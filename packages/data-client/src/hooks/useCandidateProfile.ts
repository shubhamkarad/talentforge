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

// Upsert (not update) so profile saves work even if the handle_new_user
// trigger never ran for this account — otherwise a missing row surfaces as
// PGRST116 "contains 0 rows" when the UI tries to save.
export function useUpdateCandidateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, patch }: { userId: string; patch: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from('candidate_profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert({ id: userId, ...patch } as any, { onConflict: 'id' })
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
      // profiles.email is NOT NULL. When the upsert hits the INSERT branch
      // (e.g. trigger never ran for this account) we need to supply it.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const email = session?.user?.email;
      if (!email) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert({ id: userId, email, ...patch } as any, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: qk.profile.candidate(v.userId) }),
  });
}
