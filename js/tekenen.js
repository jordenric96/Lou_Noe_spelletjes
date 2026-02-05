// TEKENEN.JS - MET ZWART/WIT + 10 SLIMME KLEUREN
console.log("Tekenen.js geladen (Smart Palette 2.0)...");

let drawState = {
    isDrawing: false,
    color: '#000000',
    lineWidth: 5,
    lastX: 0, lastY: 0,
    player: null,
    bgImage: null,
    smartPalette: []
};

// Standaard palet voor als er geen plaatje is
const defaultPalette = ['#000000', '#FFFFFF', '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548'];

// --- 1. SLIMME KLEUREN EXTRAHEREN ---
function extractColors(imgSrc) {
    return new Promise((resolve) => {
        const img = new Image(); img.src = imgSrc; img.crossOrigin = "Anonymous";
        
        img.onload = () => {
            const c = document.createElement('canvas');
            const ctx = c.getContext('2d');
            // Schaal naar max 100px voor snelheid
            const scale = Math.min(1, 100 / Math.max(img.width, img.height));
            c.width = img.width * scale; c.height = img.height * scale;
            ctx.drawImage(img, 0, 0, c.width, c.height);
            
            try {
                const data = ctx.getImageData(0, 0, c.width, c.height).data;
                const colorCounts = {};
                
                // Scan pixels
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
                    // Negeer transparant & bijna-wit (want wit voegen we sowieso toe)
                    if (a < 128 || (r > 245 && g > 245 && b > 245)) continue;
                    
                    const rgb = `${r},${g},${b}`;
                    colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
                }
                
                // Sorteer op meest voorkomend
                let sortedRGB = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
                
                // Converteer de top 20 naar Hex-code
                let extractedHex = sortedRGB.slice(0, 20).map(rgb => {
                    const [r,g,b] = rgb.split(',').map(Number);
                    // Slimme truc om RGB naar HEX te zetten
                    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
                });

                // --- HET NIEUWE GEDEELTE ---
                // 1. Begin met Zwart en Wit
                const mandatoryColors = ['#000000', '#FFFFFF'];
                
                // 2. Filter de geëxtraheerde lijst: Haal zwart en wit eruit als ze erin zitten (voorkom dubbelen)
                let filteredTop10 = extractedHex.filter(color => !mandatoryColors.includes(color));
                
                // 3. Pak de top 10 van de overgebleven kleuren
                filteredTop10 = filteredTop10.slice(0, 10);
                
                // 4. Combineer: Zwart, Wit + 10 Plaatjeskleuren
                let finalPalette = mandatoryColors.concat(filteredTop10);
                
                // Fallback als het plaatje heel saai was
                if(finalPalette.length < 6) finalPalette = defaultPalette.slice(0,12);

                resolve(finalPalette);
            } catch (e) {
                console.log("Fout bij kleurextractie:", e);
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
    
    let themeOptions = `
        <div class="theme-card-btn selected" onclick="drawSelectTheme('blank', this)">
            <div class="theme-img-container" style="background:white; border:1px solid #eee;"></div>
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
    let palette = defaultPalette.slice(0,12); // Start met een basisset incl zwart/wit
    let bgHTML = '';
    
    if (drawState.bgImage !== 'blank') {
        board.innerHTML = `<div style="display:flex; height:100%; justify-content:center; align-items:center; color:white; font-size:1.5rem;">Kleuren mengen... 🎨</div>`;
        
        const t = memThemes[drawState.bgImage];
        const nr = Math.floor(Math.random() * 15) + 1;
        const src = `${t.path}${nr}.${t.extension}`;
        
        // Haal de slimme Zwart+Wit+10 palette op
        palette = await extractColors(src);
        bgHTML = `<img src="${src}" class="tracing-bg">`;
    }

    // Bouw Palette HTML
    const paletteHTML = palette.map(c => {
        // Zwart krijgt standaard de 'active' class
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
                <div class="paint-row">
                    ${paletteHTML}
                </div>
                <div class="tools-row">
                    <div style="display:flex; gap:5px;">
                        <button class="size-btn active" onclick="setLineWidth(5, this)"><div class="size-dot" style="width:5px; height:5px;"></div></button>
                        <button class="size-btn" onclick="setLineWidth(10, this)"><div class="size-dot" style="width:10px; height:10px;"></div></button>
                        <button class="size-btn" onclick="setLineWidth(25, this)"><div class="size-dot" style="width:18px; height:18px;"></div></button>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button class="action-btn eraser-btn" onclick="setEraser(this)">Gum</button>
                        <button class="action-btn clear-btn" onclick="clearCanvas()">Wis Alles</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    setupCanvas();
    // Zet standaard kleur op zwart en dikte op 5
    drawState.color = '#000000'; 
    drawState.lineWidth = 5;
}

// --- 4. CANVAS LOGICA ---
function setupCanvas() {
    const canvas = document.getElementById('draw-canvas');
    const wrapper = document.getElementById('canvas-wrapper');
    const ctx = canvas.getContext('2d');

    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    
    // Events
    canvas.addEventListener('mousedown', startPos);
    canvas.addEventListener('mouseup', endPos);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPos(e.touches[0]); }, {passive: false});
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); endPos(); }, {passive: false});
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); }, {passive: false});

    function startPos(e) {
        drawState.isDrawing = true;
        // Update context direct voor het geval instellingen gewijzigd zijn
        ctx.strokeStyle = drawState.color;
        ctx.lineWidth = drawState.lineWidth;
        draw(e);
    }
    function endPos() {
        drawState.isDrawing = false;
        ctx.beginPath();
    }
    function draw(e) {
        if (!drawState.isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
}

// TOOLS
function setDrawColor(color, btn) {
    if(typeof playSound === 'function') playSound('click');
    drawState.color = color;
    
    document.querySelectorAll('.paint-btn, .eraser-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    // Als we een kleur kiezen, zorgen dat we niet meer in 'gum modus' zitten (visueel)
    document.querySelector('.eraser-btn').classList.remove('active-tool');
}

function setEraser(btn) {
    if(typeof playSound === 'function') playSound('click');
    drawState.color = '#FFFFFF'; // Gummen is wit tekenen
    
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
    link.download = `Tekening-${drawState.player || 'Kids'}.png`;
    
    const composite = document.createElement('canvas');
    composite.width = canvas.width; composite.height = canvas.height;
    const cCtx = composite.getContext('2d');
    
    // Witte achtergrond
    cCtx.fillStyle = "#FFFFFF";
    cCtx.fillRect(0, 0, composite.width, composite.height);
    
    // Achtergrond plaatje (optioneel, lichtjes)
    const bgImg = document.querySelector('.tracing-bg');
    if(bgImg) {
        cCtx.globalAlpha = 0.3; // Zelfde doorzichtigheid als op scherm
        const hRatio = composite.width / bgImg.naturalWidth;
        const vRatio = composite.height / bgImg.naturalHeight;
        const ratio  = Math.min( hRatio, vRatio );
        const centerShift_x = ( composite.width - bgImg.naturalWidth*ratio ) / 2;
        const centerShift_y = ( composite.height - bgImg.naturalHeight*ratio ) / 2; 
        cCtx.drawImage(bgImg, 0,0, bgImg.naturalWidth, bgImg.naturalHeight, centerShift_x, centerShift_y, bgImg.naturalWidth*ratio, bgImg.naturalHeight*ratio);
        cCtx.globalAlpha = 1.0;
    }

    // De tekening
    cCtx.drawImage(canvas, 0, 0);
    
    link.href = composite.toDataURL();
    link.click();
}
