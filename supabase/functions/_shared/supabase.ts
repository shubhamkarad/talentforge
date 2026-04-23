// Service-role Supabase client for edge functions. Bypasses RLS — any row
// selected or written here is unfiltered. Do NOT accept arbitrary user input
// as table/column names with this client.

// Using Deno's native `npm:` specifier avoids the occasional Cloudflare 522
// timeout on esm.sh that blocked edge-function deploys.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.49.4';

export function serviceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var');
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
