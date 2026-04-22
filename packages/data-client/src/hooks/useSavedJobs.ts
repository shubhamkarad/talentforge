import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import { qk } from '../query-keys';

export function useSavedJobs(candidateId: string | undefined) {
  return useQuery({
    queryKey: candidateId ? qk.savedJobs.list(candidateId) : ['saved-jobs', 'empty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          id, created_at, notes,
          jobs(
            id, title, location, remote_type, employment_type,
            salary_min, salary_max, salary_currency, show_salary,
            skills_required, status, created_at,
            companies(id, name, logo_url, industry)
          )
        `)
        .eq('candidate_id', candidateId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!candidateId,
  });
}

export function useIsJobSaved(candidateId: string | undefined, jobId: string | undefined) {
  return useQuery({
    queryKey:
      candidateId && jobId ? qk.savedJobs.has(candidateId, jobId) : ['saved-jobs', 'empty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('candidate_id', candidateId!)
        .eq('job_id', jobId!)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!candidateId && !!jobId,
  });
}

export function useSaveJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ candidateId, jobId }: { candidateId: string; jobId: string }) => {
      const { data, error } = await supabase
        .from('saved_jobs')
        .insert({ candidate_id: candidateId, job_id: jobId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: qk.savedJobs.list(v.candidateId) });
      qc.invalidateQueries({ queryKey: qk.savedJobs.has(v.candidateId, v.jobId) });
    },
  });
}

export function useUnsaveJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ candidateId, jobId }: { candidateId: string; jobId: string }) => {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: qk.savedJobs.list(v.candidateId) });
      qc.invalidateQueries({ queryKey: qk.savedJobs.has(v.candidateId, v.jobId) });
    },
  });
}

// Convenience wrapper: save or unsave based on current state.
export function useToggleSaveJob() {
  const save = useSaveJob();
  const unsave = useUnsaveJob();
  return {
    toggle: (candidateId: string, jobId: string, isSaved: boolean) =>
      isSaved
        ? unsave.mutateAsync({ candidateId, jobId })
        : save.mutateAsync({ candidateId, jobId }),
    isPending: save.isPending || unsave.isPending,
  };
}
