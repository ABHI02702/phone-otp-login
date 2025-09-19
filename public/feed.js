// feed.js - Videos ko Firestore se live fetch karke show karega

function loadFeed() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "Loading...";

  firebase.firestore()
    .collection("videos")
    .orderBy("createdAt", "desc")
    .limit(50)
    .onSnapshot(snapshot => {
      feed.innerHTML = "";
      if (snapshot.empty) {
        feed.innerHTML = "<div>No videos uploaded yet. Be the first!</div>";
        return;
      }

      snapshot.forEach(doc => {
        const d = doc.data();
        const el = document.createElement("div");
        el.className = "feed-item";
        el.innerHTML = `
          <img src="${d.thumbURL || "https://via.placeholder.com/320x180"}" alt="thumb"/>
          <h4>${escapeHtml(d.title)}</h4>
          <small>By ${escapeHtml(d.uploaderName || "Unknown")}</small>
          <video controls src="${d.videoURL}"></video>
        `;
        feed.appendChild(el);
      });
    }, err => {
      console.error("Feed load error", err);
      feed.innerHTML = "<div>Error loading videos</div>";
    });
}

// Helper - prevent XSS
function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
}

// First load
window.addEventListener("load", loadFeed);
