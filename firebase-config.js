

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyBfx8sY0KnKJ2lP-M3xvBcBz8pSiH33SbQ",
  authDomain: "ecomapparaiso.firebaseapp.com",
  projectId: "ecomapparaiso",
  storageBucket: "ecomapparaiso.firebasestorage.app",
  messagingSenderId: "667577541725",
  appId: "1:667577541725:web:7d812b1879c97d7e0819b4"
};


const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
