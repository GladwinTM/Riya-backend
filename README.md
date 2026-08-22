# Riya backend

NestJS REST API shared by the Riya storefront and dashboard.

## Local setup

1. Create a PostgreSQL database named `riya_local` in DBeaver (or run `createdb riya_local`).
2. Open and run `database/local/setup.sql` in DBeaver while connected to that database.
3. Copy `.env.example` to `.env`; change `DATABASE_URL` if your PostgreSQL password or port differs.
2. Install dependencies with `npm install`.
3. Start the API with `npm run start:dev`.

The API runs at `http://localhost:3001/api/v1`; Swagger is available at
`http://localhost:3001/api/docs`.

## Database

The local schema and dummy data are in `database/local/setup.sql`. It creates
the e-commerce tables, foreign-key indexes, one local admin, one local customer,
products, variants, and settings. Run it once in DBeaver. It is safe to rerun.

## Commands

```bash
npm run build
npm test
npm run start:dev
```

For local testing, authentication is intentionally simple: use the seeded UUID
as the Bearer token. Admin: `11111111-1111-1111-1111-111111111111`; customer:
`22222222-2222-2222-2222-222222222222`. This local-only mechanism will be
replaced with Supabase Auth later. Never commit `.env`.
