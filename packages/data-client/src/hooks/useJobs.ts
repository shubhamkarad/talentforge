import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import { qk } from '../query-keys';

export interface PublicJobFilters {
  search?: string;
  location?: string;
  remoteType?: string;
  employmentType?: string;
  experienceLevel?: string;
}

// ------- employer (owner) views -------

export function useEmployerJobs(employerId: string | undefined) {
  return useQuery({
    queryKey: employerId ? qk.jobs.byEmployer(employerId) : qk.jobs.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name, logo_url)')
        .eq('employer_id', employerId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!employerId,
  });
}

export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: jobId ? qk.jobs.byId(jobId) : qk.jobs.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(id, name, logo_url, description, industry, website, headquarters)')
        .eq('id', jobId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const { data, error } = await supabase.from('jobs').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.jobs.all }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: qk.jobs.all });
      if (data?.id) qc.invalidateQueries({ queryKey: qk.jobs.byId(data.id) });
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.jobs.all }),
  });
}

// ------- public-facing listings (seeker app) -------

export function usePublicJobs(filters?: PublicJobFilters) {
  return useQuery({
    queryKey: qk.jobs.publicList(filters),
    queryFn: async () => {
      let q = supabase
        .from('jobs')
        .select(`
          id, title, slug, description, location, remote_type, employment_type,
          experience_level, salary_min, salary_max, salary_currency, show_salary,
          skills_required, created_at, published_at,
          companies(id, name, logo_url, industry, size)
        `)
        .eq('status', 'active')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

      if (filters?.search)         q = q.ilike('title', `%${filters.search}%`);
      if (filters?.location)       q = q.ilike('location', `%${filters.location}%`);
      if (filters?.remoteType)     q = q.eq('remote_type', filters.remoteType);
      if (filters?.employmentType) q = q.eq('employment_type', filters.employmentType);
      if (filters?.experienceLevel) q = q.eq('experience_level', filters.experienceLevel);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// Insert a job_views row. Dedupes per-tab via sessionStorage so strict-mode
// re-renders don't double-count.
export function useTrackJobView(jobId: string | undefined, viewerId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!jobId || typeof window === 'undefined') return;
      const key = `job-view:${jobId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');

      const { error } = await supabase.from('job_views').insert({
        job_id: jobId,
        viewer_id: viewerId ?? null,
      });
      if (error) {
        sessionStorage.removeItem(key);
        throw error;
      }
    },
    onSuccess: () => {
      if (jobId) qc.invalidateQueries({ queryKey: qk.jobs.byId(jobId) });
    },
  });
}
