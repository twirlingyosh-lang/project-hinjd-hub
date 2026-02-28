
-- Create order_manifests table
CREATE TABLE public.order_manifests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id UUID REFERENCES public.hq_transactions(id) ON DELETE CASCADE,
  part_number TEXT NOT NULL,
  part_name TEXT NOT NULL,
  order_amount NUMERIC NOT NULL DEFAULT 500,
  shipping_address TEXT,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'generated',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_manifests ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Auth admins view all manifests" ON public.order_manifests
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Auth admins insert manifests" ON public.order_manifests
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Auth admins update manifests" ON public.order_manifests
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Auth admins delete manifests" ON public.order_manifests
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own manifests
CREATE POLICY "Auth view own manifests" ON public.order_manifests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create manifests storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('manifests', 'manifests', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for manifests bucket
CREATE POLICY "Auth admins upload manifests" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'manifests');

CREATE POLICY "Auth admins read manifests" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'manifests');
