
-- Create devotional_reactions table
CREATE TABLE public.devotional_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  devotional_id uuid NOT NULL REFERENCES public.devotionals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('amen', 'touched', 'enlightened')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (devotional_id, user_id, reaction_type)
);

ALTER TABLE public.devotional_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read devotional reactions" ON public.devotional_reactions FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated insert devotional reactions" ON public.devotional_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own devotional reactions" ON public.devotional_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create saved_devotionals table
CREATE TABLE public.saved_devotionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  devotional_id uuid NOT NULL REFERENCES public.devotionals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, devotional_id)
);

ALTER TABLE public.saved_devotionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own saved devotionals" ON public.saved_devotionals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saved devotionals" ON public.saved_devotionals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own saved devotionals" ON public.saved_devotionals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add public read policy for settings (daily_verse needs to be publicly readable)
CREATE POLICY "Public read settings" ON public.settings FOR SELECT TO public USING (true);

-- Add public SELECT on prayer_requests for the prayer room (all prayers visible to everyone)
CREATE POLICY "Public can view all prayers" ON public.prayer_requests FOR SELECT TO public USING (true);
