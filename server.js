// === server.js ===
// Render + Cloudinary + Delete機能完全版
import express from "express";
import multer from "multer";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const upload = multer({ dest: "uploads/" });
app.use(express.json());
app.use(express.static("public"));
// --- Cloudinary設定 ---
cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
});
// --- JSONファイルパス ---
const PHOTOS_JSON = path.join(__dirname, "photos.json");
// --- JSON操作 ---
function readPhotos() {
 if (!fs.existsSync(PHOTOS_JSON)) return [];
 try {
   return JSON.parse(fs.readFileSync(PHOTOS_JSON, "utf-8"));
 } catch {
   return [];
 }
}
function savePhotos(data) {
 fs.writeFileSync(PHOTOS_JSON, JSON.stringify(data, null, 2));
}
// === 一覧取得 ===
app.get("/photos", (req, res) => {
 res.json(readPhotos());
});
// === アップロード ===
app.post(
 "/upload",
 upload.fields([{ name: "listPhoto" }, { name: "singlePhoto" }]),
 async (req, res) => {
   const { password, color } = req.body;
   if (password !== "Chipi0503")
     return res.status(403).json({ success: false, message: "Forbidden: incorrect password" });
   const listFile = req.files["listPhoto"]?.[0];
   const singleFile = req.files["singlePhoto"]?.[0];
   if (!listFile || !singleFile)
     return res.status(400).json({ success: false, message: "ファイルが足りません" });
   try {
     const [listUpload, singleUpload] = await Promise.all([
       cloudinary.uploader.upload(listFile.path, { folder: "illusio_parts/list" }),
       cloudinary.uploader.upload(singleFile.path, { folder: "illusio_parts/single" }),
     ]);
     const photos = readPhotos();
     photos.push({
       color: color || "その他",
       listUrl: listUpload.secure_url,
       singleUrl: singleUpload.secure_url,
     });
     savePhotos(photos);
     fs.unlinkSync(listFile.path);
     fs.unlinkSync(singleFile.path);
     res.json({ success: true });
   } catch (e) {
     console.error(e);
     res.status(500).json({ success: false, message: e.message });
   }
 }
);
// === 削除 ===
app.post("/delete-photo", (req, res) => {
 const { password, url } = req.body;
 if (password !== "Chipi0503")
   return res.status(403).json({ success: false, message: "Forbidden: incorrect password" });
 const newList = readPhotos().filter((p) => p.singleUrl !== url);
 savePhotos(newList);
 res.json({ success: true });
});
// --- Render用ポート ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
