# Hyphen-Hacks

| Folder      | Owner    | Branch     |
|-------------|----------|------------|
| `frontend/` | Mark     | `frontend` |
| `backend/`  | Teammate | `backend`  |

Each person works only in their own folder on their own branch. Merge into `main` with a pull request.

## Frontend

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `w` to open it in a browser. The app runs on sample data until
`EXPO_PUBLIC_API_URL` is set in `frontend/.env` (copy `frontend/.env.example`). Backend notes:
[frontend/docs/BACKEND_INTEGRATION.md](frontend/docs/BACKEND_INTEGRATION.md).
