
-- 1. Fix prayer_reactions INSERT policy to prevent user_id spoofing
DROP POLICY IF EXISTS "Authenticated can react" ON public.prayer_reactions;
CREATE POLICY "Authenticated can react" ON public.prayer_reactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 2. Remove vulnerable UPDATE policy on prayer_requests
DROP POLICY IF EXISTS "Authenticated can increment prayer count" ON prayer_requests;

-- 3. Auto-sync prayer_count via trigger instead
CREATE OR REPLACE FUNCTION public.sync_prayer_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE prayer_requests
  SET prayer_count = (
    SELECT COUNT(*) FROM prayer_reactions
    WHERE prayer_request_id = COALESCE(NEW.prayer_request_id, OLD.prayer_request_id)
  )
  WHERE id = COALESCE(NEW.prayer_request_id, OLD.prayer_request_id);
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_prayer_count
AFTER INSERT OR DELETE ON prayer_reactions
FOR EACH ROW EXECUTE FUNCTION sync_prayer_count();
