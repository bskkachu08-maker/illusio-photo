const canvas = document.getElementById("necklaceCanvas");
const ctx = canvas.getContext("2d");
const saveBtn = document.getElementById("saveBtn");
const partsBtn = document.getElementById("partsBtn");
const partsPanel = document.getElementById("partsPanel");
const uploadParts = document.getElementById("uploadParts");
const partsList = document.getElementById("partsList");
canvas.width = 400;
canvas.height = 400;
function drawNecklace() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);
 ctx.beginPath();
 ctx.arc(200, 200, 150, 0, Math.PI * 2);
 ctx.strokeStyle = "silver";
 ctx.lineWidth = 3;
 ctx.stroke();
}
drawNecklace();
// パーツ一覧ボタン
partsBtn.addEventListener("click", () => {
 partsPanel.classList.toggle("active");
});
// パーツアップロード
uploadParts.addEventListener("change", (e) => {
 const files = e.target.files;
 for (const file of files) {
   const img = document.createElement("img");
   img.src = URL.createObjectURL(file);
   partsList.appendChild(img);
 }
});
// 保存
saveBtn.addEventListener("click", () => {
 const link = document.createElement("a");
 link.download = "necklace.png";
 link.href = canvas.toDataURL("image/png");
 link.click();
});

