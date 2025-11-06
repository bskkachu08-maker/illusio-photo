// === script.js ===
// 最新版：パーツ操作ボタンUI＋削除連携対応
let selectedPart = null;
let controlPanel = null;
const necklacePathY = 300; // ネックレス高さ固定ライン
// パーツを読み込み表示
async function loadParts() {
 const res = await fetch("/photos");
 const data = await res.json();
 const container = document.getElementById("partsList");
 container.innerHTML = "";
 data.forEach((p) => {
   const img = document.createElement("img");
   img.src = p.singleUrl;
   img.className = "part";
   img.dataset.color = p.color;
   img.draggable = true;
   img.addEventListener("dragstart", (e) => {
     e.dataTransfer.setData("url", p.singleUrl);
   });
   // 削除ボタン付き
   const wrapper = document.createElement("div");
   wrapper.className = "partWrapper";
   const del = document.createElement("button");
   del.className = "deleteBtn";
   del.textContent = "✕";
   del.onclick = async () => {
     const pw = prompt("管理者パスワード：");
     if (!pw) return;
     const res = await fetch("/delete-photo", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ password: pw, url: p.singleUrl }),
     });
     const result = await res.json();
     if (result.success) loadParts();
     else alert(result.message);
   };
   wrapper.appendChild(img);
   wrapper.appendChild(del);
   container.appendChild(wrapper);
 });
}
// ネックレス上にパーツドロップ
const necklaceArea = document.getElementById("necklaceArea");
necklaceArea.addEventListener("dragover", (e) => e.preventDefault());
necklaceArea.addEventListener("drop", (e) => {
 e.preventDefault();
 const url = e.dataTransfer.getData("url");
 const part = document.createElement("img");
 part.src = url;
 part.className = "placedPart";
 part.style.left = e.offsetX + "px";
 part.style.top = necklacePathY + "px";
 necklaceArea.appendChild(part);
 enableSelection(part);
});
function enableSelection(el) {
 el.addEventListener("click", () => {
   if (controlPanel) controlPanel.remove();
   selectedPart = el;
   createControlPanel();
 });
}
// 操作パネル生成
function createControlPanel() {
 controlPanel = document.createElement("div");
 controlPanel.className = "controlPanel";
 controlPanel.innerHTML = `
<button id="biggerBtn">＋</button>
<button id="smallerBtn">－</button>
<button id="rotateL">⟲</button>
<button id="rotateR">⟳</button>
<button id="closePanel">×</button>
 `;
 document.body.appendChild(controlPanel);
 const moveBy = 5;
 const scaleStep = 1.15;
 const rotateStep = 30;
 document.getElementById("biggerBtn").onclick = () => {
   if (selectedPart) {
     selectedPart.style.transform += ` scale(${scaleStep})`;
   }
 };
 document.getElementById("smallerBtn").onclick = () => {
   if (selectedPart) {
     selectedPart.style.transform += ` scale(${1 / scaleStep})`;
   }
 };
 document.getElementById("rotateL").onclick = () => {
   if (selectedPart) rotatePart(-rotateStep);
 };
 document.getElementById("rotateR").onclick = () => {
   if (selectedPart) rotatePart(rotateStep);
 };
 document.getElementById("closePanel").onclick = () => {
   controlPanel.remove();
   controlPanel = null;
 };
}
function rotatePart(angle) {
 const current = selectedPart.dataset.angle ? parseFloat(selectedPart.dataset.angle) : 0;
 const newAngle = current + angle;
 selectedPart.dataset.angle = newAngle;
 selectedPart.style.transform = `rotate(${newAngle}deg)`;
}
window.onload = loadParts;
