# FinanZen

PWA de gestión financiera para micro y pequeños negocios dominicanos. React + Vite + TypeScript + Tailwind, Supabase (PostgreSQL, Auth, Realtime, Storage), desplegado en Vercel.

## Demo

- **URL**: (pendiente de desplegar en Vercel)
- **Usuario**: `ali@colmado.com`
- **Contraseña**: `FinanZen2026!`
- Rol: Administrador — acceso completo (dashboard, transacciones, presupuestos, alertas, cuentas por cobrar/pagar, reportes, usuarios, configuración).
- También existen `carlos@colmado.com` (Cajero, activo) y `maria@colmado.com` (Cajero, inactivo) con la misma contraseña, para probar los permisos por rol.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completa con tu proyecto Supabase
npm run dev
```

## Backend (Supabase)

Migraciones en `supabase/migrations/`, en orden:
1. `0001_schema.sql` — tablas y enums
2. `0002_rls_policies.sql` — Row Level Security (aislamiento por negocio + rol)
3. `0003_storage.sql` — bucket de comprobantes
4. `0004_realtime.sql` — habilita Realtime en las tablas que lo necesitan (patrón Observer)
5. `0005_function_grants.sql` + `0006_function_grants_fix.sql` — cierra el acceso público a las funciones helper de RLS

Datos de demo en `supabase/seed/seed.sql`. Los 3 usuarios de Auth (`ali@colmado.com`, `carlos@colmado.com`, `maria@colmado.com`) deben existir en `auth.users` **antes** de correr el seed, porque `profiles` referencia sus IDs — ver `supabase/seed/seed-auth-user.md`.

## Scripts

- `npm run dev` — servidor local
- `npm run build` — build de producción
- `npm run test` — pruebas (Vitest)
- `npm run typecheck` — chequeo de tipos
