import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Initialize App Check with error handling
try {
  if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });

  // Force initial token request
  appCheck.getToken()
    .then(() => {
      console.log('App Check initialized successfully');
    })
    .catch((error) => {
      console.error('Error initializing App Check:', error);
    });
} catch (error) {
  console.error('Failed to initialize App Check:', error);
}

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
