// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, RecaptchaVerifier, signInWithPhoneNumber,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc
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

// ---------- Cloudinary Config ----------
const CLOUD_NAME = "dl1wr8zbn";   // तुम्हारा Cloudinary cloud name
const UPLOAD_PRESET = "YT_AKS";   // unsigned preset name

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
  } catch (err) {
    console.error("Error saving user:", err);
  }
}

// ================= PHONE OTP =================
window.sendOTP = function () {
  const raw = document.getElementById("phoneNumber").value.trim();
  if (!raw) { alert("Enter phone number"); return; }
  const phoneNumber = raw.length === 10 && !raw.startsWith("+") ? "+91" + raw : raw;

  window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "normal" });

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      alert("OTP sent to " + phoneNumber);
    })
    .catch((error) => {
      console.error(error);
      alert(error.message || "Failed to send OTP");
    });
};

window.verifyOTP = function () {
  const otp = document.getElementById("otp").value.trim();
  if (!otp) { alert("Enter OTP"); return; }
  confirmationResult.confirm(otp)
    .then(async () => {
      alert("Phone login successful");
      await saveUser(auth.currentUser, "phone");
      window.location.href = "dashboard.html";
    })
    .catch(() => alert("Invalid OTP"));
};

// ================= EMAIL REGISTER / LOGIN =================
window.register = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) { alert("Enter email and password"); return; }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async () => {
      alert("Registered successfully");
      await saveUser(auth.currentUser, "email");
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error(error);
      alert(error.message || "Registration failed");
    });
};

window.login = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) { alert("Enter email and password"); return; }

  signInWithEmailAndPassword(auth, email, password)
    .then(async () => {
      alert("Login successful");
      await saveUser(auth.currentUser, "email");
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error(error);
      alert(error.message || "Login failed");
    });
};

// ================= GUEST LOGIN =================
window.guestLogin = function () {
  signInAnonymously(auth)
    .then(async () => {
      alert("Guest login successful");
      await saveUser(auth.currentUser, "guest");
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error(error);
      alert(error.message || "Guest login failed");
    });
};

// ================= LOGOUT =================
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

// ================= PROFILE PAGE =================
async function loadProfile(user) {
  if (!user) return;
  const docRef = doc(db, "users", user.uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("email").innerText = data.email || "-";
    document.getElementById("phone").innerText = data.phone || "-";
    document.getElementById("uid").innerText = data.uid;
    document.getElementById("type").innerText = data.type;
    document.getElementById("lastLogin").innerText = data.lastLogin || "-";
    if (data.photoURL) {
      document.getElementById("profilePic").src = data.photoURL;
    }
  }
}

// Upload Photo to Cloudinary
window.uploadPhoto = async function () {
  const file = document.getElementById("fileInput")?.files[0];
  if (!file) {
    alert("Please choose a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    const photoURL = data.secure_url;
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      photoURL: photoURL
    }, { merge: true });

    document.getElementById("profilePic").src = photoURL;
    alert("Profile photo updated ✅");
  } catch (err) {
    console.error(err);
    alert("Upload failed ❌");
  }
};

// Listen Auth State
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // अगर profile.html पर हैं और user login नहीं है तो redirect करो
    if (window.location.pathname.includes("profile.html")) {
      window.location.href = "index.html";
    }
    return;
  }
  if (window.location.pathname.includes("profile.html")) {
    loadProfile(user);
  }
});
