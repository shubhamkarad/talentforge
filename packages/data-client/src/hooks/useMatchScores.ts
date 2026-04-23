import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EDGE_FUNCTIONS_BASE, SUPABASE_ANON_KEY, supabase } from '../client';
import { qk } from '../query-keys';

export interface MatchScoreRow {
  job_id: string;
  overall_score: number;
  skills_score: number | null;
  experience_score: number | null;
  summary: string | null;
  strengths: unknown;
  concerns: unknown;
}

// Candidate-facing: read cached scores from the DB.
// Note: RLS won't actually let candidates SELECT match_scores — use
// useCalculateMatch() instead, which returns scores inline from the edge fn.
// Kept for symmetric access patterns in employer-side UI.
export function useMatchScores(candidateId: string | undefined) {
  return useQuery({
    queryKey: candidateId ? qk.matchScores.all(candidateId) : ['match-scores', 'empty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_scores')
        .select(
          'job_id, overall_score, skills_score, experience_score, summary, strengths, concerns',
        )
        .eq('candidate_id', candidateId!);
      if (error) throw error;
      const map: Record<string, MatchScoreRow> = {};
      data?.forEach((s) => (map[s.job_id] = s as MatchScoreRow));
      return map;
    },
    enabled: !!candidateId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMatchScore(candidateId: string | undefined, jobId: string | undefined) {
  return useQuery({
    queryKey:
      candidateId && jobId ? qk.matchScores.one(candidateId, jobId) : ['match-scores', 'empty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_scores')
        .select(
          'job_id, overall_score, skills_score, experience_score, summary, strengths, concerns',
        )
        .eq('candidate_id', candidateId!)
        .eq('job_id', jobId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!candidateId && !!jobId,
    staleTime: 5 * 60 * 1000,
  });
}

// Invoke the `score-fit` edge function for a batch of (candidate, job) pairs.
// The function handles caching + the actual Cerebras call; we just forward.
export function useCalculateMatch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidateId, jobIds }: { candidateId: string; jobIds: string[] }) => {
      const res = await fetch(`${EDGE_FUNCTIONS_BASE}/score-fit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ candidate_id: candidateId, job_ids: jobIds }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `score-fit failed (${res.status})`);
      }
      return (await res.json()) as {
        success: boolean;
        scores: Record<string, MatchScoreRow>;
      };
    },
    onSuccess: (result, v) => {
      // 1. Merge into the aggregate map used by the browse page.
      qc.setQueryData<Record<string, MatchScoreRow>>(qk.matchScores.all(v.candidateId), (old) => ({
        ...(old ?? {}),
        ...result.scores,
      }));
      // 2. Seed each per-job cache entry too. Candidates can't SELECT
      //    match_scores directly (RLS), so useMatchScore() has no other way
      //    to get the data — we need to hand it the row here.
      for (const [jobId, row] of Object.entries(result.scores)) {
        qc.setQueryData(qk.matchScores.one(v.candidateId, jobId), row);
      }
    },
  });
}
