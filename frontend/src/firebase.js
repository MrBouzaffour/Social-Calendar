import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';  // Import Firestore
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {

  apiKey: "AIzaSyDVxtqmufKTzhQMo2-hHDbZ0zqpzYg5heU",

  authDomain: "matheusproject370.firebaseapp.com",

  projectId: "matheusproject370",

  storageBucket: "matheusproject370.appspot.com",

  messagingSenderId: "434008828891",

  appId: "1:434008828891:web:bd3b5db32da5e7f1e2d5fe",

  measurementId: "G-0P309NKH6B"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Initialize Firestore
const auth = getAuth(app);
const analytics = getAnalytics(app);
export { db, auth };  // Export Firestore and auth
