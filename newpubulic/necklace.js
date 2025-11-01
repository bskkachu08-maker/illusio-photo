// === 右側にアップロード済みパーツを表示 ===
async function loadParts() {
 const res = await fetch("/photos");
 const data = await res.json();
 const partsDiv = document.getElementById("parts");
 partsDiv.innerHTML = "";
 data.forEach(group => {
   group.items.forEach(imgPath => {
     const img = document.createElement("img");
     img.src = imgPath;
     img.draggable = true;
     img.addEventListener("dragstart", dragStart);
     partsDiv.appendChild(img);
   });
 });
}
loadParts();
// === ドラッグ処理 ===
let draggedSrc = null;
function dragStart(e) {
 draggedSrc = e.target.src;
}
const dropZone = document.getElementById("drop-zone");
dropZone.addEventListener("dragover", e => e.preventDefault());
dropZone.addEventListener("drop", e => {
 e.preventDefault();
 if (!draggedSrc) return;
 const rect = dropZone.getBoundingClientRect();
 const x = e.clientX - rect.left - 40;
 const y = e.clientY - rect.top - 40;
 const img = document.createElement("img");
 img.src = draggedSrc;
 img.className = "draggable";
 img.style.left = `${x}px`;
 img.style.top = `${y}px`;
 makeDraggable(img);
 dropZone.appendChild(img);
});
// === 配置後もドラッグできるように ===
function makeDraggable(el) {
 let offsetX, offsetY, isDragging = false;
 el.addEventListener("mousedown", e => {
   isDragging = true;
   offsetX = e.offsetX;
   offsetY = e.offsetY;
 });
 window.addEventListener("mousemove", e => {
   if (!isDragging) return;
   el.style.left = `${e.clientX - dropZone.offsetLeft - offsetX}px`;
   el.style.top = `${e.clientY - dropZone.offsetTop - offsetY}px`;
 });
 window.addEventListener("mouseup", () => isDragging = false);
}
// === 保存機能 ===
document.getElementById("save-btn").addEventListener("click", () => {
 const canvas = document.createElement("canvas");
 canvas.width = 500;
 canvas.height = 500;
 const ctx = canvas.getContext("2d");
 // 背景を白に
 ctx.fillStyle = "#fff";
 ctx.fillRect(0, 0, 500, 500);
 // 円（ワイヤー）を描画
 ctx.beginPath();
 ctx.arc(250, 250, 240, 0, Math.PI * 2);
 ctx.strokeStyle = "#aaa";
 ctx.lineWidth = 3;
 ctx.stroke();
 // 配置された画像を描画
 const imgs = dropZone.querySelectorAll(".draggable");
 let loaded = 0;
 imgs.forEach(img => {
   const image = new Image();
   image.src = img.src;
   image.onload = () => {
     ctx.drawImage(image, parseFloat(img.style.left), parseFloat(img.style.top), 80, 80);
     loaded++;
     if (loaded === imgs.length) saveCanvas(canvas);
   };
 });
 if (imgs.length === 0) saveCanvas(canvas);
});
function saveCanvas(canvas) {
 const link = document.createElement("a");
 link.download = `necklace_${new Date().toISOString().slice(0, 10)}.png`;
 link.href = canvas.toDataURL("image/png");
 link.click();
}
