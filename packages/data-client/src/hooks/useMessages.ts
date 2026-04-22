import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import { qk } from '../query-keys';

// ------- threads -------

export function useMessageThreads(userId: string | undefined, role: 'employer' | 'candidate' | undefined) {
  return useQuery({
    queryKey: userId && role ? qk.messages.threads(userId, role) : ['threads', 'empty'],
    queryFn: async () => {
      const col = role === 'employer' ? 'employer_id' : 'candidate_id';
      const { data, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          application:application_id(id, job_id, jobs(title, companies(name))),
          employer:employer_id(id, full_name, avatar_url),
          candidate:candidate_id(id, full_name, avatar_url),
          messages(id, content, created_at, sender_id, read_at)
        `)
        .eq(col, userId!)
        .order('last_message_at', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!role,
  });
}

export function useMessageThread(applicationId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: applicationId ? qk.messages.thread(applicationId) : ['thread', 'empty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_threads')
        .select('*')
        .eq('application_id', applicationId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!applicationId,
  });

  const createThread = useMutation({
    mutationFn: async (input: {
      applicationId: string;
      employerId: string;
      candidateId: string;
    }) => {
      const { data, error } = await supabase
        .from('message_threads')
        .insert({
          application_id: input.applicationId,
          employer_id: input.employerId,
          candidate_id: input.candidateId,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (applicationId) qc.setQueryData(qk.messages.thread(applicationId), data);
    },
  });

  return { ...query, createThread };
}

// ------- messages (with realtime) -------

export function useMessages(threadId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: threadId ? qk.messages.list(threadId) : ['messages', 'empty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(id, full_name, avatar_url)')
        .eq('thread_id', threadId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!threadId,
  });

  useEffect(() => {
    if (!threadId) return;
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` },
        () => qc.invalidateQueries({ queryKey: qk.messages.list(threadId) }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, qc]);

  return query;
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { threadId: string; senderId: string; content: string }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          thread_id: input.threadId,
          sender_id: input.senderId,
          content: input.content,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: qk.messages.list(v.threadId) }),
  });
}

export function useMarkMessagesRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ threadId, userId }: { threadId: string; userId: string }) => {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .neq('sender_id', userId)
        .is('read_at', null);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['threads'] }),
  });
}
