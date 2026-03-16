
-- PROFILES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- DEVOTIONALS
CREATE TABLE public.devotionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  verse TEXT,
  verse_reference TEXT,
  published_date DATE UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Devotionals are public" ON public.devotionals FOR SELECT USING (true);

-- PRAYER REQUESTS
CREATE TABLE public.prayer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  prayer_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prayer requests are public" ON public.prayer_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post" ON public.prayer_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- BIBLE PLAN
CREATE TABLE public.bible_plan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INT UNIQUE NOT NULL,
  old_testament TEXT,
  new_testament TEXT,
  psalm TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.bible_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bible plan is public" ON public.bible_plan FOR SELECT USING (true);

-- BIBLE PLAN PROGRESS
CREATE TABLE public.bible_plan_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_number INT REFERENCES public.bible_plan(day_number) NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, day_number)
);
ALTER TABLE public.bible_plan_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own progress" ON public.bible_plan_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.bible_plan_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own progress" ON public.bible_plan_progress FOR DELETE USING (auth.uid() = user_id);

-- PRODUCTS
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  payhip_link TEXT,
  image_url TEXT,
  type TEXT CHECK(type IN ('ebook','wallpaper')) NOT NULL,
  price_usd DECIMAL(10,2),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (is_published = true);

-- PRAYER REACTIONS
CREATE TABLE public.prayer_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prayer_request_id UUID REFERENCES public.prayer_requests(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, prayer_request_id)
);
ALTER TABLE public.prayer_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reactions" ON public.prayer_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated can react" ON public.prayer_reactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users delete own reaction" ON public.prayer_reactions FOR DELETE USING (auth.uid() = user_id);

-- AUTO-CREATE PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
