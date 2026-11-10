import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EquipmentNode {
  node_id: string;
  equipment_type: string | null;
  model: string | null;
  status: string | null;
  lat: number | null;
  lng: number | null;
  current_spec_task: string | null;
  last_maintenance: string | null;
  runtime_hours: number | null;
  telemetry: Record<string, unknown> | null;
  updated_at: string | null;
}

export function useEquipmentMaster() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = useMemo(() => ['equipment-master', user?.id ?? 'signed-out'], [user?.id]);

  // Subscribe only to the signed-in account's permitted realtime changes.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`equipment-master-realtime-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'equipment_master' },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, queryKey, user]);

  return useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_master' as any)
        .select('*')
        .order('node_id');
      if (error) throw error;
      return (data as unknown as EquipmentNode[]) ?? [];
    },
  });
}
