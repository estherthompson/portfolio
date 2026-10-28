import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { auth, db, JOURNAL_ADMIN_UID } from './firebase';

const STORAGE_KEY = 'nonsense-ingredients-posts-v1';
const LEGACY_STORAGE_KEY = 'nonsense-ingredients-posts-legacy-backup-v1';
const REMOTE_READY_KEY = 'nonsense-ingredients-firestore-ready-v1';
const LEGACY_MIGRATED_KEY = 'nonsense-ingredients-legacy-migrated-v1';
const POSTS_COLLECTION = 'journalPosts';
const isPublishedPost = (post) => post.status !== 'draft';

function readLocalPosts() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const posts = saved ? JSON.parse(saved) : [];
    return Array.isArray(posts) ? posts.sort((a, b) => new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0)) : [];
  } catch {
    return [];
  }
}

function readLegacyPosts() {
  try {
    const backup = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (backup) return JSON.parse(backup);
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const posts = saved ? JSON.parse(saved) : [];
    if (Array.isArray(posts) && posts.length) window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(posts));
    return Array.isArray(posts) ? posts : [];
  } catch {
    return [];
  }
}

// Preserve old browser-only stories before a Firestore snapshot can refresh the cache.
if (typeof window !== 'undefined') readLegacyPosts();

function cachePosts(posts) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // The hosted Firestore copy remains authoritative if the browser cache is full.
  }
}

function syncRemotePosts(posts) {
  const remoteReady = window.localStorage.getItem(REMOTE_READY_KEY) === 'true';
  const legacyPending = window.localStorage.getItem(LEGACY_MIGRATED_KEY) !== 'true';
  const localPosts = legacyPending ? readLegacyPosts() : [];
  const remoteIds = new Set(posts.map((post) => post.id));
  const visiblePosts = [...posts, ...localPosts.filter((post) => !remoteIds.has(post.id))]
    .sort((a, b) => new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0));
  if (posts.length || !localPosts.length || remoteReady) {
    cachePosts(posts);
    if (posts.length || !localPosts.length) window.localStorage.setItem(REMOTE_READY_KEY, 'true');
  }
  return visiblePosts;
}

export async function getJournalPosts() {
  try {
    const snapshot = await getDocs(query(collection(db, POSTS_COLLECTION), orderBy('date', 'desc')));
    const posts = snapshot.docs.map((postDoc) => ({ id: postDoc.id, ...postDoc.data() }));
    return syncRemotePosts(posts);
  } catch (error) {
    if (error.code === 'permission-denied') throw error;
    return readLocalPosts();
  }
}

export function subscribeJournalPosts(onPosts, onError = () => {}) {
  return onSnapshot(
    query(collection(db, POSTS_COLLECTION), orderBy('date', 'desc')),
    (snapshot) => {
      const posts = snapshot.docs.map((postDoc) => ({ id: postDoc.id, ...postDoc.data() }));
      onPosts(syncRemotePosts(posts).filter(isPublishedPost));
    },
    (error) => {
      onPosts(readLocalPosts().filter(isPublishedPost));
      onError(error);
    },
  );
}

export function subscribeAdminJournalPosts(onPosts, onError = () => {}) {
  return onSnapshot(
    query(collection(db, POSTS_COLLECTION), orderBy('date', 'desc')),
    (snapshot) => {
      onPosts(syncRemotePosts(snapshot.docs.map((postDoc) => ({ id: postDoc.id, ...postDoc.data() }))));
    },
    (error) => {
      onPosts(readLocalPosts());
      onError(error);
    },
  );
}

export async function isJournalAdmin(user = auth.currentUser) {
  return Boolean(user && user.uid === JOURNAL_ADMIN_UID);
}

export async function saveJournalPost(post) {
  if (!auth.currentUser || !(await isJournalAdmin(auth.currentUser))) {
    throw new Error('Only the signed-in journal admin can save stories.');
  }
  if (new TextEncoder().encode(JSON.stringify(post)).length > 700 * 1024) {
    throw new Error('This story is too large for Firestore. Reduce the size or number of its images and try again.');
  }
  await setDoc(doc(db, POSTS_COLLECTION, post.id), post);
  const next = [post, ...readLocalPosts().filter((item) => item.id !== post.id)]
    .sort((a, b) => new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0));
  cachePosts(next);
  return next;
}

export async function removeJournalPost(postId) {
  if (!auth.currentUser || !(await isJournalAdmin(auth.currentUser))) {
    throw new Error('Only the signed-in journal admin can remove stories.');
  }
  await deleteDoc(doc(db, POSTS_COLLECTION, postId));
  const next = readLocalPosts().filter((post) => post.id !== postId);
  cachePosts(next);
  return next;
}

export async function migrateLocalJournalPosts() {
  if (!auth.currentUser || !(await isJournalAdmin(auth.currentUser))) {
    throw new Error('Sign in as the journal admin before importing local stories.');
  }
  const localPosts = readLegacyPosts();
  let imported = 0;
  for (const post of localPosts) {
    if (new TextEncoder().encode(JSON.stringify(post)).length > 700 * 1024) {
      throw new Error(`“${post.title}” is over Firestore’s 700 KB per-story limit. Reduce its images before importing.`);
    }
    const postRef = doc(db, POSTS_COLLECTION, post.id);
    const existing = await getDoc(postRef);
    if (!existing.exists()) {
      await setDoc(postRef, post);
      imported += 1;
    }
  }
  window.localStorage.setItem(REMOTE_READY_KEY, 'true');
  window.localStorage.setItem(LEGACY_MIGRATED_KEY, 'true');
  return { imported, total: localPosts.length };
}

export function getLocalJournalPostCount() {
  return window.localStorage.getItem(LEGACY_MIGRATED_KEY) === 'true' ? 0 : readLegacyPosts().length;
}

export function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
