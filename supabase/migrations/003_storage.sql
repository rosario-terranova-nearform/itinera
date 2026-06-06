-- Itinera – Storage Configuration
-- Migration 003: Storage bucket signed-sheets e policies

-- ============================================================================
-- 5.5 – Storage Bucket: signed-sheets
-- ============================================================================

-- Crea bucket signed-sheets (privato, max 10MB, solo JPEG/PNG/WEBP/PDF)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signed-sheets',
  'signed-sheets',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy INSERT: solo rappresentanti autenticati
DROP POLICY IF EXISTS "rep_insert_signed_sheets" ON storage.objects;
CREATE POLICY "rep_insert_signed_sheets" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'signed-sheets'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'representative'
);

-- Policy SELECT:
--   - admin: tutti i file
--   - rep: solo i file degli appuntamenti di cui è rappresentante
DROP POLICY IF EXISTS "select_signed_sheets" ON storage.objects;
CREATE POLICY "select_signed_sheets" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'signed-sheets'
  AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'representative'
      AND (
        SELECT representative_id FROM public.appointments WHERE id::text = (storage.foldername(name))[1]
      ) = auth.uid()
    )
  )
);

-- Policy DELETE: solo admin
DROP POLICY IF EXISTS "admin_delete_signed_sheets" ON storage.objects;
CREATE POLICY "admin_delete_signed_sheets" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'signed-sheets'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
