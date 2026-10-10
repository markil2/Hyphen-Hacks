# How the frontend uses the Nurture API

The app talks to the backend in `backend/` (see `backend/API_CONTRACT.md`). No backend code was changed for this integration.

## Running both locally

```bash
# 1. Backend (once)
cd backend
cp .env.example .env          # then set FRONTEND_ORIGIN=http://localhost:8081 for the web preview
npm install
npm run prisma:generate
npm run db:deploy
npm run db:seed
npm run dev                   # http://localhost:8000, DEMO_MODE=true (no login)

# 2. Frontend
cd frontend
cp .env.example .env          # EXPO_PUBLIC_API_URL=http://localhost:8000/api
npx expo start                # i = iOS simulator, w = web, or scan with Expo Go
```

- **On a real phone:** use your computer's LAN IP instead of `localhost`, e.g. `http://192.168.1.20:8000/api`. Phone and computer must be on the same Wi-Fi.
- **Rate limit:** the backend's default `RATE_LIMIT_MAX=100` per 15 minutes is easy to hit while developing. Raise it in your local `backend/.env`.
- **Offline demo:** with `EXPO_PUBLIC_API_URL` empty, the app runs a self-contained offline demo instead, using sample data stored on the device. This is labelled in the UI, and Settings → Connection says which mode is active.

## Where the code is

| File | Role |
|---|---|
| `src/services/api/client.ts` | Base URL, timeout, `{ success, data }` unwrapping, calm `ApiError` messages. Never logs bodies. |
| `src/services/api/types.ts` | Raw backend record shapes |
| `src/services/api/map.ts` | Backend ↔ app type mapping, the only place that knows field names like `startTime` or `feedingType` |
| `src/services/api/nurture.ts` | One adapter per resource |
| `src/services/contracts.ts` | The interface both the API and the offline demo implement |
| `src/services/index.ts` | Chooses API or offline demo |

The app has no login screen yet, so the backend must run with `DEMO_MODE=true`. The first baby returned by `GET /babies` is used for every baby-scoped call.

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
- **Unused backend features:** login and registration, families and invitations, maternal tracking, baby health observations and account export/deletion are all implemented in the backend but have no UI yet.
