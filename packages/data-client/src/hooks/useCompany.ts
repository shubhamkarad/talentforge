import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import { qk } from '../query-keys';

export function useCompany(ownerId: string | undefined) {
  return useQuery({
    queryKey: ownerId ? qk.company.byOwner(ownerId) : ['company', 'empty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', ownerId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!ownerId,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('companies')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.owner_id) qc.invalidateQueries({ queryKey: qk.company.byOwner(data.owner_id) });
    },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('companies')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.owner_id) qc.invalidateQueries({ queryKey: qk.company.byOwner(data.owner_id) });
    },
  });
}
