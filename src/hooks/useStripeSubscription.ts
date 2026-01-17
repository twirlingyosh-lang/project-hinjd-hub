import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscriptionTiers';

interface StripeSubscriptionStatus {
  subscribed: boolean;
  tier: SubscriptionTier | null;
  subscriptionEnd: string | null;
  aggregateOpsActive: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useStripeSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<StripeSubscriptionStatus>({
    subscribed: false,
    tier: null,
    subscriptionEnd: null,
    aggregateOpsActive: false,
    isLoading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStatus({
        subscribed: false,
        tier: null,
        subscriptionEnd: null,
        aggregateOpsActive: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session");
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) throw error;

      setStatus({
        subscribed: data.subscribed || false,
        tier: data.tier || null,
        subscriptionEnd: data.subscription_end || null,
        aggregateOpsActive: data.aggregate_ops_active || false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check subscription',
      }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Check subscription periodically (every 60 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const createCheckout = async (tier: SubscriptionTier) => {
    if (!user) throw new Error("User not authenticated");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("No active session");
    }

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { tier },
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  const openCustomerPortal = async () => {
    if (!user) throw new Error("User not authenticated");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("No active session");
    }

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  return {
    ...status,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    isEnterprise: status.tier === 'enterprise',
    isPro: status.tier === 'pro',
    hasUnlimitedAccess: status.tier === 'enterprise',
    aggregateOpsActive: status.aggregateOpsActive,
  };
};
