// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA-q3jwEpQDWpVuud0eA87CpUdEQj9FUtA",
  authDomain: "aks-otp-login.firebaseapp.com",
  projectId: "aks-otp-login",
  storageBucket: "aks-otp-login.firebasestorage.app",
  messagingSenderId: "702413960260",
  appId: "1:702413960260:web:159aa8f516171d618df811",
  measurementId: "G-5Q19TWRBG0"
};

// Initialize Firebase app and auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Phone OTP functions
function sendOTP() {
  const phoneNumber = document.getElementById("phone").value;
  window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {}, auth);
  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then(confirmationResult => {
      window.confirmationResult = confirmationResult;
      alert("OTP Sent!");
    })
    .catch(err => alert(err.message));
}

function verifyOTP() {
  const otp = document.getElementById("otp").value;
  if (!window.confirmationResult) {
    alert("Please request OTP first.");
    return;
  }
  window.confirmationResult.confirm(otp)
    .then(result => alert("Phone Login Success: " + result.user.uid))
    .catch(err => alert(err.message));
}

// Email auth functions
function registerUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => alert("User Registered: " + userCredential.user.email))
    .catch(err => alert(err.message));
}

function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => alert("Login Success: " + userCredential.user.email))
    .catch(err => alert(err.message));
}

// Guest login function
function guestLogin() {
  signInAnonymously(auth)
    .then(userCredential => alert("Guest Login Success: " + userCredential.user.uid))
    .catch(err => alert(err.message));
}

// Attach event listeners after DOM loads
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("send-otp-btn").addEventListener("click", sendOTP);
  document.getElementById("verify-otp-btn").addEventListener("click", verifyOTP);
  document.getElementById("register-btn").addEventListener("click", registerUser);
  document.getElementById("login-btn").addEventListener("click", loginUser);
  document.getElementById("guest-login-btn").addEventListener("click", guestLogin);
});
