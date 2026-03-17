DROP VIEW IF EXISTS public.prayer_requests_public;
CREATE VIEW public.prayer_requests_public
  WITH (security_invoker = true)
AS
  SELECT
    id,
    content,
    is_anonymous,
    prayer_count,
    created_at,
    CASE WHEN is_anonymous = true THEN NULL ELSE user_id END AS user_id
  FROM prayer_requests;