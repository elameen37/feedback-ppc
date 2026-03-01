
DROP POLICY IF EXISTS "Authenticated or anonymous can submit complaints" ON public.complaints;

CREATE POLICY "Authenticated or anonymous can submit complaints"
ON public.complaints
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (submitter_id IS NULL AND anonymous = true)
  OR
  (auth.uid() IS NOT NULL AND submitter_id = auth.uid())
);
