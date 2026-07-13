# API Rules Audit (T12.9)

Audit date: 2026-07-13  
Source of truth: `pb_migrations/001_init_schema.js` vs spec §5.2

## Summary

All collections match the specification. Rules are locked by default where required (`appointment_modifications` update/delete, `notifications` delete).

| Collection | listRule | viewRule | createRule | updateRule | deleteRule | Status |
|------------|----------|----------|------------|------------|------------|--------|
| `users` | admin | self \|\| admin | admin | self \|\| admin | admin | OK |
| `companies` | authenticated | authenticated | admin | admin | admin | OK |
| `appointments` | admin \|\| own rep | admin \|\| own rep | admin | admin \|\| own rep (not cancelled/completed) | admin | OK |
| `appointment_modifications` | admin \|\| author \|\| appointment rep | same | authenticated | locked | locked | OK |
| `signed_sheets` | admin \|\| uploader | admin \|\| uploader | representative | admin | admin | OK |
| `notifications` | user \|\| admin | user \|\| admin | authenticated | owner | locked | OK |

## Defense in depth (Phase 12)

| Control | Location | Purpose |
|---------|----------|---------|
| Hide `internal_notes` for reps | `pb_hooks/appointments.pb.js` (`onRecordEnrich`) | Column-level redaction |
| Rep state machine | `pb_hooks/appointments.pb.js` (`onRecordUpdateRequest`) | Server-side transitions §6 |
| Upload validation | `pb_hooks/signed_sheets.pb.js` | MIME, size, ownership |
| Inactive account block | `pb_hooks/auth.pb.js` | Login + refresh |
| Safe filter binding | `src/api/*.ts` via `pb.filter()` | Injection prevention |

## Notes

- `internal_notes` is excluded client-side via `REP_APPOINTMENT_FIELDS` and server-side via enrich hook.
- Signed sheet files are protected by collection rules; URLs require `pb.files.getToken()` (5 min TTL).
- `viewed_by_admin` is updatable only by admin (`signed_sheets.updateRule`).
