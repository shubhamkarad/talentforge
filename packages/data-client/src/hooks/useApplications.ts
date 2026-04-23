import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import { qk } from '../query-keys';

// ------- employer view (with embedded match-score lookup) -------

export function useEmployerApplications(employerId: string | undefined, jobId?: string) {
  return useQuery({
    queryKey: employerId
      ? [...qk.applications.byEmployer(employerId), jobId ?? 'all']
      : qk.applications.all,
    queryFn: async () => {
      let q = supabase
        .from('applications')
        .select(
          `
          *,
          jobs!inner(id, title, employer_id, companies(name)),
          profiles:candidate_id(id, email, full_name, avatar_url)
        `,
        )
        .order('created_at', { ascending: false });

      if (employerId) q = q.eq('jobs.employer_id', employerId);
      if (jobId) q = q.eq('job_id', jobId);

      const { data, error } = await q;
      if (error) throw error;
      return decorateWithMatchScores(data);
    },
    enabled: !!employerId,
  });
}

export function useApplication(applicationId: string | undefined) {
  return useQuery({
    queryKey: applicationId ? qk.applications.byId(applicationId) : qk.applications.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(
          `
          *,
          jobs(id, title, employer_id, companies(name)),
          profiles:candidate_id(
            id, email, full_name, avatar_url, phone,
            candidate_profiles(
              headline, bio, skills, experience, education,
              resume_url, linkedin_url, github_url, portfolio_url
            )
          )
        `,
        )
        .eq('id', applicationId!)
        .single();
      if (error) throw error;

      const { data: score } = await supabase
        .from('match_scores')
        .select('overall_score, skills_score, experience_score, summary, strengths, concerns')
        .eq('candidate_id', data.candidate_id)
        .eq('job_id', data.job_id)
        .maybeSingle();

      return { ...data, match_score: score };
    },
    enabled: !!applicationId,
  });
}

// ------- candidate view -------

export function useCandidateApplications(candidateId: string | undefined) {
  return useQuery({
    queryKey: candidateId ? qk.applications.byCandidate(candidateId) : qk.applications.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(
          `
          *,
          jobs(id, title, location, remote_type, employment_type, status,
               companies(id, name, logo_url, industry))
        `,
        )
        .eq('candidate_id', candidateId!)
        .order('applied_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!candidateId,
  });
}

// Subscribes to UPDATE events on the candidate's applications. When the
// recruiter flips a status (e.g. reviewing → shortlisted), both the list
// query (useCandidateApplications) and the single-row detail query
// (useApplication) invalidate, so the UI updates without a manual refresh.
// Mount exactly once per authenticated session — the layout is the right
// place. Mounting twice trips the duplicate-topic guard in @supabase/realtime-js.
export function useCandidateApplicationsRealtime(candidateId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!candidateId) return;
    const channel = supabase
      .channel(`applications:candidate:${candidateId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `candidate_id=eq.${candidateId}`,
        },
        (payload) => {
          qc.invalidateQueries({ queryKey: qk.applications.byCandidate(candidateId) });
          const row = ((payload.new ?? payload.old) as { id?: string } | undefined) ?? undefined;
          if (row?.id) {
            qc.invalidateQueries({ queryKey: qk.applications.byId(row.id) });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [candidateId, qc]);
}

// Employer-side twin. Fires on every change to any application — RLS filters
// what the employer can actually re-fetch, so we just invalidate broadly.
// Useful when a candidate withdraws or when a new application lands.
export function useEmployerApplicationsRealtime(employerId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!employerId) return;
    const channel = supabase
      .channel(`applications:employer:${employerId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        (payload) => {
          qc.invalidateQueries({ queryKey: qk.applications.byEmployer(employerId) });
          const row = ((payload.new ?? payload.old) as { id?: string } | undefined) ?? undefined;
          if (row?.id) {
            qc.invalidateQueries({ queryKey: qk.applications.byId(row.id) });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [employerId, qc]);
}

export function useHasApplied(candidateId: string | undefined, jobId: string | undefined) {
  return useQuery({
    queryKey:
      candidateId && jobId
        ? qk.applications.exists(candidateId, jobId)
        : ['applications', 'exists', 'empty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('id, status, applied_at')
        .eq('candidate_id', candidateId!)
        .eq('job_id', jobId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!candidateId && !!jobId,
  });
}

// ------- mutations -------

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('applications')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(input as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.applications.all }),
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('applications')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(patch as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: qk.applications.all });
      if (data?.id) qc.invalidateQueries({ queryKey: qk.applications.byId(data.id) });
    },
  });
}

// ------- helpers -------

// Batch-fetch match scores for an employer application list and merge them in.
// Kept local to this hook module because only the employer list needs it;
// candidates can't read match_scores per RLS.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function decorateWithMatchScores(rows: any[] | null) {
  if (!rows || rows.length === 0) return rows ?? [];

  const candidateIds = Array.from(new Set(rows.map((r) => r.candidate_id)));
  const { data: scores } = await supabase
    .from('match_scores')
    .select(
      'candidate_id, job_id, overall_score, skills_score, experience_score, summary, strengths, concerns',
    )
    .in('candidate_id', candidateIds);

  const map = new Map<string, unknown>();
  scores?.forEach((s) => map.set(`${s.candidate_id}:${s.job_id}`, s));
  return rows.map((r) => ({
    ...r,
    match_score: map.get(`${r.candidate_id}:${r.job_id}`) ?? null,
  }));
}
