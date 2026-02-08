-- Create a table for email leads / free trial signups
CREATE TABLE public.email_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  source TEXT DEFAULT 'landing_page',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (lead capture doesn't require auth)
CREATE POLICY "Anyone can submit a lead"
  ON public.email_leads
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read leads
CREATE POLICY "Admins can view leads"
  ON public.email_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create unique index on email to prevent duplicates
CREATE UNIQUE INDEX idx_email_leads_email ON public.email_leads(email);