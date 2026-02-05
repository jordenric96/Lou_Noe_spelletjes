// TEKENEN.JS - SMART PALETTE MET HOOG CONTRAST
console.log("Tekenen.js geladen (High Contrast Colors)...");

let drawState = {
    isDrawing: false,
    color: '#000000', lineWidth: 5, lastX: 0, lastY: 0,
    player: null,
    selectedImageSrc: null, 
    smartPalette: []
};

// Reserve kleuren (voor als het plaatje te saai is)
const defaultPalette = [
    '#F44336', '#2196F3', '#4CAF50', '#FFEB3B', '#FF9800', 
    '#9C27B0', '#795548', '#00BCD4', '#E91E63', '#CDDC39'
];

// --- HULP: BEREKEN VERSCHIL TUSSEN 2 KLEUREN ---
function getHexDiff(hex1, hex2) {
    const r1 = parseInt(hex1.substring(1,3), 16);
    const g1 = parseInt(hex1.substring(3,5), 16);
    const b1 = parseInt(hex1.substring(5,7), 16);

    const r2 = parseInt(hex2.substring(1,3), 16);
    const g2 = parseInt(hex2.substring(3,5), 16);
    const b2 = parseInt(hex2.substring(5,7), 16);

    // Eenvoudige afstandsformule (Euclidean distance)
    return Math.sqrt(Math.pow(r1-r2, 2) + Math.pow(g1-g2, 2) + Math.pow(b1-b2, 2));
}

// --- 1. KLEUR EXTRACTIE ---
function extractColors(imgSrc) {
    return new Promise((resolve) => {
        const img = new Image(); img.src = imgSrc; img.crossOrigin = "Anonymous";
        img.onload = () => {
            const c = document.createElement('canvas'); const ctx = c.getContext('2d');
            // Klein maken voor snelheid
            const scale = Math.min(1, 100 / Math.max(img.width, img.height));
            c.width = img.width * scale; c.height = img.height * scale;
            ctx.drawImage(img, 0, 0, c.width, c.height);
            
            try {
                const data = ctx.getImageData(0, 0, c.width, c.height).data;
                const colorCounts = {};
                
                // 1. Alle pixels tellen
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
                    
                    // Filter: Geen transparant, geen wit, geen zeer lichtgrijs
                    if (a < 128) continue; 
                    if (r > 230 && g > 230 && b > 230) continue; // Filter "bijna wit"

                    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
                    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
                }
                
                // 2. Sorteer op vaakst voorkomend
                let sortedHex = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
                
                // 3. De Slimme Selectie
                // We beginnen ALTIJD met Zwart en Wit
                let finalPalette = ['#000000', '#FFFFFF']; 
                
                // Loop door de gevonden kleuren uit de foto
                for (let color of sortedHex) {
                    if (finalPalette.length >= 12) break; // Max 12 kleuren

                    // CHECK: Lijkt deze kleur te veel op wat we al hebben?
                    // We eisen een minimaal verschil (afstand) van 60 punten
                    let isDistinct = finalPalette.every(existingColor => {
                        return getHexDiff(color, existingColor) > 60;
                    });

                    if (isDistinct) {
                        finalPalette.push(color);
                    }
                }

                // 4. Hebben we nog geen 12 kleuren? Vul aan met de regenboog!
                if (finalPalette.length < 12) {
                    for (let defColor of defaultPalette) {
                        if (finalPalette.length >= 12) break;
                        
                        // Check ook hier of de standaardkleur niet teveel lijkt op wat we al hebben
                        let isDistinct = finalPalette.every(existingColor => {
                            return getHexDiff(defColor, existingColor) > 40;
                        });
                        
                        if (isDistinct) {
                            finalPalette.push(defColor);
                        }
                    }
                }

                resolve(finalPalette);
            } catch (e) { resolve(['#000000', '#FFFFFF', ...defaultPalette]); }
        };
        img.onerror = () => resolve(['#000000', '#FFFFFF', ...defaultPalette]);
    });
}

// --- 2. SETUP SCHERM ---
function startDrawingGame() { startDrawingSetup(); }

function startDrawingSetup() {
    const board = document.getElementById('game-board');
    
    // Thema knoppen
    let themeOptions = `
        <div class="theme-card-btn" onclick="drawSelectSpecificImage('blank', this)">
            <div class="theme-img-container" style="background:white; border:1px solid #eee;"></div>
            <div class="btn-label">Wit Blad 📄</div>
        </div>`;
        
    if(typeof memThemes !== 'undefined') {
        Object.keys(memThemes).forEach(key => {
            const t = memThemes[key];
            if(!t.locked && !t.isMix) {
                 themeOptions += `
                    <div class="theme-card-btn" onclick="drawShowImageSelection('${key}')">
                        <div class="theme-img-container"><img src="${t.path}cover.png"></div>
                        <div class="btn-label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                    </div>`;
            }
        });
    }

    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-group">
                <h3>1. Wie gaat er tekenen?</h3>
                <div class="name-row">
                    <button class="player-btn" onclick="drawSelectPerson('Lou', this)">👦🏼 Lou</button>
                    <button class="player-btn" onclick="drawSelectPerson('Noé', this)">👶🏼 Noé</button>
                    <button class="player-btn" onclick="drawSelectPerson('Mama', this)">👩🏻 Mama</button>
                    <button class="player-btn" onclick="drawSelectPerson('Papa', this)">👨🏻 Papa</button>
                </div>
            </div>

            <div class="setup-group" id="draw-theme-group">
                <h3>2. Kies een Thema</h3>
                <div class="theme-grid-wrapper">
                    ${themeOptions}
                </div>
            </div>

            <div class="setup-group hidden" id="draw-image-group">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3>3. Kies een Plaatje</h3>
                    <button class="tool-btn" style="padding:5px 10px; font-size:0.8rem;" onclick="drawShowThemes()">⬅ Terug</button>
                </div>
                <div class="theme-grid-wrapper" id="draw-image-grid"></div>
            </div>

            <div class="bottom-actions">
                <button id="draw-start-btn" class="start-btn" onclick="initDrawing()" disabled>Kies een speler...</button>
                <button class="tool-btn" onclick="location.reload()">⬅ Menu</button>
            </div>
        </div>
    `;
    drawState.player = null; drawState.selectedImageSrc = null;
}

function drawSelectPerson(name, btn) {
    if(typeof playSound === 'function') playSound('click');
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending');
    drawState.player = name;
    checkDrawStart();
}

function drawShowImageSelection(themeKey) {
    if(typeof playSound === 'function') playSound('click');
    const t = memThemes[themeKey];
    const grid = document.getElementById('draw-image-grid');
    grid.innerHTML = ''; 
    for(let i=1; i<=15; i++) {
        const src = `${t.path}${i}.${t.extension}`;
        grid.innerHTML += `
            <div class="theme-card-btn full-img" onclick="drawSelectSpecificImage('${src}', this)">
                <div class="theme-img-container"><img src="${src}"></div>
            </div>`;
    }
    document.getElementById('draw-theme-group').classList.add('hidden');
    document.getElementById('draw-image-group').classList.remove('hidden');
}

function drawShowThemes() {
    if(typeof playSound === 'function') playSound('click');
    document.getElementById('draw-image-group').classList.add('hidden');
    document.getElementById('draw-theme-group').classList.remove('hidden');
    drawState.selectedImageSrc = null;
    checkDrawStart();
}

function drawSelectSpecificImage(src, btn) {
    if(typeof playSound === 'function') playSound('pop');
    const container = btn.parentElement; 
    if(container) container.querySelectorAll('.theme-card-btn').forEach(b => b.classList.remove('selected'));
    else document.querySelectorAll('.theme-card-btn').forEach(b => b.classList.remove('selected'));

    btn.classList.add('selected');
    drawState.selectedImageSrc = src;
    checkDrawStart();
}

function checkDrawStart() {
    const btn = document.getElementById('draw-start-btn');
    if(drawState.player && drawState.selectedImageSrc) {
        btn.disabled = false; btn.innerText = "START TEKENEN 🎨"; btn.style.transform = "scale(1.05)";
    } else {
        btn.disabled = true; btn.innerText = "Kies speler & plaatje..."; btn.style.transform = "scale(1)";
    }
}

// --- 3. INIT GAME ---
async function initDrawing() {
    const board = document.getElementById('game-board');
    let palette = ['#000000', '#FFFFFF', ...defaultPalette];
    let bgHTML = '';
    
    if (drawState.selectedImageSrc && drawState.selectedImageSrc !== 'blank') {
        board.innerHTML = `<div style="display:flex; height:100%; justify-content:center; align-items:center; color:white; font-size:1.5rem;">Kleuren kiezen... 🎨</div>`;
        palette = await extractColors(drawState.selectedImageSrc);
        bgHTML = `<img src="${drawState.selectedImageSrc}" class="tracing-bg">`;
    }

    const paletteHTML = palette.map(c => {
        const isActive = c === '#000000' ? 'active' : '';
        return `<div class="paint-btn ${isActive}" style="background:${c}" onclick="setDrawColor('${c}', this)"></div>`;
    }).join('');

    board.innerHTML = `
        <div class="drawing-container">
            <div class="drawing-header">
                <button class="tool-btn" onclick="startDrawingSetup()">⬅ Terug</button>
                <div class="player-tag">${drawState.player}'s Kunstwerk</div>
                <button class="action-btn" onclick="saveDrawing()">💾 Opslaan</button>
            </div>
            
            <div class="canvas-wrapper" id="canvas-wrapper">
                ${bgHTML}
                <canvas id="draw-canvas"></canvas>
            </div>

            <div class="drawing-toolbar">
                <div class="paint-row">${paletteHTML}</div>
                <div class="tools-row">
                    <div style="display:flex; gap:5px;">
                        <button class="size-btn active" onclick="setLineWidth(5, this)"><div class="size-dot" style="width:5px; height:5px;"></div></button>
                        <button class="size-btn" onclick="setLineWidth(10, this)"><div class="size-dot" style="width:10px; height:10px;"></div></button>
                        <button class="size-btn" onclick="setLineWidth(25, this)"><div class="size-dot" style="width:18px; height:18px;"></div></button>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button class="action-btn eraser-btn" onclick="setEraser(this)">Gum</button>
                        <button class="action-btn clear-btn" onclick="clearCanvas()">Wis</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    setupCanvas();
    drawState.color = '#000000'; drawState.lineWidth = 5;
}

// --- 4. CANVAS FUNCTIES ---
function setupCanvas() {
    const canvas = document.getElementById('draw-canvas');
    const wrapper = document.getElementById('canvas-wrapper');
    const ctx = canvas.getContext('2d');
    canvas.width = wrapper.clientWidth; canvas.height = wrapper.clientHeight;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    
    canvas.addEventListener('mousedown', startPos);
    canvas.addEventListener('mouseup', endPos);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPos(e.touches[0]); }, {passive: false});
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); endPos(); }, {passive: false});
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); }, {passive: false});

    function startPos(e) {
        drawState.isDrawing = true;
        ctx.strokeStyle = drawState.color; ctx.lineWidth = drawState.lineWidth;
        draw(e);
    }
    function endPos() { drawState.isDrawing = false; ctx.beginPath(); }
    function draw(e) {
        if (!drawState.isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke(); ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
}

function setDrawColor(color, btn) {
    if(typeof playSound === 'function') playSound('click');
    drawState.color = color;
    document.querySelectorAll('.paint-btn, .eraser-btn').forEach(b => b.classList.remove('active', 'active-tool'));
    if(btn) btn.classList.add('active');
}

function setEraser(btn) {
    if(typeof playSound === 'function') playSound('click');
    drawState.color = '#FFFFFF';
    document.querySelectorAll('.paint-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active-tool');
}

function setLineWidth(width, btn) {
    if(typeof playSound === 'function') playSound('click');
    drawState.lineWidth = width;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function clearCanvas() {
    if(confirm("Wil je alles wissen?")) {
        if(typeof playSound === 'function') playSound('error');
        const canvas = document.getElementById('draw-canvas');
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }
}

function saveDrawing() {
    if(typeof playSound === 'function') playSound('victory');
    const canvas = document.getElementById('draw-canvas');
    const link = document.createElement('a');
    link.download = `Tekening-${drawState.player || 'Kids'}.png`;
    
    const composite = document.createElement('canvas');
    composite.width = canvas.width; composite.height = canvas.height;
    const cCtx = composite.getContext('2d');
    
    cCtx.fillStyle = "#FFFFFF"; cCtx.fillRect(0, 0, composite.width, composite.height);
    const bgImg = document.querySelector('.tracing-bg');
    if(bgImg) {
        cCtx.globalAlpha = 0.3;
        const hRatio = composite.width / bgImg.naturalWidth;
        const vRatio = composite.height / bgImg.naturalHeight;
        const ratio  = Math.min( hRatio, vRatio );
        const cx = ( composite.width - bgImg.naturalWidth*ratio ) / 2;
        const cy = ( composite.height - bgImg.naturalHeight*ratio ) / 2; 
        cCtx.drawImage(bgImg, 0,0, bgImg.naturalWidth, bgImg.naturalHeight, cx, cy, bgImg.naturalWidth*ratio, bgImg.naturalHeight*ratio);
        cCtx.globalAlpha = 1.0;
    }
    cCtx.drawImage(canvas, 0, 0);
    link.href = composite.toDataURL(); link.click();
}
