-- Create belt diagnostics history table
CREATE TABLE public.belt_diagnostics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location TEXT NOT NULL,
  tracking_direction TEXT NOT NULL,
  severity TEXT NOT NULL,
  cause TEXT NOT NULL,
  recommendations TEXT[] NOT NULL,
  belt_saver_benefits TEXT[] NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE public.belt_diagnostics ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (diagnostics can be viewed by anyone)
CREATE POLICY "Anyone can view diagnostics" 
ON public.belt_diagnostics 
FOR SELECT 
USING (true);

-- Create policy for public insert (anyone can create a diagnostic entry)
CREATE POLICY "Anyone can create diagnostics" 
ON public.belt_diagnostics 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public update (anyone can update diagnostics)
CREATE POLICY "Anyone can update diagnostics" 
ON public.belt_diagnostics 
FOR UPDATE 
USING (true);

-- Create index for faster queries by date
CREATE INDEX idx_belt_diagnostics_created_at ON public.belt_diagnostics(created_at DESC);

-- Create index for filtering by status
CREATE INDEX idx_belt_diagnostics_status ON public.belt_diagnostics(status);