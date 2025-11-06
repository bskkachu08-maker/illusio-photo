// == server.js ==
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const upload = multer({ dest: "uploads/" });
app.use(express.json());
app.use(express.static("newpublic"));
// --- Cloudinary設定 ---
cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
});
// --- JSONファイル ---
const PHOTOS_JSON = path.join(__dirname, "photos.json");
function readPhotos() {
 try {
   if (!fs.existsSync(PHOTOS_JSON)) return [];
   return JSON.parse(fs.readFileSync(PHOTOS_JSON, "utf-8"));
 } catch {
   return [];
 }
}
function savePhotos(data) {
 fs.writeFileSync(PHOTOS_JSON, JSON.stringify(data, null, 2));
}
// --- 一覧取得 ---
app.get("/photos", (req, res) => {
 res.json(readPhotos());
});
// --- アップロード ---
app.post("/upload", upload.fields([{ name: "listPhoto" }, { name: "singlePhoto" }]), async (req, res) => {
 const { password, color } = req.body;
 if (password !== "Chipi0503") return res.status(403).json({ success: false, message: "Forbidden: incorrect password" });
 const listFile = req.files["listPhoto"]?.[0];
 const singleFile = req.files["singlePhoto"]?.[0];
 if (!listFile || !singleFile) return res.status(400).json({ success: false, message: "ファイルが足りません" });
 const [listResult, singleResult] = await Promise.all([
   cloudinary.uploader.upload(listFile.path, { folder: "illusio_parts", use_filename: true }),
   cloudinary.uploader.upload(singleFile.path, { folder: "illusio_parts", use_filename: true })
 ]);
 const photos = readPhotos();
 photos.push({ listUrl: listResult.secure_url, singleUrl: singleResult.secure_url, color });
 savePhotos(photos);
 res.json({ success: true });
});
// --- 削除 ---
app.post("/delete-photo", async (req, res) => {
 const { password, url } = req.body;
 if (password !== "Chipi0503") return res.status(403).json({ success: false, message: "Forbidden: incorrect password" });
 const photos = readPhotos();
 const newPhotos = photos.filter(p => p.singleUrl !== url);
 savePhotos(newPhotos);
 res.json({ success: true });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
