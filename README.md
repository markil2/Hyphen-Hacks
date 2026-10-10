# Hyphen-Hacks

| Folder      | Owner    | Branch     |
|-------------|----------|------------|
| `frontend/` | Mark     | `frontend` |
| `backend/`  | Teammate | `backend`  |

Each person works only in their own folder on their own branch. Merge into `main` with a pull request.

## Running the app

```bash
# backend (first time: cp .env.example .env, npm install, npm run prisma:generate, npm run db:deploy, npm run db:seed)
cd backend && npm run dev

# frontend (first time: cp .env.example .env, npm install)
cd frontend && npx expo start
```

Press `i` for the iOS simulator, or scan the QR code with Expo Go (use your computer's LAN IP in `frontend/.env` on a real phone).
Details: [frontend/docs/BACKEND_INTEGRATION.md](frontend/docs/BACKEND_INTEGRATION.md).
