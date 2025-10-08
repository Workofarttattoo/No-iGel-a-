# Implementation Plan & Next Steps

## Remaining Engineering Tasks
- **Identity Verification**
  - Integrate native camera or document scanner to capture ID front with on-device pre-checks.
  - Call backend `/verification/id-front` endpoint with secure upload, handle retry/backoff, and show explicit retention notice.
  - Replace placeholder consent endpoint usage with signed JWT linking user session, consent timestamp, and storage location.
- **Authentication & Authorization**
  - Issue JWT + refresh tokens after verification; enforce auth middleware on chat, personas, and subscription endpoints.
  - Add role-based access for administrators to manage personas and audit logs.
- **Subscriptions**
  - Implement paywall screen and entitlement gating in the mobile app.
  - Wire RevenueCat SDK on the client; validate receipts on backend, persist entitlements, and handle webhooks.
- **Chat Streaming Enhancements**
  - Persist chat transcripts via encrypted SQLite on device and PostgreSQL server-side.
  - Append persona disclaimers to assistant messages server-side to guarantee policy compliance.
  - Expand safety filters with policy-driven keyword lists, language classification, and audit logging.
- **Offline & Privacy Controls**
  - Add settings screen for offline-only mode, telemetry opt-out, moderation toggles, and panic wipe confirmation flows.
  - Implement local encryption-at-rest for chat history using platform keystores.

## Testing Strategy
- **Unit Tests**
  - Client: test Zustand stores, theming utilities, and chat streaming parser with Jest.
  - Backend: validate Zod schemas, persona registry, and safety filter helpers with Vitest.
- **Integration Tests**
  - Mock Venice.ai using MSW (client) and Nock (server) to simulate streaming responses and failure modes.
  - Exercise ID upload + consent endpoints ensuring expected audit records.
- **End-to-End**
  - Detox or Maestro flows covering onboarding, persona switching, chat streaming, panic wipe, and subscription wall.
  - Postman collection for backend endpoints with auth and webhook signature validation.
- **Security Testing**
  - Static analysis (ESLint, TypeScript strict mode) in CI.
  - Dependency scanning (npm audit, Snyk).
  - Quarterly penetration testing focusing on auth, S3 storage, and Venice proxy logic.
  - Incident response tabletop exercises covering ID data breach scenarios.

## Deployment & QA Checklists
- Configure CI pipelines for lint, type-check, unit tests, and bundle size budgets.
- Provision staging infrastructure (PostgreSQL, S3/KMS, RevenueCat sandbox, Venice staging key).
- Set up feature flags for persona rollouts and moderation toggles.
- Create App Store / Play Store metadata, privacy manifest, and content disclaimers.
- Draft customer support playbooks for ID removal requests, refunds, and panic wipe recovery.

## Compliance & Documentation
- Complete DPIA and data flow diagrams for ID verification.
- Publish privacy policy updates detailing ID storage, consent logging, and Venice data handling.
- Maintain audit log retention schedule and deletion automation.
- Provide internal runbooks for trust & safety review of flagged conversations.
