import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
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
