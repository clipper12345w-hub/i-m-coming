
-- Fix 1: Set security_invoker on prayer views to enforce base-table RLS
ALTER VIEW prayer_requests_public SET (security_invoker = true);
ALTER VIEW prayer_comments_public SET (security_invoker = true);

-- Fix 2: Recreate products_public view to hide file_url for paid products
DROP VIEW IF EXISTS products_public;
CREATE VIEW products_public AS
  SELECT
    id, title, description, type, image_url, price_usd, payhip_link,
    is_featured, is_free, is_published, created_at,
    CASE WHEN is_free = true THEN file_url ELSE NULL END AS file_url
  FROM products
  WHERE is_published = true;

ALTER VIEW products_public SET (security_invoker = true);
