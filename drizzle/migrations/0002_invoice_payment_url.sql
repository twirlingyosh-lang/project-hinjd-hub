ALTER TABLE public.crm_invoices ADD COLUMN IF NOT EXISTS payment_url text;
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS invoice_id uuid;