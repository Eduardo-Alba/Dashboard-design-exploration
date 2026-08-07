-- FinanZen: Row Level Security. Aislamiento por tenant (business_id) y restricción por rol,
-- ambos enforced aquí (no solo en el frontend) — ver Plan_Despliegue/Interconexiones seguras.

create or replace function public.current_business_id() returns uuid
language sql stable security definer set search_path = public as
$$ select business_id from public.profiles where id = (select auth.uid()) $$;

create or replace function public.current_user_role() returns user_role
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = (select auth.uid()) $$;

alter table businesses enable row level security;
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table alerts_config enable row level security;
alter table receivables_payables enable row level security;

-- businesses
create policy biz_select on businesses for select using (id = current_business_id());
create policy biz_update on businesses for update using (id = current_business_id() and current_user_role() = 'ADMIN');

-- profiles
create policy prof_select on profiles for select using (business_id = current_business_id());
create policy prof_write on profiles for update
  using (business_id = current_business_id() and current_user_role() = 'ADMIN')
  with check (business_id = current_business_id() and current_user_role() = 'ADMIN');

-- transactions: CAJERO solo ve/crea las suyas; ADMIN/CONTADOR ven todo el negocio.
create policy tx_select on transactions for select using (
  business_id = current_business_id()
  and (current_user_role() in ('ADMIN','CONTADOR') or user_id = (select auth.uid()))
);
create policy tx_insert on transactions for insert with check (
  business_id = current_business_id()
  and current_user_role() in ('ADMIN','CAJERO')
  and user_id = (select auth.uid())
);
create policy tx_update on transactions for update using (
  business_id = current_business_id() and current_user_role() = 'ADMIN'
);
create policy tx_delete on transactions for delete using (
  business_id = current_business_id() and current_user_role() = 'ADMIN'
);

-- budgets: regla de negocio #9, CAJERO no ve KPIs/presupuestos globales.
create policy budgets_select on budgets for select using (
  business_id = current_business_id() and current_user_role() in ('ADMIN','CONTADOR')
);
create policy budgets_write on budgets for all
  using (business_id = current_business_id() and current_user_role() = 'ADMIN')
  with check (business_id = current_business_id() and current_user_role() = 'ADMIN');

-- alerts_config: solo ADMIN configura alertas (brief §5.7).
create policy alerts_select on alerts_config for select using (
  business_id = current_business_id() and current_user_role() = 'ADMIN'
);
create policy alerts_write on alerts_config for all
  using (business_id = current_business_id() and current_user_role() = 'ADMIN')
  with check (business_id = current_business_id() and current_user_role() = 'ADMIN');

-- receivables_payables: mismo criterio que budgets.
create policy accounts_select on receivables_payables for select using (
  business_id = current_business_id() and current_user_role() in ('ADMIN','CONTADOR')
);
create policy accounts_write on receivables_payables for all
  using (business_id = current_business_id() and current_user_role() = 'ADMIN')
  with check (business_id = current_business_id() and current_user_role() = 'ADMIN');
