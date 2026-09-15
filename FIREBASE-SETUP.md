# Connect Ghost Studio to Firebase

This project is designed for Cloud Firestore and Firebase App Hosting. Its database connection runs only on the Next.js server.

## 1. Create the Firestore database

1. Open the [Firebase Console](https://console.firebase.google.com/), select your project, and open **Build → Firestore Database**.
2. Click **Create database**.
3. Keep the database ID as **`(default)`**.
4. Choose a suitable European location carefully. A Firestore database location cannot be changed later.
5. Choose production mode. The included rules intentionally block direct browser access.

Do not manually create collections. Firestore creates them when the first brief or admin session is written.

## 2. Deploy the security rules

From this project folder:

```sh
npm install --global firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

When `firebase use --add` asks, select the same Firebase project that owns the Firestore database.

The included `firestore.rules` denies every client-side read and write. This is intentional: the Firebase Admin SDK runs on the server and is controlled by the validated API routes.

## 3. Configure local development

Copy `.env.example` to `.env.local` and set:

```dotenv
FIREBASE_PROJECT_ID=your-project-id
ADMIN_PASSWORD=choose-a-strong-admin-password
ADMIN_SESSION_SECRET=paste-a-random-64-character-value
NOTIFICATION_EMAIL=p8339378@gmail.com
ALLOWED_ORIGINS=https://ghoststudio.mk,https://www.ghoststudio.mk
```

Generate `ADMIN_SESSION_SECRET` with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For local Firebase credentials, the recommended method is:

```sh
gcloud auth application-default login
```

If that is unavailable, download a dedicated service-account JSON, keep it outside the project, and set `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local` to its absolute path. Never upload that JSON to GitHub or send it in chat.

Verify the connection:

```sh
npm ci
npm run firebase:check
```

The command should print `Firestore connection successful`.

## 4. Configure email notifications

The database works without Resend. To enable reliable direct email, add these variables:

```dotenv
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=Ghost Studio <notifications@ghoststudio.mk>
```

The sender domain must be verified in Resend. If it is not verified, use a sender address that Resend has approved. When no Resend key is present, the existing FormSubmit fallback is used and may require one-time inbox activation.

## 5. Deploy the Next.js app

This is not a static site. It needs server routes for form submissions, Firestore access, admin login, and email delivery.

1. Push this folder to a private or public GitHub repository. Do not commit `.env.local` or a service-account JSON.
2. In Firebase Console, open **Hosting & Serverless → App Hosting**.
3. Create a backend and connect the GitHub repository and live branch.
4. Set the root directory to `/` if `package.json` is at the repository root.
5. In **Backend → Settings → Environment**, add:
   - `ADMIN_PASSWORD` as a secret;
   - `ADMIN_SESSION_SECRET` as a secret;
   - `RESEND_API_KEY` as a secret, if used;
   - `RESEND_FROM_EMAIL` as a normal value, if used.
6. Start a rollout.

Firebase App Hosting automatically supplies `FIREBASE_CONFIG` and Google credentials, so production does not need a service-account JSON or public Firebase web keys.

App Hosting requires a Firebase project on the Blaze plan. It runs the Next.js server on managed Cloud Run infrastructure.

## 6. Confirm everything works

After deployment:

1. Open `/start`, complete a test brief, and submit it.
2. In Firebase Console → Firestore Database, confirm a document appears in `project_briefs`.
3. Open `/admin`, sign in with `ADMIN_PASSWORD`, and confirm the brief appears.
4. Change its status and refresh the page to confirm the change persists.
5. Confirm the notification email arrived or review the stored notification error in the admin dashboard.

## Optional cleanup policy

The code rejects expired sessions and rate limits automatically. You can also enable Firestore TTL on the `expires_at` field for these collection groups so old documents are eventually removed:

- `admin_sessions`
- `admin_login_limits`
- `submission_rate_limits`

Do not enable TTL on `project_briefs` unless you intentionally want customer enquiries deleted after a retention period.
