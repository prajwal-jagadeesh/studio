import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-504145450-88592",
  "appId": "1:649444934147:web:2944425c4ed6733c834436",
  "apiKey": "AIzaSyAh4ZatwjoCN4PQa78aQXnay42BLWwA1ys",
  "authDomain": "studio-504145450-88592.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "649444934147"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
