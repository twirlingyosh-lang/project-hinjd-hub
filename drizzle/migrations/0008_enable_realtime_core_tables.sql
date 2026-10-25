do $$ declare t text; begin
  foreach t in array array['quote_requests','crm_invoices','crm_deals','crm_clients','belt_diagnostics','equipment_diagnostics','fleet_units','throughput_logs','repair_logs'] loop
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;