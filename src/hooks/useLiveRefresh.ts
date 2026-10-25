import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Re-runs `refresh` whenever rows in any of `tables` change (only rows the user may read are delivered). */
export function useLiveRefresh(tables: string[], refresh: () => void, enabled = true) {
  const cb = useRef(refresh);
  cb.current = refresh;
  const key = tables.join(',');

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const channel = supabase.channel(`live-${key}-${Math.random().toString(36).slice(2)}`);
    key.split(',').forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        clearTimeout(timer);
        timer = setTimeout(() => cb.current(), 300);
      });
    });
    channel.subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [key, enabled]);
}
