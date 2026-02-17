
-- Drop the overly permissive policy
DROP POLICY "Anyone can submit complaints" ON public.complaints;

-- Replace with a policy that requires either authentication or valid submission data
CREATE POLICY "Authenticated or anonymous can submit complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND submitter_id = auth.uid())
    OR
    (submitter_id IS NULL AND anonymous = true)
  );
