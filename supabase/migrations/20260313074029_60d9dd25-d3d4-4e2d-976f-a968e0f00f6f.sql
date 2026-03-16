
-- 1. Rewrite public_prayer_requests view to mask user_id for anonymous prayers
CREATE OR REPLACE VIEW public.public_prayer_requests
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

-- 2. Harden user_roles: block all direct writes
-- RLS is already enabled, SELECT policy already exists ("Users can view own roles")
-- Block inserts, updates, deletes from regular users
CREATE POLICY "No direct inserts" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct updates" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "No direct deletes" ON public.user_roles
  FOR DELETE TO authenticated
  USING (false);
