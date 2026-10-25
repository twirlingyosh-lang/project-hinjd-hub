create or replace function public.my_client_ids() returns setof uuid language sql stable security definer set search_path=public as $$
  select id from public.crm_clients where lower(email) = lower(auth.jwt()->>'email')
$$;
revoke execute on function public.my_client_ids() from public, anon;
grant execute on function public.my_client_ids() to authenticated;
create policy "Customers view own quotes" on public.quote_requests for select to authenticated using (lower(email) = lower(auth.jwt()->>'email'));
create policy "Customers view own invoices" on public.crm_invoices for select to authenticated using (client_id in (select public.my_client_ids()));