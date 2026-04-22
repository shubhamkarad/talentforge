import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import { qk } from '../query-keys';

// Read the public.profiles row (role-agnostic — works for employers too).
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? ['profile', userId] : ['profile', 'empty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCandidateProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? qk.profile.candidate(userId) : ['profile', 'candidate', 'empty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('*, profiles(*)')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateCandidateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, patch }: { userId: string; patch: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from('candidate_profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(patch as any)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: qk.profile.candidate(v.userId) }),
  });
}

export function useCreateCandidateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, patch }: { userId: string; patch: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from('candidate_profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({ id: userId, ...patch } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: qk.profile.candidate(v.userId) }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      patch,
    }: {
      userId: string;
      patch: {
        full_name?: string;
        phone?: string;
        avatar_url?: string | null;
        onboarding_completed?: boolean;
      };
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(patch as any)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: qk.profile.candidate(v.userId) }),
  });
}
