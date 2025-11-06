const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
app.use(express.static("newpublic"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const DATA_FILE = path.join(__dirname, "photos.json");
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
// ==== Multer (アップロード設定) ====
const storage = multer.diskStorage({
 destination: (req, file, cb) => cb(null, "newpublic/uploads"),
 filename: (req, file, cb) => {
   const ext = path.extname(file.originalname);
   const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
   cb(null, unique + ext);
 }
});
const upload = multer({ storage });
// ==== パーツ一覧を返す ====
app.get("/photos", (req, res) => {
 if (!fs.existsSync(DATA_FILE)) return res.json([]);
 const json = fs.readFileSync(DATA_FILE, "utf8");
 res.json(JSON.parse(json));
});
// ==== アップロード ====
app.post("/upload", upload.fields([{ name: "listPhoto" }, { name: "singlePhoto" }]), (req, res) => {
 const pass = req.body.password;
 if (pass !== "Chipi0503") return res.json({ success: false, message: "wrong password" });
 const { color } = req.body;
 const listFile = req.files.listPhoto?.[0];
 const singleFile = req.files.singlePhoto?.[0];
 if (!listFile || !singleFile) return res.json({ success: false, message: "missing file" });
 const record = {
   id: Date.now(),
   color,
   listUrl: `/uploads/${listFile.filename}`,
   singleUrl: `/uploads/${singleFile.filename}`
 };
 const arr = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
 arr.push(record);
 fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
 res.json({ success: true });
});
// ==== パーツ削除 ====
app.post("/delete", (req, res) => {
 const pass = req.body.password;
 if (pass !== "Chipi0503") return res.json({ success: false, message: "wrong password" });
 const id = Number(req.body.id);
 let arr = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
 arr = arr.filter(p => p.id !== id);
 fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
 res.json({ success: true });
});
app.get("/", (req, res) => {
 res.sendFile(path.join(__dirname, "newpublic", "index.html"));
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`＋ILLuSio running on port ${PORT}`));
