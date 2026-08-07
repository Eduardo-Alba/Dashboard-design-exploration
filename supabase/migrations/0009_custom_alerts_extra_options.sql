-- Opciones adicionales del modulo experimental de alertas personalizadas: canales (reutiliza
-- alert_channel de 0001), severidad (solo presentacion), mensaje personalizado con variable
-- {valor}, y estado de disparo/descarte para diferenciar AVISAR (una vez hasta resolver) de
-- RECORDAR (siempre reaparece).

create type custom_alert_severity as enum ('INFO', 'ADVERTENCIA', 'CRITICA');

alter table custom_alerts
  add column channels alert_channel[] not null default '{IN_APP}',
  add column severity custom_alert_severity not null default 'ADVERTENCIA',
  add column custom_message text,
  add column was_triggered boolean not null default false,
  add column dismissed boolean not null default false;
