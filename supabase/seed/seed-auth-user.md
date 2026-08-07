# Crear los usuarios demo de Auth antes de correr seed.sql

`seed.sql` inserta filas en `profiles` referenciando estos IDs fijos, que deben existir primero
en `auth.users`.

## Opción recomendada: Admin API

Si tienes acceso a la Admin API (Node + `@supabase/supabase-js` + **service role key**, nunca la
anon key):

```js
import { createClient } from '@supabase/supabase-js'
const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const DEMO_PASSWORD = 'FinanZen2026!'

for (const [id, email] of [
  ['a1000000-0000-0000-0000-000000000001', 'ali@colmado.com'],
  ['a1000000-0000-0000-0000-000000000002', 'carlos@colmado.com'],
  ['a1000000-0000-0000-0000-000000000003', 'maria@colmado.com'],
]) {
  await admin.auth.admin.createUser({ id, email, password: DEMO_PASSWORD, email_confirm: true })
}
```

## Alternativa: SQL directo (usada en este proyecto)

El MCP de Supabase usado para desplegar este proyecto no expone un tool de Admin API para
crear usuarios, así que se insertó directamente en `auth.users` + `auth.identities` (patrón
conocido de la comunidad para seeding, no soportado oficialmente — revisar si cambia el
esquema interno de GoTrue en futuras versiones de Supabase):

```sql
do $$
declare
  ali_id uuid := 'a1000000-0000-0000-0000-000000000001';
  carlos_id uuid := 'a1000000-0000-0000-0000-000000000002';
  maria_id uuid := 'a1000000-0000-0000-0000-000000000003';
  demo_password text := 'FinanZen2026!';
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values
  ('00000000-0000-0000-0000-000000000000', ali_id, 'authenticated', 'authenticated', 'ali@colmado.com', crypt(demo_password, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', carlos_id, 'authenticated', 'authenticated', 'carlos@colmado.com', crypt(demo_password, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', maria_id, 'authenticated', 'authenticated', 'maria@colmado.com', crypt(demo_password, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values
  (gen_random_uuid(), ali_id, ali_id::text, jsonb_build_object('sub', ali_id::text, 'email', 'ali@colmado.com'), 'email', now(), now(), now()),
  (gen_random_uuid(), carlos_id, carlos_id::text, jsonb_build_object('sub', carlos_id::text, 'email', 'carlos@colmado.com'), 'email', now(), now(), now()),
  (gen_random_uuid(), maria_id, maria_id::text, jsonb_build_object('sub', maria_id::text, 'email', 'maria@colmado.com'), 'email', now(), now(), now());
end $$;
```

Requiere `create extension if not exists pgcrypto;` (ya viene en `0001_schema.sql`). Nota:
`confirmed_at` es una columna generada en versiones recientes de GoTrue — no se puede insertar
directamente, se deriva de `email_confirmed_at`.

## Luego

Corre las migraciones (`0001` → `0006`) y `supabase/seed/seed.sql` en ese orden.

La contraseña de demo (`FinanZen2026!`) ya está documentada en `README.md` como la que se
entrega para la demo del curso.
