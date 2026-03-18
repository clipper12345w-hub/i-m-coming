
-- Add original_price_usd for showing strikethrough pricing
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price_usd numeric;

-- Recreate products_public view to include original_price_usd
DROP VIEW IF EXISTS public.products_public;
CREATE VIEW public.products_public WITH (security_invoker = true) AS
SELECT
  id,
  title,
  description,
  type,
  price_usd,
  original_price_usd,
  payhip_link,
  image_url,
  is_free,
  is_published,
  is_featured,
  created_at,
  CASE WHEN is_free = true THEN file_url ELSE NULL END AS file_url
FROM public.products;
