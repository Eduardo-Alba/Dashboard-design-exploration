-- FinanZen: bucket de comprobantes de transacciones (brief §5.4 "Adjuntar comprobante").
-- Restringido a los tipos que esa pantalla realmente sube (foto o PDF), no todo el listado
-- genérico del doc de seguridad (que también menciona .xlsx para otro flujo).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;

create policy receipts_select on storage.objects for select using (
  bucket_id = 'receipts' and (storage.foldername(name))[1] = current_business_id()::text
);

create policy receipts_insert on storage.objects for insert with check (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = current_business_id()::text
  and current_user_role() in ('ADMIN','CAJERO')
);
