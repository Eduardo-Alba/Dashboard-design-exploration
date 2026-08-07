-- Modulo experimental: alertas dinamicas creadas por el usuario (no reemplaza alerts_config,
-- que sigue siendo el sistema de 5 tipos fijos). Si se aprueba, ver README para el plan de
-- reemplazar el sistema fijo por este.

create type custom_alert_module as enum ('SALDO', 'CUENTAS_POR_COBRAR', 'CUENTAS_POR_PAGAR');
create type custom_alert_comparator as enum ('MENOR_QUE', 'MAYOR_QUE');
create type custom_alert_action as enum ('AVISAR', 'RECORDAR');

create table custom_alerts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  label text not null,
  module custom_alert_module not null,
  comparator custom_alert_comparator not null,
  threshold numeric not null,
  action custom_alert_action not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table custom_alerts enable row level security;

create policy custom_alerts_select on custom_alerts for select using (
  business_id = current_business_id() and current_user_role() = 'ADMIN'
);
create policy custom_alerts_write on custom_alerts for all
  using (business_id = current_business_id() and current_user_role() = 'ADMIN')
  with check (business_id = current_business_id() and current_user_role() = 'ADMIN');
