# Nurture Backend

REST API for Nurture's baby-care tracking and parent-support experiences. All expert, family, baby, and product seed records are fictional demonstration data.

The backend also provides private maternal tracking for menstrual calibration and daily observations, pregnancy setup and symptoms, blood pressure/weight/glucose, and manually entered hormone measurements.

Nursery support includes persistent baby-height history for an interactive measuring-stick experience. The API supplies exact measurements and dates while the frontend owns the ruler visualization.

Each person has an independent verified account. Family households connect multiple parents or caregivers to shared babies without password sharing. Removing a family membership revokes future access without deleting the baby's records for remaining members.

## Stack

Node.js, TypeScript, Express, Prisma, **Supabase** (Postgres + Auth), Zod, Vitest, and Supertest.

- **Database:** Supabase Postgres via Prisma. Every table has Row Level Security on with no policies, so only this API can read or write data.
- **Auth:** parents sign up and sign in with Supabase Auth in the app. The API verifies the Supabase access token (JWKS) on every request, and creates the parent's Nurture profile and household the first time it sees them.

## Setup

Requires Node.js 20+ and a Supabase project. Full walkthrough: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

```bash
cd backend
cp .env.example .env        # fill in the Supabase URLs and keys
npm install
npm run prisma:generate
npm run db:deploy           # create the tables in Supabase
npm run db:seed             # sample experts/products/resources + demo parent (erases data!)
npm run dev
```

The API starts at `http://localhost:8000`. Verify it with `GET /api/health`.

## Environment

- `DATABASE_URL` and `DIRECT_URL`: Supabase pooled connection (runtime) and direct connection (migrations)
- `SUPABASE_URL`: used to verify sign-in tokens against the project's JWKS
- `SUPABASE_JWT_SECRET`: only for projects on the legacy shared JWT secret
- `SUPABASE_SERVICE_ROLE_KEY`: server-only; used solely to delete a person's Supabase sign-in when they delete their account
- `FRONTEND_ORIGIN`: the one allowed CORS origin (the Expo web preview is `http://localhost:8081`)
- `DEMO_MODE`: when `true`, requests without a token use the seeded fictional demo parent
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_MAX`: rate limits
- `EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM`, `APP_BASE_URL`: family-invitation emails (account emails are sent by Supabase)
- `PRIVACY_POLICY_VERSION`: version users must explicitly accept

`DEMO_MODE=true` is for live demonstrations only; keep it `false` for real use.

## Commands

```bash
npm run dev             # watch-mode development server
npm run build           # compile TypeScript
npm start               # run compiled server
npm run prisma:generate # generate Prisma client
npm run db:migrate      # create/apply a development migration
npm run db:deploy       # apply checked-in migrations in deployment
npm run db:seed         # reset and populate fictional demo data
npm test                # integration tests against the separate test project in .env.test (erases it)
```

The destructive seed reset is intended only for local/demo databases.

## Frontend integration

Set the frontend API base URL to `http://localhost:8000/api`, plus the Supabase URL and publishable key (see SUPABASE_SETUP.md). Responses always use `{ success, data, message }` or `{ success: false, error: { code, message, details? } }`. Dates are ISO-8601 UTC timestamps. Daily summary endpoints accept `timezoneOffsetMinutes`, using JavaScript's convention (for example, Los Angeles standard time is `480`). See [API_CONTRACT.md](./API_CONTRACT.md) for the complete contract.

## Security and limitations

- Sign-in, email confirmation and password resets are handled by Supabase Auth. The API verifies Supabase access tokens and enforces family-record ownership.
- Email confirmation and password resets are Supabase Auth flows. Family invitations use hashed, single-use, expiring tokens.
- Account export, versioned privacy consent, password changes, family membership controls, and account deletion/anonymization are available through authenticated settings routes.
- Account deletion removes the person's private maternal/support data and access while preserving shared baby history for remaining family members. Legal custody decisions are outside the application's authority.
- CORS uses one configured origin, request bodies are limited to 100kb with safe JSON errors, security headers are enabled, and API/auth routes are independently rate-limited.
- The database enforces one active sleep session per baby, including concurrent requests.
- Owners manage family roles and destructive baby-profile deletion; parents can manage baby profiles and invite members; caregivers can access shared babies and record care but cannot administer the family or baby profile.
- Demo mode bypasses login for one seeded fictional user and must remain off in production.
- Expert profiles and consultation delivery are demonstrations. Requests are stored locally and are not sent to real professionals.
- The expert directory also contains public external contact listings. `affiliationStatus: external_unpartnered` means Nurture has no partnership or endorsement relationship with that provider. Users contact providers outside Nurture; the backend does not send email or disclose tracked health data.
- Rule-based matching is educational routing, not diagnosis or medical triage. Urgent keywords produce an explicit care notice but are not a reliable emergency detector.
- Maternal measurements are stored as entered and are not interpreted. Multiples count is context only and never changes or predicts hCG, estrogen, or other hormone values.
- LH strip images use a private `lhPhotoReference`; this backend does not expose a public image upload directory. Connect that reference to authenticated object storage before handling real photos.
- Mood and anxiety are private tracking fields only. No automated therapy, crisis assessment, diagnosis, or treatment is provided.
- Nutrition records are conspicuously labeled samples and do not contain fabricated real-product ingredient lists or endorsements.
- Tables are reachable only through this API: Row Level Security is on with no policies, so Supabase's public REST API can't access them.
