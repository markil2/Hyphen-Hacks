# Supabase setup

Nurture uses Supabase in two ways:

- **Database:** Postgres, accessed only by the Express API through Prisma.
- **Auth:** email and password sign-in in the app. The API verifies the Supabase access token on every request.

You need **two projects**: your real one, and a separate one that `npm test` wipes on every run.

## 1. Connection strings (backend)

Dashboard → **Connect** → **ORMs** → **Prisma**. Copy both URLs into `backend/.env`:

| Variable | Which URL |
|---|---|
| `DATABASE_URL` | The pooled one (port **6543**, transaction mode). Keep `?pgbouncer=true&connection_limit=1` on the end. |
| `DIRECT_URL` | The direct / session one (port **5432**). |

Also set:

| Variable | Where it comes from |
|---|---|
| `SUPABASE_URL` | Project Settings → API → Project URL. The API uses it to verify sign-in tokens against the project's public keys (JWKS). |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API keys → **secret** (or legacy service_role). Optional. Only used to delete someone's sign-in when they delete their account. **Server-only. Never put it in the app.** |
| `SUPABASE_JWT_SECRET` | Only if your project still uses the legacy shared JWT secret. Leave it empty otherwise. |

## 2. Create the tables

```bash
cd backend
npm run prisma:generate
npm run db:deploy     # applies prisma/migrations to Supabase
npm run db:seed       # experts, products, resources + the demo parent (erases existing rows!)
```

The migration turns on **Row Level Security** for every table, with no policies. Supabase's public REST API can't read or write them, so only the Nurture API (which connects as the database owner) can.

## 3. Auth settings (dashboard → Authentication)

- **Sign In / Providers → Email:** enabled. "Confirm email" can stay on; new parents confirm by clicking the link, then sign in.
- **Emails → Reset password** template: add the code so the app can reset passwords without deep links, e.g.

  ```
  <p>Your Nurture reset code: <strong>{{ .Token }}</strong></p>
  ```

- **URL Configuration → Site URL:** any page you control. The confirmation link lands there after confirming.
- Supabase's built-in email sender is heavily rate-limited (a few emails per hour). For a real launch, add your own SMTP under **Emails → SMTP Settings**.

## 4. App (frontend)

In `frontend/.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable or anon key>
```

The publishable/anon key is meant to ship in apps. Never use the secret/service_role key here.

## 5. Tests

Create a second project, e.g. `nurture-test`, and copy `backend/.env.test.example` to `backend/.env.test` with that project's URLs. `npm test` resets that database on every run, and refuses to start if it points at the same database as `.env`.

## Demo mode

`DEMO_MODE=true` lets the app be used without signing in, as the seeded "Demo Parent", which is handy for presenting. The sign-in screen then shows **Explore the demo without an account**. Keep it `false` for real use.
