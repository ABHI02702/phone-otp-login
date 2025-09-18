// ==== AUTH FUNCTIONS ====
function register() {
  let email = document.getElementById("registerEmail").value;
  let pass = document.getElementById("registerPassword").value;
  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Registered Successfully!"))
    .catch(err => alert(err.message));
}

function login() {
  let email = document.getElementById("loginEmail").value;
  let pass = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => window.location.href = "feed.html")
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// ==== CLOUDINARY UPLOAD ====
const cloudName = "dl1wr8zbn"; 
const uploadPreset = "ml_default"; // Cloudinary preset set karna hoga

function uploadVideo() {
  const file = document.getElementById("videoFile").files[0];
  const title = document.getElementById("videoTitle").value;
  if (!file) return alert("Please select a file");

  document.getElementById("uploadStatus").innerText = "Uploading...";

  let formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      localStorage.setItem("videoTitle", title);
      localStorage.setItem("videoUrl", data.secure_url);
      alert("Uploaded Successfully!");
      window.location.href = "feed.html";
    })
    .catch(err => alert(err.message));
}

// ==== FEED DISPLAY ====
if (document.getElementById("videoFeed")) {
  let videoUrl = localStorage.getItem("videoUrl");
  let title = localStorage.getItem("videoTitle");
  if (videoUrl) {
    document.getElementById("videoFeed").innerHTML += `
      <div class="card">
        <video src="${videoUrl}" controls></video>
        <h4>${title}</h4>
        <a href="watch.html" onclick="localStorage.setItem('watchUrl','${videoUrl}'); localStorage.setItem('watchTitle','${title}');">Watch</a>
      </div>
    `;
  }
}

// ==== WATCH PAGE ====
if (document.getElementById("watchContainer")) {
  document.getElementById("videoTitle").innerText = localStorage.getItem("watchTitle");
  document.getElementById("videoPlayer").src = localStorage.getItem("watchUrl");
}

// ==== PROFILE ====
if (document.getElementById("userEmail")) {
  auth.onAuthStateChanged(user => {
    if (user) {
      document.getElementById("userEmail").innerText = "Email: " + user.email;
      document.getElementById("lastSeen").innerText = "Last seen: " + new Date().toLocaleString();
    }
  });
}
