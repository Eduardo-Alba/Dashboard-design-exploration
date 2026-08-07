# Crear los usuarios demo de Auth antes de correr seed.sql

`seed.sql` inserta filas en `profiles` referenciando estos IDs fijos. Deben existir primero en
`auth.users` — no se pueden crear con un `insert` directo (GoTrue los administra), hay que usar
la Admin API. Corre esto una vez (Node/consola, con la **service role key**, nunca la anon key):

```js
import { createClient } from '@supabase/supabase-js'
const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const DEMO_PASSWORD = '<elige una contraseña de prueba y documéntala en README.md>'

await admin.auth.admin.createUser({
  id: 'a1000000-0000-0000-0000-000000000001',
  email: 'ali@colmado.com',
  password: DEMO_PASSWORD,
  email_confirm: true,
})
await admin.auth.admin.createUser({
  id: 'a1000000-0000-0000-0000-000000000002',
  email: 'carlos@colmado.com',
  password: DEMO_PASSWORD,
  email_confirm: true,
})
await admin.auth.admin.createUser({
  id: 'a1000000-0000-0000-0000-000000000003',
  email: 'maria@colmado.com',
  password: DEMO_PASSWORD,
  email_confirm: true,
})
```

Luego corre `supabase/migrations/0001_schema.sql` → `0002_rls_policies.sql` → `0003_storage.sql`
→ `supabase/seed/seed.sql` en ese orden (SQL Editor de Supabase o `supabase db execute`).

Actualiza `README.md` con la contraseña real que uses — es la que se entrega como "contraseña
de prueba" en la demo.
