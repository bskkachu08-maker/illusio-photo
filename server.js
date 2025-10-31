
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Password for admin upload
const ADMIN_PASSWORD = "Chipi0503";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Colors (order fixed)
const COLOR_ORDER = [
  "赤","ピンク","青","緑","白","紫","ターコイズ","透明","金色","シルバー","黒","その他"
];

// Photos JSON path
const photosJsonPath = path.join(__dirname, "photos.json");

// Initialize JSON if missing
if (!fs.existsSync(photosJsonPath)) {
  const init = COLOR_ORDER.map(c => ({ color: c, items: [] }));
  fs.writeFileSync(photosJsonPath, JSON.stringify(init, null, 2), "utf-8");
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = Date.now() + "_" + file.originalname.replace(/[^\w.\-]/g, "_");
    cb(null, safe);
  }
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static
app.use("/uploads", express.static(uploadDir));
app.use("/", express.static(path.join(__dirname, "public")));

// Helper to load/save photos JSON
function loadPhotos() {
  try {
    const txt = fs.readFileSync(photosJsonPath, "utf-8");
    return JSON.parse(txt);
  } catch (e) {
    return COLOR_ORDER.map(c => ({ color: c, items: [] }));
  }
}
function savePhotos(data) {
  fs.writeFileSync(photosJsonPath, JSON.stringify(data, null, 2), "utf-8");
}

// Upload endpoint (admin-only)
app.post("/upload", upload.array("photos"), (req, res) => {
  const auth = req.headers.authorization || "";
  if (auth !== "Bearer " + ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Forbidden: incorrect password" });
  }
  const selectedColor = req.body.color;
  if (!COLOR_ORDER.includes(selectedColor)) {
    return res.status(400).json({ error: "Invalid color" });
  }
  const files = (req.files || []).map(f => "/uploads/" + f.filename);
  const data = loadPhotos();
  const idx = data.findIndex(x => x.color === selectedColor);
  if (idx >= 0) {
    data[idx].items.push(...files);
  } else {
    data.push({ color: selectedColor, items: files });
  }
  // Sort by our fixed color order
  data.sort((a, b) => COLOR_ORDER.indexOf(a.color) - COLOR_ORDER.indexOf(b.color));
  savePhotos(data);
  res.json({ success: true, added: files.length, color: selectedColor, files });
});

// Get photos grouped by color
app.get("/photos", (_req, res) => {
  const data = loadPhotos();
  // Only existing items; respect order
  const ordered = COLOR_ORDER.map(c => data.find(x => x.color == c) || { color: c, items: [] });
  res.json(ordered);
});

app.listen(PORT, () => {
  console.log(`+ILLuSio running at http://localhost:${PORT}`);
});
