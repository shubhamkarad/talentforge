// Edge function: score-fit
// Scores a candidate against a batch of jobs (overall / skills / experience)
// using Cerebras Llama 3.3 70B. Caches results in public.match_scores so the
// same (candidate, job) pair is only paid-for once. Candidates cannot read the
// cache table directly (RLS); this function is how they trigger evaluation.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { preflight, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { CEREBRAS_MODELS, callCerebrasJson } from '../_shared/cerebras.ts';

interface ScoreFitRequest {
  candidate_id: string;
  job_ids: string[];
}

interface MatchInsight {
  title: string;
  explanation: string;
}

interface ScoreResult {
  overall_score: number;
  skills_score: number;
  experience_score: number;
  summary: string;
  strengths: MatchInsight[];
  concerns: MatchInsight[];
}

interface MatchScoreRow extends ScoreResult {
  job_id: string;
}

const MODEL = CEREBRAS_MODELS.fast;
const BATCH_SIZE = 5;

const SYSTEM_PROMPT = `You are a senior talent analyst. Grade how well a candidate fits a role, honestly and concisely.

Rules:
- Ground every claim in the provided candidate profile and job posting. Never invent details.
- Reward demonstrated skills and close-adjacent transferable experience; penalize vague claims.
- Keep each strength/concern to a 2–3 sentence explanation referencing specifics from the profile.
- Always respond with valid JSON matching the required schema.`;

function buildUserPrompt(candidate: Record<string, unknown>, job: Record<string, unknown>): string {
  const profile = candidate.profiles as { full_name?: string } | null;
  const company = job.companies as { name?: string; industry?: string } | null;

  return `CANDIDATE
- Name: ${profile?.full_name ?? 'Anonymous'}
- Headline: ${candidate.headline ?? '—'}
- Skills: ${JSON.stringify(candidate.skills ?? [])}
- Experience: ${JSON.stringify(candidate.experience ?? [])}
- Education: ${JSON.stringify(candidate.education ?? [])}

JOB
- Title: ${job.title}
- Company: ${company?.name ?? '—'}${company?.industry ? ` (${company.industry})` : ''}
- Experience level: ${job.experience_level ?? '—'}
- Required skills: ${JSON.stringify(job.skills_required ?? [])}
- Requirements: ${JSON.stringify((job.requirements as string[] | undefined)?.slice(0, 6) ?? [])}
- Responsibilities: ${JSON.stringify((job.responsibilities as string[] | undefined)?.slice(0, 4) ?? [])}

Return JSON shaped exactly like:
{
  "overall_score":    <0-100>,
  "skills_score":     <0-100>,
  "experience_score": <0-100>,
  "summary":          "<one-sentence overall read>",
  "strengths": [
    { "title": "…", "explanation": "2-3 sentences" },
    { "title": "…", "explanation": "2-3 sentences" },
    { "title": "…", "explanation": "2-3 sentences" }
  ],
  "concerns": [
    { "title": "…", "explanation": "2-3 sentences with mitigation hint" },
    { "title": "…", "explanation": "2-3 sentences" }
  ]
}`;
}

async function scoreOneJob(
  candidate: Record<string, unknown>,
  job: Record<string, unknown>,
): Promise<MatchScoreRow | null> {
  try {
    const score = await callCerebrasJson<ScoreResult>({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 900,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(candidate, job) },
      ],
    });
    return { job_id: job.id as string, ...score };
  } catch (err) {
    console.error(`score-fit: failed for job ${job.id}:`, (err as Error).message);
    return null;
  }
}

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const { candidate_id, job_ids } = (await req.json()) as ScoreFitRequest;
    if (!candidate_id || !Array.isArray(job_ids) || job_ids.length === 0) {
      return jsonResponse(
        { error: 'Missing candidate_id or job_ids' },
        { status: 400 },
      );
    }

    const sb = serviceClient();

    // 1. Pull cached scores; any row we already have is free.
    const { data: cached } = await sb
      .from('match_scores')
      .select('job_id, overall_score, skills_score, experience_score, summary, strengths, concerns')
      .eq('candidate_id', candidate_id)
      .in('job_id', job_ids);

    const cachedIds = new Set((cached ?? []).map((r) => r.job_id));
    const uncached = job_ids.filter((id) => !cachedIds.has(id));

    const scoreMap: Record<string, unknown> = {};
    (cached ?? []).forEach((r) => (scoreMap[r.job_id] = r));

    if (uncached.length === 0) {
      return jsonResponse({ success: true, cached: true, scores: scoreMap });
    }

    // 2. Fetch the candidate profile once and reuse.
    const { data: candidate, error: candidateError } = await sb
      .from('candidate_profiles')
      .select('headline, bio, skills, experience, education, profiles(full_name)')
      .eq('id', candidate_id)
      .single();

    if (candidateError || !candidate) {
      return jsonResponse({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // 3. Fetch the jobs we still need to score.
    const { data: jobs } = await sb
      .from('jobs')
      .select(`
        id, title, description, requirements, responsibilities,
        skills_required, experience_level,
        companies(name, industry)
      `)
      .in('id', uncached);

    if (!jobs || jobs.length === 0) {
      return jsonResponse({ success: true, cached: true, scores: scoreMap });
    }

    // 4. Score in batches of BATCH_SIZE to respect rate limits.
    const rows: MatchScoreRow[] = [];
    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((job) => scoreOneJob(candidate as Record<string, unknown>, job as Record<string, unknown>)),
      );
      for (const r of results) if (r) rows.push(r);
    }

    // 5. Persist to cache and merge into the response.
    if (rows.length > 0) {
      const inserts = rows.map((r) => ({
        candidate_id,
        model_used: MODEL,
        ...r,
      }));
      const { error: insertError } = await sb
        .from('match_scores')
        .upsert(inserts, { onConflict: 'candidate_id,job_id' });
      if (insertError) {
        console.error('score-fit: upsert failed', insertError);
      }
    }

    rows.forEach((r) => (scoreMap[r.job_id] = r));

    return jsonResponse({
      success: true,
      calculated: rows.length,
      cached_hits: cachedIds.size,
      scores: scoreMap,
    });
  } catch (err) {
    console.error('score-fit error:', err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
});
