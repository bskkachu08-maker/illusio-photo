import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;
// 静的ファイル
app.use(express.static(path.join(__dirname, "public")));
// JSONファイル読み書き
const photosFile = path.join(__dirname, "photos.json");
// multer設定（画像保存先）
const storage = multer.diskStorage({
 destination: function (req, file, cb) {
   const uploadPath = path.join(__dirname, "public", "uploads");
   if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
   cb(null, uploadPath);
 },
 filename: function (req, file, cb) {
   cb(null, Date.now() + path.extname(file.originalname));
 }
});
const upload = multer({ storage });
// アップロード処理
app.post("/upload", upload.single("photo"), (req, res) => {
 const { color } = req.body;
 const photoPath = `/uploads/${req.file.filename}`;
 let photos = [];
 if (fs.existsSync(photosFile)) {
   photos = JSON.parse(fs.readFileSync(photosFile));
 }
 photos.push({ color, url: photoPath });
 fs.writeFileSync(photosFile, JSON.stringify(photos, null, 2));
 res.json({ success: true });
});
// JSONを提供
app.get("/photos.json", (req, res) => {
 if (!fs.existsSync(photosFile)) fs.writeFileSync(photosFile, "[]");
 res.sendFile(photosFile);
});
// サーバ起動
app.listen(PORT, () => {
 console.log(`+ILLuSio running at http://localhost:${PORT}`);
 console.log(`Your service is live 🎉`);
});
