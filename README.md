# Base44: Quick-Start Handbook

Welcome to Base44. This guide is designed for **anyone**—not just engineers. It explains what the app does, how to set it up, and how to keep it running smoothly. If you prefer video or live help, share this handbook with your support team so they know the context.

**Translations:** [Español](README.es.md) · [Français](README.fr.md) · [中文](README.zh.md) · [Deutsch](README.de.md)

**Need a cheat sheet?** Jump to the illustrated [Quick Reference](docs/quick-reference.md).

---

## 1. What Base44 Does
- **Mobile app (iOS & Android):** Lets verified adults chat with Venice.ai personas without ads or heavy filters.
- **Backend service:** Proves a user is 18+, stores a copy of their ID front, talks to Venice.ai, and keeps track of subscriptions and chat history.

You control both parts. Nothing works until the backend is running and the mobile app points at it.

---

## 2. Terms You’ll See
| Term | Plain-English Meaning |
|------|------------------------|
| **Venice.ai** | The AI platform that actually generates replies. We send prompts there. |
| **Persona** | A pre-configured “character” (e.g., the reformed hacker) with a fixed tone and guardrails. |
| **Onboarding** | Taking a photo of the front of your ID, confirming you’re 18+, and accepting the disclaimer. |
| **Paywall / Subscription** | Users need an active subscription to chat. Today it’s simulated with a demo button. |
| **JWT / Tokens** | Digital “passes” the app uses to prove the user is logged in. You receive these after onboarding. |

If anything is still confusing, note it down—improving the wording is encouraged.

---

## 3. One-Time Setup
### 3.1 Install Tools
You’ll need these on your computer:
- [Node.js 20+](https://nodejs.org/) (includes npm)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- iOS Simulator (via Xcode) and/or Android Emulator (Android Studio)
- A Postgres database (can be local or hosted)
- Optional: AWS S3 bucket if you want to store ID photos outside your laptop

### 3.2 Get Your Keys
| What | Where to get it |
|------|-----------------|
| Venice.ai API key | Venice.ai dashboard → API Keys |
| JWT secret | Run `openssl rand -base64 48` or use a password manager to make a long random string |
| Postgres URL | From your database provider (e.g., `postgres://user:pass@host:5432/base44`) |
| S3 bucket name & region (optional) | AWS Console → create bucket with encryption |
| RevenueCat/Stripe webhook secret (optional) | Billing provider’s dashboard |

Keep these in a safe place. You’ll paste them into config files.

---

## 4. Configure the Backend
1. Open `backend/.env` and fill in the placeholders:
   ```env
   VENICE_API_KEY=your_real_key
   VENICE_PROFILE_ID=h4ck3r
   PORT=4000
   DATABASE_URL=postgres://user:password@host:5432/base44
   JWT_SECRET=strong_random_value
   AWS_REGION=us-west-2
   ID_BUCKET=base44-id-assets
   STRIPE_WEBHOOK_SECRET=optional_secret
   ```
2. Install dependencies:
   ```bash
   cd backend
   npm install
   npm run build   # optional but confirms the code compiles
   ```
3. Start the server when you’re ready:
   ```bash
   npm run dev
   ```
   The server listens on the port you set (default 4000). Leave this window open.

> **Note:** In a locked-down environment (like this CLI sandbox) you might see `EPERM` errors because binding to ports is blocked. Run the same command on your own machine to test for real.

---

## 5. Configure the Mobile App
1. Set the backend location. Open `mobile/app.json` and update:
   ```json
   "extra": {
     "apiBaseUrl": "http://localhost:4000"
   }
   ```
   Replace `localhost` with your machine’s IP or a tunnel URL (ngrok) if you’re testing on a physical device.
2. Install dependencies:
   ```bash
   cd mobile
   npm install
   npx tsc --noEmit   # optional type-check
   ```
3. Launch Expo:
   ```bash
   npm start
   ```
4. Press `i` (for iOS) or `a` (for Android) to boot a simulator. On a real phone, use the Expo Go app to scan the QR code.

When both the backend and mobile app are running, you can walk through the full experience.

---

## 6. Typical User Flow
1. **Open the app.** It will ask for camera access.
2. **Scan the front of your ID.** The image is sent to the backend (which stores it securely).
3. **Agree to the disclaimer.** Tokens are issued, and we mark you as verified.
4. **Paywall appears.** Tap “Activate Secure Access” to simulate a subscription (we fake a receipt for now).
5. **Persona gallery unlocks.** Choose a persona (currently “Hacker”).
6. **Chat.** Messages stream in real time, are saved locally, and synced to the backend.
7. **Panic wipe.** Use the button in the persona gallery if you want to clear ID data, tokens, and chat history from the device.

---

## 7. Day-to-Day Operations
| Task | How to do it |
|------|--------------|
| Start the backend | `cd backend && npm run dev` |
| Start the mobile app | `cd mobile && npm start` |
| Add a new persona | Edit `backend/src/services/personaService.ts`, restart backend |
| Update safety rules | Edit `backend/src/utils/safety.ts`, restart backend |
| Review moderation incidents | (For now) check the in-memory list in `moderationService.ts` logs |
| Clear a user’s device | Hit “Activate Panic Wipe” inside the app |
| Rotate keys | Update `.env`, restart backend, and consider invalidating old tokens |

---

## 8. Troubleshooting
### Backend won’t start
- **Error: `listen EPERM`** – The environment blocked the port. Run on your own machine or choose a different port.
- **Missing connection / S3 errors** – Double-check `.env` values and network access.

### Mobile app can’t connect
- Confirm the backend URL is reachable from your device.
- Use `curl http://<host>:4000/healthz` from the device or emulator.

### ID upload fails
- Make sure camera permission was granted.
- Backend logs will show if the image was missing or too large (limit is 8 MB).

### Subscription never activates
- Backend stores entitlements in memory right now. Restarting the server clears them.
- Replace the demo activate call with your billing provider when you go live.

### Chat stops streaming
- Check the backend log for Venice.ai errors (rate limits, invalid key, etc.).
- Ensure tokens haven’t expired; the client auto-refreshes, but if the refresh token is cleared you’ll need to onboard again.

### Moderation blocks normal conversation
- Adjust keywords/patterns in `backend/src/utils/safety.ts`. Consider adding severity levels or whitelists.

If you get stuck, capture logs (terminal output) and what you were doing. That’s usually enough for a developer to help quickly.

---

## 9. Going From Demo to Production
1. **Persistent storage:** Replace in-memory maps (verification records, chat history, subscriptions) with Postgres tables or another database.
2. **Secure ID assets:** Move from local disk to an encrypted S3 bucket with lifecycle rules and access logging.
3. **Real billing:** Wire RevenueCat/Stripe receipts. Update the paywall button to use actual purchase flows.
4. **Monitoring:** Integrate structured logging (Pino), alerting, and regular moderation reviews.
5. **Policies & docs:** Publish a privacy policy covering ID storage, data retention, and Venice.ai usage.
6. **Pen testing:** Run security reviews and resolve any findings before inviting real users.

---

## 10. Need Help?
- **Debugging:** Share backend logs (`npm run dev` output) and Expo logs.
- **Configuration issues:** Screenshot your `.env` (redacting secrets) and `app.json` settings.
- **Feature requests:** Document the persona change or new rule you need and file it in your task tracker.

Remember: the more specific you are about the problem (what you clicked, what happened, exact error text), the faster someone can help.

Happy building!
