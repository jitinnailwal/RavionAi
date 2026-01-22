// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqJV9caBfHYEsyTgM0igwsVsp_EzksCDg",
  authDomain: "ravion-ai.firebaseapp.com",
  projectId: "ravion-ai",
  storageBucket: "ravion-ai.firebasestorage.app",
  messagingSenderId: "195604290531",
  appId: "1:195604290531:web:b1274aef75bf60b75cded6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {auth, googleProvider};