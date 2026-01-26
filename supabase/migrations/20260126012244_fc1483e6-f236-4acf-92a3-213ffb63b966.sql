-- Create CRM tables for clients, deals, and invoices

-- Clients table
CREATE TABLE public.crm_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  profile_picture_url TEXT,
  sentiment_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clients
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients
CREATE POLICY "Users can view own clients" ON public.crm_clients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON public.crm_clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON public.crm_clients
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON public.crm_clients
  FOR DELETE USING (auth.uid() = user_id);

-- Deals table with stages
CREATE TABLE public.crm_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'lead',
  expected_close_date DATE,
  contract_url TEXT,
  ai_next_steps TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on deals
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;

-- RLS policies for deals
CREATE POLICY "Users can view own deals" ON public.crm_deals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deals" ON public.crm_deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deals" ON public.crm_deals
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own deals" ON public.crm_deals
  FOR DELETE USING (auth.uid() = user_id);

-- Invoices table
CREATE TABLE public.crm_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  due_date DATE,
  pdf_url TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on invoices
ALTER TABLE public.crm_invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoices
CREATE POLICY "Users can view own invoices" ON public.crm_invoices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invoices" ON public.crm_invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON public.crm_invoices
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own invoices" ON public.crm_invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Client messages table for AI classification
CREATE TABLE public.crm_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.crm_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Users can view own messages" ON public.crm_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.crm_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.crm_messages
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.crm_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_crm_clients_updated_at
  BEFORE UPDATE ON public.crm_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_deals_updated_at
  BEFORE UPDATE ON public.crm_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_invoices_updated_at
  BEFORE UPDATE ON public.crm_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets for CRM files
INSERT INTO storage.buckets (id, name, public) VALUES ('crm-contracts', 'crm-contracts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('crm-invoices', 'crm-invoices', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('crm-profiles', 'crm-profiles', true);

-- Storage policies for contracts (private, user-owned)
CREATE POLICY "Users can upload contracts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'crm-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own contracts" ON storage.objects
  FOR SELECT USING (bucket_id = 'crm-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own contracts" ON storage.objects
  FOR DELETE USING (bucket_id = 'crm-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for invoices (private, user-owned)
CREATE POLICY "Users can upload invoice PDFs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'crm-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own invoice PDFs" ON storage.objects
  FOR SELECT USING (bucket_id = 'crm-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own invoice PDFs" ON storage.objects
  FOR DELETE USING (bucket_id = 'crm-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for profile pictures (public viewing)
CREATE POLICY "Anyone can view profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'crm-profiles');
CREATE POLICY "Users can upload profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'crm-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update profile pictures" ON storage.objects
  FOR UPDATE USING (bucket_id = 'crm-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete profile pictures" ON storage.objects
  FOR DELETE USING (bucket_id = 'crm-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);