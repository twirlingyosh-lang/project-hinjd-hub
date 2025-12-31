import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UsageStatus {
  freeUsesRemaining: number;
  totalUses: number;
  hasActiveSubscription: boolean;
  canUse: boolean;
  isLoading: boolean;
}

export const useUsageLimit = () => {
  const { user } = useAuth();
  const [usageStatus, setUsageStatus] = useState<UsageStatus>({
    freeUsesRemaining: 10,
    totalUses: 0,
    hasActiveSubscription: false,
    canUse: true,
    isLoading: true
  });

  const fetchUsageStatus = useCallback(async () => {
    if (!user) {
      setUsageStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_usage_status', { p_user_id: user.id });

      if (error) {
        console.error('Error fetching usage status:', error);
        return;
      }

      if (data && data.length > 0) {
        const status = data[0];
        setUsageStatus({
          freeUsesRemaining: status.free_uses_remaining,
          totalUses: status.total_uses,
          hasActiveSubscription: status.has_active_subscription,
          canUse: status.has_active_subscription || status.free_uses_remaining > 0,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching usage status:', error);
      setUsageStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    fetchUsageStatus();
  }, [fetchUsageStatus]);

  const decrementUsage = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('decrement_usage', { p_user_id: user.id });

      if (error) {
        console.error('Error decrementing usage:', error);
        return false;
      }

      // Refresh usage status after decrement
      await fetchUsageStatus();
      return data === true;
    } catch (error) {
      console.error('Error decrementing usage:', error);
      return false;
    }
  }, [user, fetchUsageStatus]);

  return {
    ...usageStatus,
    decrementUsage,
    refreshUsage: fetchUsageStatus
  };
};
