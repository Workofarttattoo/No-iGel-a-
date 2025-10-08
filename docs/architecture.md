# Base44 Mobile & Backend Architecture

## Overview
Base44 delivers ad-free AI chat experiences for verified adults across iOS and Android. The product ships as a React Native (Expo) client backed by a Node.js (Express) proxy that mediates Venice.ai access, manages personas, handles secure document storage, and integrates payments plus compliance flows.

## Technology Choices
- Mobile: React Native 0.74 with Expo SDK 51 for fast iteration and shared code across platforms.
- Navigation: React Navigation (stack + tab) with a theming layer driven by a custom design system.
- Secure Storage: Expo SecureStore backed by Keychain (iOS) and Android Keystore.
- State Management: Zustand for session and persona store; React Query for API caching and streaming coordination.
- Backend: Node.js 20 with Express, Zod validation, Prisma ORM (PostgreSQL) for persistent storage, and AWS S3 + KMS for encrypted ID assets.
- Realtime: Server-Sent Events (SSE) for Venice streaming responses relayed to the client.
- Payments: RevenueCat proxying Apple IAP and Google Play Billing, with Stripe as optional web checkout.

## Module Layout
```
visualizer/
  docs/
  mobile/
    app/ (Expo entry point)
    src/
      api/
      components/
      navigation/
      screens/
      services/
      store/
      theme/
      utils/
  backend/
    src/
      api/
      config/
      controllers/
      middleware/
      routes/
      services/
      utils/
    prisma/
    tests/
```

## Key Flows
1. **Onboarding**: App requests ID front scan, uploads to backend, receives verification status, captures explicit consent, and stores encrypted references.
2. **Persona Selection**: Personas fetched from backend persona registry; user switches via gallery; selection persisted locally.
3. **Chat Streaming**: Client posts prompt to backend `/chat/session` endpoint, backend calls Venice.ai `h4ck3r` profile with persona specific prompts, streams tokens back via SSE.
4. **Subscriptions**: Client uses RevenueCat SDK; backend validates webhooks and updates entitlement records; access gates chat usage.
5. **Panic Wipe**: User triggers secure wipe to clear SecureStore secrets, SQLite cache, and request backend session revocation.

## Security Baseline
- Encrypt sensitive data at rest (KMS + envelope encryption).
- Enforce JWT-based auth with short-lived tokens; rotate refresh tokens regularly.
- Implement rate limiting and anomaly detection on backend endpoints.
- Audit logging with SIEM integration, redacting PII.
- Routine penetration tests and static analysis integrated into CI.

## Compliance Considerations
- Maintain DPIA covering ID verification workflow.
- Provide GDPR/CCPA data subject request endpoints.
- Log consent timestamps and retention schedules.
- Document clear incident response plan with 72-hour notification process for breaches involving ID data.

## Next Artifacts
- Detailed implementation checklist.
- Persona prompt registry JSON.
- QA validation matrix and penetration test scope.
