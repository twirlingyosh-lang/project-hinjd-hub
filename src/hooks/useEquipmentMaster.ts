import { useQuery } from '@tanstack/react-query';
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

export function useEquipmentMaster() {
  return useQuery({
    queryKey: ['equipment-master'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_master' as any)
        .select('*')
        .order('node_id');
      if (error) throw error;
      return (data as unknown as EquipmentNode[]) ?? [];
    },
    refetchInterval: 30000, // refresh every 30s for live feel
  });
}
