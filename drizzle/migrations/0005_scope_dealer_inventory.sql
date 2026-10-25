drop policy if exists "Auth view inventory" on public.dealer_inventory;
create policy "View verified dealer inventory" on public.dealer_inventory for select to authenticated
using (public.has_role(auth.uid(), 'admin'::app_role) or exists (select 1 from public.equipment_dealers d where d.id = dealer_id and d.is_verified = true));