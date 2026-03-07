
-- Throughput logs table
CREATE TABLE public.throughput_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crusher TEXT NOT NULL,
  tph NUMERIC NOT NULL DEFAULT 0,
  hours NUMERIC NOT NULL DEFAULT 0,
  material TEXT NOT NULL DEFAULT '',
  notes TEXT,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Repair logs table
CREATE TABLE public.repair_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  equipment TEXT NOT NULL,
  issue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  cost NUMERIC NOT NULL DEFAULT 0,
  downtime NUMERIC NOT NULL DEFAULT 0,
  repair_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.throughput_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for throughput_logs
CREATE POLICY "Auth view own throughput" ON public.throughput_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own throughput" ON public.throughput_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own throughput" ON public.throughput_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own throughput" ON public.throughput_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS policies for repair_logs
CREATE POLICY "Auth view own repairs" ON public.repair_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own repairs" ON public.repair_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own repairs" ON public.repair_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own repairs" ON public.repair_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);
