
-- 1. Create a secure view that hides user_id for anonymous prayers
CREATE OR REPLACE VIEW public.public_prayer_requests AS
  SELECT 
    id, 
    content, 
    prayer_count, 
    created_at, 
    is_anonymous,
    CASE WHEN is_anonymous = true THEN NULL ELSE user_id END AS user_id
  FROM prayer_requests;

-- Grant access to the view
GRANT SELECT ON public.public_prayer_requests TO anon, authenticated;

-- 2. Fix INSERT policy to prevent user_id spoofing
DROP POLICY IF EXISTS "Authenticated users can post" ON prayer_requests;
CREATE POLICY "Authenticated users can post" ON prayer_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- 3. Allow authenticated users to UPDATE prayer_count (for pray reactions)
CREATE POLICY "Authenticated can increment prayer count" ON prayer_requests
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
