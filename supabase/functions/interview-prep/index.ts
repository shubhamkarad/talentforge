// Edge function: interview-prep
// Two modes:
//   'prepare'  — generate tailored prep materials for (candidate, job)
//   'feedback' — score and rewrite a specific answer the candidate drafted
// Not cached: each request is specific enough that re-running is always fresh.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { preflight, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { CEREBRAS_MODELS, callCerebrasJson } from '../_shared/cerebras.ts';

type Mode = 'prepare' | 'feedback';

interface InterviewPrepRequest {
  candidate_id: string;
  job_id: string;
  mode: Mode;
  answer?: string;   // required when mode === 'feedback'
}

const MODEL = CEREBRAS_MODELS.reason;

const SYSTEM_PROMPT = `You are a senior interview coach with direct hiring experience.

Operating principles:
- Personalize. Never emit generic advice — always reference specifics from the candidate's profile or the job description.
- Be direct. Tell candidates exactly what an interviewer will be assessing.
- Use the STAR framework for behavioral prompts (Situation, Task, Action, Result).
- Mix question difficulty. A real loop has easy warm-ups and hard discriminators.
- Respond only with valid JSON matching the requested schema.`;

function preparePrompt(job: Record<string, unknown>, candidate: Record<string, unknown>): string {
  const company = job.companies as { name?: string; industry?: string; size?: string; culture_description?: string; description?: string } | null;
  const profile = candidate.profiles as { full_name?: string } | null;

  return `Generate interview prep for this candidate and role.

JOB
- Title:       ${job.title}
- Company:     ${company?.name ?? '—'}${company?.industry ? ` (${company.industry})` : ''}
- Department:  ${job.department ?? '—'}
- Level:       ${job.experience_level ?? '—'}
- Description: ${job.description ?? '—'}
- Requirements:     ${JSON.stringify(job.requirements ?? [])}
- Responsibilities: ${JSON.stringify(job.responsibilities ?? [])}
- Required skills:  ${JSON.stringify(job.skills_required ?? [])}
- Culture:          ${company?.culture_description ?? company?.description ?? '—'}

CANDIDATE
- Name:       ${profile?.full_name ?? 'Candidate'}
- Headline:   ${candidate.headline ?? '—'}
- Skills:     ${JSON.stringify(candidate.skills ?? [])}
- Experience: ${JSON.stringify(candidate.experience ?? [])}
- Education:  ${JSON.stringify(candidate.education ?? [])}

Return JSON shaped exactly like:
{
  "job_summary": {
    "title":            "<job title>",
    "company":          "<company name>",
    "key_focus_areas":  ["3–5 topics an interviewer is most likely to probe"]
  },
  "interview_tips": [
    { "category": "<e.g. 'Before the loop', 'During the loop', 'Body language'>",
      "tips":     ["3–5 concrete tips"] }
  ],
  "common_questions": [
    { "question": "...",
      "type":     "behavioral"|"technical"|"situational"|"cultural",
      "difficulty": "easy"|"medium"|"hard",
      "what_theyre_looking_for": "...",
      "sample_structure": "<brief STAR or framework outline>" }
  ],
  "personalized_talking_points": [
    { "strength": "<from candidate profile>",
      "how_to_present": "...",
      "relevant_experience": "<specific past project/role to reference>" }
  ],
  "red_flags_to_avoid": ["5–7 things not to say or do"],
  "questions_to_ask":   ["5–7 strong questions the candidate should ask the interviewer"]
}

Include 8–10 questions in "common_questions" with a mix of types and difficulties.`;
}

function feedbackPrompt(job: Record<string, unknown>, candidate: Record<string, unknown>, answer: string): string {
  const company = job.companies as { name?: string } | null;
  const profile = candidate.profiles as { full_name?: string } | null;

  return `Critique this interview answer.

CONTEXT
- Job:       ${job.title} at ${company?.name ?? '—'}
- Candidate: ${profile?.full_name ?? 'Candidate'}

CANDIDATE ANSWER
"""
${answer}
"""

Return JSON:
{
  "overall_score": <0-100>,
  "feedback": {
    "strengths":         ["2–4 things the answer did well"],
    "improvements":      ["2–4 specific, concrete changes"],
    "detailed_feedback": "<2–3 short paragraphs of direct feedback>"
  },
  "improved_answer": "<a rewritten version in the candidate's own voice, stronger structure + content>"
}

Scoring:
- 90–100: outstanding, would land a strong signal
- 75–89:  good, minor gaps
- 60–74:  workable foundation, missing key elements
- 45–59:  needs significant rework
- <45:    major issues`;
}

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const body = (await req.json()) as InterviewPrepRequest;
    const { candidate_id, job_id, mode, answer } = body;

    if (!candidate_id || !job_id || !mode) {
      return jsonResponse({ error: 'Missing candidate_id, job_id or mode' }, { status: 400 });
    }
    if (mode !== 'prepare' && mode !== 'feedback') {
      return jsonResponse({ error: `Unknown mode: ${mode}` }, { status: 400 });
    }
    if (mode === 'feedback' && !answer) {
      return jsonResponse({ error: 'mode=feedback requires an "answer" field' }, { status: 400 });
    }

    const sb = serviceClient();

    const [jobResult, candidateResult] = await Promise.all([
      sb
        .from('jobs')
        .select(`
          title, description, requirements, responsibilities, nice_to_have,
          skills_required, experience_level, department,
          companies(name, industry, size, description, culture_description)
        `)
        .eq('id', job_id)
        .single(),
      sb
        .from('candidate_profiles')
        .select('headline, bio, skills, experience, education, profiles(full_name)')
        .eq('id', candidate_id)
        .single(),
    ]);

    if (jobResult.error || !jobResult.data) {
      return jsonResponse({ error: 'Job not found' }, { status: 404 });
    }
    if (candidateResult.error || !candidateResult.data) {
      return jsonResponse({ error: 'Candidate profile not found' }, { status: 404 });
    }

    const prompt =
      mode === 'prepare'
        ? preparePrompt(jobResult.data as Record<string, unknown>, candidateResult.data as Record<string, unknown>)
        : feedbackPrompt(
            jobResult.data as Record<string, unknown>,
            candidateResult.data as Record<string, unknown>,
            answer!,
          );

    const result = await callCerebrasJson<Record<string, unknown>>({
      model: MODEL,
      temperature: 0.6,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    return jsonResponse({ success: true, mode, data: result });
  } catch (err) {
    console.error('interview-prep error:', err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
});
