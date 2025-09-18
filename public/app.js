// app.js - Firebase v8 compat + Cloudinary unsigned upload
// REQUIREMENTS BEFORE USE:
// 1) In Cloudinary dashboard create an "unsigned" upload preset (e.g. "yt_unsigned").
// 2) Put that preset name into CLOUDINARY_UPLOAD_PRESET below.
// 3) In Firebase Console -> Authentication enable Phone and Google providers.
// 4) In Firestore rules allow writes to /videos for authenticated users during testing.

const CLOUD_NAME = "dl1wr8zbn";            // your cloud name
const UPLOAD_PRESET = "YT_AKS"; // <<--- replace with your unsigned preset name

// references to DOM
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const phoneInput = document.getElementById("phoneInput");
const otpInput = document.getElementById("otpInput");

const signInGoogleBtn = document.getElementById("signInGoogleBtn");
const emailSignUpBtn = document.getElementById("emailSignUpBtn");
const emailSignInBtn = document.getElementById("emailSignInBtn");
const emailInput = document.getElementById("emailInput");
const pwdInput = document.getElementById("pwdInput");

const uploadSection = document.getElementById("uploadSection");
const uploadBtn = document.getElementById("uploadBtn");
const uploadProgress = document.getElementById("uploadProgress");
const uploadMsg = document.getElementById("uploadMsg");

const feed = document.getElementById("feed");
const navRight = document.getElementById("navRight");

// internal vars
let confirmationResult = null;

// --- Recaptcha render once ---
function renderRecaptcha() {
  if (window.recaptchaWidgetId !== undefined) return;
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  });
  window.recaptchaVerifier.render().then(id => { window.recaptchaWidgetId = id; });
}
renderRecaptcha();

// --- Auth State handling ---
firebase.auth().onAuthStateChanged(user => {
  console.log("auth state changed:", user && user.uid);
  if (user) {
    // show user controls
    navRight.innerHTML = `
      <img src="${user.photoURL || 'https://via.placeholder.com/40'}" alt="pf"/>
      <div>
        <div><strong>${user.displayName || user.phoneNumber || user.email}</strong></div>
        <small id="lastSeen">Last seen: ${new Date().toLocaleString()}</small>
      </div>
      <button id="btnLogout">Logout</button>
    `;
    document.getElementById("btnLogout").onclick = () => firebase.auth().signOut();
    uploadSection.style.display = "block";
    // update last seen in Firestore
    firebase.firestore().collection("users").doc(user.uid).set({
      name: user.displayName || null,
      email: user.email || null,
      phone: user.phoneNumber || null,
      photo: user.photoURL || null,
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } else {
    navRight.innerHTML = `<button id="signInGoogleBtn">Sign in (Google)</button>`;
    document.getElementById("signInGoogleBtn").onclick = googleSignIn;
    uploadSection.style.display = "none";
  }
  // refresh feed
  loadFeed();
});

// --- Google sign-in ---
function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).catch(e => {
    alert("Google sign-in failed: " + e.message);
    console.error(e);
  });
}
document.getElementById("signInGoogleBtn")?.addEventListener("click", googleSignIn);

// --- Email sign up / sign in (optional) ---
emailSignUpBtn?.addEventListener("click", () => {
  const e = emailInput.value.trim(); const p = pwdInput.value;
  if (!e || !p) return alert("Enter email + password");
  firebase.auth().createUserWithEmailAndPassword(e, p).catch(err => alert(err.message));
});
emailSignInBtn?.addEventListener("click", () => {
  const e = emailInput.value.trim(); const p = pwdInput.value;
  if (!e || !p) return alert("Enter email + password");
  firebase.auth().signInWithEmailAndPassword(e, p).catch(err => alert(err.message));
});

// --- Phone login (send OTP) ---
sendOtpBtn.onclick = async () => {
  const phone = phoneInput.value.trim();
  if (!phone) return alert("Enter phone with country code");
  renderRecaptcha();
  try {
    confirmationResult = await firebase.auth().signInWithPhoneNumber(phone, window.recaptchaVerifier);
    alert("OTP sent to " + phone);
  } catch (e) {
    console.error("SMS not sent", e);
    alert("Failed to send OTP: " + e.message);
    // reset recaptcha if needed
    window.recaptchaVerifier.clear && window.recaptchaVerifier.clear();
    renderRecaptcha();
  }
};

// --- verify OTP ---
verifyOtpBtn.onclick = async () => {
  const code = otpInput.value.trim();
  if (!confirmationResult) return alert("Please send OTP first");
  try {
    const res = await confirmationResult.confirm(code);
    console.log("Phone login result", res.user);
    alert("Login success");
  } catch (e) {
    console.error("Invalid OTP", e);
    alert("Invalid OTP: " + e.message);
  }
};

// --- Cloudinary upload helpers ---
async function uploadToCloudinary(file, type = 'video') {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(url, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Cloudinary upload failed: ' + res.statusText);
  const json = await res.json();
  return json.secure_url || json.url;
}

// --- Upload flow ---
uploadBtn.onclick = async () => {
  const videoFile = document.getElementById('videoFile').files[0];
  const thumbFile = document.getElementById('thumbFile').files[0];
  const title = document.getElementById('title').value || "Untitled";
  const desc = document.getElementById('description').value || "";

  if (!videoFile) return alert("Choose a video file");
  if (!thumbFile) return alert("Choose a thumbnail image");
  const user = firebase.auth().currentUser;
  if (!user) return alert("Please login first");

  try {
    uploadProgress.value = 5;
    uploadMsg.innerText = "Uploading video...";
    const videoURL = await uploadToCloudinary(videoFile, 'video');
    uploadProgress.value = 50;
    uploadMsg.innerText = "Uploading thumbnail...";
    const thumbURL = await uploadToCloudinary(thumbFile, 'image');
    uploadProgress.value = 85;

    // Save to Firestore
    await firebase.firestore().collection('videos').add({
      title, desc, videoURL, thumbURL,
      uploaderId: user.uid,
      uploaderName: user.displayName || user.phoneNumber || user.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    uploadProgress.value = 100;
    uploadMsg.innerText = "Upload complete";
    // refresh feed
    loadFeed();
  } catch (e) {
    console.error("Upload error", e);
    alert("Upload failed: " + e.message);
    uploadMsg.innerText = "Upload failed";
  } finally {
    setTimeout(()=>{uploadProgress.value = 0; uploadMsg.innerText='';}, 1500);
  }
};

// --- Load feed (live) ---
function loadFeed() {
  feed.innerHTML = 'Loading...';
  firebase.firestore().collection('videos').orderBy('createdAt','desc').limit(50)
    .onSnapshot(snap => {
      feed.innerHTML = '';
      snap.forEach(doc => {
        const d = doc.data();
        const el = document.createElement('div');
        el.className = 'feed-item';
        el.innerHTML = `
          <img src="${d.thumbURL || 'https://via.placeholder.com/320x180'}" alt="thumb"/>
          <h4>${escapeHtml(d.title)}</h4>
          <small>By ${escapeHtml(d.uploaderName || 'Unknown')}</small>
          <video controls src="${d.videoURL}"></video>
        `;
        feed.appendChild(el);
      });
    }, err=> {
      console.error("Feed load error", err);
      feed.innerHTML = '<div>Error loading feed</div>';
    });
}

// small helper to avoid XSS when rendering titles
function escapeHtml(s){ if(!s) return ''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// initial load
loadFeed();

// ===== Debug helpers =====
console.log("App loaded. Cloudinary preset must be:", CLOUDINARY_UPLOAD_PRESET);
