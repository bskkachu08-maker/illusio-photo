import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.static("newpublic"));
app.use(express.json());
// ✅ Renderで書き込み可能な場所
const uploadDir = path.join("/tmp", "uploads");
const photosPath = path.join("/tmp", "photos.json");
// フォルダ作成
try {
 if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
   console.log("✅ /tmp/uploads フォルダ作成完了");
 }
} catch (err) {
 console.error("❌ uploadsフォルダ作成失敗:", err);
}
// multer設定（複数ファイル対応）
const storage = multer.diskStorage({
 destination: (req, file, cb) => cb(null, uploadDir),
 filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });
// ==== 2枚同時アップロード ====
app.post("/upload", upload.fields([{ name: "photoList" }, { name: "photoSingle" }]), (req, res) => {
 const password = req.body.password;
 if (password !== "Chipi053") {
   return res.status(403).send("Forbidden: incorrect password");
 }
 const color = req.body.color;
 const listFile = req.files["photoList"] ? req.files["photoList"][0].filename : null;
 const singleFile = req.files["photoSingle"] ? req.files["photoSingle"][0].filename : null;
 if (!listFile || !singleFile) {
   return res.status(400).send("Missing file(s)");
 }
 let photos = [];
 try {
   if (fs.existsSync(photosPath)) {
     photos = JSON.parse(fs.readFileSync(photosPath, "utf8"));
   }
   photos.push({
     color,
     listFile,
     singleFile,
   });
   fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2));
   console.log(`✅ パーツアップロード成功: ${listFile}, ${singleFile} (${color})`);
   res.send("✅ パーツアップロード成功 (" + color + ")");
 } catch (error) {
   console.error("❌ パーツ保存エラー:", error);
   res.status(500).send("Server error: could not save photo");
 }
});
// ==== 一覧取得 ====
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
