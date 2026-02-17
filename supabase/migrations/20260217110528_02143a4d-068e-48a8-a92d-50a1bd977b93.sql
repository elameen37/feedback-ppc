
-- Enum for complaint status
CREATE TYPE public.complaint_status AS ENUM ('submitted', 'under_review', 'assigned', 'responded', 'closed');

-- Enum for complaint category
CREATE TYPE public.complaint_category AS ENUM ('corruption', 'abuse_of_office', 'misconduct', 'policy_suggestion', 'public_service_concern', 'anti_corruption_idea', 'observation', 'self_report_officer', 'self_report_individual', 'self_report_organization');

-- Enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'officer');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT NOT NULL UNIQUE,
  submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous BOOLEAN NOT NULL DEFAULT false,
  submitter_name TEXT,
  submitter_contact TEXT,
  category complaint_category NOT NULL,
  description TEXT NOT NULL,
  submission_type TEXT NOT NULL DEFAULT 'complainant',
  status complaint_status NOT NULL DEFAULT 'submitted',
  reference_id TEXT,
  response_text TEXT,
  declaration_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Complaint assignments
CREATE TABLE public.complaint_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (complaint_id, assigned_to)
);

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  previous_status complaint_status,
  new_status complaint_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: is current user admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Helper: is current user officer
CREATE OR REPLACE FUNCTION public.is_officer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'officer')
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Audit log trigger on complaint status change
CREATE OR REPLACE FUNCTION public.log_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_logs (complaint_id, previous_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_complaint_status_change
  AFTER UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.log_complaint_status_change();

-- ========== RLS POLICIES ==========

-- Profiles: users see own, admins/officers see all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() OR public.is_officer());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System inserts profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User roles: only admins manage, officers can read
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin());

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Complaints: public can insert, admins see all, officers see assigned, owners see own
CREATE POLICY "Anyone can submit complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins see all complaints"
  ON public.complaints FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Officers see assigned complaints"
  ON public.complaints FOR SELECT
  USING (
    public.is_officer() AND EXISTS (
      SELECT 1 FROM public.complaint_assignments
      WHERE complaint_id = complaints.id AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "Submitters see own complaints"
  ON public.complaints FOR SELECT
  USING (auth.uid() IS NOT NULL AND submitter_id = auth.uid());

CREATE POLICY "Admins update all complaints"
  ON public.complaints FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Officers update assigned complaints"
  ON public.complaints FOR UPDATE
  USING (
    public.is_officer() AND EXISTS (
      SELECT 1 FROM public.complaint_assignments
      WHERE complaint_id = complaints.id AND assigned_to = auth.uid()
    )
  );

-- Complaint assignments: admins manage, officers read own
CREATE POLICY "Admins manage assignments"
  ON public.complaint_assignments FOR ALL
  USING (public.is_admin());

CREATE POLICY "Officers read own assignments"
  ON public.complaint_assignments FOR SELECT
  USING (assigned_to = auth.uid());

-- Audit logs: admins see all, officers/submitters see related
CREATE POLICY "Admins see all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Officers see assigned complaint logs"
  ON public.audit_logs FOR SELECT
  USING (
    public.is_officer() AND EXISTS (
      SELECT 1 FROM public.complaint_assignments
      WHERE complaint_id = audit_logs.complaint_id AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "Submitters see own complaint logs"
  ON public.audit_logs FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = audit_logs.complaint_id AND submitter_id = auth.uid()
    )
  );

CREATE POLICY "System inserts audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin() OR public.is_officer());
