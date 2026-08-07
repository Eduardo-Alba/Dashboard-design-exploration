-- FinanZen: esquema base. Multi-tenant por business_id, ver 0002_rls_policies.sql para el
-- aislamiento por RLS.

create extension if not exists pgcrypto;

create type user_role as enum ('ADMIN','CAJERO','CONTADOR');
create type transaction_type as enum ('INGRESO','GASTO');
create type transaction_category as enum (
  'VENTAS','SERVICIOS','PRESTAMO_RECIBIDO','OTROS_INGRESOS',
  'INVENTARIO','SALARIOS','SERVICIOS_BASICOS','RENTA','TRANSPORTE','OTROS_GASTOS'
);
create type account_direction as enum ('COBRAR','PAGAR');
create type account_status as enum ('PENDIENTE','PAGADO','VENCIDA');
create type alert_type as enum ('PRESUPUESTO','BALANCE','MESES_NEG','DEUDA','INGRESO_BAJO');
create type alert_channel as enum ('EMAIL','WHATSAPP','IN_APP');

create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rubro text not null,
  rnc text,
  initial_balance numeric(12,2) not null default 0,
  currency text not null default 'DOP',
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'CAJERO',
  is_active boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now()
);
create index profiles_business_id_idx on profiles (business_id);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references profiles(id),
  type transaction_type not null,
  category transaction_category not null,
  amount numeric(12,2) not null check (amount > 0),
  description text,
  occurred_at timestamptz not null default now(),
  document_url text,
  created_at timestamptz not null default now(),
  constraint no_future_date check (occurred_at <= now() + interval '1 minute')
);
create index transactions_business_occurred_idx on transactions (business_id, occurred_at desc);
create index transactions_business_user_idx on transactions (business_id, user_id);

create table budgets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  category transaction_category not null,
  limit_amount numeric(12,2) not null check (limit_amount > 0),
  month char(7) not null check (month ~ '^\d{4}-\d{2}$'),
  created_at timestamptz not null default now(),
  unique (business_id, category, month)
);

create table alerts_config (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  type alert_type not null,
  is_active boolean not null default true,
  threshold numeric(12,2),
  channels alert_channel[] not null default '{EMAIL,WHATSAPP,IN_APP}',
  updated_at timestamptz not null default now(),
  unique (business_id, type)
);

create table receivables_payables (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  direction account_direction not null,
  party text not null,
  amount numeric(12,2) not null check (amount > 0),
  due_date date not null,
  status account_status not null default 'PENDIENTE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index receivables_payables_business_idx on receivables_payables (business_id, direction, status);
