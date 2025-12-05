// assets/js/firebase.js
// Firebase Google Sign-In + Firestore (module)

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// -------------------------
// Firebase config
// -------------------------
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

// Allowed university domains
const ALLOWED_DOMAINS = ["@std.uwu.ac.lk", "@stu.vau.ac.lk"];
const ALLOWED_EMAILS = ["rahiru123@gmail.com","tharinduakalanka85@gmail.com"];

// ---------------------------------------------------------------------------
// GOOGLE LOGIN FUNCTION
// ---------------------------------------------------------------------------
window.googleLogin = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Save user info locally
    const userData = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL
    };
    localStorage.setItem("user", JSON.stringify(userData));

    // Check allowed domain or email
    const isAllowedDomain = ALLOWED_DOMAINS.some(d => user.email.endsWith(d));
    const isAllowedEmail = ALLOWED_EMAILS.includes(user.email);

    if (!isAllowedDomain && !isAllowedEmail) {
      alert("Access denied. Only approved university emails allowed.");
      await signOut(auth);
      throw new Error("Access denied"); // stop further execution
    }

    // Check if user exists in Firestore
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // Redirect based on role
      const role = docSnap.data().role || "student";
      redirectByRole(role);
    } else {
      // New user → registration page
      window.location.href = "register.html";
    }

    return userData;

  } catch (err) {
    console.error("Login failed:", err);
    throw err; // propagate error to caller
  }
};


// ---------------------------------------------------------------------------
// HANDLE ROLE-BASED REDIRECTION
// ---------------------------------------------------------------------------
function redirectByRole(role) {
  if (role === "owner" || role === "admin" || role === "editor") {
    window.location.href = "dashboard.html"; // or admin dashboard
  } else {
    window.location.href = "dashboard.html"; // student dashboard
  }
}

// ---------------------------------------------------------------------------
// USER REGISTRATION FUNCTION
// ---------------------------------------------------------------------------
window.registerUser = async function (regNumber, phone, level) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please login first!");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  try {
    await setDoc(userRef, {
      name: user.name,
      email: user.email,
      registrationNumber: regNumber,
      phone: phone,
      createdAt: new Date(),
      role: "student",
      level: level
    });

    alert("Registration successful!");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Failed to register: " + error.message);
    console.error(error);
  }
};

export { app };
