import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfigJSON from '../../firebase-applet-config.json';

const getFirebaseConfig = () => {
  // Try to use JSON config first
  if (firebaseConfigJSON && Object.keys(firebaseConfigJSON).length > 0) {
    return firebaseConfigJSON;
  }

  // Fallback to environment variables
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)'
  };
};

const config = getFirebaseConfig();

let app;
try {
  if (!getApps().length) {
    if (!config.apiKey) {
      console.warn("Firebase configuration is missing. App running in offline mode.");
      app = null;
    } else {
      app = initializeApp(config);
    }
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
  app = null;
}

export const auth = app ? getAuth(app) : ({} as any);
export const db = app ? getFirestore(app, config.firestoreDatabaseId || '(default)') : ({} as any);

/**
 * Validates the connection to Firestore.
 * This is recommended to ensure the client is not offline or misconfigured.
 */
export async function validateConnection() {
  if (!app) return false;
  try {
    const testDoc = doc(db, '_connection_test_', 'ping');
    await getDoc(testDoc);
    console.log("[Firebase] Connection established successfully.");
    return true;
  } catch (error) {
    console.warn("[Firebase] Connection test failed. App might be in offline mode:", error);
    return false;
  }
}

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!app) return null;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Initialize user doc if it doesn't exist
    const userDocRef = doc(db, 'users', result.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        currency: 500, // Starting bonus
        totalScore: 0,
        wins: 0,
        level: 1,
        createdAt: serverTimestamp()
      });
    }
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

export const saveHighScore = async (score: number) => {
  if (!auth.currentUser) return;
  
  try {
    await addDoc(collection(db, 'leaderboard'), {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Anonymous',
      score: score,
      timestamp: serverTimestamp()
    });
    
    // Also update user's total score
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      await setDoc(userDocRef, {
        ...data,
        totalScore: (data.totalScore || 0) + score
      }, { merge: true });
    }
  } catch (error) {
    console.error("Error saving high score", error);
  }
};

export const getLeaderboard = async () => {
  try {
    const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error fetching leaderboard", error);
    return [];
  }
};
