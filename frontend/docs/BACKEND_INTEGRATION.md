# How the frontend uses the Nurture API

The app talks to the backend in `backend/` (see `backend/API_CONTRACT.md`). No backend code was changed for this integration.

## Running both locally

Setting up Supabase (database, auth, test project) is covered in [`backend/SUPABASE_SETUP.md`](../../backend/SUPABASE_SETUP.md).

```bash
# Backend
cd backend && npm run dev            # http://localhost:8000

# Frontend (frontend/.env needs EXPO_PUBLIC_API_URL plus the Supabase URL and publishable key)
cd frontend && npx expo start        # i = iOS simulator, w = web, or scan with Expo Go
```

- **Real phone:** use your computer's LAN IP instead of `localhost`.
- **No Supabase values:** without the Supabase variables the app skips sign-in, which only works when the backend has `DEMO_MODE=true`.
- **No API URL:** the app runs a self-contained offline demo.

## Sign-in

`src/lib/supabase.ts` creates the Supabase client: AsyncStorage session, auto-refresh in the foreground. `src/services/api/client.ts` attaches the current access token to every API request.

`src/features/auth/session.ts` decides what to show:
- sign in / sign up / reset password (`src/app/auth/*`)
- add-your-baby onboarding for new accounts (`src/app/onboarding.tsx`)
- the app

Sign-out, password change and account deletion are under Settings → Account. Switching users clears all cached account data.

## Where the code is

| File | Role |
|---|---|
| `src/services/api/client.ts` | Base URL, timeout, `{ success, data }` unwrapping, calm `ApiError` messages. Never logs bodies. |
| `src/services/api/types.ts` | Raw backend record shapes |
| `src/services/api/map.ts` | Backend ↔ app type mapping, the only place that knows field names like `startTime` or `feedingType` |
| `src/services/api/nurture.ts` | One adapter per resource |
| `src/services/contracts.ts` | The interface both the API and the offline demo implement |
| `src/services/index.ts` | Chooses API or offline demo |

The first baby returned by `GET /babies` is used for every baby-scoped call. New accounts create one during onboarding (`POST /babies`).

## Endpoints in use

| Screen | Endpoints |
|---|---|
| Home | `GET /babies/:id/dashboard?timezoneOffsetMinutes=`, `GET /babies/:id/timeline`, `GET /auth/me`, `GET /babies/:id` |
| Nursery: lamp chain, monitor, sleep sessions | `POST /babies/:id/sleep/start`, `GET /babies/:id/sleep?limit=100`, `PATCH /sleep/:id` (ending a session, editing times or notes), `DELETE /sleep/:id`. A 409 `SLEEP_ALREADY_ACTIVE` triggers a quiet reload. |
| Kitchen: bottle, bowl, feeding log | `POST/GET /babies/:id/feedings`, `PATCH/DELETE /feedings/:id` |
| Pantry | `GET /nutrition/products`, `GET /nutrition/categories`, `GET /nutrition/search?q=`, `GET /nutrition/products/:id` (disclaimer shown verbatim), `GET /resources` |
| Living room: ask | `POST /questions` (shows `safetyNotice`, and the urgent notice when `mayBeUrgent`), `POST /questions/:id/match-experts`, `GET /questions` |
| Experts | `GET /experts?limit=100`, `GET /experts/categories`, `GET /experts/:id` (directory notice shown verbatim), `GET /experts/:id/contact-options` (opens phone, email or browser) |
| Consultations | `POST /consultations` (shows `demoNotice`), `GET /consultations`, `PATCH /consultations/:id/status` (cancel) |
| Changing area | `POST/GET /babies/:id/diapers`, `PATCH/DELETE /diapers/:id` (`both` ↔ `mixed`) |
| Play corner: height ruler | `POST/GET /babies/:id/heights`, `PATCH/DELETE /heights/:id` |
| Play corner: milestones | `POST/GET /babies/:id/milestones`, `DELETE /milestones/:id` |
| Settings | `GET/PATCH /babies/:id`, `GET /health` |

## Stays on the phone (no backend endpoint yet)

- saved bookmarks
- pediatrician question list
- play-idea activities and the "tried" marks
- reduce-motion and notification preferences

## Gaps for the backend

- **Nursing side (left/right/both):** no field exists, so the app doesn't ask for it.
- **Saved items and pediatrician notes:** device-only until there's an endpoint.
- **Experts:** there's no text search, so names are filtered on the phone. Category filtering uses the listing's `serviceCategory`.
- **Consultations:** stored only, never delivered. The app says so on every consultation screen.
- **Monitor vitals:** heart rate, breathing, room temperature and noise have no data source, so the tiles show "No sensor connected".
- **Unused backend features:** families and invitations, maternal tracking, baby health observations and data export are implemented in the backend but have no UI yet.
