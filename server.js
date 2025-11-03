import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
const app = express();
const PORT = process.env.PORT || 10000;
// ==== 静的ファイルの設定 ====
app.use(express.static("newpublic"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ==== 保存先の設定 ====
const uploadDir = path.join("/tmp", "uploads"); // Renderで書き込み可能な領域
const photosJsonPath = path.join("/tmp", "photos.json");
// ==== フォルダ作成 ====
if (!fs.existsSync(uploadDir)) {
 fs.mkdirSync(uploadDir, { recursive: true });
 console.log("✅ /tmp/uploads フォルダ作成済み");
}
// ==== Multer設定 ====
const storage = multer.diskStorage({
 destination: (req, file, cb) => cb(null, uploadDir),
 filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });
// ==== 写真アップロードAPI ====
app.post("/upload", upload.fields([{ name: "photoList" }, { name: "photoSingle" }]), (req, res) => {
 const password = req.body.password;
 if (password !== "Chipi0503") {
   return res.status(403).send("Forbidden: incorrect password");
 }
 const color = req.body.color;
 const listFile = req.files["photoList"] ? req.files["photoList"][0].filename : null;
 const singleFile = req.files["photoSingle"] ? req.files["photoSingle"][0].filename : null;
 if (!listFile || !singleFile) {
   return res.status(400).send("Missing file(s)");
 }
 try {
   let photos = [];
   // 既存データを読み込み
   if (fs.existsSync(photosJsonPath)) {
     photos = JSON.parse(fs.readFileSync(photosJsonPath, "utf8"));
   }
   // 新しいパーツを追加
   photos.push({
     color,
     listFile,
     singleFile,
     timestamp: new Date().toISOString(),
   });
   // JSONに保存
   fs.writeFileSync(photosJsonPath, JSON.stringify(photos, null, 2));
   console.log(`✅ パーツアップロード成功: ${listFile}, ${singleFile} (${color})`);
   res.send("✅ パーツアップロード成功 (" + color + ")");
 } catch (error) {
   console.error("❌ パーツ保存エラー:", error);
   res.status(500).send("Server error: could not save photo");
 }
});
// ==== パーツ一覧取得API ====
app.get("/photos", (req, res) => {
 try {
   if (fs.existsSync(photosJsonPath)) {
     const photos = JSON.parse(fs.readFileSync(photosJsonPath, "utf8"));
     // 各ファイルのアクセスURLを付与（Renderで静的配信されるように）
     const publicPhotos = photos.map(p => ({
       ...p,
       listUrl: `/uploads/${p.listFile}`,
       singleUrl: `/uploads/${p.singleFile}`,
     }));
     res.json(publicPhotos);
   } else {
     res.json([]);
   }
 } catch (error) {
   console.error("❌ /photos 読み込みエラー:", error);
   res.status(500).json([]);
 }
});
// ==== /tmp/uploads を静的配信可能にする ====
app.use("/uploads", express.static(uploadDir));
// ==== サーバー起動 ====
app.listen(PORT, () => {
 console.log(`✨ +ILLuSio running at http://localhost:${PORT}`);
 console.log("Your Render service is live 🚀");
});
