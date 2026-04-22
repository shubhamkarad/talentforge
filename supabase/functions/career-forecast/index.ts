// Edge function: career-forecast
// Produces a 1-/3-/5-year career trajectory for a candidate with alternative
// paths, skill-gaps, and recommended actions. Caches one row per candidate in
// public.career_predictions; pass { refresh: true } to force regeneration.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { preflight, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { CEREBRAS_MODELS, callCerebrasJson } from '../_shared/cerebras.ts';

interface CareerForecastRequest {
  candidate_id: string;
  refresh?: boolean;
}

interface CareerForecast {
  current_assessment: {
    level: string;
    strengths: string[];
    areas_for_growth: string[];
  };
  predictions: Array<{
    timeframe: '1_year' | '3_year' | '5_year';
    likely_role: string;
    probability: number;
    salary_range: { min: number; max: number };
    key_requirements: string[];
  }>;
  alternative_paths: Array<{
    role: string;
    description: string;
    fit_score: number;
  }>;
  skills_to_develop: Array<{
    skill: string;
    importance: 'high' | 'medium' | 'low';
    resources: string[];
  }>;
  recommended_actions: string[];
}

const MODEL = CEREBRAS_MODELS.reason;

const SYSTEM_PROMPT = `You are a career strategist for technology and business roles.

Produce career trajectories that are:
- Grounded: every projection references specifics from the candidate's actual experience, education, and stated preferences.
- Honest: probabilities should drop with timeframe when prerequisites are missing; do not flatter.
- Actionable: skill gaps and actions should be concrete ("ship a production Rust service", not "learn more").
- Specific: role titles are real titles from the candidate's apparent industry, not generic ladder labels.

Always respond with a single JSON object matching the requested schema — no surrounding prose.`;

function buildUserPrompt(c: Record<string, unknown>): string {
  const profile = c.profiles as { full_name?: string } | null;
  const salary =
    c.salary_expectation_min || c.salary_expectation_max
      ? `${c.salary_expectation_min ?? '?'} – ${c.salary_expectation_max ?? '?'} ${c.salary_currency ?? 'USD'}`
      : 'not specified';

  return `Analyze this candidate and project their career path.

CANDIDATE
- Name:      ${profile?.full_name ?? 'Anonymous'}
- Headline:  ${c.headline ?? '—'}
- Bio:       ${c.bio ?? '—'}
- Skills:    ${JSON.stringify(c.skills ?? [])}
- Experience:${JSON.stringify(c.experience ?? [])}
- Education: ${JSON.stringify(c.education ?? [])}

PREFERENCES
- Job types:        ${JSON.stringify(c.preferred_job_types ?? [])}
- Locations:        ${JSON.stringify(c.preferred_locations ?? [])}
- Salary target:    ${salary}

Return JSON with exactly these fields:
{
  "current_assessment": {
    "level": "<current seniority + discipline, e.g. 'Mid-level Full-stack Engineer'>",
    "strengths": ["3–5 concrete strengths drawn from the profile"],
    "areas_for_growth": ["2–3 areas to invest in"]
  },
  "predictions": [
    { "timeframe": "1_year", "likely_role": "...", "probability": <0-100>,
      "salary_range": { "min": <int>, "max": <int> },
      "key_requirements": ["..."] },
    { "timeframe": "3_year", "likely_role": "...", "probability": <0-100>,
      "salary_range": { "min": <int>, "max": <int> },
      "key_requirements": ["..."] },
    { "timeframe": "5_year", "likely_role": "...", "probability": <0-100>,
      "salary_range": { "min": <int>, "max": <int> },
      "key_requirements": ["..."] }
  ],
  "alternative_paths": [
    { "role": "...", "description": "...", "fit_score": <0-100> }
  ],
  "skills_to_develop": [
    { "skill": "...", "importance": "high"|"medium"|"low", "resources": ["..."] }
  ],
  "recommended_actions": ["5–7 concrete, verifiable next steps"]
}`;
}

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const { candidate_id, refresh = false } = (await req.json()) as CareerForecastRequest;
    if (!candidate_id) {
      return jsonResponse({ error: 'Missing candidate_id' }, { status: 400 });
    }

    const sb = serviceClient();

    // 1. Try cache unless caller explicitly asked for a fresh generation.
    if (!refresh) {
      const { data: cached } = await sb
        .from('career_predictions')
        .select('prediction, calculated_at')
        .eq('candidate_id', candidate_id)
        .maybeSingle();
      if (cached?.prediction) {
        return jsonResponse({
          success: true,
          cached: true,
          prediction: cached.prediction,
          calculated_at: cached.calculated_at,
        });
      }
    }

    // 2. Pull the candidate profile.
    const { data: candidate, error: candidateError } = await sb
      .from('candidate_profiles')
      .select(`
        headline, bio, skills, experience, education,
        preferred_job_types, preferred_locations,
        salary_expectation_min, salary_expectation_max, salary_currency,
        profiles(full_name)
      `)
      .eq('id', candidate_id)
      .single();

    if (candidateError || !candidate) {
      return jsonResponse({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // 3. Generate.
    const prediction = await callCerebrasJson<CareerForecast>({
      model: MODEL,
      temperature: 0.6,
      max_tokens: 2500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(candidate as Record<string, unknown>) },
      ],
    });

    // 4. Cache (one row per candidate).
    const { error: upsertError } = await sb
      .from('career_predictions')
      .upsert(
        {
          candidate_id,
          prediction,
          model_used: MODEL,
          calculated_at: new Date().toISOString(),
        },
        { onConflict: 'candidate_id' },
      );
    if (upsertError) console.error('career-forecast: upsert failed', upsertError);

    return jsonResponse({ success: true, cached: false, prediction });
  } catch (err) {
    console.error('career-forecast error:', err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
});
