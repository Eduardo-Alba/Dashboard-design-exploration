-- Tipos de condicion avanzados para el modulo experimental de alertas personalizadas:
-- comparar un modulo contra otro (en vez de un numero fijo) y vencimiento/antiguedad por
-- cuenta individual (AccountEntry), ademas del "valor fijo" original.
--
-- Limitacion conocida y aceptada: was_triggered/dismissed siguen siendo un booleano por
-- REGLA, no por cuenta. Una regla de VENCIMIENTO que coincide con varias cuentas se agrega
-- en un solo ActiveCustomAlert; descartarla las oculta todas a la vez, no una por una. Para
-- un historial por cuenta haria falta una tabla de eventos aparte (custom_alert_dismissals),
-- fuera de alcance para este modulo experimental.

create type custom_alert_condition_type as enum ('VALOR_FIJO', 'COMPARAR_MODULO', 'VENCIMIENTO');
create type custom_alert_vencimiento_sentido as enum ('ATRASADA', 'PROXIMA');

alter table custom_alerts
  add column condition_type custom_alert_condition_type not null default 'VALOR_FIJO',
  add column compare_module custom_alert_module,
  add column vencimiento_sentido custom_alert_vencimiento_sentido not null default 'ATRASADA',
  alter column threshold drop not null;

-- compare_module solo si COMPARAR_MODULO, nunca igual al modulo propio, nunca
-- PRESUPUESTO_CONSUMIDO (%, no comparable con RD$) ni INGRESOS_HOY (flujo, no stock).
alter table custom_alerts add constraint custom_alerts_compare_module_check check (
  (condition_type = 'COMPARAR_MODULO') = (compare_module is not null)
  and (compare_module is null or compare_module <> module)
  and (condition_type <> 'COMPARAR_MODULO' or module not in ('PRESUPUESTO_CONSUMIDO', 'INGRESOS_HOY'))
  and (compare_module is null or compare_module not in ('PRESUPUESTO_CONSUMIDO', 'INGRESOS_HOY'))
);

-- threshold requerido salvo COMPARAR_MODULO (ahi se compara contra otro modulo, no un numero).
alter table custom_alerts add constraint custom_alerts_threshold_check
  check (condition_type = 'COMPARAR_MODULO' or threshold is not null);

-- VENCIMIENTO solo aplica a los 2 modulos respaldados por AccountEntry (due_date por fila).
alter table custom_alerts add constraint custom_alerts_vencimiento_module_check
  check (condition_type <> 'VENCIMIENTO' or module in ('CUENTAS_POR_COBRAR', 'CUENTAS_POR_PAGAR'));
