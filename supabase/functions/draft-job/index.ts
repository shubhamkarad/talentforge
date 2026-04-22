// Edge function: draft-job
// Turns a one-sentence prompt into a complete, structured job posting ready
// to insert into the jobs table. The recruiter app calls this from the
// "create job → draft with AI" button; the returned shape maps directly to
// our createJobSchema (camelCase fields).

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { preflight, jsonResponse } from '../_shared/cors.ts';
import { CEREBRAS_MODELS, callCerebrasJson } from '../_shared/cerebras.ts';

interface DraftJobRequest {
  prompt: string;
  companyName?: string;
  companyIndustry?: string;
}

type ExperienceLevel =
  | 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'executive';
type EmploymentType =
  | 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
type RemoteType = 'remote' | 'hybrid' | 'onsite';

interface JobDraft {
  title: string;
  description: string;
  department: string;
  experienceLevel: ExperienceLevel;
  employmentType: EmploymentType;
  remoteType: RemoteType;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  requirements: string[];
  responsibilities: string[];
  niceToHave: string[];
  skillsRequired: string[];
  benefits: string[];
}

const MODEL = CEREBRAS_MODELS.creative;

const SYSTEM_PROMPT = `You draft job postings from a brief prompt.

Principles:
- Inclusive language. No gendered terms, no "rockstar", "ninja", or culture-fit code words.
- Concrete over generic. "Ship and own a service handling 10K RPS" beats "work on high-scale systems".
- Don't over-require. If the prompt says "junior", don't list 5+ years of experience. Keep requirements realistic for the seniority.
- Skills are individual items: "React", "Node.js", "PostgreSQL" — not bundled phrases.
- Estimate salary from the role + seniority if the prompt doesn't specify one. Use USD unless context implies another currency.
- Respond with a single JSON object matching the requested schema. No preamble, no commentary.`;

const SCHEMA_HINT = `{
  "title":            "<specific role title>",
  "description":      "<2-3 paragraphs: the role, the team, what success looks like>",
  "department":       "<e.g. 'Engineering', 'Product', 'Design'>",
  "experienceLevel":  "entry|junior|mid|senior|lead|principal|executive",
  "employmentType":   "full-time|part-time|contract|internship|freelance",
  "remoteType":       "remote|hybrid|onsite",
  "location":         "<City, State/Country> | 'Remote' | 'Flexible'",
  "salaryMin":        <int or null>,
  "salaryMax":        <int or null>,
  "salaryCurrency":   "USD",
  "requirements":     ["4-6 must-haves"],
  "responsibilities": ["5-8 concrete responsibilities"],
  "niceToHave":       ["2-4 bonuses"],
  "skillsRequired":   ["5-8 individual skills"],
  "benefits":         ["4-6 benefits / perks"]
}`;

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const { prompt, companyName, companyIndustry } = (await req.json()) as DraftJobRequest;

    if (!prompt || prompt.trim().length < 5) {
      return jsonResponse(
        { error: 'Prompt is too short — write at least a sentence about the role.' },
        { status: 400 },
      );
    }

    const contextLines: string[] = [];
    if (companyName)     contextLines.push(`Company: ${companyName}`);
    if (companyIndustry) contextLines.push(`Industry: ${companyIndustry}`);

    const userPrompt =
      `Draft a complete job posting from this brief:\n\n"${prompt.trim()}"\n\n` +
      (contextLines.length ? contextLines.join('\n') + '\n\n' : '') +
      `Return JSON with this exact shape:\n${SCHEMA_HINT}`;

    const draft = await callCerebrasJson<JobDraft>({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    return jsonResponse({ success: true, draft });
  } catch (err) {
    console.error('draft-job error:', err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
});
