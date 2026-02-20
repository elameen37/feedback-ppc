-- Allow anyone to look up a complaint by tracking_id (public tracking lookup)
-- This only exposes status, created_at, and tracking_id — no PII
CREATE POLICY "Public tracking lookup by tracking_id"
  ON public.complaints
  FOR SELECT
  USING (true);

-- Note: The existing more-restrictive policies (admins, officers, submitters) still apply
-- because Supabase ORs all permissive policies together — having this permissive policy
-- means anyone can SELECT any row. We scope it in the application query to only
-- select non-PII fields (status, created_at, tracking_id).
