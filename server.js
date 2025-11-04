// server.js
import express from "express";
import multer from "multer";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
const app = express();
const upload = multer({ dest: "uploads/" });
// 静的ファイル配信（HTML, CSS, JS）
app.use(express.static("newpublic"));
app.use(express.json());
// ===== Cloudinary 設定 =====
cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
});
// ===== メモリ上に保持するデータ =====
let photos = [];
// ===== アップロード処理 =====
app.post("/upload", upload.fields([{ name: "listPhoto" }, { name: "singlePhoto" }]), async (req, res) => {
 try {
   const { color, password } = req.body;
   if (password !== "Chipi0503") {
     return res.status(403).json({ success: false, message: "Forbidden: incorrect password" });
   }
   const listFile = req.files["listPhoto"]?.[0];
   const singleFile = req.files["singlePhoto"]?.[0];
   if (!listFile || !singleFile) {
     return res.status(400).json({ success: false, message: "ファイルが足りません" });
   }
   // Cloudinaryへアップロード
   const [listResult, singleResult] = await Promise.all([
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
   // 一時ファイル削除
   fs.unlinkSync(listFile.path);
   fs.unlinkSync(singleFile.path);
   // データを保存
   const photoData = {
     color,
     listUrl: listResult.secure_url,
     singleUrl: singleResult.secure_url,
   };
   photos.push(photoData);
   console.log("✅ New part uploaded:", photoData);
   res.json({ success: true, photo: photoData });
 } catch (err) {
   console.error("❌ Upload error:", err);
   res.status(500).json({ success: false, message: "アップロード失敗" });
 }
});
// ===== パーツ一覧取得 =====
app.get("/photos", (req, res) => {
 res.json(photos);
});
// ===== Render用ポート =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
