const canvas = document.getElementById("necklaceCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 420;
canvas.height = 420;
function drawNecklace() {
 ctx.clearRect(0, 0, 420, 420);
 ctx.beginPath();
 ctx.arc(210, 210, 190, 0, Math.PI * 2);
 ctx.strokeStyle = "silver";
 ctx.lineWidth = 3;
 ctx.stroke();
}
drawNecklace();
// ボタン
document.getElementById("adminBtn").onclick = () => (window.location.href = "admin.html");
const partsPanel = document.getElementById("partsPanel");
document.getElementById("showParts").onclick = () => partsPanel.classList.add("open");
document.getElementById("closePanel").onclick = () => partsPanel.classList.remove("open");
// パーツ一覧読み込み
async function loadParts() {
 const res = await fetch("/photos.json");
 const parts = await res.json();
 const list = document.getElementById("partsList");
 list.innerHTML = "";
 parts.forEach(p => {
   const img = document.createElement("img");
   img.src = p.thumb;
   img.onclick = () => {
     const bead = document.createElement("img");
     bead.src = p.bead;
     bead.className = "part";
     bead.style.left = "180px";
     bead.style.top = "180px";
     document.getElementById("necklace-area").appendChild(bead);
     makeDraggable(bead);
   };
   list.appendChild(img);
 });
}
loadParts();
// ドラッグ機能
function makeDraggable(el) {
 let isDown = false, offsetX, offsetY;
 el.addEventListener("mousedown", e => {
   isDown = true;
   offsetX = e.offsetX;
   offsetY = e.offsetY;
 });
 window.addEventListener("mousemove", e => {
   if (!isDown) return;
   el.style.left = e.pageX - canvas.offsetLeft - offsetX + "px";
   el.style.top = e.pageY - canvas.offsetTop - offsetY + "px";
 });
 window.addEventListener("mouseup", () => (isDown = false));
}
// 保存
document.getElementById("saveNecklace").onclick = async () => {
 const area = document.getElementById("necklace-area");
 const img = await html2canvas(area, { backgroundColor: "#fff" });
 const link = document.createElement("a");
 link.href = img.toDataURL("image/png");
 link.download = "necklace.png";
 link.click();
};
