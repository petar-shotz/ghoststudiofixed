# Ghost Studio

Ghost Studio is a Next.js website for `ghoststudio.mk`. Clients complete a five-step project planner, the server validates their submission, and the enquiry is stored in Cloud Firestore. The protected `/admin` dashboard lists briefs and lets the owner update status, retry email delivery, or delete a lead.

## Backend

The app uses the Firebase Admin SDK only on the server. Browser code never receives Firebase credentials and never reads Firestore directly.

Data is stored in these collections:

- `project_briefs` — submitted client enquiries.
- `submission_rate_limits` — privacy-safe submission throttling.
- `admin_sessions` — hashed admin sessions.
- `admin_login_limits` — failed-login throttling.

`firestore.rules` denies all browser access. The Next.js API routes authenticate through the Firebase Admin SDK and Google Application Default Credentials.

## Start locally

1. Install Node.js 22.13 or newer.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and fill in the values.
4. Authenticate locally with `gcloud auth application-default login`, or set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON stored outside the repository.
5. Run `npm run firebase:check`.
6. Run `npm run dev`, then open `http://localhost:3000`.

See [FIREBASE-SETUP.md](FIREBASE-SETUP.md) for the complete Firebase Console and deployment instructions.

## Commands

- `npm run dev` — start the development server.
- `npm run build` — create a production build.
- `npm start` — run the production server and respect the platform-provided `PORT`.
- `npm run lint` — check source quality.
- `npm run firebase:check` — verify credentials and Firestore connectivity.

## Deployment

Deploy this as a full-stack Next.js app with Firebase App Hosting. Do not upload only static files to classic Firebase Hosting: the planner depends on `/api/briefs`, and the admin dashboard depends on server rendering and `/api/admin/actions`.

Firebase App Hosting automatically supplies Firebase project configuration and credentials to the Admin SDK. Configure `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` as secret environment variables in the backend settings. `RESEND_API_KEY` is optional.
