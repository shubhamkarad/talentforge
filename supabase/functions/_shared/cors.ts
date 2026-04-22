// Shared CORS helpers. Every edge function should forward OPTIONS preflights
// via preflight() and attach corsHeaders to its own Response objects.

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight. Returns a Response when `req` is an OPTIONS request,
// otherwise null so the caller continues with its own logic.
export function preflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return null;
}

// Build a JSON response with CORS headers already attached.
export function jsonResponse(body: unknown, init?: { status?: number }): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
