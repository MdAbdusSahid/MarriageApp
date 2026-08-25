// Firebase Configuration
// ======================
// To set up Firebase:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use existing)
// 3. Go to Project Settings > General > Your apps > Add app > Web
// 4. Copy your config values below
// 5. Go to Firestore Database > Create database > Start in production mode
// 6. Go to Rules tab and set:
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /wedding_guests/{document=**} {
//          allow read, write: if true;
//        }
//      }
//    }

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVu1biJsHWY5DNqBsHYNNhi37xM4AiQ-o",
  authDomain: "marriageapp-8e5ef.firebaseapp.com",
  projectId: "marriageapp-8e5ef",
  storageBucket: "marriageapp-8e5ef.firebasestorage.app",
  messagingSenderId: "244310186035",
  appId: "1:244310186035:web:e11f826350a4161ad7ab46",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
