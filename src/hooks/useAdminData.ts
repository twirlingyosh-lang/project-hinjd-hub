import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from './useAdminRole';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface TreasuryMetrics {
  id: string;
  user_id: string;
  total_wealth: number;
  staked_sol: number;
  rewards_earned: number;
  active_leases: number;
  milestone_target: number;
  notes: string | null;
  updated_at: string;
}

interface FleetUnit {
  id: string;
  user_id: string;
  unit_name: string;
  unit_type: string | null;
  status: string;
  monthly_revenue: number | null;
  acquisition_date: string | null;
  notes: string | null;
}

interface TreasuryActivity {
  id: string;
  user_id: string;
  activity_type: string;
  amount: number | null;
  description: string | null;
  status: string;
  created_at: string;
}

export const useAdminData = () => {
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [treasuryMetrics, setTreasuryMetrics] = useState<TreasuryMetrics[]>([]);
  const [fleetUnits, setFleetUnits] = useState<FleetUnit[]>([]);
  const [activities, setActivities] = useState<TreasuryActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [usersRes, metricsRes, unitsRes, activityRes] = await Promise.all([
        supabase.from('profiles').select('id, email, full_name'),
        supabase.from('treasury_metrics').select('*').order('updated_at', { ascending: false }),
        supabase.from('fleet_units').select('*').order('created_at', { ascending: false }),
        supabase.from('treasury_activity').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      if (usersRes.error) throw usersRes.error;
      if (metricsRes.error) throw metricsRes.error;
      if (unitsRes.error) throw unitsRes.error;
      if (activityRes.error) throw activityRes.error;

      setUsers(usersRes.data || []);
      setTreasuryMetrics(metricsRes.data || []);
      setFleetUnits(unitsRes.data || []);
      setActivities(activityRes.data || []);
    } catch (err: any) {
      console.error('Admin data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      fetchAllData();
    } else if (!adminLoading && !isAdmin) {
      setLoading(false);
    }
  }, [isAdmin, adminLoading]);

  const updateTreasuryMetrics = async (id: string, updates: Partial<TreasuryMetrics>) => {
    const { error } = await supabase
      .from('treasury_metrics')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    await fetchAllData();
  };

  const updateFleetUnit = async (id: string, updates: Partial<FleetUnit>) => {
    const { error } = await supabase
      .from('fleet_units')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    await fetchAllData();
  };

  const deleteFleetUnit = async (id: string) => {
    const { error } = await supabase.from('fleet_units').delete().eq('id', id);
    if (error) throw error;
    await fetchAllData();
  };

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  return {
    isAdmin,
    loading: loading || adminLoading,
    error,
    users,
    treasuryMetrics,
    fleetUnits,
    activities,
    updateTreasuryMetrics,
    updateFleetUnit,
    deleteFleetUnit,
    getUserById,
    refetch: fetchAllData
  };
};
