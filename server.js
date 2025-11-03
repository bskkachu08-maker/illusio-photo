import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
const app = express();
const PORT = process.env.PORT || 10000;
// ==== 静的ファイル ====
app.use(express.static("newpublic"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ==== Render書き込み対応領域 ====
const uploadDir = path.join("/tmp", "uploads");
const photosJsonPath = path.join("/tmp", "photos.json");
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
// ==== アップロード ====
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
   if (fs.existsSync(photosJsonPath)) {
     photos = JSON.parse(fs.readFileSync(photosJsonPath, "utf8"));
   }
   photos.push({
     color,
     listFile,
     singleFile,
     listUrl: `/uploads/${listFile}`,
     singleUrl: `/uploads/${singleFile}`,
     timestamp: new Date().toISOString(),
   });
   fs.writeFileSync(photosJsonPath, JSON.stringify(photos, null, 2));
   console.log(`✅ パーツアップロード成功: ${listFile}, ${singleFile} (${color})`);
   res.send("✅ パーツアップロード成功 (" + color + ")");
 } catch (error) {
   console.error("❌ パーツ保存エラー:", error);
   res.status(500).send("Server error: could not save photo");
 }
});
// ==== パーツ一覧 ====
app.get("/photos", (req, res) => {
 try {
   if (fs.existsSync(photosJsonPath)) {
     const photos = JSON.parse(fs.readFileSync(photosJsonPath, "utf8"));
     res.json(photos);
   } else {
     res.json([]);
   }
 } catch (error) {
   console.error("❌ /photos 読み込みエラー:", error);
   res.status(500).json([]);
 }
});
// ==== アップロード画像の配信 ====
app.use("/uploads", express.static(uploadDir));
app.listen(PORT, () => {
 console.log(`✨ +ILLuSio running at http://localhost:${PORT}`);
});
