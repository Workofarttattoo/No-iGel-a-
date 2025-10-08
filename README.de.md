# Base44: Schnellstart-Handbuch

Willkommen bei Base44. Dieses Handbuch richtet sich an **alle** – ganz egal, ob technischer Hintergrund vorhanden ist oder nicht.

---

## 1. Was macht Base44?
- **Mobile App (iOS & Android):** Ermöglicht verifizierten Erwachsenen Unterhaltungen mit Venice.ai-Personas – ohne Werbung und übermäßige Filter.
- **Backend-Service:** Prüft das Alter, speichert die Vorderseite des Ausweises, spricht mit Venice.ai und verwaltet Abos sowie Chat-Verläufe.

Beide Komponenten müssen laufen, damit alles funktioniert.

---

## 2. Begriffe
| Begriff | Bedeutung |
|---------|-----------|
| **Venice.ai** | Die KI, die Antworten erzeugt. |
| **Persona** | Vorgefertigter Charakter (z. B. der geläuterte Hacker) mit festem Verhalten. |
| **Onboarding** | Ausweis fotografieren, Volljährigkeit bestätigen, Haftungsausschluss akzeptieren. |
| **Paywall / Abo** | Abo freischalten, um chatten zu können. Aktuell simuliert ein Button den Kauf. |
| **JWT / Token** | Zugangstokens, die nach dem Onboarding erstellt werden. |

---

## 3. Vorbereitung
### 3.1 Werkzeuge
- [Node.js 20+](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- iOS-Simulator (Xcode) oder Android-Emulator (Android Studio)
- Postgres-Datenbank
- Optional: S3-Bucket für Ausweisbilder

### 3.2 Benötigte Daten
| Item | Quelle |
|------|--------|
| Venice.ai API Key | Venice.ai Dashboard → API Keys |
| JWT Secret | `openssl rand -base64 48` ausführen |
| Postgres URL | Vom DB-Anbieter, z. B. `postgres://user:pass@host:5432/base44` |
| S3 Bucket + Region | In AWS anlegen und verschlüsseln |
| Webhook Secret (optional) | Stripe oder RevenueCat |

---

## 4. Backend einrichten
1. `backend/.env` ausfüllen:
   ```env
   VENICE_API_KEY=dein_key
   VENICE_PROFILE_ID=h4ck3r
   PORT=4000
   DATABASE_URL=postgres://user:pass@host:5432/base44
   JWT_SECRET=random_string
   AWS_REGION=eu-central-1
   ID_BUCKET=base44-id-assets
   STRIPE_WEBHOOK_SECRET=optional
   ```
2. Installieren & bauen:
   ```bash
   cd backend
   npm install
   npm run build
   ```
3. Starten:
   ```bash
   npm run dev
   ```

> Bei `listen EPERM` bitte lokal testen – manche Umgebungen verbieten Ports.

---

## 5. Mobile App
1. `mobile/app.json` → `extra.apiBaseUrl` auf den Backend-Host setzen (Standard `http://localhost:4000`).
2. Installieren & prüfen:
   ```bash
   cd mobile
   npm install
   npx tsc --noEmit
   ```
3. Expo starten: `npm start` und `i` oder `a` drücken.

---

## 6. Nutzerflow
1. Kamera freigeben.
2. Ausweisfront fotografieren und Disclaimer akzeptieren.
3. „Activate Secure Access“ tippen (Demo).
4. Persona wählen und loschatten.
5. Bei Bedarf „Activate Panic Wipe“. Dadurch werden Token & lokale Daten gelöscht.

---

## 7. Alltag
| Aufgabe | Befehl |
|---------|--------|
| Backend | `cd backend && npm run dev` |
| App | `cd mobile && npm start` |
| Neue Persona | `backend/src/services/personaService.ts` anpassen |
| Moderation | `backend/src/utils/safety.ts` anpassen |
| Gerät zurücksetzen | In der App „Activate Panic Wipe“ |

---

## 8. Fehlerbehebung
- **Backend startet nicht:** `.env` prüfen, Port freigeben, Datenbank erreichbar machen.
- **App findet Backend nicht:** `apiBaseUrl` kontrollieren, ggf. lokale IP statt `localhost` nutzen.
- **Upload schlägt fehl:** Kamera-Berechtigung bestätigen, Dateigröße (<8 MB) prüfen.
- **Abo weg:** Backend speichert nur im Speicher, nach Neustart neu aktivieren.
- **Falscher Moderations-Block:** Begriffe in `safety.ts` überarbeiten.

---

## 9. Vor der Produktion
1. Speicherstrukturen durch Postgres-Tabellen ersetzen.
2. Ausweisdaten in S3 (verschlüsselt, Lifecycle) auslagern.
3. Echte Bezahlflüsse (Stripe/RevenueCat) integrieren.
4. Monitoring, Alerts und Moderations-Reviews einführen.
5. Datenschutz-Dokumente veröffentlichen und Sicherheitstests durchführen.

---

## 10. Support
- Backend- und Expo-Logs bereitstellen.
- Screenshots der Konfiguration anhängen.
- Fehlerbild Schritt für Schritt beschreiben.

Viel Erfolg mit Base44!
