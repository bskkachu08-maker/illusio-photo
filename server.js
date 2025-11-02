// ===== server.js =====
import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
const app = express();
const PORT = process.env.PORT || 10000;
// ---- newpublic をルートに設定 ----
app.use(express.static("newpublic"));
app.use(express.json());
// ---- 写真保存フォルダ設定 ----
const uploadDir = path.join(process.cwd(), "newpublic", "uploads");
if (!fs.existsSync(uploadDir)) {
 fs.mkdirSync(uploadDir, { recursive: true });
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
// ---- photos.json のパス ----
const photosPath = path.join(process.cwd(), "photos.json");
// ---- 写真アップロードAPI ----
app.post("/upload", upload.single("photo"), (req, res) => {
 const password = req.body.password;
 if (password !== "Chipi053") {
   return res.status(403).send("Forbidden: incorrect password");
 }
 const color = req.body.color;
 const filename = req.file.filename;
 let photos = [];
 if (fs.existsSync(photosPath)) {
   photos = JSON.parse(fs.readFileSync(photosPath, "utf8"));
 }
 photos.push({ color, filename });
 fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2));
 res.send("✅ 1枚アップロード成功 (" + color + ")");
});
// ---- 写真一覧を返すAPI ----
app.get("/photos", (req, res) => {
 if (fs.existsSync(photosPath)) {
   const photos = JSON.parse(fs.readFileSync(photosPath, "utf8"));
   res.json(photos);
 } else {
   res.json([]);
 }
});
// ---- サーバー起動 ----
app.listen(PORT, () => {
 console.log(`+ILLuSio running at http://localhost:${PORT}`);
 console.log(`Your service is live ✨`);
});
