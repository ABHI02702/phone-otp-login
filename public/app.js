import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Existing Firebase setup (auth + db) remains same
const storage = getStorage(app);

// ================= PROFILE PICTURE UPLOAD =================
window.uploadProfilePic = async function () {
  const fileInput = document.getElementById("profilePicInput");
  if (!fileInput.files.length) {
    alert("Please select an image");
    return;
  }

  const file = fileInput.files[0];
  const user = auth.currentUser;
  if (!user) {
    alert("Not logged in");
    return;
  }

  try {
    // Upload to Firebase Storage
    const storageRef = ref(storage, "profilePics/" + user.uid);
    await uploadBytes(storageRef, file);

    // Get download URL
    const url = await getDownloadURL(storageRef);

    // Save to Firestore
    await setDoc(doc(db, "users", user.uid), { profilePic: url }, { merge: true });

    // Update on screen
    document.getElementById("profilePic").src = url;

    alert("Profile picture updated successfully!");
  } catch (error) {
    console.error(error);
    alert("Error uploading profile picture: " + error.message);
  }
};

// ================= LOAD PROFILE DATA =================
async function loadProfile() {
  const user = auth.currentUser;
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("email").innerText = data.email ?? "-";
    document.getElementById("phone").innerText = data.phone ?? "-";
    document.getElementById("type").innerText = data.type ?? "-";
    document.getElementById("lastLogin").innerText = data.lastLogin ?? "-";
    if (data.profilePic) {
      document.getElementById("profilePic").src = data.profilePic;
    }
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) loadProfile();
  else window.location.href = "index.html";
});
