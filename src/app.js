import { PixelDocument } from "./document.js";
import { PixelRenderer } from "./renderer.js";
import { EditorController } from "./controller.js";
import { downloadBlob, downloadText, extractPalette, hexToRgb } from "./utils.js";

const $ = (id) => document.getElementById(id);
const doc = new PixelDocument(32, 48);
const renderer = new PixelRenderer($("artCanvas"), $("overlayCanvas"), doc);
const editor = new EditorController(doc, renderer, $("canvasWrap"));
let currentColor = "#f2b84b";
let projectName = "Безымянный чибик";
let showGrid = true;
let zoom = 0;
let toastTimer;

const starterPalette = ["#171923","#303548","#596078","#9298ad","#f2f1f6","#f2b84b","#e78b54","#d85f68","#9b6bb0","#6e9ac2","#75b99b","#b7c878","#6a453f","#e9c477","#f6d9a8","#ffffff"];
let palette = [...starterPalette];

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 1900);
}
function setColor(color) {
  currentColor = color.toLowerCase();
  editor.setColor(currentColor);
  $("colorInput").value = currentColor;
  $("hexLabel").textContent = currentColor.toUpperCase();
  const {r,g,b} = hexToRgb(currentColor);
  $("rgbLabel").textContent = `RGB ${r}, ${g}, ${b}`;
  renderPalette();
}
function renderPalette() {
  $("swatches").innerHTML = "";
  palette.forEach((color) => {
    const b = document.createElement("button");
    b.className = "swatch" + (color.toLowerCase() === currentColor ? " active" : "");
    b.style.background = color;
    b.title = color;
    b.addEventListener("click", () => setColor(color));
    b.addEventListener("contextmenu", e => { e.preventDefault(); palette = palette.filter(c => c !== color); renderPalette(); });
    $("swatches").append(b);
  });
  const {r,g,b} = hexToRgb(currentColor);
  const shades = [0.55,0.75,1.15,1.35,1.6].map(f => `#${[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(f<1?v*f:v+(255-v)*(f-1)/.6)))).map(v=>v.toString(16).padStart(2,"0")).join("")}`);
  $("shades").innerHTML = "";
  shades.forEach(c => { const b=document.createElement("button"); b.className="swatch"; b.style.background=c; b.title=c; b.onclick=()=>setColor(c); $("shades").append(b); });
}
function updateLabels() {
  $("dimensionLabel").textContent = `${doc.width} × ${doc.height} px`;
  $("projectNameLabel").textContent = projectName;
  $("widthInput").value = doc.width; $("heightInput").value = doc.height;
  $("layerStatus").textContent = `Слой ${doc.activeLayerIndex+1} / ${doc.layers.length}`;
  $("brushSizeLabel").textContent = `${editor.brushSize} px`;
  renderer.setGrid(showGrid);
  resizeCanvasView();
  renderLayers();
}
function fitScale(){const wrap=$("canvasWrap");return Math.max(1,Math.floor(Math.min((wrap.clientWidth-48)/doc.width,(wrap.clientHeight-48)/doc.height)));}
function resizeCanvasView() {
  const wrap = $("canvasWrap");
  const availableW = wrap.clientWidth - 48, availableH = wrap.clientHeight - 48;
  const fit = Math.max(1, Math.floor(Math.min(availableW/doc.width, availableH/doc.height)));
  zoom = Math.max(1, Math.min(32, zoom || fit));
  const displayScale = zoom === 0 ? fit : zoom;
  renderer.setDisplaySize(doc.width*displayScale, doc.height*displayScale, displayScale);
  $("zoomSlider").value = displayScale;
  $("fitBtn").textContent = `${Math.round(displayScale*100)}%`;
}
function renderLayers() {
  const list = $("layerList"); list.innerHTML = "";
  doc.layers.forEach((layer, i) => {
    const row = document.createElement("div");
    row.className = "layer-row" + (i===doc.activeLayerIndex ? " active" : "");
    const eye = document.createElement("button"); eye.className="layer-eye"; eye.textContent=layer.visible?"◉":"○"; eye.title="Видимость";
    eye.onclick=()=>{layer.visible=!layer.visible; doc.markDirty(); renderer.render(); renderLayers();};
    const name = document.createElement("button"); name.className="layer-name"; name.textContent=layer.name; name.onclick=()=>{doc.activeLayerIndex=i;renderLayers();updateLabels();};
    row.append(eye,name); list.append(row);
  });
  $("activeLayerCard").querySelector("b").textContent = doc.activeLayerIndex+1;
  $("layerStatus").textContent = `Слой ${doc.activeLayerIndex+1} / ${doc.layers.length}`;
  const preview = $("activeLayerCard").querySelector(".mini-art");
  const composite = doc.compositeCanvas();
  preview.style.backgroundImage = `url(${composite.toDataURL("image/png")})`;
  preview.textContent = "";
}
function saveProject() {
  const data = doc.serialize(projectName, palette);
  const blob = new Blob([JSON.stringify(data)], {type:"application/json"});
  downloadBlob(blob, `${safeName(projectName)}.chib`);
  localStorage.setItem("chibiki-autosave", JSON.stringify(data));
  toast("Проект сохранён");
}
function safeName(s){return s.toLowerCase().replace(/[^a-zа-яё0-9-_]+/gi,"-").replace(/^-|-$/g,"")||"chibiki";}
function exportPng() {
  const canvas = doc.compositeCanvas();
  canvas.toBlob(blob => { if(blob) downloadBlob(blob, `${safeName(projectName)}.png`); });
}
function loadProject(data) {
  doc.load(data); projectName=data.name||"Импортированный чибик"; palette=data.palette||starterPalette;
  setColor(palette[5]||"#f2b84b"); renderer.resize(); updateLabels(); renderer.render(); toast("Проект открыт");
}
function switchTool(tool) {
  editor.setTool(tool);
  document.querySelectorAll("[data-tool]").forEach(b=>b.classList.toggle("active",b.dataset.tool===tool));
}
function openDialog(id){$(id).showModal();}


document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>switchTool(b.dataset.tool)));

$("colorInput").addEventListener("input",e=>setColor(e.target.value));
$("addColorBtn").onclick=()=>{if(!palette.includes(currentColor))palette.push(currentColor);renderPalette();toast("Цвет добавлен");};
$("savePaletteBtn").onclick=()=>{localStorage.setItem("chibiki-palette",JSON.stringify(palette));toast("Палитра сохранена");};
$("extractBtn").onclick=()=>$("imageInput").click();
$("imageInput").onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const colors=await extractPalette(file,16);palette=[...new Set([...colors,...palette])].slice(0,32);renderPalette();toast("Палитра извлечена");}catch{toast("Не удалось прочитать изображение");}e.target.value="";};
$("undoBtn").onclick=()=>{doc.undo();renderer.render();};
$("redoBtn").onclick=()=>{doc.redo();renderer.render();};
$("duplicateLayerBtn").onclick=()=>{doc.duplicateLayer();doc.markDirty();renderLayers();renderer.render();};
$("deleteLayerBtn").onclick=()=>{if(doc.layers.length>1){doc.deleteLayer();doc.markDirty();renderLayers();renderer.render();}else toast("Нужен хотя бы один слой");};
$("brushSize").oninput=e=>{editor.brushSize=+e.target.value;$("brushSizeLabel").textContent=`${editor.brushSize} px`;};
$("gridToggle").onchange=e=>{showGrid=e.target.checked;renderer.setGrid(showGrid);};
$("gridBtn").onclick=()=>{showGrid=!showGrid;$("gridToggle").checked=showGrid;$("gridBtn").classList.toggle("active",showGrid);renderer.setGrid(showGrid);};
$("checkerToggle").onchange=e=>renderer.setChecker(e.target.checked);
$("zoomIn").onclick=()=>{zoom=Math.min(32,(zoom||fitScale())+1);resizeCanvasView();};
$("zoomOut").onclick=()=>{zoom=Math.max(1,(zoom||fitScale())-1);resizeCanvasView();};
$("zoomSlider").oninput=e=>{zoom=+e.target.value;resizeCanvasView();};
$("fitBtn").onclick=()=>{zoom=fitScale();resizeCanvasView();};
$("resizeBtn").onclick=()=>{const w=clamp(+ $("widthInput").value,8,256),h=clamp(+$("heightInput").value,8,256);doc.resize(w,h);renderer.resize();updateLabels();renderer.render();toast("Размер холста изменён");};
document.querySelectorAll("[data-size]").forEach(b=>b.onclick=()=>{const [w,h]=b.dataset.size.split("x").map(Number);$("widthInput").value=w;$("heightInput").value=h;document.querySelectorAll("[data-size]").forEach(x=>x.classList.toggle("selected",x===b));});
$("saveBtn").onclick=()=>openDialog("menuDialog");
$("projectInput").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{loadProject(JSON.parse(await f.text()));}catch{toast("Файл проекта повреждён или имеет неверный формат");}e.target.value="";};
$("menuBtn").onclick=()=>$("menuDialog").showModal();
$("closeMenu").onclick=()=>$("menuDialog").close();
$("menuNew").onclick=()=>{$("menuDialog").close();$("newDialog").showModal();};
$("menuImport").onclick=()=>{$("menuDialog").close();$("projectInput").click();};
$("menuPng").onclick=()=>{$("menuDialog").close();exportPng();};
$("menuExport").onclick=()=>{$("menuDialog").close();saveProject();};
$("createProjectBtn").onclick=e=>{e.preventDefault();projectName=$("newName").value.trim()||"Мой чибик";const w=clamp(+$("newWidth").value,8,256),h=clamp(+$("newHeight").value,8,256);doc.reset(w,h);$("newDialog").close();renderer.resize();updateLabels();renderer.render();toast("Новый холст создан");};
$("renameBtn").onclick=()=>{$("renameInput").value=projectName;openDialog("renameDialog");};
$("renameSave").onclick=e=>{e.preventDefault();projectName=$("renameInput").value.trim()||"Чибик";$("renameDialog").close();updateLabels();toast("Название изменено");};
$("paletteExpand").onclick=()=>openDialog("paletteDialog");
$("closePalette").onclick=()=>$("paletteDialog").close();
$("layersOpen").onclick=()=>openDialog("layersDialog");
$("closeLayers").onclick=()=>$("layersDialog").close();
$("moreToolsBtn").onclick=()=>openDialog("settingsDialog");
$("closeSettings").onclick=()=>$("settingsDialog").close();
$("playStub").onclick=()=>toast("Покадровая анимация пока не включена");
$("activeLayerCard").onclick=()=>openDialog("layersDialog");
$("addLayerBtn").onclick=()=>{doc.addLayer();doc.markDirty();renderLayers();renderer.render();};
$("canvasWrap").addEventListener("pointermove",e=>{const p=renderer.pointerToPixel(e);$("coordsLabel").textContent=p?`x: ${p.x}  y: ${p.y}`:"x: —  y: —";});
window.addEventListener("resize",resizeCanvasView);
window.addEventListener("keydown",e=>{if(e.target.matches("input"))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?doc.redo():doc.undo();renderer.render();return;}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();saveProject();return;}const keys={pencil:"p",eraser:"e",fill:"g",eyedropper:"i",line:"l",rect:"u"};const match=Object.entries(keys).find(([,k])=>k===e.key.toLowerCase());if(match)switchTool(match[0]);});
window.addEventListener("beforeunload",()=>{try{localStorage.setItem("chibiki-autosave",JSON.stringify(doc.serialize(projectName,palette)));}catch{}});
try{const saved=JSON.parse(localStorage.getItem("chibiki-autosave")||"null");if(saved)loadProject(saved);else{const p=JSON.parse(localStorage.getItem("chibiki-palette")||"null");if(p)palette=p;setColor(currentColor);updateLabels();renderer.render();}}catch{setColor(currentColor);updateLabels();renderer.render();}
function clamp(n,min,max){return Math.max(min,Math.min(max,Number.isFinite(n)?n:min));}

// Keep the editor viewport fixed and suppress browser gestures over the workspace.
document.addEventListener("gesturestart", e=>e.preventDefault(), {passive:false});
document.addEventListener("gesturechange", e=>e.preventDefault(), {passive:false});
document.addEventListener("gestureend", e=>e.preventDefault(), {passive:false});
document.addEventListener("contextmenu", e=>e.preventDefault());
document.addEventListener("touchmove", e=>{if(!e.target.closest("input,dialog"))e.preventDefault();},{passive:false});
window.addEventListener("wheel", e=>{if(e.ctrlKey)e.preventDefault();},{passive:false});
