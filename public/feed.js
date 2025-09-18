// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Config
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
const db = getFirestore(app);

async function loadVideos() {
  const feed = document.getElementById("videoFeed");
  feed.innerHTML = `<p>⏳ Loading videos...</p>`;

  const q = query(collection(db, "videos"), orderBy("uploadedAt", "desc"));
  const snapshot = await getDocs(q);

  feed.innerHTML = ""; // clear loading

  if (snapshot.empty) {
    feed.innerHTML = `<div class="alert alert-info">No videos yet.</div>`;
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    const videoCard = `
      <div class="col-md-4">
        <div class="card shadow-sm">
          <video class="card-img-top" controls>
            <source src="${data.url}" type="video/mp4">
          </video>
          <div class="card-body">
            <h5 class="card-title">${data.title}</h5>
            <p class="card-text">${data.description || ""}</p>
            <small class="text-muted">Uploaded by: ${data.userId}</small>
          </div>
        </div>
      </div>
    `;
    feed.innerHTML += videoCard;
  });
}

loadVideos();
