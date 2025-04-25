// firebase-auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// 🔐 Ton config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD_VQ1JVFRE-CmBwGEUWxHXiZ8sF7PH1FM",
  authDomain: "knowledgequestauth.firebaseapp.com",
  projectId: "knowledgequestauth",
  storageBucket: "knowledgequestauth.appspot.com",
  messagingSenderId: "320465505876",
  appId: "1:320465505876:web:7d047904254de893f427c1"
};

// 🔥 Initialisation
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 📥 Fonction de connexion Google
export async function signInWithGooglePopup() {
  try {
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();

    return {
      token,
      user: {
        name: result.user.displayName,
        email: result.user.email
      }
    };
  } catch (error) {
    console.error("Erreur lors de la connexion Google :", error);
    throw error;
  }
}
