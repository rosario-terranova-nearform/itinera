# Itinera – Specifiche di Progetto (v4)

> **Stack**: React · TypeScript · Vite · Material UI · PocketBase (DB, Auth, Storage, Hooks)
>
> **Design di riferimento**: `.agents/design/DESIGN.md` (token colore, tipografia Inter, layout admin/rep). Mockup per schermata in `.agents/design/admin-uc/` e `.agents/design/user-represenative/`.
>
> **Assunzioni consolidate**: 3 rappresentanti · admin singolo · modifica appuntamento libera (senza approvazione UC) · notifiche via email · foglio firma come file caricato (foto/PDF) · anagrafica aziende in sola lettura per il rep

---

## 1. Panoramica

**Itinera** è una SPA per la gestione degli appuntamenti di un rappresentante di cancelleria. L'**Unità Centrale (UC)** pianifica le visite aziendali creando incarichi con data e orario. Il **Rappresentante** gestisce il proprio calendario, può confermare o modificare liberamente data/orario, e al termine di ogni visita carica il foglio firma come prova.

---

## 2. Attori e Permessi

| Ruolo              | N° account | Descrizione                                                              |
| ------------------ | ---------- | ------------------------------------------------------------------------ |
| **Admin (UC)**     | 1          | Crea e gestisce appuntamenti, anagrafica aziende, rappresentanti, portale documenti, impostazioni |
| **Representative** | 3          | Vede il proprio calendario, consulta anagrafica aziende (sola lettura), gestisce appuntamenti, carica fogli firma, area documenti personale |

Tutti gli account sono **pre-creati** (nessuna registrazione pubblica). L'UC crea i rappresentanti direttamente dall'apposita pagina nell'app (che chiama l'API PocketBase), dopodiché il sistema invia automaticamente una email di reset password così che il rep possa impostare la propria credenziale al primo accesso.

---

## 3. User Stories

### UC – Admin

| ID  | Come UC voglio…                                                                            | Così che…                                                         |
| --- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| A01 | Creare un nuovo appuntamento (azienda, data, ora, note) per un determinato rappresentante  | Il rappresentante sia avvisato subito via email |
| A02 | Modificare un appuntamento già creato                                                      | Posso correggere data, ora o azienda in qualsiasi momento         |
| A03 | Annullare un appuntamento                                                                  | Il rep sia avvisato e l'agenda si aggiorni                        |
| A04 | Vedere il calendario con tutti gli appuntamenti (mensile/settimanale/giornaliero)          | Ho una visione completa dell'agenda                               |
| A05 | Filtrare appuntamenti per stato e periodo                                                  | Trovo rapidamente ciò che mi serve                                |
| A06 | Ricevere email quando il rep conferma o modifica un appuntamento                           | Resto sempre aggiornato sullo stato dell'agenda                   |
| A07 | Visualizzare e scaricare il foglio firma caricato dal rep                                  | Ho prova documentale delle visite avvenute                        |
| A08 | Gestire l'anagrafica delle aziende clienti (CRUD)                                          | Posso selezionarle rapidamente alla creazione degli appuntamenti  |
| A09 | Creare account rappresentanti (con email di benvenuto e link reset password)               | Controllo chi può accedere all'app                                |
| A10 | Consultare il portale documenti con tutti i fogli firma caricati                           | Revisiono le prove di visita in un unico punto                    |
| A11 | Configurare preferenze di notifica di sistema (MVP: solo visualizzazione o toggle base)    | Adatto gli avvisi al flusso operativo UC                          |

### Rappresentante – User

| ID  | Come Rappresentante voglio…                                                              | Così che…                                                  |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| R01 | Ricevere email quando mi viene assegnato un nuovo appuntamento                           | Non perda nessun incarico                                  |
| R02 | Vedere il mio calendario con tutti gli appuntamenti (non vedo appuntamenti di altri rep) | Pianifichi le mie giornate                                 |
| R03 | Confermare un appuntamento così com'è                                                    | L'UC sappia che andrò alla data prevista                   |
| R04 | Modificare liberamente data e/o ora di un appuntamento con una nota                      | Gestisca eventuali impedimenti senza iter di approvazione  |
| R05 | Ricevere email se l'UC modifica o annulla un appuntamento                                 | Sia sempre sincronizzato sulle ultime decisioni            |
| R06 | Caricare il foglio firma dopo una visita (foto o PDF)                                    | Invio prova all'UC dall'app                                |
| R07 | Vedere il dettaglio di ogni appuntamento (azienda, indirizzo, note UC)                   | Arrivi preparato alla visita                               |
| R08 | Modificare il mio profilo (nome, cognome, telefono, avatar; email in sola lettura)       | Mantenga i dati aggiornati                                 |
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
│   react-dropzone · react-toastify                                │
└────────────────────────────┬─────────────────────────────────────┘
                              │ HTTPS
┌────────────────────────────▼─────────────────────────────────────┐
│                         POCKETBASE                               │
│                                                                  │
│  ┌──────────┐  ┌────────────────┐  ┌──────────┐                  │
│  │   Auth   │  │    SQLite      │  │ Storage  │                  │
│  │ (JWT)    │  │  + Collections │  │ (files)  │                  │
│  └──────────┘  └────────────────┘  └──────────┘                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  JS Hooks: pb_hooks/                                       │  │
│  │  • auth.pb.js           → blocca login se is_active=false  │  │
│  │  • notifications.pb.js  → SMTP builtin PocketBase          │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Dipendenze Frontend

```json
{
  "@mui/material": "*",
  "@mui/icons-material": "*",
  "@mui/x-date-pickers": "*",
  "pocketbase": "*",
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

PocketBase organizza i dati in **Collections** (equivalente delle tabelle relazionali). Il controllo degli accessi avviene tramite **Access Rules** per ciascuna operazione (`listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule`), espresse come filtri PocketBase. I file sono campi di tipo `file` direttamente sulla collection di riferimento — non esistono bucket separati.

### 5.1 Tipi enumerati (Select fields)

I valori enumerati sono implementati come campi `select` sulle rispettive collections:

**`users.role`** → opzioni: `admin`, `representative` (default: `representative`)

**`appointments.status`** → opzioni:
- `pending`    – creato dall'UC, il rep non ha ancora risposto
- `confirmed`  – il rep ha confermato (con o senza modifica data/ora)
- `completed`  – visita avvenuta, foglio firma caricato
- `cancelled`  – annullato dall'UC

**`notifications.type`** → opzioni:
- `appointment_created`    – UC → Rep: nuovo incarico assegnato
- `appointment_updated`    – UC → Rep: UC ha modificato data/ora/azienda
- `appointment_confirmed`  – Rep → UC: rep ha confermato senza modifiche
- `appointment_modified`   – Rep → UC: rep ha cambiato data/ora
- `signed_sheet_uploaded`  – Rep → UC: foglio firma caricato
- `appointment_cancelled`  – UC → Rep: appuntamento annullato

### 5.2 Collections

#### `users` *(Auth collection – estende il tipo auth built-in di PocketBase)*

> PocketBase ha una collection `users` di tipo `auth` pre-esistente con campi built-in (`email`, `password`, `verified`, `username`). Si estende con i campi custom sotto.

| Campo        | Tipo   | Opzioni / Note                                                             |
| ------------ | ------ | -------------------------------------------------------------------------- |
| `id`         | auto   | PocketBase ID (15 char alfanumerico), generato automaticamente             |
| `email`      | email  | built-in; unico; `emailVisibility: false` (visibile solo a se stessi/admin) |
| `password`   | —      | built-in; hashed bcrypt; mai restituita nelle risposte API                 |
| `verified`   | bool   | built-in; `true` = email verificata                                        |
| `first_name` | text   | required                                                                   |
| `last_name`  | text   | required                                                                   |
| `role`       | select | opzioni: `admin`, `representative`; default `representative`; required     |
| `job_title`  | text   | opzionale (es. "Rappresentante commerciale")                               |
| `phone`      | text   | opzionale                                                                  |
| `avatar`     | file   | max 1 file; MIME: `image/jpeg`, `image/png`, `image/webp`; max 2 MB       |
| `is_active`  | bool   | default `true`; `false` = accesso bloccato via hook `auth.pb.js`           |

**Access Rules**

| Operazione   | Regola                                                                    |
| ------------ | ------------------------------------------------------------------------- |
| `listRule`   | `@request.auth.role = "admin"`                                            |
| `viewRule`   | `@request.auth.id = id \|\| @request.auth.role = "admin"`                 |
| `createRule` | `@request.auth.role = "admin"`                                            |
| `updateRule` | `@request.auth.id = id \|\| @request.auth.role = "admin"`                 |
| `deleteRule` | `@request.auth.role = "admin"`                                            |

> **Blocco `is_active`**: implementato nell'hook `pb_hooks/auth.pb.js` tramite `onRecordAuthWithPasswordRequest`. Se `is_active = false` viene lanciata un'eccezione prima del completamento del login, indipendentemente dalla correttezza della password.

---

#### `companies` *(Base collection)*

| Campo            | Tipo   | Opzioni / Note                                     |
| ---------------- | ------ | -------------------------------------------------- |
| `name`           | text   | required                                           |
| `address`        | text   |                                                    |
| `city`           | text   |                                                    |
| `province`       | text   | es. "NA", "RM"                                     |
| `postal_code`    | text   |                                                    |
| `segment`        | select | opzioni: `Enterprise`, `Mid-Market`, `SMB`         |
| `contact_person` | text   |                                                    |
| `contact_title`  | text   | es. "Direttore acquisti"                           |
| `phone`          | text   |                                                    |
| `email`          | email  |                                                    |
| `notes`          | text   |                                                    |
| `is_active`      | bool   | default `true`; `false` = Inattiva in UI admin     |

**Access Rules**

| Operazione   | Regola                              |
| ------------ | ----------------------------------- |
| `listRule`   | `@request.auth.id != ""`            |
| `viewRule`   | `@request.auth.id != ""`            |
| `createRule` | `@request.auth.role = "admin"`      |
| `updateRule` | `@request.auth.role = "admin"`      |
| `deleteRule` | `@request.auth.role = "admin"`      |

---

#### `appointments` *(Base collection)*

| Campo                | Tipo     | Opzioni / Note                                                                   |
| -------------------- | -------- | -------------------------------------------------------------------------------- |
| `company`            | relation | → `companies`; required; cascade delete: false                                   |
| `representative`     | relation | → `users`; required                                                              |
| `scheduled_datetime` | date     | required; include time                                                           |
| `end_datetime`       | date     | opzionale; include time                                                          |
| `original_datetime`  | date     | required; include time; impostato uguale a `scheduled_datetime` alla creazione   |
| `reference_code`     | text     | unico; es. `VIS-49201`; generato lato app se non fornito                         |
| `status`             | select   | opzioni: `pending`/`confirmed`/`completed`/`cancelled`; default `pending`; required |
| `notes`              | text     | note visibili al rep                                                             |
| `internal_notes`     | text     | note interne UC — escluse dalle query del rep via parametro `fields` (vedi nota) |
| `created_by`         | relation | → `users`; required                                                              |

**Access Rules**

| Operazione   | Regola                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| `listRule`   | `@request.auth.role = "admin" \|\| representative = @request.auth.id`                                           |
| `viewRule`   | `@request.auth.role = "admin" \|\| representative = @request.auth.id`                                           |
| `createRule` | `@request.auth.role = "admin"`                                                                                  |
| `updateRule` | `@request.auth.role = "admin" \|\| (representative = @request.auth.id && status != "cancelled" && status != "completed")` |
| `deleteRule` | `@request.auth.role = "admin"`                                                                                  |

> **Nota `internal_notes`**: PocketBase non ha column-level security. Il campo viene nascosto nelle chiamate del rep passando esplicitamente il parametro `fields` nella query (`fields: "id,company,representative,scheduled_datetime,..."` — escludendo `internal_notes`). In alternativa, implementare un hook `onRecordsListRequest`/`onRecordViewRequest` che strippi il campo per `@request.auth.role = "representative"`.

---

#### `appointment_modifications` *(Base collection)*

| Campo          | Tipo | Opzioni / Note                                                    |
| -------------- | ---- | ----------------------------------------------------------------- |
| `appointment`  | relation | → `appointments`; required; cascade delete                    |
| `modified_by`  | relation | → `users`; required                                           |
| `old_datetime` | date | required; include time                                            |
| `new_datetime` | date | required; include time                                            |
| `reason`       | text | motivazione della modifica (obbligatoria lato app per i rep)      |

**Access Rules**

| Operazione   | Regola                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `listRule`   | `@request.auth.role = "admin" \|\| modified_by = @request.auth.id \|\| appointment.representative = @request.auth.id`            |
| `viewRule`   | `@request.auth.role = "admin" \|\| modified_by = @request.auth.id \|\| appointment.representative = @request.auth.id`            |
| `createRule` | `@request.auth.id != ""`                                                                                                         |
| `updateRule` | `""` *(nessuno — il log è immutabile)*                                                                                           |
| `deleteRule` | `""` *(nessuno)*                                                                                                                 |

---

#### `signed_sheets` *(Base collection)*

| Campo             | Tipo     | Opzioni / Note                                                                  |
| ----------------- | -------- | ------------------------------------------------------------------------------- |
| `appointment`     | relation | → `appointments`; required; `unique: true`; cascade delete                      |
| `file`            | file     | max 1 file; MIME: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`; max 10 MB |
| `file_name`       | text     | required                                                                        |
| `file_size`       | number   | bytes; intero                                                                   |
| `mime_type`       | text     |                                                                                 |
| `notes`           | text     | note opzionali del rep al momento dell'upload                                   |
| `uploaded_by`     | relation | → `users`; required                                                             |
| `viewed_by_admin` | bool     | default `false`                                                                 |
| `viewed_at`       | date     | opzionale; impostato al primo click "Apri" da parte dell'admin                  |

**Access Rules**

| Operazione   | Regola                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------- |
| `listRule`   | `@request.auth.role = "admin" \|\| uploaded_by = @request.auth.id`                            |
| `viewRule`   | `@request.auth.role = "admin" \|\| uploaded_by = @request.auth.id`                            |
| `createRule` | `@request.auth.role = "representative" && @request.auth.id != ""`                             |
| `updateRule` | `@request.auth.role = "admin"` *(solo admin aggiorna `viewed_by_admin`)*                      |
| `deleteRule` | `@request.auth.role = "admin"`                                                                |

---

#### `notifications` *(Base collection)*

| Campo         | Tipo     | Opzioni / Note                                              |
| ------------- | -------- | ----------------------------------------------------------- |
| `user`        | relation | → `users`; required; cascade delete                         |
| `appointment` | relation | → `appointments`; opzionale; nullify on delete              |
| `type`        | select   | opzioni: vedi §5.1; required                                |
| `title`       | text     | required                                                    |
| `message`     | text     | required                                                    |
| `is_read`     | bool     | default `false`                                             |

**Access Rules**

| Operazione   | Regola                                                                               |
| ------------ | ------------------------------------------------------------------------------------ |
| `listRule`   | `user = @request.auth.id \|\| @request.auth.role = "admin"`                          |
| `viewRule`   | `user = @request.auth.id \|\| @request.auth.role = "admin"`                          |
| `createRule` | `@request.auth.id != ""` *(il frontend crea notifiche; l'hook le intercetta per email)* |
| `updateRule` | `user = @request.auth.id` *(solo mark as read dal proprietario)*                     |
| `deleteRule` | `""`                                                                                 |

### 5.3 Indici

PocketBase crea automaticamente indici sulle relation fields. Aggiungere tramite migration JS o admin UI:

```
appointments       → status             (filtro per stato)
appointments       → scheduled_datetime (ordinamento/range date)
notifications      → user + is_read     (audit email e filtri admin)
```

### 5.4 File Storage

In PocketBase i file sono memorizzati in `pb_data/storage/` e serviti con accesso controllato dalle stesse rules della collection. Non esistono bucket separati.

**Pattern path fisico**:
```
pb_data/storage/{collection_id}/{record_id}/{filename_with_hash}
```

**URL pubblico (collection con viewRule aperta agli autenticati)**:
```
{PB_URL}/api/files/{collection_id}/{record_id}/{filename}
```

**URL per file protetti** (accesso verificato dal server tramite JWT):
```javascript
// SDK gestisce il token auth nell'header automaticamente per richieste fetch
const url = pb.files.getUrl(record, record.file);

// Per aprire in nuova tab (senza header auth), generare un file token JWT (TTL 5 min)
const fileToken = await pb.files.getToken();
const url = pb.files.getUrl(record, record.file, { token: fileToken });
// → aggiunge ?token={fileToken} alla URL
```

---

## 6. Macchina a Stati degli Appuntamenti

*(Sezione invariata rispetto a v3 — la logica di stato è indipendente dal backend)*

### Stati e colori UI

| Stato       | Significato                              | Token / hex design          | MUI (override tema) |
| ----------- | ---------------------------------------- | --------------------------- | ------------------- |
| `pending`   | In attesa di risposta del rep            | `status-pending` `#ED6C02`  | `warning`           |
| `confirmed` | Confermato (data originale o modificata) | `status-confirmed` `#2E7D32`| `success`           |
| `completed` | Visita avvenuta, foglio firma caricato   | `status-completed` `#1976D2`| `primary`           |
| `cancelled` | Annullato dall'UC                        | `status-cancelled` `#D32F2F`| `error`             |

> **Nota mockup**: etichette come "Draft" nei design sono solo dati dimostrativi e corrispondono a `pending`.

### Diagramma transizioni

```
                    ┌──────────┐
         UC crea    │          │  Notifica → Rep (email)
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
                         │  Notifica → UC (email)
                         ▼  [tipo diverso: confirmed vs modified]
                    ┌──────────┐
                    │CONFIRMED │◄──── UC modifica (da confirmed) → PENDING
                    │          │      UC modifica (da pending) → resta PENDING
                    └────┬─────┘      (sempre notifica → Rep)
                         │ Rep carica foglio firma
                         │ Notifica → UC (email)
                         ▼
                    ┌──────────┐
                    │COMPLETED │  (stato finale, non modificabile)
                    └──────────┘

        Da qualsiasi stato (tranne COMPLETED):
        UC annulla → CANCELLED + notifica → Rep
```

### Matrice transizioni

| Da                    | A           | Chi | Azione / condizione                                    |
| --------------------- | ----------- | --- | ------------------------------------------------------ |
| `pending`             | `confirmed` | Rep | Conferma senza cambiare `scheduled_datetime`           |
| `pending`             | `confirmed` | Rep | Modifica data/ora + nota obbligatoria                  |
| `confirmed`           | `confirmed` | Rep | Ri-modifica data/ora + nota obbligatoria               |
| `pending`             | `pending`   | UC  | Modifica campi (data, azienda, rep, note)              |
| `confirmed`           | `pending`   | UC  | Modifica campi dopo conferma rep                       |
| `confirmed`           | `completed` | Rep | Carica foglio firma (solo da dettaglio o da documenti) |
| `pending`/`confirmed` | `cancelled` | UC  | Annulla appuntamento                                   |
| `completed`           | —           | —   | Stato finale: nessuna transizione                      |
| `cancelled`           | —           | —   | Stato finale: nessuna transizione                      |

> **Nota**: ogni modifica di `scheduled_datetime` (UC o rep) genera una riga in `appointment_modifications`. La conferma senza cambio data **non** crea una modifica.

### Azioni UI per stato (rappresentante)

| Stato       | Conferma visita | Modifica data/ora | Carica foglio firma | Note |
| ----------- | --------------- | ----------------- | ------------------- | ---- |
| `pending`   | Sì              | Sì                | No (disabilitato)   | Bottone upload nascosto/disabilitato finché non `confirmed` |
| `confirmed` | No              | Sì                | Sì                  | Dopo upload → `completed` |
| `completed` | No              | No                | No (già caricato)   | Solo visualizzazione foglio |
| `cancelled` | No              | No                | No                  | Solo lettura |

### Notifiche per modifica UC

| Stato prima modifica UC | Stato dopo | Tipo notifica         |
| ----------------------- | ---------- | --------------------- |
| `pending`               | `pending`  | `appointment_updated` |
| `confirmed`             | `pending`  | `appointment_updated` |

---

## 7. Sistema Notifiche

### 7.1 Trigger notifiche

| Evento                   | Notifica a | Tipo                    | Canali         |
| ------------------------ | ---------- | ----------------------- | -------------- |
| UC crea appuntamento     | Rep        | `appointment_created`   | email |
| UC modifica appuntamento | Rep        | `appointment_updated`   | email |
| UC annulla appuntamento  | Rep        | `appointment_cancelled` | email |
| Rep conferma (invariato) | UC         | `appointment_confirmed` | email |
| Rep modifica data/ora    | UC         | `appointment_modified`  | email |
| Rep carica foglio firma  | UC         | `signed_sheet_uploaded` | email |

### 7.2 Architettura notifiche

```
Azione utente nel frontend
        │
        ▼
Mutation TanStack Query → PocketBase REST API (PATCH/POST)
        │
        └──► POST /api/collections/notifications/records
             │
             ▼
        pb_hooks/notifications.pb.js (onRecordAfterCreateSuccess)
                  │
                  ▼
             Legge dati appointment + user destinatario
             $app.newMailClient().send(new MailerMessage({...}))
             (SMTP configurato in PocketBase admin settings)
             Email inviata
```

**Differenza chiave rispetto a v3**: nessun Database Webhook esterno né Resend API. Il hook JS gira in-process nel server PocketBase e usa lo SMTP configurato in `Settings → Mail settings` dell'admin UI. Qualsiasi provider SMTP compatibile funziona (Resend SMTP, Mailgun, SendGrid, Gmail SMTP, ecc.).

La collezione `notifications` funge da audit log delle email inviate; non viene letta dal frontend.

### 7.3 Template email (hook SMTP)

| Tipo                    | Oggetto                                           | Contenuto principale                             |
| ----------------------- | ------------------------------------------------- | ------------------------------------------------ |
| `appointment_created`   | `📅 Nuovo incarico – {azienda} il {data}`         | Data, ora, azienda, indirizzo, note UC, link app |
| `appointment_updated`   | `✏️ Incarico modificato – {azienda}`              | Vecchia data → Nuova data, motivo                |
| `appointment_cancelled` | `❌ Incarico annullato – {azienda} del {data}`    | Conferma annullamento                            |
| `appointment_confirmed` | `✅ Incarico confermato da {rep}`                 | Data confermata, link dettaglio                  |
| `appointment_modified`  | `🔄 Data modificata da {rep} – {azienda}`         | Vecchia data → Nuova data, nota rep              |
| `signed_sheet_uploaded` | `📎 Foglio firma ricevuto – {azienda} del {data}` | Link diretto al documento                        |

### 7.4 Struttura hook notifiche (`pb_hooks/notifications.pb.js`)

```javascript
// pb_hooks/notifications.pb.js
onRecordAfterCreateSuccess((e) => {
  const record = e.record;
  const userId = record.getString("user");
  const type   = record.getString("type");
  const title  = record.getString("title");
  const msg    = record.getString("message");

  // Recupera email destinatario
  const userRecord = $app.dao().findRecordById("users", userId);
  const toEmail    = userRecord.getString("email");
  const toName     = userRecord.getString("first_name") + " " + userRecord.getString("last_name");

  // Invia email via SMTP builtin
  const message = new MailerMessage({
    from:    { address: $app.settings().meta.senderAddress, name: "Itinera" },
    to:      [{ name: toName, address: toEmail }],
    subject: title,
    text:    msg,
    // html: "<p>..." // opzionale
  });

  $app.newMailClient().send(message);
}, "notifications");
```

### 7.5 Hook auth (`pb_hooks/auth.pb.js`)

```javascript
// pb_hooks/auth.pb.js
onRecordAuthWithPasswordRequest((e) => {
  if (!e.record.getBool("is_active")) {
    throw new ApiError(403, "Account disattivato. Contatta l'amministratore.");
  }
}, "users");
```

### 7.6 Stati documento in UI (derivati, non enum DB)

| Contesto | Etichetta UI | Regola |
| -------- | ------------ | ------ |
| Rep – lista documenti | `In elaborazione` | record `signed_sheets` esiste e `viewed_by_admin = false` |
| Rep – lista documenti | `Ricevuto da UC` | `viewed_by_admin = true` |
| Admin – portale documenti | `Non letto` | `viewed_by_admin = false` |
| Admin – portale documenti | `Visualizzato` | `viewed_by_admin = true` |

### 7.7 Impostazioni notifiche (admin)

Schermata impostazioni per configurare il mittente delle email e abilitare/disabilitare l'invio automatico. **Fuori MVP**: email riepilogo giornaliero alle 08:00 (solo documentato, non implementato).

---

## 8. Struttura Cartelle

```
src/
├── api/                        # Tutte le chiamate PocketBase (no logica UI)
│   ├── appointments.ts
│   ├── companies.ts
│   ├── users.ts                # era profiles.ts in v3
│   └── signedSheets.ts
│
├── components/
│   ├── common/
│   │   ├── ConfirmDialog.tsx
│   │   ├── StatusChip.tsx
│   │   ├── FileUploadZone.tsx
│   │   ├── EmptyState.tsx
│   │   └── PageLoader.tsx
│   ├── appointments/
│   │   ├── AppointmentCard.tsx
│   │   ├── AppointmentForm.tsx
│   │   ├── AppointmentTimeline.tsx
│   │   ├── VisitInfoCard.tsx
│   │   └── RescheduleForm.tsx
│   ├── documents/
│   │   ├── DocumentUploadZone.tsx
│   │   ├── DocumentListItem.tsx
│   │   └── DocumentStatusSummary.tsx
│   ├── calendar/
│   │   └── CalendarView.tsx
│       └── layout/
│       ├── AdminLayout.tsx
│       ├── RepLayout.tsx
│       ├── AdminSidebar.tsx
│       └── Topbar.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useAppointments.ts
│   └── useCompanies.ts
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── admin/
│   │   ├── AdminDashboardPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── CreateAppointmentPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── AppointmentDetailPage.tsx
│   │   ├── CompaniesPage.tsx
│   │   ├── CompanyDetailPage.tsx
│   │   ├── RepresentativesPage.tsx
│   │   ├── DocumentsPortalPage.tsx
│   │   └── AdminSettingsPage.tsx
│   └── representative/
│       ├── RepDashboardPage.tsx
│       ├── RepCalendarPage.tsx
│       ├── RepAppointmentDetailPage.tsx
│       ├── RescheduleAppointmentPage.tsx
│       ├── RepCompaniesPage.tsx
│       ├── RepDocumentsPage.tsx
│       └── RepProfilePage.tsx
│
├── store/
│   └── authStore.ts
│
├── lib/
│   ├── pocketbase.ts           # singleton PocketBase tipizzato
│   └── pb.types.ts             # generato da pocketbase-typegen
│
├── types/
│   └── index.ts
│
├── utils/
│   ├── dateUtils.ts
│   └── statusUtils.ts
│
├── theme/
│   └── muiTheme.ts
│
└── router/
    ├── AppRouter.tsx
    ├── AdminRoutes.tsx
    └── RepRoutes.tsx

pb_migrations/
├── 001_init_schema.js          # collections + campi + access rules
└── 002_seed.js                 # dati di sviluppo (admin, 3 rep, 5 aziende, 8 appuntamenti)

pb_hooks/
├── auth.pb.js                  # blocca login se is_active = false
└── notifications.pb.js         # invia email SMTP su INSERT in notifications
```

---

## 9. Viste UI – Descrizione Pagine

*(Identica a v3 — navigazione, route e contenuto non dipendono dal backend)*

Navigazione allineata ai mockup (sidebar admin 240px; rep mobile con bottom nav 56px: **Dashboard · Calendario · Profilo**).

### Admin (UC)

| Pagina | Route | Mockup design | Contenuto |
| ------ | ----- | ------------- | --------- |
| Dashboard | `/admin` | `admin_dashboard_uc` | KPI (oggi, in attesa, completati mese), tabella attività recente, CTA "+ Nuovo appuntamento", ricerca globale |
| Pianificazione | `/admin/calendar` | `admin_scheduling_calendar` | Calendario mese/settimana/giorno; colori stato; click → drawer/dettaglio; drag & drop (admin) |
| Crea appuntamento | `/admin/appointments/new` | `create_new_appointment_admin` | Form: azienda (autocomplete), rappresentante, data, ora, note rep, note interne UC |
| Appuntamenti | `/admin/appointments` | — | Tabella con filtri (stato, rep, periodo), link a dettaglio |
| Dettaglio appuntamento | `/admin/appointments/:id` | — | Info, audit trail, foglio firma, modifica/annulla |
| Aziende | `/admin/companies` | `admin_companies_management` | Tabella con filtri stato/provincia, CRUD, soft delete |
| Dettaglio azienda | `/admin/companies/:id` | — | Scheda azienda + storico appuntamenti |
| Rappresentanti | `/admin/representatives` | `admin_representative_management` | Elenco rep, crea account (API PocketBase + reset password email), attivo/inattivo |
| Documenti | `/admin/documents` | `admin_documents_portal` | KPI upload/non letti, tabella documenti, filtro/ordinamento |
| Impostazioni | `/admin/settings` | `admin_system_settings` | Crea rep, toggle notifiche (MVP parziale) |

**Sidebar admin**: Dashboard · Pianificazione · Aziende · Rappresentanti · Documenti · Impostazioni

### Rappresentante

| Pagina | Route | Mockup design | Contenuto |
| ------ | ----- | ------------- | --------- |
| Dashboard | `/rep` | `representative_dashboard` | Card prossima visita (countdown, indirizzo, contatto), aggiornamenti recenti, tabella settimana |
| Pianificazione | `/rep/calendar` | `representative_scheduling_calendar` | Mini-calendario, riepilogo giornata per stato, timeline giornaliera |
| Dettaglio appuntamento | `/rep/appointments/:id` | `appointment_detail_actions` | Codice visita, info visita, note UC, audit trail, azioni per stato |
| Riprogramma | `/rep/appointments/:id/reschedule` | `modify_appointment_representative` | Dettaglio attuale (sola lettura) + nuova data, nuova ora, motivo obbligatorio |
| Aziende | `/rep/companies` | `client_directory_rep` | Griglia/card rubrica sola lettura |
| Documenti | `/rep/documents` | `my_personal_documents_representative` | Upload zone, riepilogo stati, lista upload recenti con download |
| Profilo | `/rep/profile` | `personal_profile_settings` | Nome, cognome, telefono, avatar; email read-only; cambio password |

**Sidebar rep (tablet/desktop)**: Dashboard · Pianificazione · Aziende · Documenti · Impostazioni
**Bottom nav rep (mobile)**: Dashboard · Calendario · Profilo

> Il rep **non** crea appuntamenti: eventuali CTA "+ Nuova visita" nei mockup sono fuori scope.

### Tema UI (§ T0.7)

Mappare i token in `.agents/design/DESIGN.md` su `muiTheme.ts`: palette primary `#005dac`, font `Inter`, status chip con sfondo 10–15% opacità e testo ad alto contrasto.

---

## 10. Task di Sviluppo

---

### FASE 0 – Setup Progetto

| ID   | Task                                                                                                                          | Output atteso              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| T0.1 | `npm create vite@latest itinera -- --template react-ts`                                                                       | Progetto base funzionante  |
| T0.2 | Installare dipendenze frontend (vedi §4)                                                                                      | `package.json` completo    |
| T0.3 | Configurare ESLint + Prettier + path alias `@/` in `vite.config.ts` e `tsconfig.json`                                        | Import puliti con `@/`     |
| T0.4 | Scaricare il binario PocketBase da `pocketbase.io`; eseguire `./pocketbase serve`; aprire admin UI `http://127.0.0.1:8090/_/`; impostare email e password del superadmin | PocketBase locale attivo |
| T0.5 | Creare `.env` con `VITE_PB_URL=http://127.0.0.1:8090` + committare `.env.example`                                            | Config env                 |
| T0.6 | `src/lib/pocketbase.ts`: esportare singleton `new PocketBase(import.meta.env.VITE_PB_URL)` con tipi generati                 | Client riutilizzabile      |
| T0.7 | `src/theme/muiTheme.ts`: token da `.agents/design/DESIGN.md` (primary `#005dac`, Inter, status hex, chip 10–15% opacity)     | Tema allineato ai mockup   |

---

### FASE 1 – Database e Backend

| ID   | Task                                                                                                                                          | Output atteso                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| T1.1 | `pb_migrations/001_init_schema.js`: definire tutte le collections (`users` extend, `companies`, `appointments`, `appointment_modifications`, `signed_sheets`, `notifications`) con campi, tipi, required e access rules come da §5.2 | Schema DB completo |
| T1.2 | Applicare migration: `./pocketbase migrate up` (o riavviare il server — le migration vengono applicate automaticamente all'avvio)              | Collections create              |
| T1.3 | `pb_hooks/auth.pb.js`: hook `onRecordAuthWithPasswordRequest` che lancia `ApiError(403, "Account disattivato")` se `is_active = false`         | Blocco login utenti disattivati  |
| T1.4 | `pb_hooks/notifications.pb.js`: hook `onRecordAfterCreateSuccess` sulla collection `notifications` → recupera destinatario → `$app.newMailClient().send(message)` | Email automatiche |
| T1.5 | Generare tipi TypeScript: `npx pocketbase-typegen --url http://127.0.0.1:8090 --email admin@… --password … --out src/lib/pb.types.ts`          | Tipi aggiornati                  |
| T1.6 | `pb_migrations/002_seed.js`: 1 admin, 3 rappresentanti, 5 aziende, 8 appuntamenti in vari stati                                               | Dati di sviluppo                 |
| T1.7 | Configurare SMTP in PocketBase Admin UI (`Settings → Mail settings`): host, porta, username, password (es. Resend SMTP relay, Mailgun, SMTP locale per dev) | Email funzionanti in sviluppo |

---

### FASE 2 – Autenticazione

| ID   | Task                                                                                                                                                                                   | Output atteso       |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| T2.1 | `LoginPage.tsx`: form email + password → `pb.collection('users').authWithPassword(email, password)` → controllo `pb.authStore.model.is_active` post-login → redirect per ruolo; gestione errori | Login funzionante |
| T2.2 | `ResetPasswordPage.tsx`: step 1 → `pb.collection('users').requestPasswordReset(email)`; step 2 (da link email) → `pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)` | Reset funzionante |
| T2.3 | `authStore.ts` (Zustand): state `{ authModel, isLoading }`, actions `login()`, `logout()` (`pb.authStore.clear()`), `init()` che sincronizza da `pb.authStore.onChange` | Store auth |
| T2.4 | `useAuth.ts`: hook wrapper dello store + `useEffect` che chiama `init()` e registra `pb.authStore.onChange` per reattività                                                            | Hook riutilizzabile |
| T2.5 | `ProtectedRoute.tsx`: controlla `pb.authStore.isValid` + ruolo → redirect a `/login` se non autenticato; redirect alla home di ruolo se ruolo errato                                 | Guard route         |
| T2.6 | `AppRouter.tsx`: route pubbliche (`/login`, `/reset-password`), route admin (`/admin/*`), route rep (`/rep/*`)                                                                        | Routing completo    |
| T2.7 | `RepresentativesPage.tsx` (`/admin/representatives`): tabella rep; form "Crea nuovo rep" → `pb.collection('users').create({email, password, passwordConfirm, first_name, last_name, role:'representative', is_active:true})` + `pb.collection('users').requestPasswordReset(email)` per invio link di benvenuto | Gestione account rep |
| T2.8 | Disattivazione rep: `pb.collection('users').update(id, {is_active:false})` → l'hook `auth.pb.js` blocca il prossimo tentativo di login; sessioni attive invalidate al prossimo refresh token | Disattivazione account |

---

### FASE 3 – Layout e Navigazione

| ID   | Task                                                                                                               | Output atteso       |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ------------------- |
| T3.1 | `AdminLayout.tsx`: Drawer laterale persistente (240px) + `<Outlet />`                                              | Layout admin        |
| T3.2 | `AdminSidebar.tsx`: logo Itinera, voci nav (Dashboard, Pianificazione, Aziende, Rappresentanti, Documenti, Impostazioni), voce attiva evidenziata | Sidebar allineata al design |
| T3.3 | `Topbar.tsx` (condivisa): titolo pagina, `UserMenu` (avatar via `pb.files.getUrl()` + logout) | Topbar funzionante  |
| T3.4 | `RepLayout.tsx`: Topbar + Outlet; mobile bottom nav (Dashboard, Calendario, Profilo); da `md` sidebar             | Layout rep          |
| T3.5 | `UserMenu.tsx`: nome utente, voce "Profilo", voce "Logout" che chiama `pb.authStore.clear()` + redirect           | Menu utente         |


---

### FASE 4 – Gestione Aziende (Admin)

| ID   | Task                                                                                                                                  | Output atteso     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| T4.1 | `api/companies.ts`: `getAll(filter?)`, `getById(id)`, `create(data)`, `update(id, data)`, `softDelete(id)` via `pb.collection('companies')` | Layer API     |
| T4.2 | `useCompanies.ts`: TanStack Query hooks (`useCompaniesQuery`, `useCreateCompanyMutation`, ecc.)                                       | Hook dati         |
| T4.3 | `CompaniesPage.tsx`: MUI DataGrid con ricerca per nome/città, pulsante "Aggiungi"                                                     | Lista aziende     |
| T4.4 | `CompanyForm.tsx`: campi come da §5.2 (nome*, indirizzo, città, provincia, CAP, segmento, referente, titolo referente, telefono, email, note); validazione Zod | Form azienda |
| T4.5 | `CompanyDetailPage.tsx`: card info azienda + tab "Appuntamenti" con storico                                                           | Dettaglio azienda |

---

### FASE 5 – Gestione Appuntamenti (Admin)

| ID   | Task                                                                                                                                                    | Output atteso       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| T5.1 | `api/appointments.ts`: `getAll(filter?)`, `getById(id, expand?)`, `create(data)`, `update(id, data)`, `cancel(id)`, `logModification(data)` via `pb.collection('appointments')` e `pb.collection('appointment_modifications')` | Layer API |
| T5.2 | `useAppointments.ts`: hooks TanStack Query con invalidation cache alla mutazione                                                                        | Hook dati           |
| T5.3 | `AppointmentsPage.tsx`: tabella con colonne (data, rappresentante, azienda, stato, azioni), filtri (stato, rep, data da/a), pulsante "Crea"             | Lista admin         |
| T5.4 | `AppointmentForm.tsx`: Autocomplete azienda/rappresentante (da PocketBase con `?filter`), DateTimePicker, note, internal_notes; validazione Zod         | Form create/edit    |
| T5.5 | Al `create()`: POST `appointments` + POST `notifications` (tipo `appointment_created`, destinatario: il rep); l'hook invia email automaticamente        | Notifica automatica |
| T5.6 | `CalendarPage.tsx`: `CalendarView` con tutti gli appuntamenti, colore per stato, click evento → Drawer dettaglio                                        | Calendario admin    |
| T5.7 | `AppointmentDetailPage.tsx` (admin): card info, `AppointmentTimeline`, sezione foglio firma, bottoni modifica/annulla                                   | Dettaglio admin     |
| T5.8 | Azione "Modifica": PATCH `appointments`; se `status='confirmed'` → `status='pending'`; se solo `pending` resta `pending`; log in `appointment_modifications`; POST notification `appointment_updated` | Edit coerente con macchina stati |
| T5.9 | Azione "Annulla": `ConfirmDialog` → PATCH `status='cancelled'` + POST notification `appointment_cancelled`                                              | Annullamento        |

---

### FASE 6 – Area Rappresentante (dashboard, calendario, rubrica)

| ID   | Task                                                                                                                                     | Output atteso          |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| T6.1 | `RepDashboardPage.tsx`: card prossima visita, tabella "Settimana in arrivo"                      | Dashboard rep          |
| T6.2 | `RepCalendarPage.tsx`: viste giorno/settimana/mese; query filtrata `?filter=representative="${currentUser.id}"`; mini-calendario; riepilogo stati | Pianificazione rep |
| T6.3 | `RepCompaniesPage.tsx`: griglia/card aziende sola lettura con ricerca (segmento, referente, indirizzo)                                   | Rubrica aziende        |
| T6.4 | `RepAppointmentDetailPage.tsx`: `VisitInfoCard`, note UC (esclusa da query con `fields`), audit trail, azioni per stato                  | Dettaglio visita       |
| T6.5 | `RescheduleAppointmentPage.tsx` + `RescheduleForm.tsx`: data/ora/motivo separati; submit secondo matrice transizioni §6                  | Riprogrammazione       |
| T6.6 | `RepProfilePage.tsx`: PATCH `first_name`, `last_name`, `phone`; upload avatar via `pb.collection('users').update(id, formData)` (multipart); email read-only; cambio password via PATCH con `{oldPassword, password, passwordConfirm}` | Profilo rep |

---

### FASE 7 – Azioni Rappresentante sugli Appuntamenti

| ID   | Task                                                                                                                                                    | Output atteso        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| T7.1 | **Azione "Conferma"** (`pending`): `ConfirmDialog` → PATCH `status='confirmed'` + POST notification `appointment_confirmed`                             | Conferma funzionante |
| T7.2 | **Azione "Modifica data/ora"** (`pending` o `confirmed`): naviga a `RescheduleAppointmentPage`                                                           | Flusso modifica      |
| T7.3 | `RescheduleForm.tsx`: `DatePicker` + `TimePicker` separati + motivo obbligatorio (Zod `min(1)`)                                                          | Form allineato mockup |
| T7.4 | Submit reschedule: PATCH `scheduled_datetime` + `status='confirmed'` + POST `appointment_modifications` + POST notification `appointment_modified`       | Modifica completa    |
| T7.5 | **Carica foglio firma** solo se `status='confirmed'`: accesso dal dettaglio appuntamento o da `RepDocumentsPage` con `appointment_id` preselezionato     | Upload gated by stato |
| T7.6 | `FileUploadZone.tsx`: `react-dropzone`, accetta `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, max 10 MB; anteprima thumbnail + progress bar | Componente upload   |
| T7.7 | Upload: costruire `FormData` con `file`, `file_name`, `file_size`, `mime_type`, `appointment`, `uploaded_by` → `pb.collection('signed_sheets').create(formData)` → PATCH `status='completed'` → POST notification `signed_sheet_uploaded` | Upload end-to-end |

---

---

### FASE 9 – Documenti e Fogli Firma

| ID    | Task                                                                                                                                              | Output atteso            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| T9.0  | `RepDocumentsPage.tsx`: upload zone, riepilogo stati derivati (§7.6), lista `signed_sheets` del rep con download                                  | Hub documenti rep        |
| T9.0b | `DocumentsPortalPage.tsx` (admin): KPI upload/non letti, tabella globale fogli firma, filtri, link ad appuntamento/azienda                        | Portale documenti UC     |
| T9.1  | `AppointmentDetailPage` admin: sezione condizionale foglio firma se `status='completed'` o foglio caricato                                        | Sezione visibile         |
| T9.2  | `api/signedSheets.ts`: `getByAppointmentId(id)`, `getFileUrl(record)` via `pb.files.getUrl()` + `pb.files.getToken()` (TTL 5 min), `markAsViewed(id)` | Layer API             |
| T9.3  | Preview: thumbnail se immagine, icona PDF se PDF; pulsante "Apri" (nuova tab con URL + file token) e "Scarica" (attributo `download`)             | Preview + download       |
| T9.4  | Al primo click "Apri": PATCH `viewed_by_admin=true`, `viewed_at=new Date().toISOString()`                                                         | Tracking visualizzazione |
| T9.5  | Badge "Non letto" su riga appuntamento in lista admin finché `viewed_by_admin=false`                                                              | Indicatore visivo        |

---

### FASE 10 – Componente Calendario (Condiviso)

| ID    | Task                                                                                                                              | Output atteso     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| T10.1 | `CalendarView.tsx`: wrapper FullCalendar con `dayGridMonth`, `timeGridWeek`, `timeGridDay`, pulsante oggi, navigazione mese       | Calendario base   |
| T10.2 | Mappatura eventi: `appointments[]` → `EventInput[]` con colore da `getStatusColor(status)`                                        | Colorazione stati |
| T10.3 | Click su evento → `AppointmentDrawer.tsx` con riepilogo e link "Vai al dettaglio"                                                 | Drawer evento     |
| T10.4 | (Solo admin) Drag & drop evento su nuova data → `ConfirmDialog` → PATCH + log `appointment_modifications` + POST notification rep | Drag & drop admin |

---

### FASE 11 – Qualità UX

| ID    | Task                                                                                                                                    | Output atteso       |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| T11.1 | Skeleton loaders (`MUI Skeleton`) per tabelle, calendario e card durante il caricamento                                                 | Loading UX          |
| T11.2 | `react-toastify`: feedback toast per ogni azione (es. "Appuntamento creato", "Foglio firma caricato")                                   | Feedback utente     |
| T11.3 | `ConfirmDialog.tsx` riutilizzabile: `title`, `message`, `confirmText`, `onConfirm`, `isLoading` state durante operazione async          | Dialog generico     |
| T11.4 | `EmptyState.tsx`: illustrazione + testo per liste vuote                                                                                 | Empty states        |
| T11.5 | `StatusChip.tsx`: MUI `Chip` con colore e label per ogni stato (`pending`→arancio, `confirmed`→verde, `completed`→blu, `cancelled`→rosso) | Chip riutilizzabile |
| T11.6 | `AppointmentTimeline.tsx`: MUI `Timeline` con tutti gli eventi (creazione, modifiche, conferma, upload foglio)                          | Storico visivo      |
| T11.7 | Responsive layout: `xs/sm` mobile rep (bottom nav), `md+` admin sidebar                                                                | Mobile-friendly     |
| T11.8 | Error boundaries React + pagine `/404` e `/error` con link "Torna alla home"                                                            | Gestione errori     |
| T11.9 | `AdminSettingsPage.tsx`: sezione crea rep + toggle notifiche (§7.7); placeholder riepilogo email giornaliero                            | Impostazioni admin  |
| T11.10 | Utility `generateReferenceCode()`: formato `VIS-{id.slice(0,6).toUpperCase()}` applicato al create appointment                        | Codice visita in UI |

---

### FASE 12 – Testing e Deploy

| ID    | Task                                                                                                            | Output atteso      |
| ----- | --------------------------------------------------------------------------------------------------------------- | ------------------ |
| T12.1 | Unit test `useAuth` (Vitest + testing-library): mock `pocketbase` client, test login/logout/redirect            | Test auth          |
| T12.2 | Unit test `AppointmentForm`: validazione Zod, submit, error states                                             | Test form          |
| T12.3 | Integration test notifiche: verifica che POST `notifications` crei il record e inneschi l'hook email            | Test notifiche     |
| T12.4 | E2E Playwright: flusso admin (login → crea appuntamento → verifica creazione notifica)                               | Test E2E           |
| T12.5 | E2E Playwright: flusso rep (login → modifica appuntamento → carica foglio firma)                               | Test E2E           |
| T12.6 | GitHub Actions CI: lint + typecheck + unit test + build frontend                                               | Pipeline CI        |
| T12.7 | Deploy PocketBase su server (Railway, Fly.io o VPS): montare volume persistente su `pb_data/`; copiare `pb_hooks/` e `pb_migrations/`; eseguire `./pocketbase serve` | Backend produzione |
| T12.8 | Deploy frontend su Vercel: env var `VITE_PB_URL` puntata al PocketBase di produzione; build command `vite build` | Frontend produzione |
| T12.9 | Configurare URL di redirect nelle template email PocketBase (`Settings → Email templates`): URL produzione per reset password e verifica email | Auth email prod |

---

## 11. Cheat Sheet Tipi TypeScript

```typescript
// src/types/index.ts
import type { RecordModel } from "pocketbase";

// --- Enumerati ---

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

// --- Records ---
// RecordModel aggiunge: id, collectionId, collectionName, created, updated

export interface UserRecord extends RecordModel {
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  first_name: string;
  last_name: string;
  role: UserRole;
  job_title: string;
  phone: string;
  avatar: string;       // nome file — ottieni URL con pb.files.getUrl(record, record.avatar)
  is_active: boolean;
}

export interface CompanyRecord extends RecordModel {
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  segment: "Enterprise" | "Mid-Market" | "SMB" | "";
  contact_person: string;
  contact_title: string;
  phone: string;
  email: string;
  notes: string;
  is_active: boolean;
}

export interface AppointmentRecord extends RecordModel {
  company: string;              // ID (o CompanyRecord se expand)
  representative: string;       // ID (o UserRecord se expand)
  scheduled_datetime: string;   // ISO 8601
  end_datetime: string;
  original_datetime: string;
  reference_code: string;
  status: AppointmentStatus;
  notes: string;
  internal_notes: string;       // mai richiesto nelle query del rep
  created_by: string;           // ID
  // expand: disponibile con ?expand=company,representative,created_by
  expand?: {
    company?: CompanyRecord;
    representative?: UserRecord;
    created_by?: UserRecord;
  };
}

export interface AppointmentModificationRecord extends RecordModel {
  appointment: string;          // ID
  modified_by: string;          // ID
  old_datetime: string;
  new_datetime: string;
  reason: string;
  expand?: {
    modified_by?: UserRecord;
  };
}

export interface SignedSheetRecord extends RecordModel {
  appointment: string;          // ID
  file: string;                 // nome file — usa pb.files.getUrl(record, record.file)
  file_name: string;
  file_size: number;
  mime_type: string;
  notes: string;
  uploaded_by: string;          // ID
  viewed_by_admin: boolean;
  viewed_at: string;
}

export interface NotificationRecord extends RecordModel {
  user: string;                 // ID
  appointment: string;          // ID | ""
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
}

// --- Helpers ---

export function getDisplayName(
  u: Pick<UserRecord, "first_name" | "last_name">
): string {
  return `${u.first_name} ${u.last_name}`.trim();
}

// Ottieni URL avatar (o placeholder se assente)
// import pb from "@/lib/pocketbase";
// pb.files.getUrl(userRecord, userRecord.avatar)

// Ottieni URL foglio firma (con file token per accesso protetto)
// const token = await pb.files.getToken();
// pb.files.getUrl(sheetRecord, sheetRecord.file, { token })
```

### Snippet client PocketBase (`src/lib/pocketbase.ts`)

```typescript
import PocketBase from "pocketbase";

const pb = new PocketBase(import.meta.env.VITE_PB_URL);

// Disabilita auto-cancellazione richieste (evita race condition con React StrictMode)
pb.autoCancellation(false);

export default pb;
```
