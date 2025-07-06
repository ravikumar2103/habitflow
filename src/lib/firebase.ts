import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBpgtC-V41aQ5pz3ci7FxUIuJsfr215KSA",
  authDomain: "habit-flow-fa9e4.firebaseapp.com",
  projectId: "habit-flow-fa9e4",
  storageBucket: "habit-flow-fa9e4.firebasestorage.app",
  messagingSenderId: "562986143623",
  appId: "1:562986143623:web:b9493a987cde0dbbf04d22"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);