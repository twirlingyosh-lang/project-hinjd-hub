import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Referral {
  id: string;
  referral_code: string;
  referred_email: string | null;
  status: string;
  created_at: string;
  converted_at: string | null;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'REF-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const fetchReferrals = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
      
      // Find existing code or create one
      const existing = data?.find(r => r.status === 'pending' && !r.referred_email);
      if (existing) {
        setReferralCode(existing.referral_code);
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createReferralCode = async () => {
    if (!user) return null;
    
    const code = generateCode();
    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          referral_code: code,
        })
        .select()
        .single();

      if (error) throw error;
      setReferralCode(data.referral_code);
      setReferrals(prev => [data, ...prev]);
      return data.referral_code;
    } catch (err) {
      console.error('Error creating referral code:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const referralUrl = referralCode 
    ? `${window.location.origin}/auth?ref=${referralCode}` 
    : null;

  const totalReferred = referrals.filter(r => r.status === 'converted').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending' && r.referred_email).length;

  return {
    referrals,
    referralCode,
    referralUrl,
    isLoading,
    totalReferred,
    pendingReferrals,
    createReferralCode,
    fetchReferrals,
  };
};
