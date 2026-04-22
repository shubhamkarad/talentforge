import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

// Minimal Vite env shim — avoids needing "vite/client" types in the package.
// Vite inlines these at build time for any app that imports this package.
interface ImportMetaEnvShim {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
interface ImportMetaShim {
  readonly env: ImportMetaEnvShim;
}

const env = (import.meta as unknown as ImportMetaShim).env;

const url     = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
  );
}

const authOptions = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
} as const;

export const supabase: SupabaseClient<Database> = createClient<Database>(url, anonKey, {
  auth: authOptions,
});

export function createBrowserClient(): SupabaseClient<Database> {
  return createClient<Database>(url!, anonKey!, { auth: authOptions });
}

// Re-export the function-call URL for direct edge-function fetches.
export const EDGE_FUNCTIONS_BASE = `${url}/functions/v1`;
export const SUPABASE_ANON_KEY   = anonKey;
