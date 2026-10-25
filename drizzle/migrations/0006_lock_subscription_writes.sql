drop policy if exists "Auth insert own sub" on public.subscriptions;
drop policy if exists "Auth update own sub" on public.subscriptions;
drop policy if exists "Auth delete own sub" on public.subscriptions;
revoke insert, update, delete on public.subscriptions from authenticated, anon;