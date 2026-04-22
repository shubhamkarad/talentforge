// Edge function: extract-profile
// Converts a candidate's resume (PDF upload or raw text) into the structured
// fields we store on candidate_profiles. Accepts two content types:
//   - multipart/form-data  with a `file` field (PDF or .txt)
//   - application/json     with { text: string }
// Returns { success, profile }. The caller decides whether to save the result.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { getDocumentProxy } from 'https://esm.sh/unpdf@0.12.1';
import { preflight, jsonResponse } from '../_shared/cors.ts';
import { CEREBRAS_MODELS, callCerebrasJson } from '../_shared/cerebras.ts';

const MODEL = CEREBRAS_MODELS.reason;
const MAX_RESUME_CHARS = 15_000;
const MIN_RESUME_CHARS = 50;

interface ExtractedExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string | null;
  current?: boolean;
  description?: string;
}

interface ExtractedEducation {
  degree: string;
  institution: string;
  location?: string;
  year: string;
  field?: string;
}

interface ExtractedProfile {
  headline: string;
  bio: string;
  skills: string[];
  experience: ExtractedExperience[];
  education: ExtractedEducation[];
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
}

const SYSTEM_PROMPT = `You extract structured profile data from resume text.

Rules:
- "skills" is a FLAT array of individual technologies, languages, frameworks, databases, tools, platforms — not categorized.
- Normalize dates to "YYYY-MM". Use "Present" for ongoing roles; do not invent end dates.
- List experience reverse-chronologically.
- Build full URLs for social profiles — "linkedin.com/in/x" → "https://linkedin.com/in/x".
- If a URL, skill, experience, or education block isn't clearly present, omit it rather than hallucinate.
- Keep the bio to 2–3 sentences in a neutral professional voice.
- Respond with a single JSON object matching the requested schema.`;

const RESPONSE_SCHEMA_HINT = `{
  "headline":      "<professional headline e.g. 'Senior Go engineer, infra focus'>",
  "bio":           "<2-3 sentences>",
  "skills":        ["..."],
  "experience": [
    { "title": "...", "company": "...", "location": "...",
      "startDate": "YYYY-MM", "endDate": "YYYY-MM | Present",
      "description": "..." }
  ],
  "education": [
    { "degree": "...", "institution": "...", "location": "...", "year": "YYYY", "field": "..." }
  ],
  "linkedin_url":  "<https://... or null>",
  "github_url":    "<https://... or null>",
  "portfolio_url": "<https://... or null>"
}`;

// ---------------------------------------------------------------------------
// PDF extraction via unpdf (works inside Deno without native deps).
// ---------------------------------------------------------------------------
async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content.items.map((item: any) => item.str ?? '').join(' '),
    );
  }
  return pages.join('\n\n');
}

// ---------------------------------------------------------------------------
// Pull the resume text out of whatever input format the client used.
// ---------------------------------------------------------------------------
async function readResumeText(req: Request): Promise<string> {
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = (await req.json()) as { text?: string };
    return body.text ?? '';
  }

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      throw new Error('No file field in multipart body');
    }
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      try {
        return await extractPdfText(file);
      } catch (err) {
        throw new Error(
          `Could not read PDF (${(err as Error).message}). Try a .txt export or paste the resume text instead.`,
        );
      }
    }
    return await file.text();
  }

  throw new Error(
    'Unsupported content type. Send multipart/form-data with a file, or JSON with a text field.',
  );
}

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const text = (await readResumeText(req)).trim();

    if (text.length < MIN_RESUME_CHARS) {
      return jsonResponse(
        { error: 'Resume text was too short to parse. Paste at least a few lines.' },
        { status: 400 },
      );
    }

    const truncated = text.slice(0, MAX_RESUME_CHARS);

    const profile = await callCerebrasJson<ExtractedProfile>({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 2500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content:
            `Parse this resume and return the data in the schema below.\n\n` +
            `SCHEMA:\n${RESPONSE_SCHEMA_HINT}\n\n` +
            `RESUME:\n${truncated}`,
        },
      ],
    });

    return jsonResponse({ success: true, profile });
  } catch (err) {
    console.error('extract-profile error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Client-induced errors (bad body / bad file) → 400. Others → 500.
    const status =
      /^(Unsupported content type|Could not read PDF|No file field)/.test(message) ? 400 : 500;
    return jsonResponse({ error: message }, { status });
  }
});
