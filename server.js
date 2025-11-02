import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000; // Render対応
// 静的ファイル
app.use(express.static(path.join(__dirname, "public")));
// JSONファイル（存在しなければ空配列を作成）
const photosFile = path.join(__dirname, "photos.json");
if (!fs.existsSync(photosFile)) fs.writeFileSync(photosFile, "[]");
// アップロード先ディレクトリ
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
// multer: 2フィールド（thumb=一覧用, bead=配置用）
const storage = multer.diskStorage({
 destination: (_req, _file, cb) => cb(null, uploadDir),
 filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
// パーツ登録（色 + 2画像）
app.post(
 "/upload",
 upload.fields([
   { name: "thumb", maxCount: 1 },
   { name: "bead", maxCount: 1 }
 ]),
 (req, res) => {
   try {
     const { color } = req.body;
     if (!req.files?.thumb?.[0] || !req.files?.bead?.[0]) {
       return res.status(400).json({ success: false, message: "thumb と bead を送ってください" });
     }
     const thumbPath = `/uploads/${req.files.thumb[0].filename}`;
     const beadPath  = `/uploads/${req.files.bead[0].filename}`;
     const json = JSON.parse(fs.readFileSync(photosFile));
     json.push({ color, thumb: thumbPath, bead: beadPath });
     fs.writeFileSync(photosFile, JSON.stringify(json, null, 2));
     res.json({ success: true });
   } catch (e) {
     console.error(e);
     res.status(500).json({ success: false, message: "upload error" });
   }
 }
);
// JSON提供
app.get("/photos.json", (_req, res) => {
 res.sendFile(photosFile);
});
// ルート
app.get("/", (_req, res) => {
 res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.listen(PORT, () => {
 console.log(`＋ILLuSio running at http://localhost:${PORT}`);
});
