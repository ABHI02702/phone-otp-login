// Firebase imports (v10.12.2)
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

// ---------- UI helpers ----------
function showAlert(message, type = "success", timeout = 4000) {
  const box = document.getElementById("alertBox");
  box.className = `alert alert-${type} mt-3`;
  box.textContent = message;
  box.style.display = "block";
  if (timeout) setTimeout(() => { box.style.display = "none"; }, timeout);
}

function showSpinner(show = true) {
  const s = document.getElementById("spinner");
  s.style.display = show ? "inline-block" : "none";
}

// ---------- Save user to Firestore ----------
async function saveUser(user, type) {
  if (!user || !user.uid) return;
  try {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email || null,
      phone: user.phoneNumber || null,
      type: type,
      lastLogin: new Date().toISOString()
    }, { merge: true });
    console.log("User saved:", user.uid);
  } catch (err) {
    console.error("Error saving user:", err);
  }
}

// ================= PHONE OTP =================
window.sendOTP = function () {
  const raw = document.getElementById("phoneNumber").value.trim();
  if (!raw) { showAlert("Enter phone number", "warning"); return; }
  const phoneNumber = raw.length === 10 && !raw.startsWith("+") ? "+91" + raw : raw;

  showSpinner(true);
  window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "normal" });

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      showSpinner(false);
      showAlert("OTP sent to " + phoneNumber, "info");
    })
    .catch((error) => {
      showSpinner(false);
      console.error(error);
      showAlert(error.message || "Failed to send OTP", "danger");
    });
};

window.verifyOTP = function () {
  const otp = document.getElementById("otp").value.trim();
  if (!otp) { showAlert("Enter OTP", "warning"); return; }
  showSpinner(true);
  confirmationResult.confirm(otp)
    .then(async (cred) => {
      showSpinner(false);
      showAlert("Phone login successful", "success");
      await saveUser(auth.currentUser, "phone");
      window.location.href = "dashboard.html";
    })
    .catch((err) => {
      showSpinner(false);
      console.error(err);
      showAlert("Invalid OTP", "danger");
    });
};

// ================= EMAIL REGISTER / LOGIN =================
window.register = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) { showAlert("Enter email and password", "warning"); return; }

  showSpinner(true);
  createUserWithEmailAndPassword(auth, email, password)
    .then(async () => {
      showSpinner(false);
      showAlert("Registered successfully", "success");
      await saveUser(auth.currentUser, "email");
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      showSpinner(false);
      console.error(error);
      showAlert(error.message || "Registration failed", "danger");
    });
};

window.login = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) { showAlert("Enter email and password", "warning"); return; }

  showSpinner(true);
  signInWithEmailAndPassword(auth, email, password)
    .then(async () => {
      showSpinner(false);
      showAlert("Login successful", "success");
      await saveUser(auth.currentUser, "email");
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      showSpinner(false);
      console.error(error);
      showAlert(error.message || "Login failed", "danger");
    });
};

// ================= GUEST LOGIN =================
window.guestLogin = function () {
  showSpinner(true);
  signInAnonymously(auth)
    .then(async () => {
      showSpinner(false);
      showAlert("Guest login successful", "success");
      await saveUser(auth.currentUser, "guest");
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      showSpinner(false);
      console.error(error);
      showAlert(error.message || "Guest login failed", "danger");
    });
};

// ================= LOGOUT =================
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

// ================= AUTH STATE =================
function showUser(user) {
  const section = document.getElementById("userSection");
  if (!section) return;
  section.style.display = "block";
  const info = document.getElementById("userInfo");
  if (user.phoneNumber) info.innerText = "Phone: " + user.phoneNumber;
  else if (user.email) info.innerText = "Email: " + user.email;
  else info.innerText = "Guest User";
}

onAuthStateChanged(auth, (user) => {
  if (user) showUser(user);
  else {
    const section = document.getElementById("userSection");
    if (section) section.style.display = "none";
  }
});
