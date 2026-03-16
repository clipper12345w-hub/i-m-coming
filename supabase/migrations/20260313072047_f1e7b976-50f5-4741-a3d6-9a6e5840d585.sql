
-- 1. Replace overly permissive SELECT policy with owner-only access on base table
-- This forces all public reads through the public_prayer_requests view
DROP POLICY IF EXISTS "Prayer requests are public" ON prayer_requests;
CREATE POLICY "Users can view own prayers" ON prayer_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 2. Tighten UPDATE policy to only allow prayer_count changes by authenticated users
DROP POLICY IF EXISTS "Authenticated can increment prayer count" ON prayer_requests;
CREATE POLICY "Authenticated can increment prayer count" ON prayer_requests
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (
    content = (SELECT content FROM prayer_requests WHERE id = prayer_requests.id)
    AND is_anonymous = (SELECT is_anonymous FROM prayer_requests WHERE id = prayer_requests.id)
    AND user_id IS NOT DISTINCT FROM (SELECT user_id FROM prayer_requests WHERE id = prayer_requests.id)
  );

-- 3. Create user_roles table for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can view roles, users can view their own
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 4. Create security definer function for role checking (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
