-- Extiende el modulo experimental con las dos reglas de negocio que faltaban (presupuesto y
-- ingreso bajo), completando el espejo de los 5 tipos de alerts_config.
alter type custom_alert_module add value 'PRESUPUESTO_CONSUMIDO';
alter type custom_alert_module add value 'INGRESOS_HOY';
