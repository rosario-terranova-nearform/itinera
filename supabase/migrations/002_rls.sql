-- Itinera – Row Level Security
-- Migration 002: RLS policies per tutte le tabelle
-- Nota: ogni policy admin usa get_user_role() (SECURITY DEFINER) per evitare
-- ricorsione infinita (le policy query sulla tabella profiles attiverebbero
-- sé stesse in loop).

-- ============================================================================
-- Helper function: restituisce il ruolo dell'utente corrente bypassando RLS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ============================================================================
-- profiles
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile" ON profiles
  FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "admin_all" ON profiles
  FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================================
-- companies
-- ============================================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_companies" ON companies
  FOR ALL
  USING (get_user_role() = 'admin');

CREATE POLICY "rep_read_companies" ON companies
  FOR SELECT
  USING (get_user_role() = 'representative');

-- ============================================================================
-- appointments
-- ============================================================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_appointments" ON appointments
  FOR ALL
  USING (get_user_role() = 'admin');

CREATE POLICY "rep_own_appointments" ON appointments
  FOR SELECT
  USING (representative_id = auth.uid());

CREATE POLICY "rep_update_own" ON appointments
  FOR UPDATE
  USING (
    representative_id = auth.uid()
    AND status IN ('pending', 'confirmed')
  )
  WITH CHECK (
    representative_id = auth.uid()
    AND status IN ('confirmed', 'completed')
  );

-- ============================================================================
-- appointment_modifications
-- ============================================================================
ALTER TABLE appointment_modifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_modifications" ON appointment_modifications
  FOR ALL
  USING (get_user_role() = 'admin');

CREATE POLICY "rep_own_modifications" ON appointment_modifications
  FOR ALL
  USING (modified_by = auth.uid());

CREATE POLICY "rep_read_all_for_own_appt" ON appointment_modifications
  FOR SELECT
  USING (
    (SELECT representative_id FROM appointments WHERE id = appointment_id) = auth.uid()
  );

-- ============================================================================
-- signed_sheets
-- ============================================================================
ALTER TABLE signed_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_sheets" ON signed_sheets
  FOR ALL
  USING (get_user_role() = 'admin');

CREATE POLICY "rep_own_sheets" ON signed_sheets
  FOR ALL
  USING (uploaded_by = auth.uid());

-- ============================================================================
-- notifications
-- ============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_notifications" ON notifications
  FOR ALL
  USING (user_id = auth.uid());
