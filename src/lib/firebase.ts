import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import configJson from '../../firebase-applet-config.json';

export const firebaseConfig = {
  projectId: configJson.projectId,
  appId: configJson.appId,
  apiKey: configJson.apiKey,
  authDomain: configJson.authDomain,
  firestoreDatabaseId: configJson.firestoreDatabaseId || '(default)',
  storageBucket: configJson.storageBucket,
  messagingSenderId: configJson.messagingSenderId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

const databaseId = configJson.firestoreDatabaseId && configJson.firestoreDatabaseId !== '(default)'
  ? configJson.firestoreDatabaseId
  : undefined;

// Initialize Firestore with offline persistence and auto-detect long polling
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalAutoDetectLongPolling: true,
}, databaseId);

export default app;
