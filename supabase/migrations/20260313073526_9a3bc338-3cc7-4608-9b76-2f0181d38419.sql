
-- 1. Add content length constraint on prayer_requests
ALTER TABLE prayer_requests
  ADD CONSTRAINT prayer_content_length CHECK (char_length(content) BETWEEN 1 AND 2000);

-- 2. Restrict prayer_reactions reads to own reactions only
DROP POLICY IF EXISTS "Public read reactions" ON public.prayer_reactions;
CREATE POLICY "Users see own reactions" ON public.prayer_reactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
