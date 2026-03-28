import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

const QUERY_KEY = ['equipment-master'];

export function useEquipmentMaster() {
  const queryClient = useQueryClient();

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('equipment-master-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'equipment_master' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: QUERY_KEY,
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
