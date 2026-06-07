# Itinera – Specifiche di Progetto (v3)

> **Stack**: React · TypeScript · Vite · Material UI · Supabase (DB, Auth, Storage, Realtime, Edge Functions)
>
> **Design di riferimento**: `.agents/design/DESIGN.md` (token colore, tipografia Inter, layout admin/rep). Mockup per schermata in `.agents/design/admin-uc/` e `.agents/design/user-represenative/`.
>
> **Assunzioni consolidate**: 3 rappresentanti · admin singolo · modifica appuntamento libera (senza approvazione UC) · notifiche in-app + email · foglio firma come file caricato (foto/PDF) · anagrafica aziende in sola lettura per il rep

---

## 1. Panoramica

**Itinera** è una SPA per la gestione degli appuntamenti di un rappresentante di cancelleria. L'**Unità Centrale (UC)** pianifica le visite aziendali creando incarichi con data e orario. Il **Rappresentante** riceve notifiche, gestisce il proprio calendario, può confermare o modificare liberamente data/orario, e al termine di ogni visita carica il foglio firma come prova.

---

## 2. Attori e Permessi

| Ruolo              | N° account | Descrizione                                                              |
| ------------------ | ---------- | ------------------------------------------------------------------------ |
| **Admin (UC)**     | 1          | Crea e gestisce appuntamenti, anagrafica aziende, rappresentanti, portale documenti, impostazioni |
| **Representative** | 3          | Vede il proprio calendario, consulta anagrafica aziende (sola lettura), gestisce appuntamenti, carica fogli firma, area documenti personale |

Tutti gli account sono **pre-creati** (nessuna registrazione pubblica). L'UC invita i rappresentanti via email da Supabase Auth.

---

## 3. User Stories

### UC – Admin

| ID  | Come UC voglio…                                                                           | Così che…                                                         |
| --- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| A01 | Creare un nuovo appuntamento (azienda, data, ora, note) per un determinato rappresentante | Il rappresentante sia avvisato subito via notifica in-app e email |
| A02 | Modificare un appuntamento già creato                                                     | Posso correggere data, ora o azienda in qualsiasi momento         |
| A03 | Annullare un appuntamento                                                                 | Il rep sia avvisato e l'agenda si aggiorni                        |
| A04 | Vedere il calendario con tutti gli appuntamenti (mensile/settimanale/giornaliero)         | Ho una visione completa dell'agenda                               |
| A05 | Filtrare appuntamenti per stato e periodo                                                 | Trovo rapidamente ciò che mi serve                                |
| A06 | Ricevere notifica (in-app + email) quando il rep conferma o modifica un appuntamento      | Resto sempre aggiornato sullo stato dell'agenda                   |
| A07 | Visualizzare e scaricare il foglio firma caricato dal rep                                 | Ho prova documentale delle visite avvenute                        |
| A08 | Gestire l'anagrafica delle aziende clienti (CRUD)                                         | Posso selezionarle rapidamente alla creazione degli appuntamenti  |
| A09 | Gestire i rappresentanti (invito, attivazione/disattivazione)                             | Controllo chi può accedere all'app                                |
| A10 | Consultare il portale documenti con tutti i fogli firma caricati                          | Revisiono le prove di visita in un unico punto                      |
| A11 | Configurare preferenze di notifica di sistema (MVP: solo visualizzazione o toggle base)    | Adatto gli avvisi al flusso operativo UC                            |

### Rappresentante – User

| ID  | Come Rappresentante voglio…                                                              | Così che…                                                 |
| --- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| R01 | Ricevere notifica (in-app + email) quando mi viene assegnato un nuovo appuntamento       | Non perda nessun incarico                                 |
| R02 | Vedere il mio calendario con tutti gli appuntamenti (non vedo appuntamenti di altri rep) | Pianifichi le mie giornate                                |
| R03 | Confermare un appuntamento così com'è                                                    | L'UC sappia che andrò alla data prevista                  |
| R04 | Modificare liberamente data e/o ora di un appuntamento con una nota                      | Gestisca eventuali impedimenti senza iter di approvazione |
| R05 | Ricevere notifica se l'UC modifica o annulla un appuntamento                             | Sia sempre sincronizzato sulle ultime decisioni           |
| R06 | Caricare il foglio firma dopo una visita (foto o PDF)                                    | Invio prova all'UC dall'app                               |
| R07 | Vedere il dettaglio di ogni appuntamento (azienda, indirizzo, note UC)                   | Arrivi preparato alla visita                              |
| R08 | Modificare il mio profilo (nome, cognome, telefono, avatar; email in sola lettura)     | Mantenga i dati aggiornati                                |
| R09 | Consultare l'anagrafica aziende (sola lettura, ricerca)                                  | Trovi rapidamente indirizzo e referente prima della visita |
| R10 | Vedere e caricare documenti dalla sezione "I miei documenti"                             | Gestisca i fogli firma anche fuori dal dettaglio appuntamento |

---

## 4. Architettura Tecnica

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (SPA)                             │
│   React · TypeScript · Vite                                      │
│   Material UI · MUI X Date Pickers                               │
│   React Router · Zustand · TanStack Query                        │
│   FullCalendar · React Hook Form + Zod · dayjs                   │
│   react-dropzone · react-toastify                                     │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS / WebSocket (Realtime)
┌────────────────────────────▼─────────────────────────────────────┐
│                          SUPABASE                                │
│                                                                  │
│  ┌──────────┐  ┌────────────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │  PostgreSQL    │  │ Storage  │  │Realtime  │    │
│  │ (JWT)    │  │  + RLS         │  │ (bucket) │  │(WS)      │    │
│  └──────────┘  └────────────────┘  └──────────┘  └──────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Edge Function: send-notification-email                    │  │
│  │  Trigger: INSERT su `notifications` → Resend API           │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Dipendenze Frontend

```json
{
  "@mui/material": "*",
  "@mui/icons-material": "*",
  "@mui/x-date-pickers": "*",
  "@supabase/supabase-js": "*",
  "@tanstack/react-query": "*",
  "@tanstack/react-query-devtools": "*",
  "zustand": "*",
  "react-router-dom": "*",
  "react-hook-form": "*",
  "zod": "*",
  "@hookform/resolvers": "*",
  "dayjs": "*",
  "@fullcalendar/react": "*",
  "@fullcalendar/daygrid": "*",
  "@fullcalendar/timegrid": "*",
  "@fullcalendar/interaction": "*",
  "react-dropzone": "*",
  "react-toastify": "*"
}
```

---

## 5. Modello Dati

### 5.1 Tipi enumerati

```sql
CREATE TYPE user_role AS ENUM ('admin', 'representative');

CREATE TYPE appointment_status AS ENUM (
  'pending',     -- creato dall'UC, il rep non ha ancora risposto
  'confirmed',   -- il rep ha confermato (con o senza modifica data/ora)
  'completed',   -- visita avvenuta, foglio firma caricato
  'cancelled'    -- annullato dall'UC
);

CREATE TYPE notification_type AS ENUM (
  'appointment_created',    -- UC → Rep: nuovo incarico assegnato
  'appointment_updated',    -- UC → Rep: UC ha modificato data/ora/azienda
  'appointment_confirmed',  -- Rep → UC: rep ha confermato senza modifiche
  'appointment_modified',   -- Rep → UC: rep ha cambiato data/ora (inclusa nuova data)
  'signed_sheet_uploaded',  -- Rep → UC: foglio firma caricato
  'appointment_cancelled'   -- UC → Rep: appuntamento annullato
);
```

### 5.2 Tabelle

```sql
-- Profili (estende auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'representative',
  job_title   TEXT,                    -- es. "Rappresentante commerciale" (solo rep, opzionale)
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Nome visualizzato in UI: first_name || ' ' || last_name

-- Aziende clienti
CREATE TABLE companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  address         TEXT,
  city            TEXT,
  province        TEXT,   -- es. "NA", "RM"
  postal_code     TEXT,
  segment         TEXT,   -- es. "Enterprise" | "Mid-Market" | "SMB" (tag UI in rubrica rep)
  contact_person  TEXT,
  contact_title   TEXT,   -- es. "Direttore acquisti"
  phone           TEXT,
  email           TEXT,
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,  -- false = Inattiva in UI admin
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appuntamenti
CREATE TABLE appointments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id),
  representative_id   UUID NOT NULL REFERENCES profiles(id),  -- riferimento al rappresentante assegnato
  scheduled_datetime  TIMESTAMPTZ NOT NULL,   -- inizio visita (aggiornato da UC o rep)
  end_datetime        TIMESTAMPTZ,            -- fine visita (opzionale; se assente UI mostra solo inizio)
  original_datetime   TIMESTAMPTZ NOT NULL,   -- data/ora proposta inizialmente dall'UC
  reference_code      TEXT UNIQUE,            -- es. VIS-49201; generato in app se non valorizzato
  status              appointment_status NOT NULL DEFAULT 'pending',
  notes               TEXT,                   -- note visibili al rep
  internal_notes      TEXT,                   -- note interne UC (non visibili al rep)
  created_by          UUID NOT NULL REFERENCES profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Log modifiche a data/ora (storico negoziazione)
CREATE TABLE appointment_modifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id    UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  modified_by       UUID NOT NULL REFERENCES profiles(id),
  old_datetime      TIMESTAMPTZ NOT NULL,
  new_datetime      TIMESTAMPTZ NOT NULL,
  reason            TEXT,          -- nota motivazione del rep (o dell'UC)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fogli firma
CREATE TABLE signed_sheets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  file_path       TEXT NOT NULL,     -- path Supabase Storage: {appointment_id}/{filename}
  file_name       TEXT NOT NULL,
  file_size       INTEGER,           -- bytes
  mime_type       TEXT,              -- image/jpeg | image/png | image/webp | application/pdf
  notes           TEXT,              -- note opzionali del rep al momento dell'upload
  uploaded_by     UUID NOT NULL REFERENCES profiles(id),
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_by_admin BOOLEAN NOT NULL DEFAULT false,
  viewed_at       TIMESTAMPTZ
);

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
```

### 5.3 Indici

```sql
CREATE INDEX idx_appointments_status        ON appointments(status);
CREATE INDEX idx_appointments_scheduled     ON appointments(scheduled_datetime);
CREATE INDEX idx_appointments_representative ON appointments(representative_id);
CREATE INDEX idx_notifications_user_unread  ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_modifications_appointment  ON appointment_modifications(appointment_id);
CREATE INDEX idx_appointments_reference     ON appointments(reference_code) WHERE reference_code IS NOT NULL;
```

### 5.4 Row Level Security (RLS)

```sql
-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile"      ON profiles FOR ALL  USING (auth.uid() = id);
CREATE POLICY "admin_all"        ON profiles FOR ALL  USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- companies: admin CRUD, rep solo lettura
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_companies"  ON companies FOR ALL    USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "rep_read_companies" ON companies FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'representative'
);

-- appointments: admin tutto, rep solo i propri
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_appointments" ON appointments FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "rep_own_appointments" ON appointments FOR SELECT USING (
  representative_id = auth.uid()
);
CREATE POLICY "rep_update_own" ON appointments FOR UPDATE USING (
  representative_id = auth.uid()
  AND status IN ('pending', 'confirmed')   -- non modificabile se cancelled o completed
) WITH CHECK (
  representative_id = auth.uid()
  AND status IN ('confirmed', 'completed') -- rep non può annullare né riportare a pending
);

-- appointment_modifications: admin tutto, rep inserisce/legge le sue
ALTER TABLE appointment_modifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_modifications" ON appointment_modifications FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "rep_own_modifications" ON appointment_modifications FOR ALL USING (
  modified_by = auth.uid()
);
CREATE POLICY "rep_read_all_for_own_appt" ON appointment_modifications FOR SELECT USING (
  (SELECT representative_id FROM appointments WHERE id = appointment_id) = auth.uid()
);

-- signed_sheets: admin tutto, rep inserisce/vede le sue
ALTER TABLE signed_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_sheets"    ON signed_sheets FOR ALL    USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "rep_own_sheets"  ON signed_sheets FOR ALL    USING (
  uploaded_by = auth.uid()
);

-- notifications: solo le proprie
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_notifications" ON notifications FOR ALL USING (user_id = auth.uid());
```

### 5.5 Storage Bucket

```
Bucket name : signed-sheets
Accesso     : privato (solo authenticated)
Path pattern: {appointment_id}/{uuid}_{original_filename}
Max file size: 10 MB
MIME consentiti: image/jpeg, image/png, image/webp, application/pdf

Policy Storage:
  - INSERT: utente autenticato con ruolo 'representative'
  - SELECT: utente autenticato (rep solo percorsi del proprio appointment_id, admin tutti)
  - DELETE: solo admin

Bucket name : avatars
Accesso     : pubblico in lettura (URL pubblico) o signed URL; path `{user_id}/avatar.{ext}`
Max file size: 2 MB
MIME consentiti: image/jpeg, image/png, image/webp
Policy Storage:
  - INSERT/UPDATE: utente autenticato solo sul proprio `{user_id}/`
  - SELECT: tutti gli autenticati (per mostrare avatar in tabella admin)
```

---

## 6. Macchina a Stati degli Appuntamenti

### Stati e colori UI

Allineati al design system (`.agents/design/DESIGN.md`):

| Stato       | Significato                              | Token / hex design   | MUI (override tema) |
| ----------- | ---------------------------------------- | -------------------- | ------------------- |
| `pending`   | In attesa di risposta del rep            | `status-pending` `#ED6C02` | `warning` |
| `confirmed` | Confermato (data originale o modificata) | `status-confirmed` `#2E7D32` | `success` |
| `completed` | Visita avvenuta, foglio firma caricato   | `status-completed` `#1976D2` | `primary` |
| `cancelled` | Annullato dall'UC                        | `status-cancelled` `#D32F2F` | `error` |

> **Nota mockup**: etichette come "Draft" nei design sono solo dati dimostrativi e corrispondono a `pending`.

### Diagramma transizioni

```
                    ┌──────────┐
         UC crea    │          │  Notifica → Rep (in-app + email)
        ──────────► │ PENDING  │
                    │          │
                    └────┬─────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
         Rep conferma           Rep modifica
         (data invariata)       data/ora + nota
              │                     │
              └──────────┬──────────┘
                         │  Notifica → UC (in-app + email)
                         ▼  [tipo diverso: confirmed vs modified]
                    ┌──────────┐
                    │CONFIRMED │◄──── UC modifica (da confirmed) → PENDING
                    │          │      UC modifica (da pending) → resta PENDING
                    └────┬─────┘      (sempre notifica → Rep)
                         │ Rep carica foglio firma
                         │ Notifica → UC (in-app + email)
                         ▼
                    ┌──────────┐
                    │COMPLETED │  (stato finale, non modificabile)
                    └──────────┘

        Da qualsiasi stato (tranne COMPLETED):
        UC annulla → CANCELLED + notifica → Rep
```

### Matrice transizioni

| Da                    | A           | Chi | Azione / condizione                                      |
| --------------------- | ----------- | --- | -------------------------------------------------------- |
| `pending`             | `confirmed` | Rep | Conferma senza cambiare `scheduled_datetime`             |
| `pending`             | `confirmed` | Rep | Modifica data/ora + nota obbligatoria                    |
| `confirmed`           | `confirmed` | Rep | Ri-modifica data/ora + nota obbligatoria                 |
| `pending`             | `pending`   | UC  | Modifica campi (data, azienda, rep, note)                |
| `confirmed`           | `pending`   | UC  | Modifica campi dopo conferma rep                         |
| `confirmed`           | `completed` | Rep | Carica foglio firma (solo da dettaglio o da documenti)   |
| `pending`/`confirmed` | `cancelled` | UC  | Annulla appuntamento                                     |
| `completed`           | —           | —   | Stato finale: nessuna transizione                        |
| `cancelled`           | —           | —   | Stato finale: nessuna transizione                        |

> **Nota**: Ogni modifica di `scheduled_datetime` (UC o rep) genera una riga in `appointment_modifications`. La conferma senza cambio data **non** crea una modifica.

### Azioni UI per stato (rappresentante)

| Stato       | Conferma visita | Modifica data/ora | Carica foglio firma | Note |
| ----------- | --------------- | ----------------- | ------------------- | ---- |
| `pending`   | Sì              | Sì                | No (disabilitato)   | Mockup mostra il bottone upload: in implementazione resta nascosto o disabilitato finché non `confirmed` |
| `confirmed` | No              | Sì                | Sì                  | Dopo upload → `completed` |
| `completed` | No              | No                | No (già caricato)   | Solo visualizzazione foglio |
| `cancelled` | No              | No                | No                  | Solo lettura |

### Notifiche per modifica UC

| Stato prima modifica UC | Stato dopo | Tipo notifica        |
| ----------------------- | ---------- | -------------------- |
| `pending`               | `pending`  | `appointment_updated` |
| `confirmed`             | `pending`  | `appointment_updated` |

---

## 7. Sistema Notifiche

### 7.1 Trigger notifiche

| Evento                   | Notifica a | Tipo                    | Canali         |
| ------------------------ | ---------- | ----------------------- | -------------- |
| UC crea appuntamento     | Rep        | `appointment_created`   | in-app + email |
| UC modifica appuntamento | Rep        | `appointment_updated`   | in-app + email |
| UC annulla appuntamento  | Rep        | `appointment_cancelled` | in-app + email |
| Rep conferma (invariato) | UC         | `appointment_confirmed` | in-app + email |
| Rep modifica data/ora    | UC         | `appointment_modified`  | in-app + email |
| Rep carica foglio firma  | UC         | `signed_sheet_uploaded` | in-app + email |

### 7.2 Architettura notifiche

```
Azione utente nel frontend
        │
        ▼
Mutation TanStack Query → Supabase (UPDATE/INSERT)
        │
        ├──► INSERT in `notifications`   ──► Supabase Realtime
        │         (in-app)                        │
        │                                         ▼
        │                                   Frontend riceve WS
        │                                   Zustand store update
        │                                   Badge count aggiornato
        │
        └──► Supabase Database Webhook ──► Edge Function `send-notification-email`
                  (su INSERT notifications)            │
                                                       ▼
                                                  Resend API
                                                  Email inviata
```

### 7.3 Template email (Resend)

| Tipo                    | Oggetto                                           | Contenuto principale                             |
| ----------------------- | ------------------------------------------------- | ------------------------------------------------ |
| `appointment_created`   | `📅 Nuovo incarico – {azienda} il {data}`         | Data, ora, azienda, indirizzo, note UC, link app |
| `appointment_updated`   | `✏️ Incarico modificato – {azienda}`              | Vecchia data → Nuova data, motivo                |
| `appointment_cancelled` | `❌ Incarico annullato – {azienda} del {data}`    | Conferma annullamento                            |
| `appointment_confirmed` | `✅ Incarico confermato da {rep}`                 | Data confermata, link dettaglio                  |
| `appointment_modified`  | `🔄 Data modificata da {rep} – {azienda}`         | Vecchia data → Nuova data, nota rep              |
| `signed_sheet_uploaded` | `📎 Foglio firma ricevuto – {azienda} del {data}` | Link diretto al documento                        |

### 7.4 Stati documento in UI (derivati, non enum DB)

| Contesto | Etichetta UI | Regola |
| -------- | ------------ | ------ |
| Rep – lista documenti | `In elaborazione` | `signed_sheets` esiste e `viewed_by_admin = false` |
| Rep – lista documenti | `Ricevuto da UC` | `viewed_by_admin = true` |
| Admin – portale documenti | `Non letto` | `viewed_by_admin = false` |
| Admin – portale documenti | `Visualizzato` | `viewed_by_admin = true` |

I contatori "In revisione / Approvati" nel mockup rep sono aggregati su queste regole (MVP: nessuna tabella `review_status` separata).

### 7.5 Impostazioni notifiche (admin)

Schermata impostazioni (design `admin_system_settings`): toggle per avvisi immediati su nuovo appuntamento e upload documento. **Fuori MVP**: email riepilogo giornaliero alle 08:00 (solo documentato, non implementato in v3).

---

## 8. Struttura Cartelle

```
src/
├── api/                        # Tutte le chiamate Supabase (no logica UI)
│   ├── appointments.ts
│   ├── companies.ts
│   ├── notifications.ts
│   ├── profiles.ts
│   └── signedSheets.ts
│
├── components/
│   ├── common/
│   │   ├── ConfirmDialog.tsx   # Dialog generico conferma/annulla
│   │   ├── StatusChip.tsx      # Chip colorato per stato appuntamento
│   │   ├── FileUploadZone.tsx  # Dropzone riutilizzabile
│   │   ├── EmptyState.tsx
│   │   └── PageLoader.tsx
│   ├── appointments/
│   │   ├── AppointmentCard.tsx
│   │   ├── AppointmentForm.tsx       # Form create/edit (admin)
│   │   ├── AppointmentTimeline.tsx   # Audit trail (assegnazione, modifiche, upload)
│   │   ├── VisitInfoCard.tsx         # Dettaglio visita + mappa/indicazioni
│   │   └── RescheduleForm.tsx        # Form rep: nuova data, ora, motivo (campi separati)
│   ├── documents/
│   │   ├── DocumentUploadZone.tsx
│   │   ├── DocumentListItem.tsx
│   │   └── DocumentStatusSummary.tsx
│   ├── calendar/
│   │   └── CalendarView.tsx          # FullCalendar wrapper
│   ├── notifications/
│   │   ├── NotificationCenter.tsx    # Drawer notifiche
│   │   ├── NotificationItem.tsx
│   │   └── NotificationBadge.tsx
│   └── layout/
│       ├── AdminLayout.tsx
│       ├── RepLayout.tsx
│       ├── AdminSidebar.tsx
│       └── Topbar.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useNotifications.ts
│   ├── useAppointments.ts
│   ├── useCompanies.ts
│   └── useRealtimeNotifications.ts
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── admin/
│   │   ├── AdminDashboardPage.tsx
│   │   ├── CalendarPage.tsx              # Pianificazione
│   │   ├── CreateAppointmentPage.tsx     # oppure dialog da calendario/lista
│   │   ├── AppointmentsPage.tsx
│   │   ├── AppointmentDetailPage.tsx
│   │   ├── CompaniesPage.tsx
│   │   ├── CompanyDetailPage.tsx
│   │   ├── RepresentativesPage.tsx
│   │   ├── DocumentsPortalPage.tsx
│   │   └── AdminSettingsPage.tsx
│   └── representative/
│       ├── RepDashboardPage.tsx
│       ├── RepCalendarPage.tsx           # Pianificazione (vista giorno/settimana/mese)
│       ├── RepAppointmentDetailPage.tsx
│       ├── RescheduleAppointmentPage.tsx # Modifica data/ora + motivo
│       ├── RepCompaniesPage.tsx          # Rubrica aziende (sola lettura)
│       ├── RepDocumentsPage.tsx
│       └── RepProfilePage.tsx
│
├── store/
│   ├── authStore.ts
│   └── notificationStore.ts
│
├── lib/
│   ├── supabase.ts              # createClient tipizzato
│   └── database.types.ts        # generato da `supabase gen types`
│
├── types/
│   └── index.ts                 # tipi dominio (Appointment, Company, Profile…)
│
├── utils/
│   ├── dateUtils.ts             # formatDate, isUpcoming, relativeTime…
│   └── statusUtils.ts           # getStatusLabel, getStatusColor…
│
├── theme/
│   └── muiTheme.ts              # palette, typography, component overrides
│
└── router/
    ├── AppRouter.tsx
    ├── AdminRoutes.tsx
    └── RepRoutes.tsx

supabase/
├── migrations/
│   ├── 001_schema.sql
│   ├── 002_rls.sql
│   └── 003_seed.sql
└── functions/
    └── send-notification-email/
        └── index.ts
```

---

## 9. Viste UI – Descrizione Pagine

Navigazione allineata ai mockup (sidebar admin 240px; rep mobile con bottom nav 56px: **Dashboard · Calendario · Profilo**).

### Admin (UC)

| Pagina | Route | Mockup design | Contenuto |
| ------ | ----- | ------------- | --------- |
| Dashboard | `/admin` | `admin_dashboard_uc` | KPI (oggi, in attesa, completati mese), tabella attività recente, CTA "+ Nuovo appuntamento", ricerca globale appuntamenti |
| Pianificazione | `/admin/calendar` | `admin_scheduling_calendar` | Calendario mese/settimana/giorno; colori stato; click → drawer/dettaglio; drag & drop (admin) |
| Crea appuntamento | `/admin/appointments/new` | `create_new_appointment_admin` | Form: azienda (autocomplete), rappresentante, data, ora, note rep, note interne UC |
| Appuntamenti | `/admin/appointments` | — | Tabella con filtri (stato, rep, periodo), link a dettaglio |
| Dettaglio appuntamento | `/admin/appointments/:id` | — | Info, audit trail, foglio firma, modifica/annulla |
| Aziende | `/admin/companies` | `admin_companies_management` | Tabella con filtri stato/provincia, CRUD, soft delete |
| Dettaglio azienda | `/admin/companies/:id` | — | Scheda azienda + storico appuntamenti |
| Rappresentanti | `/admin/representatives` | `admin_representative_management` | Elenco rep, invito, attivo/inattivo, metriche sintetiche |
| Documenti | `/admin/documents` | `admin_documents_portal` | KPI upload/non letti, tabella documenti (azienda, rep, data, stato lettura), filtro/ordinamento |
| Impostazioni | `/admin/settings` | `admin_system_settings` | Inviti rep, toggle notifiche (MVP parziale) |

**Sidebar admin**: Dashboard · Pianificazione · Aziende · Rappresentanti · Documenti · Impostazioni

### Rappresentante

| Pagina | Route | Mockup design | Contenuto |
| ------ | ----- | ------------- | --------- |
| Dashboard | `/rep` | `representative_dashboard` | Card prossima visita (countdown, indirizzo, contatto), aggiornamenti recenti, tabella settimana |
| Pianificazione | `/rep/calendar` | `representative_scheduling_calendar` | Mini-calendario, riepilogo giornata per stato, timeline giornaliera (viste giorno/settimana/mese) |
| Dettaglio appuntamento | `/rep/appointments/:id` | `appointment_detail_actions` | Codice visita, info visita (contatto con telefono, mappa/indicazioni), note UC, audit trail, azioni per stato |
| Riprogramma | `/rep/appointments/:id/reschedule` | `modify_appointment_representative` | Dettaglio attuale (sola lettura) + nuova data, nuova ora, motivo obbligatorio |
| Aziende | `/rep/companies` | `client_directory_rep` | Griglia/card rubrica sola lettura (segmento, indirizzo, referente, telefono) |
| Documenti | `/rep/documents` | `my_personal_documents_representative` | Upload zone, riepilogo stati, elenco upload recenti con download |
| Profilo | `/rep/profile` | `personal_profile_settings` | Nome, cognome, telefono, avatar; email read-only; cambio password |

**Sidebar rep (tablet/desktop)**: Dashboard · Pianificazione · Aziende · Documenti · Impostazioni  
**Bottom nav rep (mobile)**: Dashboard · Calendario · Profilo

> Il rep **non** crea appuntamenti: eventuali CTA "+ Nuova visita" nei mockup sono fuori scope e non vanno implementate.

### Tema UI (§ T0.7)

Mappare i token in `.agents/design/DESIGN.md` su `muiTheme.ts`: palette primary `#005dac`, font `Inter`, status chip con sfondo 10–15% opacità e testo ad alto contrasto.

---

## 10. Task di Sviluppo

---

### FASE 0 – Setup Progetto

| ID   | Task                                                                                       | Output atteso              |
| ---- | ------------------------------------------------------------------------------------------ | -------------------------- |
| T0.1 | `npm create vite@latest itinera -- --template react-ts`                                    | Progetto base funzionante  |
| T0.2 | Installazione tutte le dipendenze (vedi § 4)                                               | `package.json` completo    |
| T0.3 | Configurazione ESLint + Prettier + path alias `@/` in `vite.config.ts` e `tsconfig.json`   | Import puliti con `@/`     |
| T0.4 | Creazione progetto su Supabase dashboard, abilitare Auth (email), Storage                  | Progetto Supabase attivo   |
| T0.5 | File `.env` con `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` + `.env.example` committato | Config env                 |
| T0.6 | `src/lib/supabase.ts`: `createClient<Database>()` tipizzato                                | Client riutilizzabile      |
| T0.7 | `src/theme/muiTheme.ts`: token da `.agents/design/DESIGN.md` (primary `#005dac`, Inter, status hex, chip 10–15% opacity) | Tema allineato ai mockup |

---

### FASE 1 – Database e Backend

| ID   | Task                                                                                                             | Output atteso              |
| ---- | ---------------------------------------------------------------------------------------------------------------- | -------------------------- |
| T1.1 | Migration `001_schema.sql`: enum types, tutte le tabelle, indici                                                 | Schema DB completo         |
| T1.2 | Migration `002_rls.sql`: RLS policies per tutte le tabelle                                                       | Sicurezza dati garantita   |
| T1.3 | Configurazione Storage bucket `signed-sheets` con policy (via SQL o dashboard)                                   | Bucket pronto              |
| T1.4 | `supabase gen types typescript --project-id <id> > src/lib/database.types.ts`                                    | Tipi TypeScript aggiornati |
| T1.5 | Migration `003_seed.sql`: 1 admin, 3 rappresentanti, 5 aziende, 8 appuntamenti in vari stati                     | Dati di sviluppo           |

---

### FASE 2 – Autenticazione

| ID   | Task                                                                                                              | Output atteso       |
| ---- | ----------------------------------------------------------------------------------------------------------------- | ------------------- |
| T2.1 | `LoginPage.tsx`: form email + password, gestione errori Supabase, link reset password                             | Login funzionante   |
| T2.2 | `ResetPasswordPage.tsx`: step 1 (inserisci email), step 2 (inserisci nuova password da magic link)                | Reset funzionante   |
| T2.3 | `authStore.ts` (Zustand): state `{ session, profile, isLoading }`, actions `login()`, `logout()`, `loadProfile()` | Store auth          |
| T2.4 | `useAuth.ts`: hook wrapper dello store + inizializzazione `supabase.auth.onAuthStateChange`                       | Hook riutilizzabile |
| T2.5 | `ProtectedRoute.tsx`: se non autenticato redirect a `/login`; se autenticato controlla ruolo e reindirizza        | Guard route         |
| T2.6 | `AppRouter.tsx`: route pubbliche (`/login`, `/reset-password`), route admin (`/admin/*`), route rep (`/rep/*`)    | Routing completo    |
| T2.7 | `RepresentativesPage.tsx` (`/admin/representatives`): tabella rep (nome, email, telefono, stato); "Invita nuovo rep" (Supabase Auth invite); "Disattiva" (`is_active=false`) | Gestione account rep |
| T2.8 | Colonna `is_active` su `profiles` + check in app: utenti disattivati non accedono (logout forzato se sessione esistente) | Disattivazione account |

---

### FASE 3 – Layout e Navigazione

| ID   | Task                                                                                                           | Output atteso       |
| ---- | -------------------------------------------------------------------------------------------------------------- | ------------------- |
| T3.1 | `AdminLayout.tsx`: Drawer laterale persistente (240px) + `<Outlet />` per il contenuto                         | Layout admin        |
| T3.2 | `AdminSidebar.tsx`: logo Itinera, voci (Dashboard, Pianificazione, Aziende, Rappresentanti, Documenti, Impostazioni), voce attiva evidenziata | Sidebar allineata al design |
| T3.3 | `Topbar.tsx` (condivisa): titolo pagina, `NotificationBadge`, `UserMenu` (avatar + logout)                     | Topbar funzionante  |
| T3.4 | `RepLayout.tsx`: Topbar + Outlet; mobile bottom nav (Dashboard, Calendario, Profilo); da `md` sidebar (Dashboard, Pianificazione, Aziende, Documenti, Impostazioni) | Layout rep |
| T3.5 | `UserMenu.tsx`: MUI Menu con nome utente, voce "Profilo", voce "Logout"                                        | Menu utente         |
| T3.6 | `NotificationBadge.tsx`: `IconButton` campanella + `Badge` con count notifiche non lette                       | Badge interattivo   |

---

### FASE 4 – Gestione Aziende (Admin)

| ID   | Task                                                                                                                             | Output atteso     |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| T4.1 | `api/companies.ts`: `getAll()`, `getById()`, `create()`, `update()`, `softDelete()` (setta `is_active=false`)                    | Layer API         |
| T4.2 | `useCompanies.ts`: TanStack Query hooks (`useCompaniesQuery`, `useCreateCompanyMutation`, ecc.)                                  | Hook dati         |
| T4.3 | `CompaniesPage.tsx`: MUI `DataGrid` (o `Table`) con ricerca per nome/città, pulsante "Aggiungi"                                  | Lista aziende     |
| T4.4 | `CompanyForm.tsx`: campi nome\*, indirizzo, città, provincia, CAP, segmento, referente, titolo referente, telefono, email, note; validazione Zod | Form azienda |
| T4.5 | `CompanyDetailPage.tsx`: card info azienda + tab "Appuntamenti" con storico                                                      | Dettaglio azienda |

---

### FASE 5 – Gestione Appuntamenti (Admin)

| ID   | Task                                                                                                                                       | Output atteso       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| T5.1 | `api/appointments.ts`: `getAll(filters?)`, `getById()`, `create()`, `update()`, `cancel()`, `logModification()`                            | Layer API           |
| T5.2 | `useAppointments.ts`: hooks TanStack Query con invalidation cache alla mutazione                                                           | Hook dati           |
| T5.3 | `AppointmentsPage.tsx`: tabella con colonne (data, rappresentante, azienda, stato, azioni), filtri (stato, rappresentante, data da/a), pulsante "Crea" | Lista admin         |
| T5.4 | `AppointmentForm.tsx`: Dialog con `Autocomplete` rappresentante, `Autocomplete` azienda, `DateTimePicker`, campo note, campo internal_notes; validazione Zod | Form creazione/edit |
| T5.5 | Al salvataggio `create()`: INSERT appointment + INSERT notification (tipo `appointment_created`) per il rep                                | Notifica automatica |
| T5.6 | `CalendarPage.tsx`: `CalendarView` con tutti gli appuntamenti, colore per stato, click evento → Drawer dettaglio                           | Calendario admin    |
| T5.7 | `AppointmentDetailPage.tsx` (admin): card info complete, `AppointmentTimeline`, sezione foglio firma, bottoni modifica/annulla             | Dettaglio admin     |
| T5.8 | Azione "Modifica": riapre `AppointmentForm`; se `status='confirmed'` → `status='pending'`; se solo `pending` resta `pending`; logga modifiche data/ora in `appointment_modifications`; INSERT `appointment_updated` | Edit coerente con macchina stati |
| T5.9 | Azione "Annulla": `ConfirmDialog` → UPDATE `status='cancelled'` + INSERT notification `appointment_cancelled`                              | Annullamento        |

---

### FASE 6 – Area Rappresentante (dashboard, calendario, rubrica)

| ID   | Task                                                                                                                               | Output atteso          |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| T6.1 | `RepDashboardPage.tsx`: card prossima visita, feed aggiornamenti (notifiche recenti), tabella "Settimana in arrivo"                | Dashboard rep          |
| T6.2 | `RepCalendarPage.tsx`: viste giorno/settimana/mese, mini-calendario, riepilogo stati giornata, timeline (solo `representative_id` corrente) | Pianificazione rep |
| T6.3 | `RepCompaniesPage.tsx`: griglia/card aziende in sola lettura con ricerca (campi: segmento, referente, indirizzo)                   | Rubrica aziende        |
| T6.4 | `RepAppointmentDetailPage.tsx`: `VisitInfoCard` (mappa link esterno/indicazioni), note UC, audit trail, azioni per §6            | Dettaglio visita       |
| T6.5 | `RescheduleAppointmentPage.tsx` + `RescheduleForm.tsx`: data/ora/motivo separati; submit secondo matrice transizioni §6          | Riprogrammazione       |
| T6.6 | `RepProfilePage.tsx`: first/last name, telefono, avatar (`avatars/`); email read-only; cambio password opzionale                 | Profilo rep            |

---

### FASE 7 – Azioni Rappresentante sugli Appuntamenti

| ID   | Task                                                                                                                                                                                  | Output atteso        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| T7.1 | **Azione "Conferma"** (stato `pending`): bottone → `ConfirmDialog` → UPDATE `status='confirmed'` + INSERT notification `appointment_confirmed`                                        | Conferma funzionante |
| T7.2 | **Azione "Modifica data/ora"** (`pending` o `confirmed`): naviga a `RescheduleAppointmentPage`                                                                                          | Flusso modifica      |
| T7.3 | `RescheduleForm.tsx`: `DatePicker` + `TimePicker` separati + motivo obbligatorio (Zod)                                                                                                | Form allineato mockup |
| T7.4 | Submit reschedule: UPDATE `scheduled_datetime` (+ `end_datetime` se usato) + `status='confirmed'` + log `appointment_modifications` + notifica `appointment_modified` (o `appointment_confirmed` se era solo conferma senza cambio data da pagina dettaglio) | Modifica completa |
| T7.5 | **Carica foglio firma** solo se `status='confirmed'`: dialog o redirect da `RepDocumentsPage` con `appointment_id` preselezionato                                                     | Upload gated by stato |
| T7.6 | `FileUploadZone.tsx`: `react-dropzone` per drag&drop / click, accetta JPEG/PNG/WEBP/PDF ≤10MB, anteprima thumbnail + progress bar                                                     | Componente upload    |
| T7.7 | Upload foglio firma: Storage upload → INSERT `signed_sheets` → UPDATE `status='completed'` → INSERT notification `signed_sheet_uploaded`                                              | Upload end-to-end    |

---

### FASE 8 – Sistema Notifiche

| ID   | Task                                                                                                                                                | Output atteso        |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| T8.1 | `api/notifications.ts`: `getAll()`, `markAsRead(id)`, `markAllAsRead()`, `getUnreadCount()`                                                         | Layer API            |
| T8.2 | `notificationStore.ts` (Zustand): `notifications[]`, `unreadCount`, azioni di sync                                                                  | Store                |
| T8.3 | `useRealtimeNotifications.ts`: subscribe su `supabase.channel('notifications').on('postgres_changes', INSERT)` → aggiorna store                     | Realtime funzionante |
| T8.4 | `NotificationBadge.tsx`: mostra count da store, click → apre `NotificationCenter` Drawer                                                            | Badge live           |
| T8.5 | `NotificationCenter.tsx`: MUI Drawer da destra, lista `NotificationItem`, header con "Segna tutte come lette"                                       | Centro notifiche     |
| T8.6 | `NotificationItem.tsx`: icona per tipo notifica, titolo, messaggio, timestamp relativo, click → naviga al dettaglio appuntamento + segna come letta | Item notifica        |

---

### FASE 9 – Documenti e Fogli Firma

| ID   | Task                                                                                                                    | Output atteso            |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| T9.0 | `RepDocumentsPage.tsx`: upload zone, riepilogo stati derivati (§7.4), lista `signed_sheets` del rep con download        | Hub documenti rep        |
| T9.0b | `DocumentsPortalPage.tsx` (admin): KPI, tabella globale fogli firma, filtri, link ad appuntamento/azienda              | Portale documenti UC   |
| T9.1 | In `AppointmentDetailPage` admin: sezione condizionale se `status='completed'` o foglio caricato                        | Sezione visibile         |
| T9.2 | `api/signedSheets.ts`: `getByAppointmentId()`, `getSignedUrl()` (Supabase Storage signed URL, TTL 1h), `markAsViewed()` | Layer API                |
| T9.3 | Preview documento: thumbnail se immagine, icona PDF se PDF; pulsante "Apri" (nuova tab con signed URL) e "Scarica"      | Preview + download       |
| T9.4 | Al primo click su "Apri": UPDATE `signed_sheets.viewed_by_admin = true`, `viewed_at = NOW()`                            | Tracking visualizzazione |
| T9.5 | Badge "Non letto" sull'appuntamento nella lista admin finché `viewed_by_admin = false`                                  | Indicatore visivo        |

---

### FASE 10 – Componente Calendario (Condiviso)

| ID    | Task                                                                                                                         | Output atteso     |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| T10.1 | `CalendarView.tsx`: wrapper FullCalendar con `dayGridMonth`, `timeGridWeek`, `timeGridDay`, pulsante oggi, navigazione mese  | Calendario base   |
| T10.2 | Mappatura eventi: `appointments[]` → `EventInput[]` con colore da `getStatusColor(status)`                                   | Colorazione stati |
| T10.3 | Click su evento → Drawer laterale (`AppointmentDrawer.tsx`) con riepilogo e link "Vai al dettaglio"                          | Drawer evento     |
| T10.4 | (Solo admin) Drag & drop evento su nuova data → `ConfirmDialog` "Confermi lo spostamento?" → `update()` + log + notifica rep | Drag & drop admin |

---

### FASE 11 – Qualità UX

| ID    | Task                                                                                                                                      | Output atteso       |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| T11.1 | Skeleton loaders (`MUI Skeleton`) per tabelle, calendario e card durante il caricamento                                                   | Loading UX          |
| T11.2 | `react-toastify`: feedback toast per ogni azione (es. "Appuntamento creato", "Foglio firma caricato")                                     | Feedback utente     |
| T11.3 | `ConfirmDialog.tsx` riutilizzabile: title, message, `confirmText`, `onConfirm`, `isLoading` state durante operazione async                | Dialog generico     |
| T11.4 | `EmptyState.tsx`: illustrazione + testo per liste vuote (nessun appuntamento, nessuna notifica, ecc.)                                     | Empty states        |
| T11.5 | `StatusChip.tsx`: MUI `Chip` con colore e label per ogni stato (`pending`→arancio, `confirmed`→verde, `completed`→blu, `cancelled`→rosso) | Chip riutilizzabile |
| T11.6 | `AppointmentTimeline.tsx`: MUI `Timeline` con tutti gli eventi dell'appuntamento (creazione, modifiche, conferma, upload foglio)          | Storico visivo      |
| T11.7 | Responsive layout: breakpoint `xs/sm` per mobile rep (bottom nav), `md+` per admin sidebar                                                | Mobile-friendly     |
| T11.8 | Error boundaries React + pagine `/404` e `/error` con link "Torna alla home"                                                              | Gestione errori     |
| T11.9 | `AdminSettingsPage.tsx`: sezione inviti rep + toggle notifiche (§7.5); placeholder per riepilogo email giornaliero                        | Impostazioni admin  |
| T11.10 | Utility `generateReferenceCode()`: formato `VIS-{id corto}` su create appointment                                                      | Codice visita in UI |

---

### FASE 12 – Testing e Deploy

| ID    | Task                                                                                             | Output atteso  |
| ----- | ------------------------------------------------------------------------------------------------ | -------------- |
| T12.1 | Unit test `useAuth` (Vitest + testing-library): mock Supabase client, test login/logout/redirect | Test auth      |
| T12.2 | Unit test `AppointmentForm`: validazione Zod, submit, error states                               | Test form      |
| T12.3 | Integration test notifiche: mock Realtime → verifica badge update                                | Test notifiche |
| T12.4 | E2E Playwright: flusso completo admin (login → crea appuntamento → verifica notifica rep)        | Test E2E       |
| T12.5 | E2E Playwright: flusso rep (login → modifica appuntamento → carica foglio firma)                 | Test E2E       |
| T12.6 | GitHub Actions CI: lint + typecheck + unit test + build                                          | Pipeline CI    |
| T12.7 | Deploy frontend su Vercel: env vars Supabase, build command `vite build`                         | Produzione     |
| T12.8 | Supabase: configurare redirect URL Auth per produzione, SMTP Resend in Supabase Auth settings    | Config prod    |

---

## 11. Cheat Sheet Tipi TypeScript

```typescript
// src/types/index.ts

export type UserRole = "admin" | "representative";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type NotificationType =
  | "appointment_created"
  | "appointment_updated"
  | "appointment_confirmed"
  | "appointment_modified"
  | "signed_sheet_uploaded"
  | "appointment_cancelled";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  job_title: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  segment: string | null;
  contact_person: string | null;
  contact_title: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  company_id: string;
  representative_id: string;
  scheduled_datetime: string; // ISO 8601
  end_datetime: string | null;
  original_datetime: string;
  reference_code: string | null;
  status: AppointmentStatus;
  notes: string | null;
  internal_notes: string | null;
  created_at: string;
  // join fields
  company?: Company;
  representative?: Profile;
}

export interface AppointmentModification {
  id: string;
  appointment_id: string;
  modified_by: string;
  old_datetime: string;
  new_datetime: string;
  reason: string | null;
  created_at: string;
  modifier?: Profile;
}

export interface SignedSheet {
  id: string;
  appointment_id: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  notes: string | null;
  uploaded_at: string;
  viewed_by_admin: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  appointment_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Helper
export function getDisplayName(p: Pick<Profile, "first_name" | "last_name">): string {
  return `${p.first_name} ${p.last_name}`.trim();
}
```

---

## 12. Note per l'Uso con LLM

Ogni task può essere eseguito in sessione separata. Template di prompt consigliato:

```
Contesto: sto costruendo "Itinera", una web app React + TypeScript + Vite +
Material UI + Supabase. Le specifiche complete sono nel documento allegato.

Task da completare: [T_X.Y – Titolo task]

Requisiti specifici:
- Usa MUI (no Tailwind)
- Supabase client da `@/lib/supabase`
- Tipi da `@/types/index.ts`
- TanStack Query per server state
- Zustand per client state
- React Hook Form + Zod per form
- dayjs per date

[Incolla le sezioni rilevanti della spec come contesto aggiuntivo]
```

---

_Itinera – Specifiche v3 · Allineato a `.agents/design` (navigazione, schermate rep/admin, token UI). Correzioni logica: RLS rep su stati terminali, transizioni UC pending/confirmed, upload foglio solo da `confirmed`, stati documento derivati, profilo/aziende estesi._
