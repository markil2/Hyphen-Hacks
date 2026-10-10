# Nurture — frontend

Expo (SDK 57) + React Native + TypeScript app for iPhone and Android. The app is a calm, illustrated home: each room
holds part of the day (sleep in the nursery, feeding in the kitchen, questions and expert support in the living room).

## Run it

```bash
npm install
npx expo start
```

- **On your phone:** install **Expo Go**, then scan the QR code from the terminal (same Wi-Fi as your computer).
- **In a browser:** press `w`, or run `npx expo start --web`.

## Checks

```bash
npx tsc --noEmit
npx expo lint
```

## Demo mode

With `EXPO_PUBLIC_API_URL` empty (the default), everything runs on sample data stored on the device. Sample content is
always labelled in the UI. Profile → Demo tools can restore the sample data or simulate a connection error.

To connect the backend, see [docs/BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md).

## Layout

| Path | What's there |
|---|---|
| `src/app/` | Screens (expo-router). Tabs live in `(tabs)/`; each room has its own folder. |
| `src/components/scene/` | The 2.5D room engine: `RoomScene` (layers, parallax, camera zoom), `InteractiveObject`, `RoomShell`, and the room art in `art/`. |
| `src/components/ui/` | Shared UI: buttons, fields, time editor, badges, empty/loading/error states. |
| `src/features/` | Feature logic and components (sleep, feeding, pantry, support, community…). |
| `src/services/` | Data access. `mock/` for demo mode, `api/` for the real backend, chosen in `index.ts`. |
| `src/state/` | Small stores and hooks over the services. |
| `src/theme/` | Colours, type, spacing, shadows. |
| `design/reference/` | The original nursery render the visual style is based on. |
