# Ghost Studio — start here

This ZIP contains the editable source for the Ghost Studio website and a complete server-only Firebase Firestore integration.

## What was fixed

The previous project mixed Cloudflare D1 documentation, SQLite settings, and PostgreSQL code. It also had no Firebase initialization. This version uses one consistent backend: Cloud Firestore through the Firebase Admin SDK.

It includes:

- the existing homepage, artwork, privacy page, and five-step planner;
- durable Firestore storage with idempotent submissions;
- Firestore-backed rate limits, admin sessions, and login protection;
- the protected `/admin` lead dashboard;
- email notifications after a brief is safely stored;
- deny-by-default Firestore rules;
- Firebase App Hosting configuration and setup instructions;
- a corrected package lock and platform-compatible `dev`/`start` commands.

## First run

Open a terminal in this folder and run:

```sh
npm ci
npm run build
```

Then follow [FIREBASE-SETUP.md](FIREBASE-SETUP.md). After Firebase is configured:

```sh
npm run firebase:check
npm run dev
```

Open `http://localhost:3000`. The project planner is at `/start`, and the owner dashboard is at `/admin`.

## Important

- Use the Firestore database ID `(default)`.
- You do not need `VITE_FIREBASE_*` or `NEXT_PUBLIC_FIREBASE_*` keys for this project.
- Never put a service-account JSON or `.env.local` in GitHub.
- Use Firebase **App Hosting**, not a static-only Firebase Hosting upload.
- Firestore saves the brief first; email failure does not discard the enquiry.
