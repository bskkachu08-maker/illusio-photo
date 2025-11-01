const canvas = document.getElementById("necklaceCanvas");
const ctx = canvas.getContext("2d");
const saveBtn = document.getElementById("saveBtn");
const addPartsBtn = document.getElementById("addPartsBtn");
const uploadParts = document.getElementById("uploadParts");
const partsBtn = document.getElementById("partsBtn");
const partsPanel = document.getElementById("partsPanel");
const partsList = document.getElementById("partsList");
const necklaceArea = document.getElementById("necklace-area");
canvas.width = 400;
canvas.height = 400;
// 銀色ワイヤー
function drawNecklace() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);
 ctx.beginPath();
 ctx.arc(200, 200, 150, 0, Math.PI * 2);
 ctx.strokeStyle = "silver";
 ctx.lineWidth = 3;
 ctx.stroke();
}
drawNecklace();
// パーツ一覧表示
partsBtn.addEventListener("click", () => {
 partsPanel.classList.toggle("active");
});
// ＋パーツ追加
addPartsBtn.addEventListener("click", () => {
 uploadParts.click();
});
uploadParts.addEventListener("change", (e) => {
 const files = e.target.files;
 for (const file of files) {
   const img = document.createElement("img");
   img.src = URL.createObjectURL(file);
   img.classList.add("part");
   partsList.appendChild(img);
   img.addEventListener("click", () => {
     const clone = img.cloneNode();
     clone.style.left = "180px";
     clone.style.top = "180px";
     necklaceArea.appendChild(clone);
     makeDraggable(clone);
   });
 }
});
// ドラッグできる
function makeDraggable(el) {
 let offsetX, offsetY, isDragging = false;
 el.addEventListener("mousedown", startDrag);
 el.addEventListener("touchstart", startDrag, { passive: true });
 el.addEventListener("mousemove", onDrag);
 el.addEventListener("touchmove", onDrag, { passive: true });
 el.addEventListener("mouseup", endDrag);
 el.addEventListener("touchend", endDrag);
 function startDrag(e) {
   isDragging = true;
   const rect = el.getBoundingClientRect();
   const clientX = e.touches ? e.touches[0].clientX : e.clientX;
   const clientY = e.touches ? e.touches[0].clientY : e.clientY;
   offsetX = clientX - rect.left;
   offsetY = clientY - rect.top;
 }
 function onDrag(e) {
   if (!isDragging) return;
   const clientX = e.touches ? e.touches[0].clientX : e.clientX;
   const clientY = e.touches ? e.touches[0].clientY : e.clientY;
   const parentRect = necklaceArea.getBoundingClientRect();
   el.style.left = `${clientX - parentRect.left - offsetX}px`;
   el.style.top = `${clientY - parentRect.top - offsetY}px`;
 }
 function endDrag() {
   isDragging = false;
 }
}
// 保存機能
saveBtn.addEventListener("click", () => {
 html2canvas(necklaceArea).then((canvasSave) => {
   const link = document.createElement("a");
   link.download = "necklace.png";
   link.href = canvasSave.toDataURL("image/png");
   link.click();
 });
});
