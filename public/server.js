const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Storage for uploaded videos
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use(express.static(__dirname));
app.use("/uploads", express.static("uploads"));

// Upload Route
app.post("/upload", upload.single("video"), (req, res) => {
  res.json({ message: "Uploaded!" });
});

// Fetch all videos
app.get("/videos", (req, res) => {
  if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
  const files = fs.readdirSync("uploads").map(f => ({
    name: f,
    path: "/uploads/" + f
  }));
  res.json(files);
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
