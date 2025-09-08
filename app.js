// Import Firebase v10 SDK using CDN modules (recommended for web hosting)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Your Firebase Config (replace with actual values from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyA-q3jwEpQDWpVuud0eA87CpUdEQj9FUtA",
  authDomain: "aks-otp-login.firebaseapp.com",
  projectId: "aks-otp-login",
  storageBucket: "aks-otp-login.appspot.com",
  messagingSenderId: "702413960260",
  appId: "1:702413960260:web:159aa8f516171dc18df811",
  measurementId: "G-SQ17WRB6GQ"
};

// Initialize Firebase App and Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set Recaptcha (visible widget for easier testing)
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
  size: 'normal',
  callback: (response) => {
    console.log("Recaptcha verified");
  }
});

// Send OTP function
window.sendOTP = function () {
  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  if (!phoneNumber) {
    alert("Please enter phone number with country code, e.g., +91XXXXXXXXXX");
    return;
  }
  const appVerifier = window.recaptchaVerifier;
  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      alert("OTP Sent! Enter the OTP received.");
    }).catch((error) => {
      alert("Error sending OTP: " + error.message);
      console.error(error);
    });
}

// Verify OTP function
window.verifyOTP = function () {
  const otp = document.getElementById("otp").value.trim();
  if (!otp) {
    alert("Please enter the OTP.");
    return;
  }
  if (!window.confirmationResult) {
    alert("Send OTP first before verifying.");
    return;
  }
  window.confirmationResult.confirm(otp)
    .then((result) => {
      alert("Login Success! User: " + result.user.phoneNumber);
    }).catch((error) => {
      alert("Invalid OTP: " + error.message);
    });
}
