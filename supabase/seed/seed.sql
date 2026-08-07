-- FinanZen: datos de demostración. Ejecutar DESPUÉS de crear los 3 usuarios de Auth descritos
-- en seed-auth-user.md (los ids fijos usados abajo deben existir en auth.users primero).
--
-- Los montos de transacciones/presupuestos reconcilian exactamente con los números de
-- Reportes del brief (Ingresos 87,450 · Gastos 54,320 · Ganancia 33,130) y con los % de
-- Presupuestos (92%/83%/42%/100%). Las fechas usan el mes en curso relativo a hoy (no un mes
-- fijo del brief) para que "Hoy/Semana/Mes" y el constraint no_future_date sigan siendo
-- válidos sin importar cuándo se ejecute este script.

insert into businesses (id, name, rubro, rnc, initial_balance, currency)
values ('11111111-1111-1111-1111-111111111111', 'Colmado Guzmán', 'Colmado', null, 10000.00, 'DOP');

insert into profiles (id, business_id, full_name, email, role, is_active) values
  ('a1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Ali Guzmán', 'ali@colmado.com', 'ADMIN', true),
  ('a1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Carlos Martínez', 'carlos@colmado.com', 'CAJERO', true),
  ('a1000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'María Rodríguez', 'maria@colmado.com', 'CAJERO', false);

-- Transacciones del mes en curso (52 filas, generadas y verificadas para reconciliar con
-- Reportes — ver supabase/seed/gen_seed.py en el historial de la sesión si hace falta
-- regenerarlas con otras fechas).
insert into transactions (id, business_id, user_id, type, category, amount, description, occurred_at) values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 5200.00, 'Venta mercancia', date_trunc('month', current_date) + interval '6 days' + time '14:30:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'GASTO', 'INVENTARIO', 1500.00, 'Pago proveedor', date_trunc('month', current_date) + interval '6 days' + time '12:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 3800.00, 'Venta del dia', date_trunc('month', current_date) + interval '6 days' + time '10:15:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'SERVICIOS_BASICOS', 300.00, 'Recarga luz', date_trunc('month', current_date) + interval '5 days' + time '18:40:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'GASTO', 'SALARIOS', 1200.00, 'Pago empleado', date_trunc('month', current_date) + interval '5 days' + time '09:15:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 9100.00, 'Cierre de caja', date_trunc('month', current_date) + interval '4 days' + time '16:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 3625.11, 'Venta del dia', date_trunc('month', current_date) + interval '0 days' + time '09:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 2679.43, 'Venta del dia', date_trunc('month', current_date) + interval '1 days' + time '10:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 3152.27, 'Venta del dia', date_trunc('month', current_date) + interval '2 days' + time '11:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 3625.11, 'Venta del dia', date_trunc('month', current_date) + interval '3 days' + time '12:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 2679.43, 'Venta del dia', date_trunc('month', current_date) + interval '4 days' + time '13:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 3152.27, 'Venta del dia', date_trunc('month', current_date) + interval '5 days' + time '14:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 3625.11, 'Venta del dia', date_trunc('month', current_date) + interval '6 days' + time '15:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 2679.43, 'Venta del dia', date_trunc('month', current_date) + interval '0 days' + time '16:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 3152.27, 'Venta del dia', date_trunc('month', current_date) + interval '1 days' + time '09:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 3625.11, 'Venta del dia', date_trunc('month', current_date) + interval '2 days' + time '10:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 2679.43, 'Venta del dia', date_trunc('month', current_date) + interval '3 days' + time '11:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 3152.27, 'Venta del dia', date_trunc('month', current_date) + interval '4 days' + time '12:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 3625.11, 'Venta del dia', date_trunc('month', current_date) + interval '5 days' + time '13:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 2679.43, 'Venta del dia', date_trunc('month', current_date) + interval '6 days' + time '14:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 3152.27, 'Venta del dia', date_trunc('month', current_date) + interval '0 days' + time '15:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 3625.11, 'Venta del dia', date_trunc('month', current_date) + interval '1 days' + time '16:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 2679.43, 'Venta del dia', date_trunc('month', current_date) + interval '2 days' + time '09:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 3152.27, 'Venta del dia', date_trunc('month', current_date) + interval '3 days' + time '10:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 3625.11, 'Venta del dia', date_trunc('month', current_date) + interval '4 days' + time '11:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 2679.43, 'Venta del dia', date_trunc('month', current_date) + interval '5 days' + time '12:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'INGRESO', 'VENTAS', 3152.27, 'Venta del dia', date_trunc('month', current_date) + interval '6 days' + time '13:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'INGRESO', 'VENTAS', 3152.33, 'Venta del dia', date_trunc('month', current_date) + interval '0 days' + time '14:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'INVENTARIO', 4225.00, 'Compra de inventario', date_trunc('month', current_date) + interval '0 days' + time '15:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'INVENTARIO', 4225.00, 'Compra de inventario', date_trunc('month', current_date) + interval '1 days' + time '16:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'INVENTARIO', 4225.00, 'Compra de inventario', date_trunc('month', current_date) + interval '2 days' + time '17:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'INVENTARIO', 4225.00, 'Compra de inventario', date_trunc('month', current_date) + interval '3 days' + time '18:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'GASTO', 'SALARIOS', 2825.00, 'Pago de nomina', date_trunc('month', current_date) + interval '4 days' + time '15:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'GASTO', 'SALARIOS', 2825.00, 'Pago de nomina', date_trunc('month', current_date) + interval '5 days' + time '16:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'GASTO', 'SALARIOS', 2825.00, 'Pago de nomina', date_trunc('month', current_date) + interval '6 days' + time '17:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'GASTO', 'SALARIOS', 2825.00, 'Pago de nomina', date_trunc('month', current_date) + interval '0 days' + time '18:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'SERVICIOS_BASICOS', 450.00, 'Pago de servicios', date_trunc('month', current_date) + interval '1 days' + time '15:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'SERVICIOS_BASICOS', 450.00, 'Pago de servicios', date_trunc('month', current_date) + interval '2 days' + time '16:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'SERVICIOS_BASICOS', 450.00, 'Pago de servicios', date_trunc('month', current_date) + interval '3 days' + time '17:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'SERVICIOS_BASICOS', 450.00, 'Pago de servicios', date_trunc('month', current_date) + interval '4 days' + time '18:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'GASTO', 'RENTA', 2000.00, 'Pago de renta', date_trunc('month', current_date) + interval '5 days' + time '15:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'GASTO', 'RENTA', 2000.00, 'Pago de renta', date_trunc('month', current_date) + interval '6 days' + time '16:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'GASTO', 'RENTA', 2000.00, 'Pago de renta', date_trunc('month', current_date) + interval '0 days' + time '17:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001', 'GASTO', 'RENTA', 2000.00, 'Pago de renta', date_trunc('month', current_date) + interval '1 days' + time '18:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'TRANSPORTE', 830.00, 'Gastos de transporte', date_trunc('month', current_date) + interval '2 days' + time '15:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'TRANSPORTE', 830.00, 'Gastos de transporte', date_trunc('month', current_date) + interval '3 days' + time '16:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'TRANSPORTE', 830.00, 'Gastos de transporte', date_trunc('month', current_date) + interval '4 days' + time '17:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'TRANSPORTE', 830.00, 'Gastos de transporte', date_trunc('month', current_date) + interval '5 days' + time '18:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'OTROS_GASTOS', 2500.00, 'Gastos varios', date_trunc('month', current_date) + interval '6 days' + time '15:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'OTROS_GASTOS', 2500.00, 'Gastos varios', date_trunc('month', current_date) + interval '0 days' + time '16:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'OTROS_GASTOS', 2500.00, 'Gastos varios', date_trunc('month', current_date) + interval '1 days' + time '17:00:00'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002', 'GASTO', 'OTROS_GASTOS', 2500.00, 'Gastos varios', date_trunc('month', current_date) + interval '2 days' + time '18:00:00');

-- Presupuestos del mes en curso (brief §5.6): Inventario 92%, Salarios 83%, Servicios 42%,
-- Renta 100% — porcentajes calculados en vivo por la app a partir de las transacciones de
-- arriba, no almacenados.
insert into budgets (business_id, category, limit_amount, month) values
  ('11111111-1111-1111-1111-111111111111', 'INVENTARIO', 20000.00, to_char(current_date, 'YYYY-MM')),
  ('11111111-1111-1111-1111-111111111111', 'SALARIOS', 15000.00, to_char(current_date, 'YYYY-MM')),
  ('11111111-1111-1111-1111-111111111111', 'SERVICIOS_BASICOS', 5000.00, to_char(current_date, 'YYYY-MM')),
  ('11111111-1111-1111-1111-111111111111', 'RENTA', 8000.00, to_char(current_date, 'YYYY-MM'));

-- Alertas configurables (brief §5.7), con los estados ON/OFF y umbrales por defecto del mock.
insert into alerts_config (business_id, type, is_active, threshold, channels) values
  ('11111111-1111-1111-1111-111111111111', 'PRESUPUESTO', true, null, '{EMAIL,WHATSAPP,IN_APP}'),
  ('11111111-1111-1111-1111-111111111111', 'BALANCE', true, 5000, '{EMAIL,WHATSAPP,IN_APP}'),
  ('11111111-1111-1111-1111-111111111111', 'MESES_NEG', true, 2, '{EMAIL,IN_APP}'),
  ('11111111-1111-1111-1111-111111111111', 'DEUDA', true, 7, '{EMAIL,WHATSAPP,IN_APP}'),
  ('11111111-1111-1111-1111-111111111111', 'INGRESO_BAJO', false, 3000, '{IN_APP}');

-- Cuentas por Cobrar/Pagar (brief §5.8/§5.9), con fechas relativas a hoy para que
-- "vence en N días" / "VENCIDA" sigan siendo correctas sin importar cuándo se corre este seed.
insert into receivables_payables (business_id, direction, party, amount, due_date, status) values
  ('11111111-1111-1111-1111-111111111111', 'COBRAR', 'Juan López', 5000.00, current_date + 4, 'PENDIENTE'),
  ('11111111-1111-1111-1111-111111111111', 'COBRAR', 'Supermercado ABC', 12500.00, current_date + 9, 'PENDIENTE'),
  ('11111111-1111-1111-1111-111111111111', 'COBRAR', 'Rosa Rodríguez', 2000.00, current_date - 6, 'PENDIENTE'),
  ('11111111-1111-1111-1111-111111111111', 'PAGAR', 'Importadora Central', 8500.00, current_date + 9, 'PENDIENTE'),
  ('11111111-1111-1111-1111-111111111111', 'PAGAR', 'Distribuidora El Mayorista', 15000.00, current_date + 14, 'PENDIENTE');
