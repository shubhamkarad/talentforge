import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CareerForecast } from '@forge/shared';
import { EDGE_FUNCTIONS_BASE, SUPABASE_ANON_KEY, supabase } from '../client';
import { qk } from '../query-keys';

// Read the cached career forecast from career_predictions.
export function useCareerForecast(candidateId: string | undefined) {
  return useQuery({
    queryKey: candidateId ? qk.career.forecast(candidateId) : ['career', 'empty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('career_predictions')
        .select('*')
        .eq('candidate_id', candidateId!)
        .maybeSingle();
      if (error) throw error;
      return data as { prediction: CareerForecast; calculated_at: string } | null;
    },
    enabled: !!candidateId,
    staleTime: 10 * 60 * 1000,
  });
}

// Fire the `career-forecast` edge function. Pass { refresh: true } to force
// regeneration even if a cached prediction exists.
export function useGenerateCareerForecast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      candidateId,
      refresh,
    }: {
      candidateId: string;
      refresh?: boolean;
    }) => {
      const res = await fetch(`${EDGE_FUNCTIONS_BASE}/career-forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ candidate_id: candidateId, refresh: !!refresh }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `career-forecast failed (${res.status})`);
      }
      return (await res.json()) as { success: boolean; prediction: CareerForecast };
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: qk.career.forecast(v.candidateId) }),
  });
}
