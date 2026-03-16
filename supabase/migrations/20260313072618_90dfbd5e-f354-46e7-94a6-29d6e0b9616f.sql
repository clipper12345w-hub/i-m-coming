
-- Drop old function with user_id parameter
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Recreate without _user_id — always checks the authenticated caller
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role
  )
$$;
