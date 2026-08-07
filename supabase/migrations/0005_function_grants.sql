-- Los helpers de RLS quedan expuestos por defecto vía /rest/v1/rpc/ (PostgREST). No filtran
-- nada (solo leen el propio perfil del caller, sin parámetros), pero no hay razón para que
-- `anon` los invoque directamente. `authenticated` SÍ necesita EXECUTE: las políticas RLS
-- los llaman en su nombre al evaluar cada query.
--
-- NOTA: esto revoca de PUBLIC, pero Supabase otorga EXECUTE a anon/authenticated de forma
-- directa (default privileges), no solo vía PUBLIC — ver 0006_function_grants_fix.sql, que
-- corrige eso.

revoke execute on function public.current_business_id() from public;
revoke execute on function public.current_user_role() from public;

grant execute on function public.current_business_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;
