import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBNEw7Jc4Nmh9x6wbIyYYsMg3--YqbIq3A",
  authDomain: "reactauthproject-ae85a.firebaseapp.com",
  projectId: "reactauthproject-ae85a",
  storageBucket: "reactauthproject-ae85a.firebasestorage.app",
  messagingSenderId: "297915636470",
  appId: "1:297915636470:web:773c0852eaec120615ead7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app)