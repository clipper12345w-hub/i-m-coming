
-- Add columns to devotionals
ALTER TABLE public.devotionals
ADD COLUMN IF NOT EXISTS reflection_1 TEXT,
ADD COLUMN IF NOT EXISTS reflection_2 TEXT,
ADD COLUMN IF NOT EXISTS reflection_3 TEXT,
ADD COLUMN IF NOT EXISTS closing_prayer TEXT,
ADD COLUMN IF NOT EXISTS header_image_url TEXT;

-- Add is_featured to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id INT DEFAULT 1 PRIMARY KEY,
  daily_verse TEXT DEFAULT 'For I know the plans I have for you, declares the Lord...',
  daily_verse_reference TEXT DEFAULT 'Jeremiah 29:11',
  ko_fi_url TEXT DEFAULT 'https://ko-fi.com/yourname',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.settings (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Settings policies
CREATE POLICY "Admin read settings" ON public.settings FOR SELECT USING (public.has_role('admin'::app_role));
CREATE POLICY "Admin update settings" ON public.settings FOR UPDATE USING (public.has_role('admin'::app_role));
CREATE POLICY "Admin insert settings" ON public.settings FOR INSERT WITH CHECK (public.has_role('admin'::app_role));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('devotional-images', 'devotional-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Admin upload devotional images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'devotional-images' AND public.has_role('admin'::app_role));
CREATE POLICY "Public read devotional images" ON storage.objects FOR SELECT USING (bucket_id = 'devotional-images');
CREATE POLICY "Admin delete devotional images" ON storage.objects FOR DELETE USING (bucket_id = 'devotional-images' AND public.has_role('admin'::app_role));
CREATE POLICY "Admin upload product files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND public.has_role('admin'::app_role));
CREATE POLICY "Public read product files" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Admin delete product files" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND public.has_role('admin'::app_role));

-- Admin policies for devotionals
CREATE POLICY "Admin insert devotionals" ON public.devotionals FOR INSERT WITH CHECK (public.has_role('admin'::app_role));
CREATE POLICY "Admin update devotionals" ON public.devotionals FOR UPDATE USING (public.has_role('admin'::app_role));
CREATE POLICY "Admin delete devotionals" ON public.devotionals FOR DELETE USING (public.has_role('admin'::app_role));

-- Admin policies for products
CREATE POLICY "Admin insert products" ON public.products FOR INSERT WITH CHECK (public.has_role('admin'::app_role));
CREATE POLICY "Admin update products" ON public.products FOR UPDATE USING (public.has_role('admin'::app_role));
CREATE POLICY "Admin delete products" ON public.products FOR DELETE USING (public.has_role('admin'::app_role));

-- Admin can view and delete all prayer requests
CREATE POLICY "Admin can view all prayers" ON public.prayer_requests FOR SELECT USING (public.has_role('admin'::app_role));
CREATE POLICY "Admin delete prayers" ON public.prayer_requests FOR DELETE USING (public.has_role('admin'::app_role));

-- Admin policies for bible plan
CREATE POLICY "Admin insert bible plan" ON public.bible_plan FOR INSERT WITH CHECK (public.has_role('admin'::app_role));
CREATE POLICY "Admin update bible plan" ON public.bible_plan FOR UPDATE USING (public.has_role('admin'::app_role));
CREATE POLICY "Admin delete bible plan" ON public.bible_plan FOR DELETE USING (public.has_role('admin'::app_role));

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (public.has_role('admin'::app_role));

-- Admin can manage user_roles
CREATE POLICY "Admin can view all roles" ON public.user_roles FOR SELECT USING (public.has_role('admin'::app_role));
CREATE POLICY "Admin can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role('admin'::app_role));
CREATE POLICY "Admin can delete roles" ON public.user_roles FOR DELETE USING (public.has_role('admin'::app_role));

-- Function to get users with email (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  created_at timestamptz,
  email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.created_at, u.email
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE public.has_role('admin'::app_role)
  ORDER BY p.created_at DESC;
$$;
