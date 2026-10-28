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

Stories remain cached in the browser for faster display, but Firestore is the shared copy used across devices and by visitors. Each post is limited to 700 KB because uploaded images are stored inside its Firestore document; very image-heavy posts need smaller or fewer images.

## Netlify

No service-account key or Netlify secret is required for this web-SDK setup. After deploying the site, use the same `/admin` sign-in. Firestore rules protect writes independently of the page UI.
