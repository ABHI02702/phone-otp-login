// scripts.js - General UI helpers

// Search filter
document.getElementById("searchInput")?.addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const items = document.querySelectorAll(".feed-item");
  items.forEach(item => {
    const title = item.querySelector("h4").innerText.toLowerCase();
    item.style.display = title.includes(query) ? "block" : "none";
  });
});

// Simple toast (notifications)
function showToast(msg) {
  let t = document.createElement("div");
  t.className = "toast";
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
