// Firebase Configuration for GlobeWorth
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  Timestamp,
  enableIndexedDbPersistence
} from 'firebase/firestore';

// Check if we're in demo mode (no Firebase config provided)
const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'demo-key';

// Firebase configuration - In production, these should be environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "globeworth-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "globeworth-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "globeworth-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DEMO"
};

// Initialize Firebase only if not in demo mode
let app: any;
let auth: any;
let db: any;

if (!isDemoMode) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err: any) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support offline persistence');
    }
  });
}

// Demo user data
const DEMO_USER: User = {
  uid: 'demo-user-123',
  email: 'demo@globeworth.app',
  displayName: 'Demo User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'demo-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: 'google.com',
};

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const signInWithGoogle = async () => {
  if (isDemoMode) {
    // Simulate demo login
    localStorage.setItem('globeworth_demo_user', JSON.stringify(DEMO_USER));
    return DEMO_USER;
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (isDemoMode) {
    localStorage.removeItem('globeworth_demo_user');
    return;
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (isDemoMode) {
      const demoUser = localStorage.getItem('globeworth_demo_user');
      resolve(demoUser ? JSON.parse(demoUser) : null);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Firestore helpers
export const createUserDocument = async (user: User) => {
  if (isDemoMode) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
    });
  } else {
    await updateDoc(userRef, {
      lastLoginAt: Timestamp.now(),
    });
  }
};

// Demo mode data helpers
const getDemoData = (key: string) => {
  const data = localStorage.getItem(`globeworth_demo_${key}`);
  return data ? JSON.parse(data) : null;
};

const setDemoData = (key: string, value: any) => {
  localStorage.setItem(`globeworth_demo_${key}`, JSON.stringify(value));
};

// Collection references - returns mock functions for demo mode
export const getUserAssetsRef = (userId: string) => {
  if (isDemoMode) {
    return {
      // Mock collection reference
    } as any;
  }
  return collection(db, 'users', userId, 'assets');
};

export const getUserLiabilitiesRef = (userId: string) => {
  if (isDemoMode) {
    return {} as any;
  }
  return collection(db, 'users', userId, 'liabilities');
};

export const getUserSnapshotsRef = (userId: string) => {
  if (isDemoMode) {
    return {} as any;
  }
  return collection(db, 'users', userId, 'snapshots');
};

export const getUserSettingsRef = (userId: string) => {
  if (isDemoMode) {
    return {} as any;
  }
  return doc(db, 'users', userId, 'settings', 'preferences');
};

// Demo data helpers for store
export const getDemoAssets = (): any[] => getDemoData('assets') || [];
export const setDemoAssets = (assets: any[]) => setDemoData('assets', assets);
export const getDemoLiabilities = (): any[] => getDemoData('liabilities') || [];
export const setDemoLiabilities = (liabilities: any[]) => setDemoData('liabilities', liabilities);
export const getDemoSettings = (): any => getDemoData('settings') || {
  userId: 'demo-user-123',
  displayCurrency: 'USD',
  darkMode: false,
  livePriceFetching: true,
  roundingFormat: 'decimal',
  emailSummary: false,
};
export const setDemoSettings = (settings: any) => setDemoData('settings', settings);
export const getDemoSnapshots = (): any[] => getDemoData('snapshots') || [];
export const setDemoSnapshots = (snapshots: any[]) => setDemoData('snapshots', snapshots);

export const isDemo = () => isDemoMode;
export { app, auth, db };
