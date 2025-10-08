# Base44 Backend

Node.js service acting as a secure proxy between Base44 clients and Venice.ai while handling ID verification, persona management, subscriptions, and safety controls.

## Quick Start
1. `cd backend && npm install`.
2. Copy `.env.example` to `.env` and populate secrets.
3. Run `npm run dev` to start the development server on port `4000`.

## Environment Variables
Create `backend/.env` using the template below:
```
VENICE_API_KEY=your_venice_key
VENICE_PROFILE_ID=h4ck3r
PORT=4000
DATABASE_URL=postgres://base44:password@localhost:5432/base44
JWT_SECRET=change-me-please
AWS_REGION=us-west-2
ID_BUCKET=base44-id-assets
```

## Endpoints (alpha)
- `GET /healthz` – health probe.
- `GET /personas` – list available personas.
- `POST /chat/stream` – proxy streaming chat responses using SSE.
- `POST /verification/id-front` – accept ID front scan upload (memory storage placeholder).
- `POST /verification/consent` – record consent acknowledgement.
- `POST /subscriptions/activate` – validate purchase receipt (stubbed).
- `POST /subscriptions/webhook` – receive billing platform notifications (stubbed).

## Roadmap
- Persist verification records and personas in PostgreSQL via Prisma.
- Replace stubbed S3 upload with encrypted storage (SSE-KMS).
- Add auth middleware (JWT + refresh tokens) and RBAC for admin tooling.
- Integrate RevenueCat/Stripe receipt validation and webhook signature checks.
- Expand safety filters with policy-driven classifiers.
- Harden logging pipeline and redact sensitive values.
