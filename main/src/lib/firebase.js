import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase's web config identifies the project; authorization is enforced by
// Firebase Authentication and the Firestore rules in firestore.rules.
const firebaseConfig = {
  apiKey: 'AIzaSyBbCL3rZRQzigGQFVi5myAKWBfWx7C7qro',
  authDomain: 'esther-s-portfolio.firebaseapp.com',
  projectId: 'esther-s-portfolio',
  storageBucket: 'esther-s-portfolio.firebasestorage.app',
  messagingSenderId: '828305187381',
  appId: '1:828305187381:web:9b0bfdd99273006015877c',
  measurementId: 'G-DV1PMBG977',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const JOURNAL_ADMIN_UID = 'pvt5zRlejfg76xXWTXol6vKp59c2';
