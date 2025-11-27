// assets/js/firebase.js
// Firebase Google Sign-In + Firestore (module)

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB-UK8Fa0FN2bt4tfQMl6ksWFwktqB8htU",
  authDomain: "codebase-83525.firebaseapp.com",
  projectId: "codebase-83525",
  storageBucket: "codebase-83525.firebasestorage.app",
  messagingSenderId: "729735531784",
  appId: "1:729735531784:web:c6eba0c9a92ef6fff270bd",
  measurementId: "G-DTPQ1PHCBN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ------------------------------------------
// GOOGLE LOGIN FLOW
// ------------------------------------------

window.googleLogin = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Save Google user basic profile
    localStorage.setItem("user", JSON.stringify({
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      uid: user.uid
    }));

    // Check if user already exists in Firestore
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // Already registered → go dashboard
      window.location.href = "dashboard.html";
    } else {
      // New user → go to registration page
      window.location.href = "register.html";
    }

  } catch (error) {
    alert("Login failed: " + error.message);
    console.error("Google login error:", error);
  }
};

// ------------------------------------------
// USER REGISTRATION FUNCTION
// ------------------------------------------

window.registerUser = async function (regNumber, phone) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please login first!");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  try {
    // Save registration data
    await setDoc(userRef, {
      name: user.name,
      email: user.email,
      registrationNumber: regNumber,
      phone: phone,
      createdAt: new Date()
    });

    alert("Registration successful!");
    window.location.href = "dashboard.html";

  } catch (error) {
    alert("Failed to register: " + error.message);
    console.error(error);
  }
};
