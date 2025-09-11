// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, RecaptchaVerifier, signInWithPhoneNumber,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---------- Firebase Config ----------
const firebaseConfig = {
  apiKey: "AIzaSyA-q3jwEpQDWpVuud0eA87CpUdEQj9FUtA",
  authDomain: "aks-otp-login.firebaseapp.com",
  projectId: "aks-otp-login",
  storageBucket: "aks-otp-login.appspot.com",
  messagingSenderId: "702413960260",
  appId: "1:702413960260:web:159aa8f516171d618df811",
  measurementId: "G-5Q19TWRBG0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let confirmationResult;

// ---------- Save user to Firestore ----------
async function saveUser(user, type) {
  if (!user || !user.uid) return;
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email || null,
    phone: user.phoneNumber || null,
    type: type,
    lastLogin: new Date().toISOString()
  }, { merge: true });
}

// ================= PHONE OTP =================
window.sendOTP = function () {
  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  if (!phoneNumber) { alert("Enter phone number"); return; }

  // reCAPTCHA setup only once
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "normal" });
  }

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      alert("OTP sent!");
    })
    .catch((error) => {
      alert("Error: " + error.message);
      console.error(error);
    });
};

window.verifyOTP = function () {
  const otp = document.getElementById("otp").value.trim();
  if (!otp) { alert("Enter OTP"); return; }
  confirmationResult.confirm(otp)
    .then(async (cred) => {
      alert("Phone login successful!");
      await saveUser(cred.user, "phone");
      window.location.href = "dashboard.html";
    })
    .catch((err) => alert("Invalid OTP: " + err.message));
};

// ================= EMAIL REGISTER / LOGIN =================
window.register = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) { alert("Enter email and password"); return; }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (cred) => {
      alert("Registered successfully!");
      await saveUser(cred.user, "email");
      window.location.href = "dashboard.html";
    })
    .catch((error) => alert(error.message));
};

window.login = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) { alert("Enter email and password"); return; }

  signInWithEmailAndPassword(auth, email, password)
    .then(async (cred) => {
      alert("Login successful!");
      await saveUser(cred.user, "email");
      window.location.href = "dashboard.html";
    })
    .catch((error) => alert(error.message));
};

// ================= GUEST LOGIN =================
window.guestLogin = function () {
  signInAnonymously(auth)
    .then(async (cred) => {
      alert("Guest login successful!");
      await saveUser(cred.user, "guest");
      window.location.href = "dashboard.html";
    })
    .catch((error) => alert(error.message));
};

// ================= LOGOUT =================
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

// ================= AUTH STATE =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Logged in:", user.uid);
  } else {
    console.log("No user logged in");
  }
});
