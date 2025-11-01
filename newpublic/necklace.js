// === アップロード済みパーツ一覧を読み込む ===

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

// === ドラッグ＆ドロップ設定 ===

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

// === パーツ一覧（下からスライド） ===

const drawer = document.getElementById("drawer");

const openBtn = document.getElementById("open-parts-btn");

const closeBtn = document.getElementById("close-drawer-btn");

const body = document.body;

openBtn.addEventListener("click", () => {

  drawer.classList.add("open");

  body.classList.add("drawer-open");

});

closeBtn.addEventListener("click", () => {

  drawer.classList.remove("open");

  body.classList.remove("drawer-open");

});

// === 保存機能 ===

document.getElementById("save-btn").addEventListener("click", () => {

  const canvas = document.createElement("canvas");

  canvas.width = 600;

  canvas.height = 600;

  const ctx = canvas.getContext("2d");

  // 背景白

  ctx.fillStyle = "#fff";

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // シルバーの円（ワイヤー）

  ctx.beginPath();

  ctx.arc(300, 300, 250, 0, Math.PI * 2);

  const gradient = ctx.createLinearGradient(0, 0, 600, 0);

  gradient.addColorStop(0, "#ccc");

  gradient.addColorStop(0.5, "#eee");

  gradient.addColorStop(1, "#aaa");

  ctx.strokeStyle = gradient;

  ctx.lineWidth = 3;

  ctx.stroke();

  // パーツ描画

  const imgs = dropZone.querySelectorAll(".draggable");

  let loaded = 0;

  if (imgs.length === 0) saveCanvas(canvas);

  imgs.forEach(img => {

    const image = new Image();

    image.src = img.src;

    image.onload = () => {

      const x = parseFloat(img.style.left) + 50;

      const y = parseFloat(img.style.top) + 50;

      ctx.drawImage(image, x, y, 80, 80);

      loaded++;

      if (loaded === imgs.length) saveCanvas(canvas);

    };

  });

});

function saveCanvas(canvas) {

  const link = document.createElement("a");

  link.download = `necklace_${new Date().toISOString().slice(0, 10)}.png`;

  link.href = canvas.toDataURL("image/png");

  link.click();

}
 
