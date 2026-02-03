-- Create treasury_metrics table to store dashboard state
CREATE TABLE public.treasury_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  total_wealth numeric NOT NULL DEFAULT 0,
  active_leases integer NOT NULL DEFAULT 0,
  staked_sol numeric NOT NULL DEFAULT 0,
  rewards_earned numeric NOT NULL DEFAULT 0,
  milestone_target numeric NOT NULL DEFAULT 125000,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create fleet_units table to track active leases/units
CREATE TABLE public.fleet_units (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  unit_name text NOT NULL,
  unit_type text DEFAULT 'standard',
  status text NOT NULL DEFAULT 'active',
  monthly_revenue numeric DEFAULT 0,
  acquisition_date date,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create treasury_activity table for activity feed
CREATE TABLE public.treasury_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  amount numeric,
  description text,
  status text NOT NULL DEFAULT 'success',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.treasury_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for treasury_metrics
CREATE POLICY "Users can view own treasury metrics"
  ON public.treasury_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own treasury metrics"
  ON public.treasury_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own treasury metrics"
  ON public.treasury_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for fleet_units
CREATE POLICY "Users can view own fleet units"
  ON public.fleet_units FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fleet units"
  ON public.fleet_units FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fleet units"
  ON public.fleet_units FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fleet units"
  ON public.fleet_units FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for treasury_activity
CREATE POLICY "Users can view own treasury activity"
  ON public.treasury_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own treasury activity"
  ON public.treasury_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_treasury_metrics_updated_at
  BEFORE UPDATE ON public.treasury_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fleet_units_updated_at
  BEFORE UPDATE ON public.fleet_units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();