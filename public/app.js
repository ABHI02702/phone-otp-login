// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, RecaptchaVerifier, signInWithPhoneNumber,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const ADMIN_UID = "3rY1DMMG4NhqsQWLFbaEbNfXBR62";

function showAlert(msg, type="info") {
  const box = document.getElementById("alertBox");
  if (box) {
    box.style.display = "block";
    box.className = `alert alert-${type}`;
    box.innerText = msg;
    setTimeout(()=>box.style.display="none",4000);
  }
}
function showSpinner(show=true){
  const s=document.getElementById("spinner");
  if(s) s.style.display=show?"block":"none";
}

// Save user
async function saveUser(user, type){
  if(!user) return;
  await setDoc(doc(db,"users",user.uid),{
    uid:user.uid,email:user.email||null,phone:user.phoneNumber||null,
    type:type,lastLogin:new Date().toISOString()
  },{merge:true});
}

// Phone OTP
window.sendOTP=()=>{
  const raw=document.getElementById("phoneNumber").value.trim();
  if(!raw) return showAlert("Enter phone number","warning");
  const phone=raw.length===10?"+91"+raw:raw;
  window.recaptchaVerifier=new RecaptchaVerifier(auth,"recaptcha-container",{size:"normal"});
  signInWithPhoneNumber(auth,phone,window.recaptchaVerifier)
    .then(res=>{window.confirmationResult=res;showAlert("OTP sent","success");})
    .catch(e=>showAlert(e.message,"danger"));
};
window.verifyOTP=()=>{
  const otp=document.getElementById("otp").value.trim();
  if(!otp) return showAlert("Enter OTP","warning");
  window.confirmationResult.confirm(otp).then(async()=>{
    await saveUser(auth.currentUser,"phone");
    window.location.href="dashboard.html";
  }).catch(()=>showAlert("Invalid OTP","danger"));
};

// Email register/login
window.register=()=>{
  const e=document.getElementById("email").value.trim();
  const p=document.getElementById("password").value;
  createUserWithEmailAndPassword(auth,e,p).then(async()=>{
    await saveUser(auth.currentUser,"email");window.location.href="dashboard.html";
  }).catch(er=>showAlert(er.message,"danger"));
};
window.login=()=>{
  const e=document.getElementById("email").value.trim();
  const p=document.getElementById("password").value;
  signInWithEmailAndPassword(auth,e,p).then(async()=>{
    await saveUser(auth.currentUser,"email");window.location.href="dashboard.html";
  }).catch(er=>showAlert(er.message,"danger"));
};

// Guest
window.guestLogin=()=>{
  signInAnonymously(auth).then(async()=>{
    await saveUser(auth.currentUser,"guest");window.location.href="dashboard.html";
  }).catch(er=>showAlert(er.message,"danger"));
};

// Logout
window.logout=()=>{signOut(auth).then(()=>window.location.href="index.html");};

// Auth state
onAuthStateChanged(auth,(user)=>{
  if(window.location.pathname.endsWith("dashboard.html")){
    if(!user) return window.location.href="index.html";
    document.getElementById("me").innerText="Logged in as: "+(user.email||user.phoneNumber||"Guest");
    if(user.uid===ADMIN_UID) document.getElementById("adminLink").style.display="inline-block";
  }
  if(window.location.pathname.endsWith("profile.html")&&user){
    getDoc(doc(db,"users",user.uid)).then(d=>{
      if(d.exists()){
        const u=d.data();
        document.getElementById("uid").innerText=u.uid;
        document.getElementById("email").innerText=u.email||"-";
        document.getElementById("phone").innerText=u.phone||"-";
        document.getElementById("type").innerText=u.type;
        document.getElementById("lastLogin").innerText=u.lastLogin;
      }
    });
  }
  if(window.location.pathname.endsWith("user.html")){
    if(!user) return window.location.href="index.html";
    if(user.uid!==ADMIN_UID) return document.body.innerHTML="<div class='container mt-5'><div class='alert alert-danger'>Access Denied</div></div>";
    getDocs(collection(db,"users")).then(s=>{
      const tbody=document.getElementById("usersTable");
      s.forEach(doc=>{
        const d=doc.data();
        tbody.innerHTML+=`<tr><td>${d.uid}</td><td>${d.email||"-"}</td><td>${d.phone||"-"}</td><td>${d.type}</td><td>${d.lastLogin}</td></tr>`;
      });
    });
  }
});