
-- Create referrals table to track referral links and conversions
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referred_email TEXT,
  referred_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_type TEXT NOT NULL DEFAULT 'discount_20',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT referral_code_length CHECK (char_length(referral_code) >= 6)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- Users can create their own referral codes
CREATE POLICY "Users can create own referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- Users can update own referrals
CREATE POLICY "Users can update own referrals"
  ON public.referrals FOR UPDATE
  USING (auth.uid() = referrer_id);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON public.referrals FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone authenticated can look up a referral code (for validation during signup)
CREATE POLICY "Auth users can lookup referral codes"
  ON public.referrals FOR SELECT
  USING (true);

-- Create index on referral_code for fast lookups
CREATE INDEX idx_referrals_code ON public.referrals (referral_code);
CREATE INDEX idx_referrals_referrer ON public.referrals (referrer_id);
