// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeMXSO4KuntYlFVbRGH_AkCK7TStXIJK4",
  authDomain: "docs-flow-b4ff3.firebaseapp.com",
  projectId: "docs-flow-b4ff3",
  storageBucket: "docs-flow-b4ff3.firebasestorage.app",
  messagingSenderId: "923820992466",
  appId: "1:923820992466:web:30930ee1f6e40eb32e0a0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 export const auth = getAuth(app)
 export const db = getFirestore(app)