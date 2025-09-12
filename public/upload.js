// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const storage = getStorage(app);

// Upload Function
window.uploadVideo = async function () {
  const file = document.getElementById("videoFile").files[0];
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const statusBox = document.getElementById("status");

  if (!file || !title) {
    statusBox.innerHTML = `<div class="alert alert-warning">⚠️ Select a video and enter title.</div>`;
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      statusBox.innerHTML = `<div class="alert alert-danger">❌ Please login first.</div>`;
      return;
    }

    const storageRef = ref(storage, "videos/" + Date.now() + "_" + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed",
      (snapshot) => {
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        statusBox.innerHTML = `<div class="alert alert-info">⏳ Uploading... ${progress.toFixed(0)}%</div>`;
      },
      (error) => {
        statusBox.innerHTML = `<div class="alert alert-danger">❌ Error: ${error.message}</div>`;
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "videos"), {
          title,
          description,
          url: downloadURL,
          userId: user.uid,
          uploadedAt: serverTimestamp()
        });
        statusBox.innerHTML = `<div class="alert alert-success">✅ Video uploaded successfully!</div>`;
      }
    );
  });
};
