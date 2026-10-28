# Firebase setup for Nonsense & Ingredients

The site uses the Firebase Web SDK. The web config in `src/lib/firebase.js` identifies the Firebase project; it is not an Admin SDK credential. Do not add a service-account JSON file or private key to this repository or to frontend environment variables.

## One-time Firebase setup

1. In Firebase Console, enable **Authentication → Sign-in method → Email/Password**.
2. In **Authentication → Users**, add your editor account with your email and a strong password. Public sign-up is intentionally not provided.
3. Confirm the account's UID is `pvt5zRlejfg76xXWTXol6vKp59c2`.
4. In **Firestore Database → Rules**, publish the contents of `firestore.rules` in this repository.

The app reads public documents from `journalPosts`; the first saved story creates this collection automatically. Only the confirmed Firebase Auth UID can write or delete posts. The rules also deny all access to the unused `admins` collection.

## Existing browser-only stories

Open `/admin` on the same site origin and in the same browser where the posts were created, sign in, and choose **Import browser stories to Firestore**. If those posts were made on `localhost:3000`, run the migration at `http://localhost:3000/admin`; a live Netlify domain cannot read localhost's browser storage. The import keeps existing story IDs and skips IDs already present in Firestore, so it is safe to retry if interrupted.

Stories remain cached in the browser for faster display, but Firestore is the shared copy used across devices and by visitors. Images, videos, and PDFs are stored in Cloudinary and only their URLs are saved in Firestore, keeping posts small. The editor accepts source images up to 15 MB, videos up to 100 MB, and PDFs up to 25 MB.

## Signed Cloudinary media uploads

The journal editor requests a short-lived signed upload from `netlify/functions/cloudinary-signature.mjs`. The function checks the Firebase ID token against Firebase Authentication and only signs uploads for the journal admin UID above. The Cloudinary API secret stays in the Netlify Function environment and is never sent to the browser.

In Netlify, add these environment variables with the **Functions** scope, then deploy again:

- `CLOUDINARY_CLOUD_NAME` — Cloudinary product environment cloud name.
- `CLOUDINARY_API_KEY` — Cloudinary API key. This is returned to the browser for the signed upload.
- `CLOUDINARY_API_SECRET` — Cloudinary API secret. Mark this variable as containing a secret; never add it to `VITE_*` variables or the repository.
- `FIREBASE_WEB_API_KEY` — Firebase web API key from `src/lib/firebase.js`, used by the function to validate the ID token.
- `JOURNAL_ADMIN_UID` — the Firebase UID listed above.

For local development with Netlify Dev, copy `.env.example` to `.env.local` and fill these values there. Do not commit `.env.local`. After confirming signed uploads work, disable or delete the old unsigned Cloudinary preset.

## Netlify

No Firebase service-account key is required. After deploying the site and configuring the Function variables above, use the same `/admin` sign-in. Firestore rules protect writes independently of the page UI.
