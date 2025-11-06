// === 要素取得 ===
const svg = document.getElementById("canvas");
const wire = document.getElementById("wire");
const addPartBtn = document.getElementById("addPartBtn");
const partsBtn = document.getElementById("partsBtn");
const partsPanel = document.getElementById("partsPanel");
const closePanel = document.getElementById("closePanel");
const colorTabs = document.getElementById("colorTabs");
const partsContent = document.getElementById("partsContent");
const editBar = document.getElementById("editBar");
const btnRotL = document.getElementById("rotateL");
const btnRotR = document.getElementById("rotateR");
const btnBig = document.getElementById("bigger");
const btnSmall = document.getElementById("smaller");
const btnDel = document.getElementById("delete");
const saveBtn = document.getElementById("saveBtn");
let beads = [];  // {el, angle}
let selected = null;
let rotationDeg = 0;
let lastActionAt = 0;
const STEP_DEG = 8; // ←→ 角度移動幅
const ROTATE_STEP = 30; // 回転は30°
const ZOOM_SCALE = 1.5;
const COLORS_ORDER = ["赤","ピンク","青","緑","白","紫","ターコイズ","透明","金色","シルバー","黒","その他"];
let photosCache = [];
let availableColors = [];
let activeColor = "赤";
// === 円情報 ===
function getCircle() {
 return {
   cx: parseFloat(wire.getAttribute("cx")),
   cy: parseFloat(wire.getAttribute("cy")),
   r: parseFloat(wire.getAttribute("r")),
 };
}
function normalize(a) {
 while (a <= -Math.PI) a += 2 * Math.PI;
 while (a > Math.PI) a -= 2 * Math.PI;
 return a;
}
function angleAtPoint(x, y) {
 const { cx, cy } = getCircle();
 return Math.atan2(y - cy, x - cx);
}
function posFromAngle(angle, w = 35, h = 35) {
 const { cx, cy, r } = getCircle();
 const px = cx + r * Math.cos(angle);
 const py = cy + r * Math.sin(angle);
 return { x: px - w / 2, y: py - h / 2 };
}
function centerOf(el) {
 const x = parseFloat(el.getAttribute("x"));
 const y = parseFloat(el.getAttribute("y"));
 const w = parseFloat(el.getAttribute("width"));
 const h = parseFloat(el.getAttribute("height"));
 return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}
function applyCenterRotate(el, deg) {
 el.dataset.rotate = String(deg);
 const c = centerOf(el);
 el.setAttribute("transform", `rotate(${deg}, ${c.cx}, ${c.cy})`);
}
function canAct(interval = 100) {
 const now = Date.now();
 if (now - lastActionAt < interval) return false;
 lastActionAt = now;
 return true;
}
// === ビーズ追加 ===
function addBead(singleUrl, angle) {
 const el = document.createElementNS("http://www.w3.org/2000/svg", "image");
 el.setAttributeNS(null, "href", singleUrl);
 el.setAttributeNS(null, "width", 35);
 el.setAttributeNS(null, "height", 35);
 el.dataset.rotate = "0";
 svg.appendChild(el);
 const bead = { el, angle: normalize(angle) };
 beads.push(bead);
 updateBeadPosition(bead);
 // 選択
 el.addEventListener("click", () => selectBead(el));
 // ドラッグ移動（即スワイプ対応）
 let dragging = false;
 el.addEventListener("pointerdown", (e) => {
   e.preventDefault();
   selectBead(el);
   dragging = true;
   el.setPointerCapture(e.pointerId);
 });
 el.addEventListener("pointermove", (e) => {
   if (!dragging) return;
   const rect = svg.getBoundingClientRect();
   const mx = e.clientX - rect.left;
   const my = e.clientY - rect.top;
   const ang = angleAtPoint(mx, my);
   bead.angle = normalize(ang);
   updateBeadPosition(bead);
 });
 el.addEventListener("pointerup", (e) => {
   dragging = false;
   el.releasePointerCapture(e.pointerId);
   selectBead(el);
 });
}
// === 位置更新 ===
function updateBeadPosition(bead) {
 const el = bead.el;
 const w = parseFloat(el.getAttribute("width"));
 const h = parseFloat(el.getAttribute("height"));
 const p = posFromAngle(bead.angle, w, h);
 el.setAttribute("x", p.x);
 el.setAttribute("y", p.y);
 applyCenterRotate(el, parseFloat(el.dataset.rotate || "0"));
}
// === 選択 ===
function selectBead(el) {
 selected = beads.find((b) => b.el === el) || null;
 if (!selected) {
   editBar.classList.remove("show");
   return;
 }
 rotationDeg = parseFloat(el.dataset.rotate || "0");
 editBar.classList.add("show");
}
svg.addEventListener("pointerdown", (e) => {
 if (e.target.tagName.toLowerCase() !== "image") {
   selected = null;
   editBar.classList.remove("show");
 }
});
// === 回転 ===
btnRotL.addEventListener("click", () => {
 if (!selected || !canAct()) return;
 rotationDeg -= ROTATE_STEP;
 applyCenterRotate(selected.el, rotationDeg);
});
btnRotR.addEventListener("click", () => {
 if (!selected || !canAct()) return;
 rotationDeg += ROTATE_STEP;
 applyCenterRotate(selected.el, rotationDeg);
});
// === 拡大縮小 ===
function resizeSelected(scale) {
 const el = selected.el;
 const c = centerOf(el);
 const nw = Math.min(Math.max(c.w * scale, 20), 200);
 const nh = Math.min(Math.max(c.h * scale, 20), 200);
 el.setAttribute("x", c.cx - nw / 2);
 el.setAttribute("y", c.cy - nh / 2);
 el.setAttribute("width", nw);
 el.setAttribute("height", nh);
 applyCenterRotate(el, parseFloat(el.dataset.rotate || "0"));
}
btnBig.addEventListener("click", () => {
 if (!selected || !canAct()) return;
 resizeSelected(ZOOM_SCALE);
});
btnSmall.addEventListener("click", () => {
 if (!selected || !canAct()) return;
 resizeSelected(1 / ZOOM_SCALE);
});
// === 削除 ===
btnDel.addEventListener("click", () => {
 if (!selected) return;
 selected.el.remove();
 beads = beads.filter((b) => b !== selected);
 selected = null;
 editBar.classList.remove("show");
});
// === パーツ読み込み ===
async function loadPhotos() {
 try {
   const res = await fetch("/photos");
   const json = await res.json();
   photosCache = Array.isArray(json) ? json : [];
   const set = new Set(photosCache.map((p) => p.color || "その他"));
   availableColors = COLORS_ORDER.filter((c) => set.has(c));
   if (availableColors.length === 0) availableColors = ["その他"];
   if (!availableColors.includes(activeColor)) activeColor = availableColors[0];
   renderTabs();
   renderParts(activeColor);
 } catch (e) {
   partsContent.innerHTML = `<p style="color:#c00;">読み込み失敗: ${e.message}</p>`;
 }
}
// === タブ生成 ===
function renderTabs() {
 colorTabs.innerHTML = "";
 availableColors.forEach((c) => {
   const btn = document.createElement("button");
   btn.className = "tab" + (c === activeColor ? " active" : "");
   btn.textContent = c;
   btn.addEventListener("click", () => {
     activeColor = c;
     document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
     btn.classList.add("active");
     renderParts(c);
   });
   colorTabs.appendChild(btn);
 });
}
// === パーツ一覧表示 ===
function renderParts(color) {
 const list = photosCache.filter((p) => (p.color || "その他") === color);
 const title = `<div class="group-title">${color}系</div>`;
 if (list.length === 0) {
   partsContent.innerHTML = title + `<p>この色のパーツはありません。</p>`;
   return;
 }
 const html = list
   .map(
     (p) =>
       `<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
<img class="part-img" draggable="true" src="${p.listUrl}" data-single="${p.singleUrl}" alt="${p.color}">
<button class="deletePart" data-id="${p.id}" style="border:1px solid #111;background:transparent;color:#111;border-radius:6px;padding:4px 6px;cursor:pointer;">削除</button>
</div>`
   )
   .join("");
 partsContent.innerHTML = title + html;
 // ドラッグ配置 or クリック配置
 partsContent.querySelectorAll(".part-img").forEach((img) => {
   img.addEventListener("dragstart", (e) => {
     e.dataTransfer.setData("photo", JSON.stringify({ singleUrl: img.dataset.single }));
   });
   img.addEventListener("click", () => addBead(img.dataset.single, -Math.PI / 2));
 });
 // 削除ボタン
 document.querySelectorAll(".deletePart").forEach((btn) => {
   btn.addEventListener("click", async () => {
     const pw = prompt("パスワードを入力");
     if (!pw) return;
     const res = await fetch("/delete", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ id: btn.dataset.id, password: pw }),
     });
     const data = await res.json();
     if (data.success) {
       alert("削除しました");
       loadPhotos();
     } else {
       alert("削除失敗: " + (data.message || "エラー"));
     }
   });
 });
}
// === ドロップで配置 ===
svg.addEventListener("dragover", (e) => e.preventDefault());
svg.addEventListener("drop", (e) => {
 e.preventDefault();
 const raw = e.dataTransfer.getData("photo");
 if (!raw) return;
 const p = JSON.parse(raw);
 const rect = svg.getBoundingClientRect();
 const x = e.clientX - rect.left;
 const y = e.clientY - rect.top;
 const angle = angleAtPoint(x, y);
 addBead(p.singleUrl, angle);
});
// === ボタン・ナビ ===
addPartBtn.addEventListener("click", () => (location.href = "admin.html"));
partsBtn.addEventListener("click", async () => {
 partsPanel.classList.add("open");
 await loadPhotos();
});
closePanel.addEventListener("click", () => partsPanel.classList.remove("open"));
saveBtn.addEventListener("click", () => {
 alert("保存は端末のスクリーンショットでお願いします。");
});
