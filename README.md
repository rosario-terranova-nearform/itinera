# Itinera

SPA per la gestione degli appuntamenti dei rappresentanti di cancelleria.

**Stack:** React · TypeScript · Vite · Material UI · PocketBase

## Prerequisiti

- Node.js 20+
- PocketBase binary (incluso in repo root)

## Setup locale

### 1. Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

### 2. PocketBase

```bash
# Avvia il server (applica le migration automaticamente)
npm run pb:dev
```

Admin UI: [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/)

Al primo avvio crea il superadmin, poi esegui le migration se necessario:

```bash
npm run pb:migrate
```

### 3. Dati di sviluppo

Le migration `001`–`002` creano schema e seed (1 admin, 3 rep, 5 aziende, 8 appuntamenti).

I fogli firma per gli appuntamenti `completed` richiedono file binari e vanno caricati a parte (autenticati come superadmin PocketBase):

```bash
PB_SUPERUSER_EMAIL=your@email.com PB_SUPERUSER_PASSWORD=yourpassword npm run pb:seed-files
```

Vedi [docs/seed-reference.md](docs/seed-reference.md) per credenziali e dati di test.

### 4. SMTP (email notifiche)

Configura in **Admin UI → Settings → Mail settings**:

| Campo | Esempio dev (Mailpit) | Esempio prod |
|-------|----------------------|--------------|
| Host | `localhost` | `smtp.resend.com` |
| Port | `1025` | `587` |
| Username | *(vuoto)* | API key / user SMTP |
| Password | *(vuoto)* | password SMTP |
| Sender address | `noreply@itinera.it` | dominio verificato |
| Sender name | `Itinera` | `Itinera` |

Per sviluppo locale puoi usare [Mailpit](https://github.com/axllent/mailpit) (`brew install mailpit && mailpit`).

Le email partono quando viene creato un record in `notifications` (hook `pb_hooks/notifications.pb.js`).

### 5. Tipi TypeScript

Con PocketBase in esecuzione:

```bash
npm run pb:typegen
```

## Script utili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia Vite dev server |
| `npm run build` | Build produzione |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run pb:dev` | Avvia PocketBase |
| `npm run pb:migrate` | Applica migration |
| `npm run pb:migrate:redo` | Reset e riapplica tutte le migration |
| `npm run pb:seed-files` | Carica fogli firma seed |
| `npm run pb:typegen` | Rigenera `src/lib/pb.types.ts` |

## Credenziali dev

Password per tutti gli account: **`password123`**

| Ruolo | Email |
|-------|-------|
| Admin | `admin@itinera.it` |
| Rep | `luca.bianchi@itinera.it` |
| Rep | `sara.verdi@itinera.it` |
| Rep | `marco.gialli@itinera.it` |
