// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKp6rCV2G6B7nW-KVdGBhbzcPaNdDcCFg",
  authDomain: "aula02062026.firebaseapp.com",
  projectId: "aula02062026",
  storageBucket: "aula02062026.firebasestorage.app",
  messagingSenderId: "492235816306",
  appId: "1:492235816306:web:508362098dae54288bf1eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);