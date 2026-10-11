# Nurture Backend

REST API for Nurture's baby-care tracking and parent-support experiences. All expert, family, baby, and product seed records are fictional demonstration data.

The backend also provides private maternal tracking for menstrual calibration and daily observations, pregnancy setup and symptoms, blood pressure/weight/glucose, and manually entered hormone measurements.

Nursery support includes persistent baby-height history for an interactive measuring-stick experience. The API supplies exact measurements and dates while the frontend owns the ruler visualization.

Each person has an independent verified account. Family households connect multiple parents or caregivers to shared babies without password sharing. Removing a family membership revokes future access without deleting the baby's records for remaining members.

## Stack

Node.js, TypeScript, Express, Prisma, SQLite, Zod, JWT, Vitest, and Supertest. The Prisma models avoid SQLite-specific field types so the datasource can later move to PostgreSQL.

## Setup

Requires Node.js 20+ and SQLite 3.

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The API starts at `http://localhost:8000`. Verify it with `GET /api/health`.

If `prisma migrate dev` cannot run in a restricted environment, initialize a local SQLite database from the checked-in migration:

```bash
sqlite3 prisma/dev.db ".read prisma/migrations/20261010190000_init/migration.sql"
npm run db:seed
```

## Environment

- `PORT`: server port; default `8000`
- `DATABASE_URL`: Prisma database URL; local default `file:./dev.db`
- `JWT_SECRET`: token-signing secret; replace in every deployed environment
- `FRONTEND_ORIGIN`: the one allowed CORS origin, normally `http://localhost:5173`
- `DEMO_MODE`: when `true`, requests without a bearer token use the seeded fictional demo parent
- `DEMO_EMAIL`: seeded demo account lookup, default `demo@nurture.local`
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, and `AUTH_RATE_LIMIT_MAX`: API and stricter authentication rate-limit settings
- `EMAIL_PROVIDER`: `console` for local development or `resend` for real delivery
- `RESEND_API_KEY`: server-only Resend credential; required when `EMAIL_PROVIDER=resend`
- `EMAIL_FROM`: verified Resend sender, for example `Nurture <accounts@yourdomain.com>`
- `APP_BASE_URL`: frontend URL used in verification, reset, and invitation links
- `PRIVACY_POLICY_VERSION`: version users must explicitly accept

`DEMO_MODE=true` is for local hackathon demonstrations only. It is not production authentication. With demo mode off, register or log in and send `Authorization: Bearer <token>`.

For real email, verify a sending domain with Resend, set `EMAIL_PROVIDER=resend`, and provide `RESEND_API_KEY` and `EMAIL_FROM`. Console mode never delivers messages and returns development tokens only for local/test workflows. Never expose the Resend key to frontend code.

## Commands

```bash
npm run dev             # watch-mode development server
npm run build           # compile TypeScript
npm start               # run compiled server
npm run prisma:generate # generate Prisma client
npm run db:migrate      # create/apply a development migration
npm run db:deploy       # apply checked-in migrations in deployment
npm run db:seed         # reset and populate fictional demo data
npm test                # integration test suite
```

The destructive seed reset is intended only for local/demo databases.

## Frontend integration

Set the frontend API base URL to `http://localhost:8000`. Responses always use `{ success, data, message }` or `{ success: false, error: { code, message, details? } }`. Dates are ISO-8601 UTC timestamps. Daily summary endpoints accept `timezoneOffsetMinutes`, using JavaScript's convention (for example, Los Angeles standard time is `480`). See [API_CONTRACT.md](./API_CONTRACT.md) for the complete contract.

## Security and limitations

- Passwords are hashed with bcrypt; JWT authentication and family-record ownership checks are implemented.
- Registration requires email verification. Password reset, changed-email verification, and family invitations use hashed, single-use, expiring tokens.
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
- SQLite is appropriate for the hackathon, not a horizontally scaled deployment.
