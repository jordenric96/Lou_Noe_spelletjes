// NIEUWE SPELLEN, STICKERS & TEKENALBUM

// CONFIGURATIE PLAATJES
const assetConfig = {
    'mario':     { count: 15, ext: 'png' },
    'pokemon':   { count: 15, ext: 'png' },
    'studio100': { count: 15, ext: 'png' },
    'boerderij': { count: 15, ext: 'png' },
    'dino':      { count: 15, ext: 'jpg' },
    'marvel':    { count: 15, ext: 'jpg' },
    'natuur':    { count: 15, ext: 'jpg' },
    'beroepen':  { count: 15, ext: 'jpg' }
};

// --- STICKERBOEK LOGICA ---

function generateAllStickers() {
    let allStickers = [];
    for (const [theme, data] of Object.entries(assetConfig)) {
        for (let i = 1; i <= data.count; i++) {
            allStickers.push({
                id: `${theme}-${i}`,
                src: `assets/images/memory/${theme}/${i}.${data.ext}`
            });
        }
    }
    return allStickers;
}

function getUnlockedStickers() {
    const stored = localStorage.getItem('myStickers');
    return stored ? JSON.parse(stored) : [];
}

function unlockRandomSticker() {
    const allStickers = generateAllStickers();
    const unlockedIds = getUnlockedStickers();
    const lockedStickers = allStickers.filter(s => !unlockedIds.includes(s.id));
    
    if (lockedStickers.length === 0) return null; 
    
    // UPDATE: KANS OP 100% GEZET (Altijd prijs!)
    const newSticker = lockedStickers[Math.floor(Math.random() * lockedStickers.length)];
    unlockedIds.push(newSticker.id);
    localStorage.setItem('myStickers', JSON.stringify(unlockedIds));
    return newSticker;
}

function openStickerBook() {
    const board = document.getElementById('game-board');
    const unlockedIds = getUnlockedStickers();
    const allStickers = generateAllStickers();
    
    let html = `<div class="sticker-header">Mijn Verzameling (${unlockedIds.length}/${allStickers.length})</div>`;
    html += '<div class="sticker-container">';
    
    if(unlockedIds.length === 0) {
        html += '<div class="empty-msg">Win spelletjes om stickers te verdienen!</div>';
    }
    
    allStickers.forEach(s => {
        const isUnlocked = unlockedIds.includes(s.id);
        if (isUnlocked) {
            // NU KLIKBAAR: zoomImage(...)
            html += `<div class="sticker-slot unlocked" onclick="zoomImage('${s.src}', false)">
                        <img src="${s.src}" class="sticker-img" loading="lazy">
                     </div>`;
        } else {
            html += `<div class="sticker-slot locked"><span class="sticker-lock-icon">🔒</span></div>`;
        }
    });
    
    html += '</div>';
    board.innerHTML = html;
}

// --- TEKENBORD & ALBUM ---

let isDrawing = false; let ctx; let drawColor = '#000000'; let drawSize = 5;

function startDrawing() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="drawing-container">
            <div class="drawing-controls top-controls">
               <button class="tool-btn album-btn" onclick="openDrawingAlbum()">📁 Mijn Album</button>
               <button class="tool-btn save-btn" onclick="saveDrawing()">💾 Opslaan</button>
            </div>
            
            <div class="drawing-controls">
                <div class="color-swatch active" style="background:black" onclick="setColor('black', this)"></div>
                <div class="color-swatch" style="background:#F44336" onclick="setColor('#F44336', this)"></div>
                <div class="color-swatch" style="background:#2196F3" onclick="setColor('#2196F3', this)"></div>
                <div class="color-swatch" style="background:#4CAF50" onclick="setColor('#4CAF50', this)"></div>
                <div class="color-swatch" style="background:#FFEB3B" onclick="setColor('#FFEB3B', this)"></div>
                <div class="control-divider"></div>
                <div class="size-btn active" onclick="setBrushSize(5, this)"><div class="dot dot-s"></div></div>
                <div class="size-btn" onclick="setBrushSize(15, this)"><div class="dot dot-m"></div></div>
                <div class="size-btn" onclick="setBrushSize(30, this)"><div class="dot dot-l"></div></div>
                <div class="control-divider"></div>
                <button class="tool-btn" onclick="clearCanvas()">🗑️</button>
            </div>
            <canvas id="drawCanvas"></canvas>
        </div>
    `;
    
    initCanvas();
}

function initCanvas() {
    const canvas = document.getElementById('drawCanvas');
    const container = document.querySelector('.drawing-container');
    if(!canvas) return;

    canvas.width = container.clientWidth * 0.95; 
    canvas.height = container.clientHeight * 0.75; // Iets kleiner ivm extra knoppen
    
    ctx = canvas.getContext('2d'); 
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    
    canvas.addEventListener('mousedown', startDraw); canvas.addEventListener('touchstart', startDraw, {passive: false});
    canvas.addEventListener('mousemove', draw); canvas.addEventListener('touchmove', draw, {passive: false});
    canvas.addEventListener('mouseup', stopDraw); canvas.addEventListener('touchend', stopDraw);
}

function startDraw(e) { isDrawing = true; draw(e); }
function stopDraw() { isDrawing = false; ctx.beginPath(); }
function draw(e) { 
    if (!isDrawing) return; 
    e.preventDefault(); 
    const canvas = document.getElementById('drawCanvas');
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; 
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; 
    ctx.lineWidth = drawSize; ctx.strokeStyle = drawColor; 
    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y); 
}
function setColor(color, btn) { if(typeof playSound === 'function') playSound('click'); drawColor = color; document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
function setBrushSize(size, btn) { if(typeof playSound === 'function') playSound('click'); drawSize = size; document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
function clearCanvas() { if(typeof playSound === 'function') playSound('pop'); const canvas = document.getElementById('drawCanvas'); ctx.clearRect(0, 0, canvas.width, canvas.height); }

// --- TEKENINGEN OPSLAAN & ALBUM ---

function saveDrawing() {
    const canvas = document.getElementById('drawCanvas');
    // Maak een plaatje (base64 string)
    const image = canvas.toDataURL("image/png");
    
    let album = JSON.parse(localStorage.getItem('myDrawings') || '[]');
    
    // Voeg nieuwe toe (max 20 tekeningen om geheugen te sparen)
    album.unshift(image); 
    if(album.length > 20) album.pop();
    
    localStorage.setItem('myDrawings', JSON.stringify(album));
    
    if(typeof playSound === 'function') playSound('win');
    alert("Tekening opgeslagen! 🎉");
}

function openDrawingAlbum() {
    const board = document.getElementById('game-board');
    const album = JSON.parse(localStorage.getItem('myDrawings') || '[]');
    
    let html = `<div class="sticker-header">Mijn Tekenalbum 🎨</div>`;
    html += `<button class="start-btn" onclick="startDrawing()" style="width:auto; margin-bottom:10px;">⬅ Terug naar tekenen</button>`;
    html += '<div class="sticker-container">';
    
    if(album.length === 0) {
        html += '<div class="empty-msg">Je hebt nog geen tekeningen opgeslagen.</div>';
    }
    
    // Loop door tekeningen (met index om te kunnen verwijderen)
    album.forEach((imgSrc, index) => {
        html += `<div class="sticker-slot unlocked" style="background:white" onclick="zoomImage('${imgSrc}', true, ${index})">
                    <img src="${imgSrc}" class="sticker-img" style="border-radius:10px;">
                 </div>`;
    });
    
    html += '</div>';
    board.innerHTML = html;
}

function deleteDrawing(index) {
    let album = JSON.parse(localStorage.getItem('myDrawings') || '[]');
    album.splice(index, 1); // Verwijder de tekening
    localStorage.setItem('myDrawings', JSON.stringify(album));
    closeZoom();
    openDrawingAlbum(); // Ververs het album
    if(typeof playSound === 'function') playSound('pop');
}


// --- ZOOM FUNCTIE (Voor stickers & tekeningen) ---
function zoomImage(src, isDrawing, index) {
    const overlay = document.getElementById('zoom-overlay');
    const img = document.getElementById('zoomed-image');
    const delBtn = document.getElementById('delete-drawing-btn');
    
    img.src = src;
    overlay.classList.remove('hidden');
    
    if(isDrawing) {
        delBtn.classList.remove('hidden');
        // Koppel de verwijder actie aan de juiste index
        delBtn.onclick = function(e) {
            e.stopPropagation(); // Voorkom dat de modal sluit
            if(confirm("Wil je deze tekening weggooien?")) {
                deleteDrawing(index);
            }
        };
    } else {
        delBtn.classList.add('hidden');
    }
}

function closeZoom() {
    document.getElementById('zoom-overlay').classList.add('hidden');
}


// --- VANG ZE & SIMON (Blijven hetzelfde, kort samengevat) ---
// (Ik laat de code voor Whack & Simon hier staan zoals in de vorige versie)
// Zorg dat je de whack en simon code uit het vorige antwoord hieronder laat staan of kopieert!
// Om ruimte te besparen plak ik ze hier niet opnieuw, maar ze MOETEN in dit bestand blijven.
// ... WHACK CODE ...
// ... SIMON CODE ...
// (Als je ze kwijt bent, pak ze uit het vorige bericht en plak ze onderaan dit bestand)

// HIERONDER DE WHACK & SIMON CODE OPNIEUW VOOR DE VOLLEDIGHEID:

let whackState = { player: null, score: 0, timer: 30, active: false, gridSize: 9, speed: 1000, moleTimer: null, gameTimer: null };
function startWhackGame() { const board = document.getElementById('game-board'); board.innerHTML = `<div class="memory-setup"><div class="setup-columns"><div class="setup-group group-players"><h3>Wie speelt?</h3><div class="option-grid"><button class="option-btn player-btn" onclick="setWhackPlayer('Lou', this)"><span>👦🏼</span><span class="btn-label">Lou</span></button><button class="option-btn player-btn" onclick="setWhackPlayer('Noé', this)"><span>👶🏼</span><span class="btn-label">Noé</span></button></div></div><div class="setup-group group-size"><h3>Niveau</h3><div class="option-grid"><button class="option-btn" onclick="setWhackDiff('easy', this)"><span>🟢</span></button><button class="option-btn selected" onclick="setWhackDiff('medium', this)"><span>🟠</span></button><button class="option-btn" onclick="setWhackDiff('hard', this)"><span>🔴</span></button></div></div></div><button id="start-whack-btn" class="start-btn" onclick="runWhackGame()" disabled>Kies een speler...</button></div>`; whackState.player = null; }
function setWhackPlayer(n, b) { whackState.player = n; document.querySelectorAll('.player-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); document.getElementById('start-whack-btn').disabled=false; }
function setWhackDiff(d, b) { document.querySelectorAll('.group-size .option-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); whackState.gridSize = d==='easy'?4:(d==='hard'?16:9); whackState.speed = d==='easy'?1500:(d==='hard'?550:900); }
function runWhackGame() { const board = document.getElementById('game-board'); whackState.score=0; whackState.timer=30; whackState.active=true; let gC = whackState.gridSize===4?'grid-2':(whackState.gridSize===16?'grid-4':'grid-3'); let h=''; for(let i=0;i<whackState.gridSize;i++) h+=`<div class="whack-hole" id="hole-${i}" onmousedown="whack(this)" ontouchstart="whack(this)"><div class="whack-character"></div></div>`; board.innerHTML=`<div class="whack-container"><div class="whack-score-board"><span>${whackState.player}</span><span><span id="whack-time">30</span>s</span><span><span id="whack-score">0</span></span></div><div class="whack-grid ${gC}">${h}</div></div>`; whackState.gameTimer=setInterval(()=>{if(!whackState.active)return;whackState.timer--;document.getElementById('whack-time').innerText=whackState.timer;if(whackState.timer<=0)endWhackGame();},1000); popUpMole(); }
function popUpMole() { if(!whackState.active)return; const holes=document.querySelectorAll('.whack-hole'); const hole=holes[Math.floor(Math.random()*holes.length)]; hole.querySelector('.whack-character').style.backgroundImage=`url('assets/images/memory/mario/${Math.floor(Math.random()*10)+1}.png')`; hole.classList.add('up'); whackState.moleTimer=setTimeout(()=>{hole.classList.remove('up');if(whackState.active)setTimeout(popUpMole,Math.random()*300);},whackState.speed); }
function whack(h) { if(!whackState.active||!h.classList.contains('up')||h.classList.contains('whacked'))return; playSound('pop'); h.classList.remove('up'); h.classList.add('whacked'); setTimeout(()=>h.classList.remove('whacked'),200); whackState.score++; document.getElementById('whack-score').innerText=whackState.score; }
function endWhackGame() { whackState.active=false; clearInterval(whackState.gameTimer); clearTimeout(whackState.moleTimer); showWinnerModal(whackState.player, [{name:whackState.player, score:whackState.score}]); }
function stopWhackGame() { whackState.active=false; clearInterval(whackState.gameTimer); clearTimeout(whackState.moleTimer); }

// SIMON
let simonSeq=[], playSeq=[], simonLvl=0, simonAct=false, simonThm='mario';
const simonThemes={'mario':{type:'img',path:'assets/images/memory/mario/',ext:'png'}, 'pokemon':{type:'img',path:'assets/images/memory/pokemon/',ext:'png'}, 'kleuren':{type:'color',colors:['#4CAF50','#F44336','#FFEB3B','#2196F3']}}; 
function startSimonGame() { const board=document.getElementById('game-board'); board.innerHTML=`<div class="memory-setup"><div class="setup-group"><h3>Thema</h3><div class="option-grid"><button class="option-btn" onclick="setSimonThm('mario',this)"><span>🍄</span></button><button class="option-btn" onclick="setSimonThm('pokemon',this)"><span>⚡</span></button></div></div><button id="start-simon" class="start-btn" onclick="initSimon()" disabled>Kies...</button></div>`; }
function setSimonThm(t,b){ simonThm=t; document.querySelectorAll('.option-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); document.getElementById('start-simon').disabled=false; }
function initSimon(){ const board=document.getElementById('game-board'); let b=''; for(let i=0;i<4;i++) b+=`<button class="simon-btn" id="btn-${i}" style="background-image:url('${simonThemes[simonThm].path}${i+1}.${simonThemes[simonThm].ext}');background-size:cover" onclick="handleSimon(${i})"></button>`; board.innerHTML=`<div class="simon-container"><div class="simon-info"><span id="simon-msg">Let op...</span></div><div class="simon-board">${b}</div><button class="start-btn" onclick="nextSimon()">Start</button></div>`; simonSeq=[]; simonLvl=0; }
function nextSimon(){ simonLvl++; playSeq=[]; simonSeq.push(Math.floor(Math.random()*4)); runSeq(); }
function runSeq(){ simonAct=false; let i=0; const int=setInterval(()=>{ actSimon(simonSeq[i]); i++; if(i>=simonSeq.length){clearInterval(int); simonAct=true; document.getElementById('simon-msg').innerText="Jij!";} },800); }
function actSimon(i){ const b=document.getElementById(`btn-${i}`); b.classList.add('lit'); playSound('pop'); setTimeout(()=>b.classList.remove('lit'),400); }
function handleSimon(i){ if(!simonAct)return; actSimon(i); playSeq.push(i); if(playSeq[playSeq.length-1]!==simonSeq[playSeq.length-1]){ playSound('lose'); document.getElementById('simon-msg').innerText="Fout!"; simonAct=false; setTimeout(()=>showWinnerModal("Simon",[{name:"Jij",score:simonLvl-1}]),1000); return;} if(playSeq.length===simonSeq.length){ simonAct=false; setTimeout(nextSimon,1000); }}
function stopSimonGame(){ simonAct=false; }
