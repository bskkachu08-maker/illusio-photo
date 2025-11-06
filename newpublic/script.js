const necklace = document.getElementById("necklace");
const wire = document.getElementById("wire");
const partsBtn = document.getElementById("partsBtn");
const partsPanel = document.getElementById("partsPanel");
const closePanel = document.getElementById("closePanel");
const editBar = document.getElementById("editBar");
const btnRotateL = document.getElementById("rotateL");
const btnRotateR = document.getElementById("rotateR");
const btnBig = document.getElementById("bigger");
const btnSmall = document.getElementById("smaller");
const btnDelete = document.getElementById("delete");
const colorTabs = document.getElementById("colorTabs");
const partsContent = document.getElementById("partsContent");
let selected = null;
let activeColor = "赤";
let photos = [];
const COLORS = ["赤","青","緑","白","黒","その他"];
// --- 円情報 ---
function getCircle() {
 return {
   cx: parseFloat(wire.getAttribute("cx")),
   cy: parseFloat(wire.getAttribute("cy")),
   r: parseFloat(wire.getAttribute("r"))
 };
}
function angleAt(x, y) {
 const { cx, cy } = getCircle();
 return Math.atan2(y - cy, x - cx);
}
function posFromAngle(angle, size=35) {
 const { cx, cy, r } = getCircle();
 return {
   x: cx + r * Math.cos(angle) - size/2,
   y: cy + r * Math.sin(angle) - size/2
 };
}
// --- パーツ一覧 ---
partsBtn.addEventListener("click", async () => {
 partsPanel.classList.remove("hidden");
 await loadPhotos();
});
closePanel.addEventListener("click", () => partsPanel.classList.add("hidden"));
async function loadPhotos() {
 const res = await fetch("/photos");
 photos = await res.json();
 renderTabs();
 renderParts(activeColor);
}
function renderTabs() {
 colorTabs.innerHTML = "";
 COLORS.forEach(c => {
   const btn = document.createElement("button");
   btn.textContent = c;
   btn.className = "tab" + (c === activeColor ? " active" : "");
   btn.onclick = () => { activeColor = c; renderTabs(); renderParts(c); };
   colorTabs.appendChild(btn);
 });
}
function renderParts(color) {
 const list = photos.filter(p => (p.color || "その他") === color);
 partsContent.innerHTML = "";
 list.forEach(p => {
   const img = document.createElement("img");
   img.src = p.listUrl;
   img.className = "part-img";
   img.draggable = true;
   img.addEventListener("dragstart", e => {
     e.dataTransfer.setData("photo", JSON.stringify(p));
   });
   partsContent.appendChild(img);
 });
}
// --- 配置 ---
necklace.addEventListener("dragover", e => e.preventDefault());
necklace.addEventListener("drop", e => {
 e.preventDefault();
 const rect = necklace.getBoundingClientRect();
 const x = e.clientX - rect.left;
 const y = e.clientY - rect.top;
 const data = JSON.parse(e.dataTransfer.getData("photo"));
 const angle = angleAt(x, y);
 const pos = posFromAngle(angle);
 addBead(data.singleUrl, pos.x, pos.y, angle);
});
function addBead(url, x, y, angle) {
 const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
 img.setAttributeNS(null, "href", url);
 img.setAttribute("x", x);
 img.setAttribute("y", y);
 img.setAttribute("width", 35);
 img.setAttribute("height", 35);
 img.dataset.angle = angle;
 img.dataset.rotate = 0;
 necklace.appendChild(img);
 makeDraggable(img);
}
function makeDraggable(el) {
 let dragging = false;
 el.addEventListener("pointerdown", e => {
   e.preventDefault();
   select(el);
   dragging = true;
   el.setPointerCapture(e.pointerId);
 });
 el.addEventListener("pointermove", e => {
   if (!dragging) return;
   const rect = necklace.getBoundingClientRect();
   const x = e.clientX - rect.left;
   const y = e.clientY - rect.top;
   const angle = angleAt(x, y);
   const pos = posFromAngle(angle);
   el.setAttribute("x", pos.x);
   el.setAttribute("y", pos.y);
   el.dataset.angle = angle;
 });
 el.addEventListener("pointerup", e => {
   dragging = false;
   el.releasePointerCapture(e.pointerId);
 });
}
function select(el) {
 selected = el;
 editBar.classList.remove("hidden");
}
// --- 編集バー ---
btnRotateL.onclick = () => rotate(-30);
btnRotateR.onclick = () => rotate(30);
btnBig.onclick = () => resize(1.4);
btnSmall.onclick = () => resize(0.7);
btnDelete.onclick = () => {
 if (selected) selected.remove();
 selected = null;
 editBar.classList.add("hidden");
};
function rotate(angle) {
 if (!selected) return;
 const deg = (parseFloat(selected.dataset.rotate) || 0) + angle;
 selected.dataset.rotate = deg;
 const cx = parseFloat(selected.getAttribute("x")) + 17.5;
 const cy = parseFloat(selected.getAttribute("y")) + 17.5;
 selected.setAttribute("transform", `rotate(${deg}, ${cx}, ${cy})`);
}
function resize(scale) {
 if (!selected) return;
 const w = parseFloat(selected.getAttribute("width")) * scale;
 const h = parseFloat(selected.getAttribute("height")) * scale;
 selected.setAttribute("width", w);
 selected.setAttribute("height", h);
}
