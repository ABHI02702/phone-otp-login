// ===== Recaptcha =====
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
  'size': 'normal'
});
window.recaptchaVerifier.render();

// ===== Phone OTP =====
let confirmationResult;

document.getElementById("sendOtp").onclick = async () => {
  const phone = document.getElementById("phone").value;
  try {
    confirmationResult = await firebase.auth().signInWithPhoneNumber(phone, window.recaptchaVerifier);
    alert("OTP sent to " + phone);
  } catch(e) {
    console.error(e);
    alert("Failed to send OTP: " + e.message);
  }
};

document.getElementById("verifyOtp").onclick = async () => {
  const code = document.getElementById("otp").value;
  try {
    const result = await confirmationResult.confirm(code);
    alert("Phone login success! UID: " + result.user.uid);
  } catch(e) {
    console.error(e);
    alert("Invalid OTP: " + e.message);
  }
};

// ===== Email Login =====
document.getElementById("createAccount").onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(u => alert("Account created! UID: " + u.user.uid))
    .catch(err => alert(err.message));
};

document.getElementById("emailSignIn").onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(u => alert("Email login success! UID: " + u.user.uid))
    .catch(err => alert(err.message));
};

// ===== Google Login =====
document.getElementById("googleSignIn").onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(u => alert("Google login success! UID: " + u.user.uid))
    .catch(err => alert(err.message));
};
