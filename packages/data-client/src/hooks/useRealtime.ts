import { useEffect } from 'react';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../client';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RealtimeOptions<Row extends { [key: string]: any }> {
  channel: string;
  table: string;
  event?: RealtimeEvent;
  filter?: string;
  onChange?: (payload: RealtimePostgresChangesPayload<Row>) => void;
  onInsert?: (row: Row) => void;
  onUpdate?: (row: Row) => void;
  onDelete?: (row: Row) => void;
}

// Thin typed wrapper around Supabase Realtime channels. Auto-unsubscribes on
// unmount. Pass a `filter` like "user_id=eq.<uid>" to scope updates.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRealtime<Row extends { [key: string]: any }>(opts: RealtimeOptions<Row>) {
  const { channel, table, event = '*', filter, onChange, onInsert, onUpdate, onDelete } = opts;

  useEffect(() => {
    let chan: RealtimeChannel | null = null;

    chan = supabase
      .channel(channel)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on<Row>('postgres_changes' as any, { event, schema: 'public', table, filter }, (payload) => {
        onChange?.(payload);
        if (payload.eventType === 'INSERT') onInsert?.(payload.new as Row);
        else if (payload.eventType === 'UPDATE') onUpdate?.(payload.new as Row);
        else if (payload.eventType === 'DELETE') onDelete?.(payload.old as Row);
      })
      .subscribe();

    return () => {
      if (chan) supabase.removeChannel(chan);
    };
  }, [channel, table, event, filter, onChange, onInsert, onUpdate, onDelete]);
}
