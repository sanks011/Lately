import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref } from "firebase/database"; // Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyBMYQEtXEGJcJbP8MHD1b5FJvSnLqAvu7E",
  authDomain: "lately-e6182.firebaseapp.com",
  databaseURL: "https://lately-e6182-default-rtdb.firebaseio.com",
  projectId: "lately-e6182",
  storageBucket: "lately-e6182.appspot.com",
  messagingSenderId: "975551672334",
  appId: "1:975551672334:web:212489a78ce074f51c8c5f",
  measurementId: "G-LMLWY6VSQR"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Realtime Database
const db = getDatabase(app); // Realtime Database

export { auth, db, googleProvider, ref }; // Added ref for referencing database
