// firebase.js
// Conexión compartida de Educa Digital con Firebase (SDK modular).

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

// Configuración del proyecto Firebase Educa Digital.
const firebaseConfig = {
  apiKey: "AIzaSyAC6wVTMUyH5O7pR7NrtG1-i-MyQgOSB1g",
  authDomain: "educadigital-f1393.firebaseapp.com",
  projectId: "educadigital-f1393",
  storageBucket: "educadigital-f1393.firebasestorage.app",
  messagingSenderId: "309526687498",
  appId: "1:309526687498:web:271c34d0c858cc48d494f3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
