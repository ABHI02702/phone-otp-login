// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, RecaptchaVerifier, signInWithPhoneNumber,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, getDocs, collection
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---------- Firebase Config ----------
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

// ---------- Cloudinary Config ----------
const CLOUD_NAME = "dl1wr8zbn"; // 👈 Replace with your Cloudinary Cloud Name
const UPLOAD_PRESET = "YT_AKS";       // 👈 Upload preset created

let confirmationResult;

// ---------- Helpers ----------
function showAlert(msg, type="info") {
  const box = document.getElementById("alertBox");
  if(box){
    box.className = `alert alert-${type}`;
    box.innerText = msg;
    box.style.display = "block";
    setTimeout(()=> box.style.display="none", 4000);
  } else {
    console.log(msg);
  }
}

// ---------- Save user ----------
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

// ================= PHONE LOGIN =================
window.sendOTP = function() {
  const phone = document.getElementById("phoneNumber").value.trim();
  if (!phone) return showAlert("Enter phone", "warning");
  window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "normal" });
  signInWithPhoneNumber(auth, phone, window.recaptchaVerifier)
    .then(r => { confirmationResult = r; showAlert("OTP sent!", "success"); })
    .catch(e => showAlert(e.message, "danger"));
};

window.verifyOTP = function() {
  const otp = document.getElementById("otp").value.trim();
  if (!otp || !confirmationResult) return;
  confirmationResult.confirm(otp).then(async cred=>{
    await saveUser(cred.user, "phone");
    window.location="dashboard.html";
  }).catch(e=>showAlert("Invalid OTP","danger"));
};

// ================= EMAIL LOGIN =================
window.register = function() {
  const email=document.getElementById("email").value.trim();
  const pass=document.getElementById("password").value;
  createUserWithEmailAndPassword(auth,email,pass)
    .then(async cred=>{ await saveUser(cred.user,"email"); window.location="dashboard.html"; })
    .catch(e=>showAlert(e.message,"danger"));
};
window.login = function() {
  const email=document.getElementById("email").value.trim();
  const pass=document.getElementById("password").value;
  signInWithEmailAndPassword(auth,email,pass)
    .then(async cred=>{ await saveUser(cred.user,"email"); window.location="dashboard.html"; })
    .catch(e=>showAlert(e.message,"danger"));
};

// ================= GUEST LOGIN =================
window.guestLogin = function(){
  signInAnonymously(auth).then(async cred=>{
    await saveUser(cred.user,"guest");
    window.location="dashboard.html";
  }).catch(e=>showAlert(e.message,"danger"));
};

// ================= LOGOUT =================
window.logout = function(){ signOut(auth).then(()=> window.location="index.html"); };

// ================= AUTH STATE =================
onAuthStateChanged(auth, async user=>{
  if(!user) return;
  const me=document.getElementById("me");
  if(me) me.innerText="Logged in as: "+(user.email||user.phoneNumber||"Guest");
  if(user.uid==="3rY1DMMG4NhqsQWLFbaEbNfXBR62"){ // 👈 Admin UID
    const link=document.getElementById("adminLink");
    if(link) link.style.display="inline-block";
  }
  if(window.location.pathname.endsWith("profile.html")) {
    const snap=await getDoc(doc(db,"users",user.uid));
    if(snap.exists()){
      const d=snap.data();
      document.getElementById("email").innerText=d.email||"N/A";
      document.getElementById("phone").innerText=d.phone||"N/A";
      document.getElementById("uid").innerText=d.uid;
      document.getElementById("type").innerText=d.type;
      document.getElementById("lastLogin").innerText=d.lastLogin;
      if(d.photoURL) document.getElementById("profilePic").src=d.photoURL;
    }
  }
  if(window.location.pathname.endsWith("user.html")) {
    const q=await getDocs(collection(db,"users"));
    const tbody=document.getElementById("userTable");
    q.forEach(docSnap=>{
      const d=docSnap.data();
      tbody.innerHTML+=`<tr><td>${d.email||"-"}</td><td>${d.phone||"-"}</td><td>${d.type}</td><td>${d.lastLogin}</td></tr>`;
    });
  }
});

// ================= PROFILE UPLOAD =================
window.uploadProfilePic = async function(){
  const file=document.getElementById("fileInput").files[0];
  if(!file) return alert("Select a file");
  const formData=new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  const res=await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,{ method:"POST", body:formData });
  const data=await res.json();
  if(data.secure_url){
    const user=auth.currentUser;
    await setDoc(doc(db,"users",user.uid),{ photoURL:data.secure_url },{ merge:true });
    document.getElementById("profilePic").src=data.secure_url;
    alert("Profile updated!");
  }
};
