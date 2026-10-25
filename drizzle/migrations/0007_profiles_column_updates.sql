revoke update on public.profiles from authenticated, anon;
grant update (full_name, email, updated_at) on public.profiles to authenticated;