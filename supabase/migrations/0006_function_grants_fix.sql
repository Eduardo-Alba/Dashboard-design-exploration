-- Supabase otorga EXECUTE a anon/authenticated directamente (default privileges), no vía
-- PUBLIC — 0005 no alcanzó a anon. Revoca de cada rol explícitamente.

revoke execute on function public.current_business_id() from anon, authenticated, public;
revoke execute on function public.current_user_role() from anon, authenticated, public;

grant execute on function public.current_business_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;
