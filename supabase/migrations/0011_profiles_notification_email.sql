-- Correo real de entrega para notificaciones, separado del email de login/display (profiles.email).
-- Si es null, se usa el email de Auth del usuario (comportamiento actual sin cambios).
alter table profiles add column notification_email text;
