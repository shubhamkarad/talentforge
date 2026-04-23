// Edge function: draft-cover-letter
// Writes a short, personalized cover letter in the candidate's voice from
// their profile + the job they're applying to. Seeker app calls this from the
// apply dialog's "Generate with AI" button; the returned text flows straight
// into the cover-letter textarea so the candidate can edit and send.
//
// No caching — each click is a fresh draft. Temperature is intentionally
// higher than scoring so regenerations read differently each time.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { preflight, jsonResponse } from '../_shared/cors.ts';
import { CEREBRAS_MODELS, callCerebrasJson } from '../_shared/cerebras.ts';
import { serviceClient } from '../_shared/supabase.ts';

type Tone = 'professional' | 'enthusiastic' | 'concise';

interface DraftCoverLetterRequest {
  candidate_id: string;
  job_id: string;
  tone?: Tone;
}

interface CoverLetterDraft {
  coverLetter: string;
}

const MODEL = CEREBRAS_MODELS.creative;

const SYSTEM_PROMPT = `You write short, specific cover letters in the candidate's own voice.

Principles:
- Three short paragraphs, under 220 words total.
- Paragraph 1: state the role and one sentence on why this company/team.
- Paragraph 2: the single strongest overlap between the candidate's experience and the role — cite a concrete project, scale, or skill.
- Paragraph 3: a one-line close that proposes a next step.
- No filler ("I am writing to express my interest…"), no generic praise, no inventing experience the candidate doesn't have.
- Match the requested tone. Default is 'professional': warm, direct, no exclamation marks.
- Respond with a single JSON object containing one field: coverLetter (string). No preamble or commentary.`;

const TONE_HINTS: Record<Tone, string> = {
  professional: 'Warm and direct. Confident without hype. No exclamation marks.',
  enthusiastic: 'Upbeat and specific about what excites the candidate. One exclamation mark max.',
  concise: 'Maximally compact. Three paragraphs, two sentences each. Under 140 words total.',
};

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const {
      candidate_id,
      job_id,
      tone = 'professional',
    } = (await req.json()) as DraftCoverLetterRequest;

    if (!candidate_id) return jsonResponse({ error: 'Missing candidate_id' }, { status: 400 });
    if (!job_id) return jsonResponse({ error: 'Missing job_id' }, { status: 400 });

    const sb = serviceClient();

    // Fetch candidate profile (the writing voice) + public profile (the name).
    const [{ data: candidate, error: candidateErr }, { data: profile, error: profileErr }] =
      await Promise.all([
        sb
          .from('candidate_profiles')
          .select('headline, bio, skills, experience, education')
          .eq('id', candidate_id)
          .maybeSingle(),
        sb.from('profiles').select('full_name').eq('id', candidate_id).maybeSingle(),
      ]);
    if (candidateErr) throw candidateErr;
    if (profileErr) throw profileErr;
    if (!candidate) return jsonResponse({ error: 'Candidate profile not found' }, { status: 404 });

    // Fetch the job + its company name.
    const { data: job, error: jobErr } = await sb
      .from('jobs')
      .select('title, description, requirements, skills_required, companies(name)')
      .eq('id', job_id)
      .maybeSingle();
    if (jobErr) throw jobErr;
    if (!job) return jsonResponse({ error: 'Job not found' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const companyName = (job as any).companies?.name ?? 'the team';

    const candidateBlock = [
      `Candidate name: ${profile?.full_name ?? 'the candidate'}`,
      candidate.headline ? `Headline: ${candidate.headline}` : null,
      candidate.bio ? `Bio: ${candidate.bio}` : null,
      Array.isArray(candidate.skills) && candidate.skills.length
        ? `Skills: ${candidate.skills
            .map((s: { name?: string } | string) => (typeof s === 'string' ? s : s.name))
            .filter(Boolean)
            .join(', ')}`
        : null,
      Array.isArray(candidate.experience) && candidate.experience.length
        ? `Experience:\n${candidate.experience
            .slice(0, 4)
            .map(
              (e: { title?: string; company?: string; description?: string }) =>
                `- ${e.title ?? 'Role'} at ${e.company ?? 'Company'}${e.description ? ` — ${e.description}` : ''}`,
            )
            .join('\n')}`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    const jobBlock = [
      `Role: ${job.title}`,
      `Company: ${companyName}`,
      `Description: ${job.description}`,
      Array.isArray(job.requirements) && job.requirements.length
        ? `Requirements: ${job.requirements.join('; ')}`
        : null,
      Array.isArray(job.skills_required) && job.skills_required.length
        ? `Skills wanted: ${job.skills_required.join(', ')}`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    const userPrompt =
      `Write a cover letter in this candidate's voice for this role.\n\n` +
      `Tone: ${tone}. ${TONE_HINTS[tone]}\n\n` +
      `--- CANDIDATE ---\n${candidateBlock}\n\n` +
      `--- ROLE ---\n${jobBlock}\n\n` +
      `Respond with JSON: { "coverLetter": "<three short paragraphs>" }`;

    const draft = await callCerebrasJson<CoverLetterDraft>({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 600,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    if (!draft?.coverLetter || typeof draft.coverLetter !== 'string') {
      throw new Error('Model returned no cover letter');
    }

    return jsonResponse({ success: true, coverLetter: draft.coverLetter });
  } catch (err) {
    console.error('draft-cover-letter error:', err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
});
