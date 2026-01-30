-- Create app_role enum for admin access control
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create diagnostic_logic table for fault code lookups
CREATE TABLE public.diagnostic_logic (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fault_code text NOT NULL UNIQUE,
    fault_description text NOT NULL,
    part_number text NOT NULL,
    part_name text NOT NULL,
    price numeric(10,2) NOT NULL DEFAULT 0,
    category text,
    equipment_types text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on diagnostic_logic
ALTER TABLE public.diagnostic_logic ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read diagnostic_logic (public catalog)
CREATE POLICY "Auth users can view diagnostic logic"
ON public.diagnostic_logic
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify diagnostic_logic
CREATE POLICY "Admins can insert diagnostic logic"
ON public.diagnostic_logic
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update diagnostic logic"
ON public.diagnostic_logic
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete diagnostic logic"
ON public.diagnostic_logic
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create hq_transactions table for revenue tracking with scholarship split
CREATE TABLE public.hq_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    amount numeric(10,2) NOT NULL,
    business_revenue numeric(10,2) NOT NULL,
    scholarship_fund numeric(10,2) NOT NULL,
    transaction_type text NOT NULL DEFAULT 'part_order',
    stripe_payment_intent_id text,
    description text,
    status text NOT NULL DEFAULT 'completed',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on hq_transactions
ALTER TABLE public.hq_transactions ENABLE ROW LEVEL SECURITY;

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.hq_transactions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
ON public.hq_transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role inserts (from edge functions)
CREATE POLICY "Service can insert transactions"
ON public.hq_transactions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Trigger for updated_at on diagnostic_logic
CREATE TRIGGER update_diagnostic_logic_updated_at
BEFORE UPDATE ON public.diagnostic_logic
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some example diagnostic fault codes
INSERT INTO public.diagnostic_logic (fault_code, fault_description, part_number, part_name, price, category, equipment_types)
VALUES 
    ('HIGH_TEMP', 'Hydraulic system overheating', 'HYD-COOL-001', 'Hydraulic Cooler Assembly', 485.00, 'Hydraulic', ARRAY['Excavator', 'Loader']),
    ('LOW_PRESS', 'Low hydraulic pressure detected', 'HYD-PUMP-002', 'Main Hydraulic Pump', 1250.00, 'Hydraulic', ARRAY['Excavator', 'Bulldozer']),
    ('BELT_SLIP', 'Conveyor belt slipping detected', 'BELT-TENS-003', 'Belt Tensioner Kit', 320.00, 'Conveyor', ARRAY['Conveyor']),
    ('TRACK_WEAR', 'Excessive track wear indicated', 'TRACK-PAD-004', 'Track Pad Set (48pc)', 890.00, 'Undercarriage', ARRAY['Excavator', 'Bulldozer']),
    ('ENG_KNOCK', 'Engine knock sensor triggered', 'ENG-INJ-005', 'Fuel Injector Assembly', 675.00, 'Engine', ARRAY['Excavator', 'Loader', 'Bulldozer']);