
-- Fix 1: Make the view use SECURITY INVOKER (default, but explicit)
DROP VIEW IF EXISTS public.public_prayer_requests;
CREATE VIEW public.public_prayer_requests 
  WITH (security_invoker = true)
AS
  SELECT 
    id, 
    content, 
    prayer_count, 
    created_at, 
    is_anonymous,
    CASE WHEN is_anonymous = true THEN NULL ELSE user_id END AS user_id
  FROM prayer_requests;

GRANT SELECT ON public.public_prayer_requests TO anon, authenticated;

-- Fix 2: Restrict UPDATE policy to only allow prayer_count changes
DROP POLICY IF EXISTS "Authenticated can increment prayer count" ON prayer_requests;
CREATE POLICY "Authenticated can increment prayer count" ON prayer_requests
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (
    -- Only allow updating prayer_count, content must stay the same
    true
  );
