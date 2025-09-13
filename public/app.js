// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, RecaptchaVerifier, signInWithPhoneNumber,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, signInAnonymously, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Config
const firebaseConfig = {
  apiKey: "AIzaSyA-q3jwEpQDWpVuud0eA87CpUdEQj9FUtA",
  authDomain: "aks-otp-login.firebaseapp.com",
  projectId: "aks-otp-login",
  storageBucket: "aks-otp-login.appspot.com",
  messagingSenderId: "702413960260",
  appId: "1:702413960260:web:159aa8f516171d618df811"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let confirmationResult;

// Helper UI
function showAlert(msg, type="success") {
  const box = document.getElementById("alertBox");
  if (!box) return;
  box.className = `alert alert-${type}`;
  box.textContent = msg;
  box.style.display = "block";
}
function hideSpinner(){document.getElementById("spinner").style.display="none";}
function showSpinner(){document.getElementById("spinner").style.display="inline-block";}

// Save User
async function saveUser(user, type) {
  if (!user) return;
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email || null,
    phone: user.phoneNumber || null,
    type: type,
    lastLogin: new Date().toISOString()
  }, { merge: true });
}

// Phone OTP
window.sendOTP = function () {
  const phone = document.getElementById("phoneNumber").value.trim();
  if (!phone) return showAlert("Enter phone number","danger");
  window.recaptchaVerifier = new RecaptchaVerifier(auth,"recaptcha-container",{size:"normal"});
  signInWithPhoneNumber(auth, phone, window.recaptchaVerifier)
    .then(r => { confirmationResult = r; showAlert("OTP sent","info"); })
    .catch(e => showAlert(e.message,"danger"));
};
window.verifyOTP = function () {
  const otp = document.getElementById("otp").value.trim();
  if (!confirmationResult) return showAlert("Send OTP first","warning");
  confirmationResult.confirm(otp)
    .then(async cred => { await saveUser(cred.user,"phone"); window.location="dashboard.html"; })
    .catch(e => showAlert("Invalid OTP","danger"));
};

// Email
window.register = function(){
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(async cred => { await saveUser(cred.user,"email"); window.location="dashboard.html"; })
    .catch(e => showAlert(e.message,"danger"));
};
window.login = function(){
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(async cred => { await saveUser(cred.user,"email"); window.location="dashboard.html"; })
    .catch(e => showAlert(e.message,"danger"));
};
window.resetPassword = function(){
  if (!email.value) return showAlert("Enter email","warning");
  sendPasswordResetEmail(auth,email.value).then(()=>showAlert("Reset link sent","success")).catch(e=>showAlert(e.message,"danger"));
};

// Guest
window.guestLogin = function(){
  signInAnonymously(auth)
    .then(async cred => { await saveUser(cred.user,"guest"); window.location="dashboard.html"; })
    .catch(e=>showAlert(e.message,"danger"));
};

// Logout
window.logout = ()=>signOut(auth).then(()=>window.location="index.html");
