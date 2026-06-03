

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAHUel22F1X-_dt21Ua9kY09v1q0xZ2g3A",
  authDomain: "ecomapa-paraiso.firebaseapp.com",
  projectId: "ecomapa-paraiso",
  storageBucket: "ecomapa-paraiso.firebasestorage.app",
  messagingSenderId: "1042208837869",
  appId: "1:1042208837869:web:96cd70aec98e049643fce4",
  measurementId: "G-W8H2BW1GS9"
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
