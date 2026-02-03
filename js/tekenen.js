// TEKENEN.JS - KIDS ART STUDIO
console.log("Tekenen.js geladen...");

let drawState = {
    isDrawing: false,
    color: '#000000',
    lineWidth: 5,
    lastX: 0, 
    lastY: 0
};

const drawColors = ['#000000', '#F44336', '#E91E63', '#9C27B0', '#2196F3', '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#795548', '#FFFFFF'];
const brushSizes = [5, 10, 20, 40]; // Diktes

function startDrawingGame() {
    const board = document.getElementById('game-board');
    
    // HTML Bouwen
    let colorHTML = drawColors.map(c => 
        `<div class="paint-btn ${c==='#000000'?'active':''}" style="background:${c}" onclick="setDrawColor('${c}', this)"></div>`
    ).join('');

    let sizeHTML = brushSizes.map(s => 
        `<button class="size-btn ${s===5?'active':''}" onclick="setDrawSize(${s}, this)">
            <span class="size-dot" style="width:${s/2}px; height:${s/2}px;"></span>
        </button>`
    ).join('');

    board.innerHTML = `
        <div class="drawing-game-container">
            <div class="drawing-header">
                <button class="tool-btn" onclick="location.reload()">⬅ Terug</button>
                <div class="drawing-title">🎨 Tekenstudio</div>
                <button class="action-btn btn-gallery" onclick="openGallery()">📂 Galerij</button>
            </div>
            
            <div class="canvas-wrapper" id="canvas-container">
                <canvas id="drawing-canvas"></canvas>
            </div>
            
            <div class="drawing-tools">
                <div class="color-picker-scroll">${colorHTML}</div>
                <div class="size-picker">${sizeHTML}</div>
                <div class="action-buttons">
                    <button class="action-btn btn-clear" onclick="clearCanvas()">🗑️</button>
                    <button class="action-btn btn-save" onclick="saveDrawing()">💾</button>
                </div>
            </div>
        </div>
    `;

    // Canvas Initialiseren
    setTimeout(initCanvas, 100);
}

function initCanvas() {
    const canvas = document.getElementById('drawing-canvas');
    const container = document.getElementById('canvas-container');
    if (!canvas || !container) return;

    // Stel canvas grootte in op basis van container (Full Size)
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    const ctx = canvas.getContext('2d');
    
    // Instellingen
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = drawState.color;
    ctx.lineWidth = drawState.lineWidth;

    // Event Listeners (Muis & Touch)
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);

    canvas.addEventListener('touchstart', startDrawTouch, {passive: false});
    canvas.addEventListener('touchmove', drawTouch, {passive: false});
    canvas.addEventListener('touchend', stopDraw);
}

// --- TEKEN FUNCTIES ---

function startDraw(e) {
    drawState.isDrawing = true;
    [drawState.lastX, drawState.lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!drawState.isDrawing) return;
    const ctx = document.getElementById('drawing-canvas').getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(drawState.lastX, drawState.lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    
    [drawState.lastX, drawState.lastY] = [e.offsetX, e.offsetY];
}

// Speciale functies voor Touch (Tablet/GSM)
function startDrawTouch(e) {
    e.preventDefault(); // Voorkom scrollen
    const touch = e.touches[0];
    const canvas = document.getElementById('drawing-canvas');
    const rect = canvas.getBoundingClientRect();
    
    drawState.isDrawing = true;
    drawState.lastX = touch.clientX - rect.left;
    drawState.lastY = touch.clientY - rect.top;
}

function drawTouch(e) {
    e.preventDefault();
    if (!drawState.isDrawing) return;
    
    const touch = e.touches[0];
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(drawState.lastX, drawState.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    drawState.lastX = x;
    drawState.lastY = y;
}

function stopDraw() {
    drawState.isDrawing = false;
}

// --- TOOLS ---

function setDrawColor(color, btn) {
    drawState.color = color;
    const ctx = document.getElementById('drawing-canvas').getContext('2d');
    ctx.strokeStyle = color;
    
    // Update UI
    document.querySelectorAll('.paint-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if(typeof playSound === 'function') playSound('click');
}

function setDrawSize(size, btn) {
    drawState.lineWidth = size;
    const ctx = document.getElementById('drawing-canvas').getContext('2d');
    ctx.lineWidth = size;

    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if(typeof playSound === 'function') playSound('pop');
}

function clearCanvas() {
    if(!confirm("Wil je alles wissen?")) return;
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(typeof playSound === 'function') playSound('trash');
}

// --- OPSLAAN & GALERIJ ---

function saveDrawing() {
    const canvas = document.getElementById('drawing-canvas');
    const dataURL = canvas.toDataURL('image/png');
    
    // Haal bestaande tekeningen op
    let gallery = JSON.parse(localStorage.getItem('myDrawings') || '[]');
    gallery.unshift(dataURL); // Voeg nieuwe vooraan toe
    localStorage.setItem('myDrawings', JSON.stringify(gallery));
    
    if(typeof playSound === 'function') playSound('win');
    alert("Tekening opgeslagen! 🎉");
}

function openGallery() {
    const gallery = JSON.parse(localStorage.getItem('myDrawings') || '[]');
    
    let html = `
        <div class="gallery-modal">
            <h2 style="color:white; font-family:'Fredoka One'">Mijn Kunstwerken 🎨</h2>
            <div class="gallery-content">
                ${gallery.length === 0 ? '<p style="text-align:center; width:100%">Nog geen tekeningen...</p>' : ''}
                ${gallery.map((img, i) => `
                    <div class="gallery-item">
                        <img src="${img}">
                        <button class="gallery-delete" onclick="deleteDrawing(${i})">X</button>
                    </div>
                `).join('')}
            </div>
            <button class="gallery-close" onclick="closeGallery()">Sluiten</button>
        </div>
    `;
    
    const div = document.createElement('div');
    div.id = 'gallery-overlay';
    div.innerHTML = html;
    document.body.appendChild(div);
}

function closeGallery() {
    const el = document.getElementById('gallery-overlay');
    if(el) el.remove();
}

function deleteDrawing(index) {
    if(!confirm("Tekening weggooien?")) return;
    let gallery = JSON.parse(localStorage.getItem('myDrawings') || '[]');
    gallery.splice(index, 1);
    localStorage.setItem('myDrawings', JSON.stringify(gallery));
    
    // Herlaad galerij
    closeGallery();
    openGallery();
}
