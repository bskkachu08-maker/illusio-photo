// === server.js ===
import express from "express";
import multer from "multer";
import * as fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import path from "node:path";
import { fileURLToPath } from "node:url";
// ES Module 環境では __dirname をこう作る
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Express基本設定 ---
const app = express();
const upload = multer({ dest: "uploads/" });
app.use(express.json());
app.use(express.static("newpublic"));
// --- Cloudinary設定（RenderのEnvironmentに登録したキーを使う）---
cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
});
// --- JSONファイルに保存するパス ---
const PHOTOS_JSON = path.join(__dirname, "photos.json");
// === ユーティリティ ===
function readPhotos() {
 if (!fs.existsSync(PHOTOS_JSON)) return [];
 const data = fs.readFileSync(PHOTOS_JSON, "utf-8");
 try {
   return JSON.parse(data);
 } catch {
   return [];
 }
}
function savePhotos(arr) {
 fs.writeFileSync(PHOTOS_JSON, JSON.stringify(arr, null, 2));
}
// === パーツ一覧取得 ===
app.get("/photos", (req, res) => {
 const photos = readPhotos();
 res.json(photos);
});
// === パーツ削除（管理者パスワード必要）===
app.post("/delete-photo", express.json(), (req, res) => {
 const { password, url } = req.body;
 if (password !== "Chipi0503") {
   return res
     .status(403)
     .json({ success: false, message: "Forbidden: incorrect password" });
 }
 const photos = readPhotos();
 const newList = photos.filter((p) => p.singleUrl !== url);
 savePhotos(newList);
 res.json({ success: true });
});
// === パーツ追加（Cloudinaryアップロード）===
app.post(
 "/upload",
 upload.fields([{ name: "listPhoto" }, { name: "singlePhoto" }]),
 async (req, res) => {
   const { password, color } = req.body;
   if (password !== "Chipi0503") {
     return res
       .status(403)
       .json({ success: false, message: "Forbidden: incorrect password" });
   }
   const listFile = req.files["listPhoto"]?.[0];
   const singleFile = req.files["singlePhoto"]?.[0];
   if (!listFile || !singleFile) {
     return res
       .status(400)
       .json({ success: false, message: "ファイルが足りません。" });
   }
   try {
     // Cloudinaryへアップロード
     const [listUpload, singleUpload] = await Promise.all([
       cloudinary.uploader.upload(listFile.path, {
         folder: "illusio_parts/list",
         use_filename: true,
         unique_filename: false,
       }),
       cloudinary.uploader.upload(singleFile.path, {
         folder: "illusio_parts/single",
         use_filename: true,
         unique_filename: false,
       }),
     ]);
     // 既存データに追加
     const photos = readPhotos();
     photos.push({
       color: color || "その他",
       listUrl: listUpload.secure_url,
       singleUrl: singleUpload.secure_url,
     });
     savePhotos(photos);
     // 一時ファイル削除
     fs.unlinkSync(listFile.path);
     fs.unlinkSync(singleFile.path);
     res.json({ success: true, message: "アップロード成功！" });
   } catch (err) {
     console.error("Upload Error:", err);
     res.status(500).json({ success: false, message: err.message });
   }
 }
);
// === Render用のポート設定 ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
