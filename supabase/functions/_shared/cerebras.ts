// Cerebras Cloud — OpenAI-compatible chat-completions wrapper.
// All five Talentforge AI edge functions funnel through here so swapping the
// provider later (back to OpenAI, or to Anthropic, or to a local llama.cpp)
// requires changing one file instead of five.
//
// Auth: set CEREBRAS_API_KEY as a function secret:
//   supabase secrets set CEREBRAS_API_KEY=csk-...
// Docs: https://inference-docs.cerebras.ai/api-reference/chat-completions

const CEREBRAS_ENDPOINT = 'https://api.cerebras.ai/v1/chat/completions';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  response_format?: { type: 'json_object' };
  // Cerebras supports the OpenAI `seed` param for reproducible outputs.
  seed?: number;
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

export interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatResponse {
  id: string;
  model: string;
  choices: ChatChoice[];
  usage: ChatUsage;
}

// ---------------------------------------------------------------------------
// Recommended model pins per workload. Override per call by passing `model`
// explicitly; these just keep workloads consistent across functions.
// ---------------------------------------------------------------------------

export const CEREBRAS_MODELS = {
  // Fast + cheap bulk scoring (score-fit).
  fast:     'llama-3.3-70b',
  // Stronger reasoning for career forecast, interview prep, resume parsing.
  reason:   'llama-4-scout-17b-16e-instruct',
  // Creative JSON generation for draft-job.
  creative: 'llama-4-scout-17b-16e-instruct',
} as const;

// ---------------------------------------------------------------------------
// Core call
// ---------------------------------------------------------------------------

export async function callCerebras(body: ChatRequest): Promise<ChatResponse> {
  const key = Deno.env.get('CEREBRAS_API_KEY');
  if (!key) throw new Error('CEREBRAS_API_KEY is not set for this function');

  const res = await fetch(CEREBRAS_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Cerebras ${res.status} ${res.statusText}: ${detail.slice(0, 500)}`);
  }

  return (await res.json()) as ChatResponse;
}

// Convenience: call the model and parse the JSON content of choice[0]. Throws
// with a useful message if the model returned non-JSON, which occasionally
// happens on very long contexts.
export async function callCerebrasJson<T = unknown>(body: ChatRequest): Promise<T> {
  const request: ChatRequest = {
    ...body,
    response_format: body.response_format ?? { type: 'json_object' },
  };
  const res = await callCerebras(request);
  const raw = res.choices[0]?.message?.content ?? '';
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(
      `Cerebras returned non-JSON content (model=${res.model}): ${raw.slice(0, 300)} — ${(err as Error).message}`,
    );
  }
}
