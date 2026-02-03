import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface TreasuryMetrics {
  id?: string;
  total_wealth: number;
  active_leases: number;
  staked_sol: number;
  rewards_earned: number;
  milestone_target: number;
}

interface FleetUnit {
  id: string;
  unit_name: string;
  unit_type: string;
  status: string;
  monthly_revenue: number;
  acquisition_date: string | null;
  notes: string | null;
  created_at: string;
}

interface TreasuryActivity {
  id: string;
  activity_type: string;
  amount: number | null;
  description: string | null;
  status: string;
  created_at: string;
}

interface SolanaData {
  solPrice: number;
  walletBalance: number;
  recentTransactions: string[];
}

const SOLANA_WALLET = 'Fa65TzfhxASYXWaniMsVt16TDb5gMSSQpbhEQEh71NHloATA';
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

export function useTreasuryData() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<TreasuryMetrics | null>(null);
  const [fleetUnits, setFleetUnits] = useState<FleetUnit[]>([]);
  const [activities, setActivities] = useState<TreasuryActivity[]>([]);
  const [solanaData, setSolanaData] = useState<SolanaData>({
    solPrice: 0,
    walletBalance: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch SOL price from CoinGecko
  const fetchSolPrice = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      );
      const data = await response.json();
      return data.solana?.usd || 0;
    } catch (err) {
      console.error('Failed to fetch SOL price:', err);
      return 0;
    }
  }, []);

  // Fetch Solana wallet data
  const fetchSolanaData = useCallback(async () => {
    try {
      const connection = new Connection(SOLANA_RPC, 'confirmed');
      const publicKey = new PublicKey(SOLANA_WALLET);
      
      // Get balance
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      // Get recent transactions
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 5 });
      const txSignatures = signatures.map(sig => sig.signature.slice(0, 8) + '...');
      
      // Get SOL price
      const price = await fetchSolPrice();
      
      setSolanaData({
        solPrice: price,
        walletBalance: solBalance,
        recentTransactions: txSignatures,
      });
    } catch (err) {
      console.error('Failed to fetch Solana data:', err);
    }
  }, [fetchSolPrice]);

  // Fetch treasury metrics
  const fetchMetrics = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('treasury_metrics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setMetrics({
          id: data.id,
          total_wealth: Number(data.total_wealth),
          active_leases: data.active_leases,
          staked_sol: Number(data.staked_sol),
          rewards_earned: Number(data.rewards_earned),
          milestone_target: Number(data.milestone_target),
        });
      } else {
        // Create default metrics if none exist
        const defaultMetrics = {
          user_id: user.id,
          total_wealth: 0,
          active_leases: 0,
          staked_sol: 0,
          rewards_earned: 0,
          milestone_target: 125000,
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('treasury_metrics')
          .insert(defaultMetrics)
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        setMetrics({
          id: newData.id,
          total_wealth: Number(newData.total_wealth),
          active_leases: newData.active_leases,
          staked_sol: Number(newData.staked_sol),
          rewards_earned: Number(newData.rewards_earned),
          milestone_target: Number(newData.milestone_target),
        });
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError('Failed to load treasury metrics');
    }
  }, [user]);

  // Fetch fleet units
  const fetchFleetUnits = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('fleet_units')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFleetUnits(data || []);
    } catch (err) {
      console.error('Failed to fetch fleet units:', err);
    }
  }, [user]);

  // Fetch recent activities
  const fetchActivities = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('treasury_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  }, [user]);

  // Update metrics
  const updateMetrics = useCallback(async (updates: Partial<TreasuryMetrics>) => {
    if (!user || !metrics?.id) return false;
    
    try {
      const { error } = await supabase
        .from('treasury_metrics')
        .update(updates)
        .eq('id', metrics.id);
      
      if (error) throw error;
      
      setMetrics(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error('Failed to update metrics:', err);
      return false;
    }
  }, [user, metrics?.id]);

  // Add activity
  const addActivity = useCallback(async (
    activityType: string,
    amount: number | null,
    description: string,
    status: string = 'success'
  ) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('treasury_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          amount,
          description,
          status,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setActivities(prev => [data, ...prev].slice(0, 10));
      return true;
    } catch (err) {
      console.error('Failed to add activity:', err);
      return false;
    }
  }, [user]);

  // Add fleet unit
  const addFleetUnit = useCallback(async (unit: {
    unit_name: string;
    unit_type?: string;
    monthly_revenue?: number;
    notes?: string;
  }) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('fleet_units')
        .insert({
          user_id: user.id,
          ...unit,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setFleetUnits(prev => [data, ...prev]);
      
      // Update active leases count
      await updateMetrics({ active_leases: fleetUnits.length + 1 });
      
      return true;
    } catch (err) {
      console.error('Failed to add fleet unit:', err);
      return false;
    }
  }, [user, fleetUnits.length, updateMetrics]);

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMetrics(),
        fetchFleetUnits(),
        fetchActivities(),
        fetchSolanaData(),
      ]);
      setLoading(false);
    };
    
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, fetchMetrics, fetchFleetUnits, fetchActivities, fetchSolanaData]);

  // Auto-refresh Solana data every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchSolanaData, 30000);
    return () => clearInterval(interval);
  }, [fetchSolanaData]);

  return {
    metrics,
    fleetUnits,
    activities,
    solanaData,
    loading,
    error,
    updateMetrics,
    addActivity,
    addFleetUnit,
    refresh: useCallback(async () => {
      await Promise.all([
        fetchMetrics(),
        fetchFleetUnits(),
        fetchActivities(),
        fetchSolanaData(),
      ]);
    }, [fetchMetrics, fetchFleetUnits, fetchActivities, fetchSolanaData]),
  };
}
