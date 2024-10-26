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
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize App Check only if site key is available
if (process.env.REACT_APP_RECAPTCHA_SITE_KEY) {
  try {
    // Enable debug token in development
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });

    console.log('App Check configuration attempted');
  } catch (error) {
    console.warn('App Check initialization skipped:', error.message);
  }
} else {
  console.warn('Skipping App Check initialization: No reCAPTCHA site key provided');
}

export { auth, db };
