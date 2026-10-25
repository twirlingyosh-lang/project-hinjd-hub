alter table public.quote_requests add column if not exists product text not null default 'beltsaver';
alter table public.quote_requests add column if not exists details jsonb;
alter table public.quote_requests add column if not exists estimated_total numeric;