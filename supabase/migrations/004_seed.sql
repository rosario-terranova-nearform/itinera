-- Itinera – Seed Data
-- Migration 004: dati di sviluppo per testing
-- 1 admin, 3 rappresentanti, 5 aziende, 8 appuntamenti in vari stati
--
-- Password comune per tutti gli account: password123

-- ============================================================================
-- Auth Users (1 admin + 3 rappresentanti)
-- ============================================================================
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current)
VALUES
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@itinera.it',             crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'luca.bianchi@itinera.it',     crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'sara.verdi@itinera.it',       crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'marco.gialli@itinera.it',     crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Fix NULL recovery_token for existing rows (GoTrue v2.189.0 requires non-NULL)
UPDATE auth.users SET recovery_token = '' WHERE recovery_token IS NULL;

-- ============================================================================
-- Auth Identities (per login email/password)
-- ============================================================================
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000001', 'admin@itinera.it')::jsonb,          'email', 'admin@itinera.it',          now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000002', 'luca.bianchi@itinera.it')::jsonb,  'email', 'luca.bianchi@itinera.it',  now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000003', 'sara.verdi@itinera.it')::jsonb,    'email', 'sara.verdi@itinera.it',    now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000004', 'marco.gialli@itinera.it')::jsonb,  'email', 'marco.gialli@itinera.it',  now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Profiles
-- ============================================================================
INSERT INTO public.profiles (id, first_name, last_name, role, job_title, phone, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Mario', 'Rossi',  'admin',          NULL,                           '+39 02 1234567', true),
  ('00000000-0000-0000-0000-000000000002', 'Luca',  'Bianchi', 'representative', 'Rappresentante commerciale',   '+39 333 1111111', true),
  ('00000000-0000-0000-0000-000000000003', 'Sara',  'Verdi',  'representative', 'Rappresentante commerciale',   '+39 333 2222222', true),
  ('00000000-0000-0000-0000-000000000004', 'Marco', 'Gialli', 'representative', 'Rappresentante commerciale',   '+39 333 3333333', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Companies (5 aziende)
-- ============================================================================
INSERT INTO public.companies (id, name, address, city, province, postal_code, segment, contact_person, contact_title, phone, email, notes)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Cartoleria Milano SRL',  'Via Torino 25',    'Milano',  'MI', '20123', 'Enterprise',  'Giuseppe Ferrari', 'Direttore acquisti',  '+39 02 7654321', 'g.ferrari@cartoleriamilano.it', 'Cliente storico, visita mensile'),
  ('10000000-0000-0000-0000-000000000002', 'Ufficio Moderno SPA',    'Corso Europa 50',   'Roma',    'RM', '00144', 'Mid-Market',  'Anna Conti',       'Responsabile forniture', '+39 06 1234567', 'a.conti@ufficiomoderno.it',   'Nuovo contratto in corso'),
  ('10000000-0000-0000-0000-000000000003', 'Cancelleria Roma SRL',  'Via Nazionale 100',  'Roma',    'RM', '00185', 'SMB',         'Paolo Bianco',     'Titolare',              '+39 06 9876543', 'p.bianco@cancelleriaroma.it', 'Negozio al dettaglio'),
  ('10000000-0000-0000-0000-000000000004', 'Paper & Co. SRL',       'Via Mazzini 12',    'Bologna', 'BO', '40121', 'Mid-Market',  'Laura Neri',       'Responsabile ufficio',  '+39 051 2345678', 'l.neri@paperco.it',           'Preferenza per prodotti riciclati'),
  ('10000000-0000-0000-0000-000000000005', 'Scrivania Express SRL', 'Piazza Duomo 5',    'Firenze', 'FI', '50122', 'Enterprise',  'Marco Sala',        'Direttore acquisti',    '+39 055 8765432', 'm.sala@scrivaniaexpress.it',  'Budget annuale da rinnovare')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Appointments (8 appuntamenti in vari stati)
-- ============================================================================
INSERT INTO public.appointments (id, company_id, representative_id, scheduled_datetime, end_datetime, original_datetime, reference_code, status, notes, internal_notes, created_by)
VALUES
  -- 1. pending: Luca @ Cartoleria Milano, tra 3 giorni
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', NOW() + INTERVAL '3 days',
   'VIS-00001', 'pending', 'Presentare nuovo catalogo cancelleria 2026', 'Contattare Giuseppe per rinnovo contratto',
   '00000000-0000-0000-0000-000000000001'),

  -- 2. confirmed: Sara @ Ufficio Moderno, tra 5 giorni (confermato con modifica data)
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003',
   NOW() + INTERVAL '5 days' + INTERVAL '2 hours', NOW() + INTERVAL '5 days' + INTERVAL '3 hours', NOW() + INTERVAL '5 days',
   'VIS-00002', 'confirmed', 'Verifica giacenze magazzino', 'Sara ha chiesto di posticipare alle 11:00',
   '00000000-0000-0000-0000-000000000001'),

  -- 3. completed: Marco @ Cancelleria Roma, 2 giorni fa (con foglio firma)
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '1 hour', NOW() - INTERVAL '2 days',
   'VIS-00003', 'completed', 'Consegna ordine trimestrale', 'Foglio firma già ricevuto',
   '00000000-0000-0000-0000-000000000001'),

  -- 4. cancelled: Luca @ Paper & Co., 1 settimana fa
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '1 hour', NOW() - INTERVAL '7 days',
   'VIS-00004', 'cancelled', 'Presentazione nuova linea prodotti', 'Annullato per indisponibilità cliente',
   '00000000-0000-0000-0000-000000000001'),

  -- 5. pending: Sara @ Scrivania Express, tra 7 giorni
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003',
   NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '1 hour', NOW() + INTERVAL '7 days',
   'VIS-00005', 'pending', 'Proposta commerciale annuale', 'Cliente strategico, preparare scontistica',
   '00000000-0000-0000-0000-000000000001'),

  -- 6. confirmed: Marco @ Cartoleria Milano, tra 10 giorni (confermato senza modifica)
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004',
   NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '1 hour', NOW() + INTERVAL '10 days',
   'VIS-00006', 'confirmed', 'Ritiro ordine materiale pubblicitario', NULL,
   '00000000-0000-0000-0000-000000000001'),

  -- 7. completed: Luca @ Ufficio Moderno, 1 mese fa (con foglio firma)
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days' + INTERVAL '1 hour', NOW() - INTERVAL '30 days',
   'VIS-00007', 'completed', 'Visita di routine trimestrale', NULL,
   '00000000-0000-0000-0000-000000000001'),

  -- 8. pending: Marco @ Paper & Co., tra 14 giorni
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004',
   NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '1 hour', NOW() + INTERVAL '14 days',
   'VIS-00008', 'pending', 'Presentazione catalogo carta riciclata', 'Laura interessata a nuovi prodotti ecosostenibili',
   '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Appointment Modifications (storico modifiche)
-- ============================================================================
INSERT INTO public.appointment_modifications (appointment_id, modified_by, old_datetime, new_datetime, reason)
VALUES
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003',
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '2 hours',
   'Impegno mattutino, chiedo di posticipare alle 11:00');

-- ============================================================================
-- Signed Sheets (per appuntamenti completed)
-- ============================================================================
INSERT INTO public.signed_sheets (appointment_id, file_path, file_name, file_size, mime_type, notes, uploaded_by, viewed_by_admin)
VALUES
  ('20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003/foglio-firma-vis-00003.pdf', 'foglio-firma-vis-00003.pdf', 245760, 'application/pdf', 'Firma digitale apposta', '00000000-0000-0000-0000-000000000004', true),
  ('20000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007/foglio-firma-vis-00007.jpg', 'foglio-firma-vis-00007.jpg', 1520000, 'image/jpeg', 'Foto del foglio firmato', '00000000-0000-0000-0000-000000000002', false)
ON CONFLICT (appointment_id) DO NOTHING;

-- ============================================================================
-- Notifications (notifiche pregresse per storico)
-- ============================================================================
INSERT INTO public.notifications (user_id, appointment_id, type, title, message, is_read)
VALUES
  -- App. 1: Luca – nuovo incarico (letto)
  ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'appointment_created',  'Nuovo incarico – Cartoleria Milano SRL',       'Mario Rossi ti ha assegnato una visita presso Cartoleria Milano SRL.', true),
  -- App. 2: Sara – nuovo incarico (letto) + notifica admin modifica
  ('00000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'appointment_created',  'Nuovo incarico – Ufficio Moderno SPA',         'Mario Rossi ti ha assegnato una visita presso Ufficio Moderno SPA.', true),
  ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'appointment_modified', 'Data modificata da Sara Verdi – Ufficio Moderno SPA', 'Sara Verdi ha modificato la data della visita presso Ufficio Moderno SPA.', false),
  -- App. 3: Marco – nuovo incarico (letto) + foglio firma (admin letto)
  ('00000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'appointment_created',  'Nuovo incarico – Cancelleria Roma SRL',         'Mario Rossi ti ha assegnato una visita presso Cancelleria Roma SRL.', true),
  ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'signed_sheet_uploaded','Foglio firma ricevuto – Cancelleria Roma SRL',  'Marco Gialli ha caricato il foglio firma per Cancelleria Roma SRL.', true),
  -- App. 4: Luca – nuovo incarico (letto) + annullamento (non letto)
  ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 'appointment_created',  'Nuovo incarico – Paper & Co. SRL',              'Mario Rossi ti ha assegnato una visita presso Paper & Co. SRL.', true),
  ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 'appointment_cancelled','Incarico annullato – Paper & Co. SRL',          'Mario Rossi ha annullato la visita presso Paper & Co. SRL.', false),
  -- App. 6: Marco – nuovo incarico (letto) + conferma (admin non letto)
  ('00000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000006', 'appointment_created',  'Nuovo incarico – Cartoleria Milano SRL',        'Mario Rossi ti ha assegnato una visita presso Cartoleria Milano SRL.', true),
  ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'appointment_confirmed','Incarico confermato da Marco Gialli – Cartoleria Milano SRL', 'Marco Gialli ha confermato la visita presso Cartoleria Milano SRL.', false),
  -- App. 7: Luca – nuovo incarico (letto) + foglio firma (admin letto)
  ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000007', 'appointment_created',  'Nuovo incarico – Ufficio Moderno SPA',          'Mario Rossi ti ha assegnato una visita presso Ufficio Moderno SPA.', true),
  ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'signed_sheet_uploaded','Foglio firma ricevuto – Ufficio Moderno SPA',   'Luca Bianchi ha caricato il foglio firma per Ufficio Moderno SPA.', true),
  -- App. 5: Sara – nuovo incarico (non letto)
  ('00000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 'appointment_created',  'Nuovo incarico – Scrivania Express SRL',        'Mario Rossi ti ha assegnato una visita presso Scrivania Express SRL.', false),
  -- App. 8: Marco – nuovo incarico (non letto)
  ('00000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000008', 'appointment_created',  'Nuovo incarico – Paper & Co. SRL',              'Mario Rossi ti ha assegnato una visita presso Paper & Co. SRL.', false);
