# Backend integration guide

This is for whoever builds the Nurture backend (`backend/`). The frontend currently runs entirely in **demo mode**: every
record is sample data stored on the device with AsyncStorage. Nothing is sent anywhere.

Everything below is a **proposal**. None of it is a fixed contract. If you want different paths or shapes, change them;
the frontend only needs updates in `src/services/api/rest.ts` and `src/types/index.ts`.

## How to switch the app to your API

1. Set `EXPO_PUBLIC_API_URL` in `frontend/.env`. Use your machine's LAN IP when testing on a phone,
   e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.20:8000`.
2. Restart `npx expo start`.

`src/services/index.ts` swaps every service from the mock to the REST adapter when the variable is set. Screens never call
`fetch` directly, so no UI code changes.

## What the frontend expects

The REST adapter (`src/services/api/rest.ts`) uses three shapes:

| Kind | Calls |
|---|---|
| Collection | `GET /{resource}` → `T[]`, `POST /{resource}` → `T`, `PATCH /{resource}/{id}` → `T`, `DELETE /{resource}/{id}` → 204 |
| Catalog (read-only) | `GET /{resource}` → `T[]` |
| Document | `GET /{resource}` → `T`, `PUT /{resource}` → `T` |

Send JSON. Errors can be any non-2xx status; the UI shows a retry state.

| Resource | Kind | Type in `src/types/index.ts` |
|---|---|---|
| `profile` | Document | `Profile` |
| `sleep-sessions` | Collection | `SleepSession` |
| `feedings` | Collection | `FeedingEntry` (union on `kind`: `breast` / `formula` / `solid`) |
| `diapers` | Collection | `DiaperEntry` |
| `questions` | Collection | `Question` |
| `consultations` | Collection | `Consultation` (includes `messages[]`) |
| `saved` | Collection | `SavedItem` |
| `pediatrician-notes` | Collection | `PediatricianNote` |
| `activity-progress` | Collection | `ActivityProgress` |
| `community/posts` | Collection | `Post` |
| `products` | Catalog | `Product` |
| `experts` | Catalog | `Expert` |
| `milestones` | Catalog | `Milestone` |
| `activities` | Catalog | `Activity` |
| `community/groups` | Catalog | `CommunityGroup` |

### Conventions

- **IDs**: the server assigns them on `POST`.
- **Times**: ISO 8601 strings (UTC is fine). The UI formats them locally.
- **`origin`**: the frontend stamps `'api'` on everything that comes back from your server. You don't need to send it.
- **Sleep sessions**: a running session has `endedAt: null`. The UI works out elapsed time from `startedAt`, so the
  server never needs a timer.
- **`verification`** on products, experts, milestones and activities:
  `{ status: 'unverified' | 'pending' | 'verified', note?, sources: [{ label, url? }] }`.
  The UI only shows "Reviewed" when status is `verified`, and lists `sources` as links. Please only mark something
  `verified` once a qualified person has checked it.
- **Consultations**: the UI creates them with `status: 'pending'`. The real status should come from the server
  (`confirmed` / `unavailable` / `cancelled`). The demo has "Simulate confirmation" buttons; they only appear in demo mode
  and should never be needed with a real backend.

## Still mocked (no backend equivalent yet)

- Authentication / accounts: there is no sign-in screen. The profile is a single document.
- Sending questions to real people. Questions are only `recorded`.
- Expert availability, booking, and consultation messaging.
- Community replies, moderation queue (reports just set `reported: true`).
- Notifications (the toggles are stored as preferences only).
- All product, expert, milestone and activity content is fictional and `unverified`.

## Where to look

- `src/services/index.ts`: the demo/API switch.
- `src/services/mock/*`: seed data and the local storage implementation.
- `src/state/*`: the stores and hooks the screens use (`useCollection`, `useCatalog`, `useDoc`).
