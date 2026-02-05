// TEKENEN.JS - MET SMART PALETTE & SETUP
console.log("Tekenen.js geladen (Smart Colors)...");

let drawState = {
    isDrawing: false,
    color: '#000000',
    lineWidth: 5,
    lastX: 0, lastY: 0,
    player: null,
    bgImage: null,
    smartPalette: [] // Hier komen de 12 kleuren
};

const defaultPalette = ['#000000', '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#FFFFFF'];

// --- 1. SLIMME KLEUREN EXTRAHEREN ---
function extractColors(imgSrc) {
    return new Promise((resolve) => {
        const img = new Image(); img.src = imgSrc; img.crossOrigin = "Anonymous";
        
        img.onload = () => {
            // Maak een mini canvas om pixels te lezen
            const c = document.createElement('canvas');
            const ctx = c.getContext('2d');
            // We verkleinen het plaatje voor snelheid (max 100px)
            const scale = Math.min(1, 100 / Math.max(img.width, img.height));
            c.width = img.width * scale; c.height = img.height * scale;
            ctx.drawImage(img, 0, 0, c.width, c.height);
            
            try {
                const data = ctx.getImageData(0, 0, c.width, c.height).data;
                const colorCounts = {};
                
                // Scan pixels
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
                    // Negeer transparant & wit
                    if (a < 128 || (r > 240 && g > 240 && b > 240)) continue;
                    
                    const rgb = `${r},${g},${b}`;
                    colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
                }
                
                // Sorteer op meest voorkomend
                let sorted = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
                
                // Pak top 12 en zet om naar Hex
                let palette = sorted.slice(0, 12).map(rgb => {
                    const [r,g,b] = rgb.split(',').map(Number);
                    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
                });
                
                // Als we te weinig kleuren vinden, vul aan met zwart/rood/blauw
                if(palette.length < 5) palette = palette.concat(['#000000', '#FF0000', '#0000FF']);
                
                resolve(palette);
            } catch (e) {
                console.log("Kleur extractie fout (waarschijnlijk security):", e);
                resolve(defaultPalette.slice(0, 12)); // Fallback
            }
        };
        img.onerror = () => resolve(defaultPalette.slice(0, 12));
    });
}

// --- 2. SETUP SCHERM ---
function startDrawingGame() {
    startDrawingSetup();
}

function startDrawingSetup() {
    const board = document.getElementById('game-board');
    
    // Thema's ophalen
    let themeOptions = `
        <div class="theme-card-btn selected" onclick="drawSelectTheme('blank', this)">
            <div class="theme-img-container" style="background:white;"></div>
            <div class="btn-label">Wit Blad 📄</div>
        </div>`;
        
    if(typeof memThemes !== 'undefined') {
        Object.keys(memThemes).forEach(key => {
            const t = memThemes[key];
            if(!t.locked && !t.isMix) {
                 themeOptions += `
                    <div class="theme-card-btn" onclick="drawSelectTheme('${key}', this)">
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

            <div class="setup-group">
                <h3>2. Kies een Kleurplaat</h3>
                <div class="theme-grid-wrapper">
                    ${themeOptions}
                </div>
            </div>

            <div class="bottom-actions">
                <button id="draw-start-btn" class="start-btn" onclick="initDrawing()" disabled>Kies een speler...</button>
                <button class="tool-btn" onclick="location.reload()">⬅ Menu</button>
            </div>
        </div>
    `;
    drawState.player = null; drawState.bgImage = 'blank';
}

function drawSelectPerson(name, btn) {
    if(typeof playSound === 'function') playSound('click');
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending');
    drawState.player = name;
    checkDrawStart();
}

function drawSelectTheme(theme, btn) {
    if(typeof playSound === 'function') playSound('click');
    document.querySelectorAll('.theme-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    drawState.bgImage = theme;
}

function checkDrawStart() {
    const btn = document.getElementById('draw-start-btn');
    if(drawState.player) {
        btn.disabled = false; btn.innerText = "START TEKENEN 🎨";
    }
}

// --- 3. INIT GAME ---
async function initDrawing() {
    const board = document.getElementById('game-board');
    
    // Kleuren bepalen
    let palette = defaultPalette;
    let bgHTML = '';
    
    if (drawState.bgImage !== 'blank') {
        board.innerHTML = `<div style="display:flex; height:100%; justify-content:center; align-items:center; color:white; font-size:1.5rem;">Kleuren mengen... 🎨</div>`;
        
        // Kies willekeurig plaatje uit thema
        const t = memThemes[drawState.bgImage];
        const nr = Math.floor(Math.random() * 15) + 1;
        const src = `${t.path}${nr}.${t.extension}`;
        
        // 1. Haal kleuren op
        const smartColors = await extractColors(src);
        palette = smartColors.concat(['#000000', '#FFFFFF']); // Altijd zwart/wit erbij
        
        // 2. Zet achtergrond
        bgHTML = `<img src="${src}" class="tracing-bg">`;
    }

    // Bouw Scherm
    const paletteHTML = palette.map(c => 
        `<div class="paint-btn" style="background:${c}" onclick="setDrawColor('${c}', this)"></div>`
    ).join('');

    board.innerHTML = `
        <div class="drawing-container">
            <div class="drawing-header">
                <button class="tool-btn" onclick="startDrawingSetup()">⬅ Terug</button>
                <div class="player-tag">${drawState.player}'s Kunstwerk</div>
                <button class="action-btn" onclick="saveDrawing()">💾</button>
            </div>
            
            <div class="canvas-wrapper" id="canvas-wrapper">
                ${bgHTML}
                <canvas id="draw-canvas"></canvas>
            </div>

            <div class="drawing-toolbar">
                <div class="paint-row">
                    ${paletteHTML}
                </div>
                <div class="tools-row">
                    <div style="display:flex; gap:5px;">
                        <button class="size-btn active" onclick="setLineWidth(5, this)"><div class="size-dot" style="width:5px; height:5px;"></div></button>
                        <button class="size-btn" onclick="setLineWidth(10, this)"><div class="size-dot" style="width:10px; height:10px;"></div></button>
                        <button class="size-btn" onclick="setLineWidth(20, this)"><div class="size-dot" style="width:15px; height:15px;"></div></button>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button class="action-btn eraser-btn" onclick="setDrawColor('#FFFFFF', this)">Gum</button>
                        <button class="action-btn clear-btn" onclick="clearCanvas()">Wis Alles</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    setupCanvas();
}

// --- 4. CANVAS LOGICA ---
function setupCanvas() {
    const canvas = document.getElementById('draw-canvas');
    const wrapper = document.getElementById('canvas-wrapper');
    const ctx = canvas.getContext('2d');

    // Resize canvas to fit wrapper
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = drawState.color;
    ctx.lineWidth = drawState.lineWidth;

    // Mouse Events
    canvas.addEventListener('mousedown', startPos);
    canvas.addEventListener('mouseup', endPos);
    canvas.addEventListener('mousemove', draw);
    
    // Touch Events
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPos(e.touches[0]); }, {passive: false});
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); endPos(); }, {passive: false});
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); }, {passive: false});

    function startPos(e) {
        drawState.isDrawing = true;
        draw(e); // Zet direct een punt
    }
    
    function endPos() {
        drawState.isDrawing = false;
        ctx.beginPath(); // Reset pad zodat lijnen niet verbonden blijven
    }
    
    function draw(e) {
        if (!drawState.isDrawing) return;
        
        // Correctie voor canvas positie
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

// TOOLS
function setDrawColor(color, btn) {
    if(typeof playSound === 'function') playSound('click');
    drawState.color = color;
    const ctx = document.getElementById('draw-canvas').getContext('2d');
    ctx.strokeStyle = color;
    
    // Visuele update
    document.querySelectorAll('.paint-btn, .eraser-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
}

function setLineWidth(width, btn) {
    if(typeof playSound === 'function') playSound('click');
    drawState.lineWidth = width;
    const ctx = document.getElementById('draw-canvas').getContext('2d');
    ctx.lineWidth = width;
    
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function clearCanvas() {
    if(confirm("Wil je echt alles wissen?")) {
        if(typeof playSound === 'function') playSound('error');
        const canvas = document.getElementById('draw-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function saveDrawing() {
    if(typeof playSound === 'function') playSound('victory');
    const canvas = document.getElementById('draw-canvas');
    const link = document.createElement('a');
    link.download = `Tekening-${drawState.player}.png`;
    
    // We moeten de achtergrond en de tekening samenvoegen voor de download
    // (Anders download je alleen de lijnen)
    const composite = document.createElement('canvas');
    composite.width = canvas.width; composite.height = canvas.height;
    const cCtx = composite.getContext('2d');
    
    // 1. Witte achtergrond
    cCtx.fillStyle = "#FFFFFF";
    cCtx.fillRect(0, 0, composite.width, composite.height);
    
    // 2. (Optioneel) De kleurplaat eronder tekenen? 
    // Als we dat doen, wordt het een echte kleurplaat. 
    // Laten we de afbeelding ophalen
    const bgImg = document.querySelector('.tracing-bg');
    if(bgImg) {
        // Teken de achtergrond vaag
        cCtx.globalAlpha = 0.3;
        // Schalen zoals CSS 'object-fit: contain'
        const hRatio = composite.width / bgImg.naturalWidth;
        const vRatio = composite.height / bgImg.naturalHeight;
        const ratio  = Math.min( hRatio, vRatio );
        const centerShift_x = ( composite.width - bgImg.naturalWidth*ratio ) / 2;
        const centerShift_y = ( composite.height - bgImg.naturalHeight*ratio ) / 2; 
        cCtx.drawImage(bgImg, 0,0, bgImg.naturalWidth, bgImg.naturalHeight, centerShift_x, centerShift_y, bgImg.naturalWidth*ratio, bgImg.naturalHeight*ratio);
        cCtx.globalAlpha = 1.0;
    }

    // 3. De tekening zelf
    cCtx.drawImage(canvas, 0, 0);
    
    link.href = composite.toDataURL();
    link.click();
}
