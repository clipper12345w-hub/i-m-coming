-- Make products bucket private to prevent direct URL access to paid files
UPDATE storage.buckets SET public = false WHERE id = 'products';

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Public read product files" ON storage.objects;

-- Allow authenticated users (admins) to still upload
-- Keep existing upload policies intact