# Seed Data — Riferimento rapido

## Password
Tutti gli account: **`password123`**

## Account

| Ruolo     | Nome            | Email                          |
| --------- | --------------- | ------------------------------ |
| Admin     | Mario Rossi     | admin@itinera.it               |
| Rep       | Luca Bianchi    | luca.bianchi@itinera.it        |
| Rep       | Sara Verdi      | sara.verdi@itinera.it          |
| Rep       | Marco Gialli    | marco.gialli@itinera.it        |

## Aziende

| Nome                    | Città   | Contatto         |
| ----------------------- | ------- | ---------------- |
| Cartoleria Milano SRL   | Milano  | Giuseppe Ferrari |
| Ufficio Moderno SPA     | Roma    | Anna Conti       |
| Cancelleria Roma SRL    | Roma    | Paolo Bianco     |
| Paper & Co. SRL         | Bologna | Laura Neri       |
| Scrivania Express SRL   | Firenze | Marco Sala       |

## Appuntamenti (8)

| # | Stato      | Rep   | Azienda              | Quando         |
| - | ---------- | ----- | -------------------- | -------------- |
| 1 | pending    | Luca  | Cartoleria Milano    | tra 3 giorni   |
| 2 | confirmed  | Sara  | Ufficio Moderno      | tra 5 giorni   |
| 3 | completed  | Marco | Cancelleria Roma     | 2 giorni fa    |
| 4 | cancelled  | Luca  | Paper & Co.          | 1 sett. fa     |
| 5 | pending    | Sara  | Scrivania Express    | tra 7 giorni   |
| 6 | confirmed  | Marco | Cartoleria Milano    | tra 10 giorni  |
| 7 | completed  | Luca  | Ufficio Moderno      | 30 giorni fa   |
| 8 | pending    | Marco | Paper & Co.          | tra 14 giorni  |

## Note
- Le date usano offset relativi a `NOW()`, quindi sono sempre aggiornate
- I completed (#3 `VIS-10002`, #7 `VIS-10006`) hanno fogli firma — eseguire `PB_SUPERUSER_EMAIL=… PB_SUPERUSER_PASSWORD=… npm run pb:seed-files` dopo le migration
- Il confirmed #2 (`VIS-10001`) ha una modifica data in cronologia (Sara ha posticipato di 2 ore)
