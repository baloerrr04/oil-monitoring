import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAVlIwVTUrrzhFHY-_cWeCHwx-rbVM4ly0",
  authDomain: "minyak-ok.firebaseapp.com",
  databaseURL: "https://minyak-ok-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "minyak-ok",
  storageBucket: "minyak-ok.firebasestorage.app",
  messagingSenderId: "78949519866",
  appId: "1:78949519866:web:899c5c77b77436dc2d5443",
  measurementId: "G-GVV55FRSB0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { auth, database };

