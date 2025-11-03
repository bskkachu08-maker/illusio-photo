// ===== server.js =====
import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
const app = express();
const PORT = process.env.PORT || 10000;
// ==== 静的フォルダ設定 ====
app.use(express.static("newpublic"));
app.use(express.json());
// ==== アップロード先設定 ====
const uploadDir = path.join(process.cwd(), "newpublic", "uploads");
// Render環境でも確実にフォルダを作成
try {
 if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
   console.log("✅ uploadsフォルダ作成:", uploadDir);
 }
} catch (err) {
 console.error("❌ uploadsフォルダ作成失敗:", err);
}
const storage = multer.diskStorage({
 destination: function (req, file, cb) {
   cb(null, uploadDir);
 },
 filename: function (req, file, cb) {
   cb(null, Date.now() + "-" + file.originalname);
 },
});
const upload = multer({ storage });
// ==== photos.json の場所 ====
const photosPath = path.join(process.cwd(), "photos.json");
// ==== 写真アップロードAPI ====
app.post("/upload", upload.single("photo"), (req, res) => {
 const password = req.body.password;
 if (password !== "Chipi053") {
   return res.status(403).send("Forbidden: incorrect password");
 }
 const color = req.body.color;
 const filename = req.file.filename;
 let photos = [];
 try {
   if (fs.existsSync(photosPath)) {
     photos = JSON.parse(fs.readFileSync(photosPath, "utf8"));
   }
   photos.push({ color, filename });
   fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2));
   console.log(`✅ 写真アップロード成功: ${filename} (${color})`);
   res.send("✅ 1枚アップロード成功 (" + color + ")");
 } catch (error) {
   console.error("❌ 写真保存エラー:", error);
   res.status(500).send("Server error: could not save photo");
 }
});
// ==== 写真一覧API ====
app.get("/photos", (req, res) => {
 try {
   if (fs.existsSync(photosPath)) {
     const photos = JSON.parse(fs.readFileSync(photosPath, "utf8"));
     res.json(photos);
   } else {
     res.json([]);
   }
 } catch (error) {
   console.error("❌ /photos 読み込みエラー:", error);
   res.status(500).json([]);
 }
});
// ==== サーバー起動 ====
app.listen(PORT, () => {
 console.log(`+ILLuSio running at http://localhost:${PORT}`);
 console.log(`Your service is live ✨`);
});
