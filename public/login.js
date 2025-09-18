// ==== Firebase Config ====
const firebaseConfig = {
  apiKey: "AIzaSyA-q3jwEpQDWpVuud0eA87CpUdEQj9FUtA",
  authDomain: "aks-otp-login.firebaseapp.com",
  projectId: "aks-otp-login",
  storageBucket: "aks-otp-login.appspot.com",   // 🔥 FIXED
  messagingSenderId: "702413960260",
  appId: "1:702413960260:web:159aa8f516171d618df811",
  measurementId: "G-5Q19TWRBG0"
};
firebase.initializeApp(firebaseConfig);

// ==== Phone OTP Login ====
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
  size: 'normal',
  callback: function(response) {
    console.log("Recaptcha solved");
  }
});

function sendOTP() {
  const phoneNumber = document.getElementById("phone").value;
  const appVerifier = window.recaptchaVerifier;
  firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
    .then(confirmationResult => {
      window.confirmationResult = confirmationResult;
      alert("OTP sent!");
    })
    .catch(error => {
      console.error(error);
      alert(error.message);
    });
}

function verifyOTP() {
  const code = document.getElementById("otp").value;
  window.confirmationResult.confirm(code).then(result => {
    alert("Phone login successful!");
    window.location.replace("home.html");
  }).catch(error => {
    alert("Invalid OTP");
  });
}

// ==== Email Login/Register ====
function emailLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Email login successful!");
      window.location.replace("home.html");
    })
    .catch(error => alert(error.message));
}

function emailRegister() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Registration successful!");
      window.location.replace("home.html");
    })
    .catch(error => alert(error.message));
}

// ==== Google Login ====
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => {
      alert("Google login successful!");
      window.location.replace("home.html");
    })
    .catch(error => alert(error.message));
}

// ==== GitHub Login ====
function githubLogin() {
  const provider = new firebase.auth.GithubAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => {
      alert("GitHub login successful!");
      window.location.replace("home.html");
    })
    .catch(error => alert(error.message));
}

// ==== Auth State Change (Fix Auto Loop) ====
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("User logged in:", user.phoneNumber || user.email || user.displayName);
  } else {
    console.log("No user logged in");
  }
});
