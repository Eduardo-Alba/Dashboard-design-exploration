-- Sin esto, postgres_changes nunca dispara: las tablas nuevas NO se agregan solas a la
-- publicación de Realtime. Esto es lo que hace funcionar el patrón Observer (store/realtime.ts).

alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table budgets;
alter publication supabase_realtime add table receivables_payables;
