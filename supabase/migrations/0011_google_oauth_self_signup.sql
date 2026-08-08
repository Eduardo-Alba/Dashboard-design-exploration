-- Alta automatica para usuarios nuevos via OAuth (Google): se unen al UNICO negocio demo como
-- CAJERO. Alcance de un solo tenant (Sign Up real descartado). business_id fijo al literal
-- sembrado, no a una subconsulta contra `businesses` — un usuario sin perfil aun no puede leer
-- esa tabla (su RLS depende de ya tener un perfil), asi que una subquery no resolveria nada.
create policy prof_self_insert on profiles for insert with check (
  id = auth.uid()
  and business_id = '11111111-1111-1111-1111-111111111111'
  and role = 'CAJERO'
  and is_active = true
);
