-- Itinera – Schema iniziale
-- Migration 001: enum types, tabelle, indici

-- ============================================================================
-- Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 5.1 – Tipi enumerati
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'representative');

CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled'
);

CREATE TYPE notification_type AS ENUM (
  'appointment_created',
  'appointment_updated',
  'appointment_confirmed',
  'appointment_modified',
  'signed_sheet_uploaded',
  'appointment_cancelled'
);

-- ============================================================================
-- 5.2 – Tabelle
-- ============================================================================

-- Profili (estende auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'representative',
  job_title   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Profili utente collegati a auth.users';

-- Aziende clienti
CREATE TABLE companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  address         TEXT,
  city            TEXT,
  province        TEXT,
  postal_code     TEXT,
  segment         TEXT,
  contact_person  TEXT,
  contact_title   TEXT,
  phone           TEXT,
  email           TEXT,
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE companies IS 'Anagrafica aziende clienti';

-- Appuntamenti
CREATE TABLE appointments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id),
  representative_id   UUID NOT NULL REFERENCES profiles(id),
  scheduled_datetime  TIMESTAMPTZ NOT NULL,
  end_datetime        TIMESTAMPTZ,
  original_datetime   TIMESTAMPTZ NOT NULL,
  reference_code      TEXT UNIQUE,
  status              appointment_status NOT NULL DEFAULT 'pending',
  notes               TEXT,
  internal_notes      TEXT,
  created_by          UUID NOT NULL REFERENCES profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE appointments IS 'Appuntamenti di visita pianificati dall\'UC';

-- Log modifiche a data/ora (storico negoziazione)
CREATE TABLE appointment_modifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id    UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  modified_by       UUID NOT NULL REFERENCES profiles(id),
  old_datetime      TIMESTAMPTZ NOT NULL,
  new_datetime      TIMESTAMPTZ NOT NULL,
  reason            TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE appointment_modifications IS 'Storico delle modifiche a scheduled_datetime';

-- Fogli firma
CREATE TABLE signed_sheets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  file_path       TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_size       INTEGER,
  mime_type       TEXT,
  notes           TEXT,
  uploaded_by     UUID NOT NULL REFERENCES profiles(id),
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_by_admin BOOLEAN NOT NULL DEFAULT false,
  viewed_at       TIMESTAMPTZ
);

COMMENT ON TABLE signed_sheets IS 'Fogli firma caricati dai rappresentanti';

-- Notifiche in-app
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  type            notification_type NOT NULL,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Notifiche in-app per utenti';

-- ============================================================================
-- 5.3 – Indici
-- ============================================================================

CREATE INDEX idx_appointments_status         ON appointments(status);
CREATE INDEX idx_appointments_scheduled      ON appointments(scheduled_datetime);
CREATE INDEX idx_appointments_representative ON appointments(representative_id);
CREATE INDEX idx_notifications_user_unread   ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_modifications_appointment   ON appointment_modifications(appointment_id);
CREATE INDEX idx_appointments_reference      ON appointments(reference_code) WHERE reference_code IS NOT NULL;
