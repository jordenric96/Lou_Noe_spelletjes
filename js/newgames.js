// NEWGAMES.JS - VOLLEDIG PAKKET (PUZZEL, VANG ZE MET VALLEN, SIMON, TEKENEN, STICKERS)

console.log("Newgames.js Full Loaded");

// Configuratie
const assetConfig = {
    'mario': { count: 15, ext: 'png' }, 'pokemon': { count: 15, ext: 'png' },
    'studio100': { count: 15, ext: 'png' }, 'boerderij': { count: 15, ext: 'png' },
    'dino': { count: 15, ext: 'jpg' }, 'marvel': { count: 15, ext: 'jpg' },
    'natuur': { count: 15, ext: 'jpg' }, 'beroepen': { count: 15, ext: 'jpg' }
};

// --- 1. STICKERBOEK ---
function generateAllStickers() {
    let all = [];
    for (const [theme, data] of Object.entries(assetConfig)) {
        for (let i=1; i<=data.count; i++) all.push({id:`${theme}-${i}`, src:`assets/images/memory/${theme}/${i}.${data.ext}`});
    }
    return all;
}
function getUnlockedStickers() { return JSON.parse(localStorage.getItem('myStickers') || '[]'); }

function unlockRandomSticker() {
    const all = generateAllStickers(); 
    const unlocked = getUnlockedStickers();
    const locked = all.filter(s => !unlocked.includes(s.id));
    if (locked.length === 0) return null;
    
    // 30% kans op sticker bij winst
    if (Math.random() > 0.3) { 
        const newS = locked[Math.floor(Math.random() * locked.length)];
        unlocked.push(newS.id);
        localStorage.setItem('myStickers', JSON.stringify(unlocked));
        return newS;
    }
    return null;
}

function openStickerBook() {
    const board = document.getElementById('game-board');
    const unlocked = getUnlockedStickers(); 
    const all = generateAllStickers();
    
    let html = `<div class="sticker-header">Mijn Verzameling (${unlocked.length}/${all.length})</div><div class="sticker-container">`;
    if(unlocked.length === 0) html += '<div class="empty-msg">Win spelletjes om stickers te verdienen!</div>';
    
    all.forEach(s => {
        if(unlocked.includes(s.id)) html+=`<div class="sticker-slot unlocked"><img src="${s.src}" class="sticker-img"></div>`;
        else html+=`<div class="sticker-slot locked"><span class="sticker-lock-icon">🔒</span></div>`;
    });
    board.innerHTML = html + '</div>';
}


// --- 2. VANG ZE! (MET VALLEN) ---
let wState = { score: 0, timer: 30, active: false, speed: 1000, grid: 9, timerInt: null, moleInt: null };

function startWhackGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="memory-setup" style="text-align:center;">
            <div class="setup-group" style="width:100%; max-width:400px; margin:0 auto;">
                <h3>Vang ze! 🔨</h3>
                <p style="font-size:0.9rem; color:#666; margin-bottom:10px;">Pas op voor de 💣 en de 💩!</p>
                <div class="option-grid">
                    <button class="option-btn" onclick="setWhackDiff('easy', this)"><span>🟢</span><span class="btn-label">Makkelijk</span></button>
                    <button class="option-btn selected" onclick="setWhackDiff('medium', this)"><span>🟠</span><span class="btn-label">Normaal</span></button>
                    <button class="option-btn" onclick="setWhackDiff('hard', this)"><span>🔴</span><span class="btn-label">Snel!</span></button>
                </div>
            </div>
            <button class="start-btn" onclick="runWhackGame()">START SPEL</button>
        </div>
    `;
    wState.speed = 900; wState.grid = 9;
}

function setWhackDiff(diff, btn) {
    if(typeof playSound === 'function') playSound('click');
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    if(diff === 'easy') { wState.speed = 1200; wState.grid = 4; }
    else if(diff === 'medium') { wState.speed = 900; wState.grid = 9; }
    else if(diff === 'hard') { wState.speed = 550; wState.grid = 12; }
}

function runWhackGame() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    wState.score = 0; wState.timer = 30; wState.active = true;
    
    let gridClass = wState.grid === 4 ? 'grid-2' : (wState.grid === 12 ? 'grid-4' : 'grid-3');
    let holes = '';
    for(let i=0; i<wState.grid; i++) {
        holes += `<div class="whack-hole" id="hole-${i}" onmousedown="whack(this)" ontouchstart="whack(this)"><div class="whack-character"></div></div>`;
    }
    
    board.innerHTML = `
        <div class="whack-container">
            <div class="whack-score-board">
                <span>Tijd: <span id="w-time">30</span></span>
                <span>Score: <span id="w-score">0</span></span>
            </div>
            <div class="whack-grid ${gridClass}">${holes}</div>
        </div>
    `;
    
    wState.timerInt = setInterval(() => {
        if(!wState.active) return;
        wState.timer--;
        document.getElementById('w-time').innerText = wState.timer;
        if(wState.timer <= 0) endWhack(false);
    }, 1000);
    
    popMole();
}

function popMole() {
    if(!wState.active) return;
    const holes = document.querySelectorAll('.whack-hole');
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    const char = randomHole.querySelector('.whack-character');
    
    randomHole.classList.remove('trap-bomb', 'trap-poop');
    char.innerHTML = '';
    char.style.backgroundImage = '';

    // VALSTRIK LOGICA (20% Kans)
    const isTrap = Math.random() < 0.2; 
    if (isTrap) {
        const isBomb = Math.random() < 0.5;
        if (isBomb) { randomHole.classList.add('trap-bomb'); char.innerText = '💣'; }
        else { randomHole.classList.add('trap-poop'); char.innerText = '💩'; }
    } else {
        const imgNr = Math.floor(Math.random() * 10) + 1;
        char.style.backgroundImage = `url('assets/images/memory/mario/${imgNr}.png')`;
    }
    
    randomHole.classList.add('up');
    wState.moleInt = setTimeout(() => {
        randomHole.classList.remove('up');
        if(wState.active) setTimeout(popMole, Math.random() * 500);
    }, wState.speed);
}

function whack(hole) {
    if(!wState.active || !hole.classList.contains('up') || hole.classList.contains('whacked')) return;
    
    // GAME OVER BIJ VAL
    if (hole.classList.contains('trap-bomb') || hole.classList.contains('trap-poop')) {
        if(typeof playSound === 'function') playSound('lose');
        hole.querySelector('.whack-character').innerText = '💥'; 
        hole.style.backgroundColor = 'red';
        wState.active = false;
        setTimeout(() => endWhack(true), 500);
        return;
    }

    if(typeof playSound === 'function') playSound('pop');
    wState.score++;
    document.getElementById('w-score').innerText = wState.score;
    hole.classList.remove('up'); hole.classList.add('whacked');
    setTimeout(() => hole.classList.remove('whacked'), 200);
}

function endWhack(isGameOver) {
    wState.active = false;
    clearInterval(wState.timerInt); clearTimeout(wState.moleInt);
    let title = isGameOver ? "BOEM! 💥" : "Tijd op!";
    let msg = isGameOver ? "Je raakte een val!" : "Goed gedaan!";
    
    if(typeof showWinnerModal === 'function') {
        const modalTitle = document.getElementById('winner-title');
        if(modalTitle) modalTitle.innerText = title;
        showWinnerModal(msg, [{name:"Score", score: wState.score}]);
    }
}
function stopWhackGame() { wState.active = false; clearInterval(wState.timerInt); clearTimeout(wState.moleInt); }


// --- 3. SIMON ZEGT (MET THEMA'S) ---
let sSeq=[], pSeq=[], sLvl=0, sAct=false, sThm='mario';
const sThms = {
    'mario': { path: 'assets/images/memory/mario/', ext: 'png' },
    'pokemon': { path: 'assets/images/memory/pokemon/', ext: 'png' }
};

function startSimonGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="memory-setup" style="text-align:center;">
            <div class="setup-group">
                <h3>Kies Vriendjes 💡</h3>
                <div class="option-grid">
                    <button class="option-btn selected" onclick="setSimonTheme('mario', this)"><span>🍄</span><span class="btn-label">Mario</span></button>
                    <button class="option-btn" onclick="setSimonTheme('pokemon', this)"><span>⚡</span><span class="btn-label">Pokémon</span></button>
                </div>
            </div>
            <button class="start-btn" onclick="initSimon()">START</button>
        </div>
    `;
    sThm = 'mario';
}

function setSimonTheme(t, btn) {
    if(typeof playSound === 'function') playSound('click');
    sThm = t;
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function initSimon() {
    const board = document.getElementById('game-board');
    const t = sThms[sThm];
    let buttons = '';
    for(let i=0; i<4; i++) {
        buttons += `<button class="simon-btn" id="sb-${i}" style="background-image:url('${t.path}${i+1}.${t.ext}'); background-size:cover;" onclick="hSim(${i})"></button>`;
    }
    board.innerHTML = `
        <div class="simon-container">
            <div class="simon-info"><div class="simon-score">Score: <span id="s-score">0</span></div><div class="simon-message" id="s-msg">Let op...</div></div>
            <div class="simon-board theme-${sThm}">${buttons}</div>
            <button class="start-btn" onclick="nextSim()" style="width:auto; padding:10px 20px; margin-top:20px;">Start!</button>
        </div>
    `;
    sSeq=[]; sLvl=0;
}

function nextSim() {
    sLvl++; pSeq=[]; 
    document.getElementById('s-score').innerText = sLvl-1;
    document.getElementById('s-msg').innerText = "Kijk goed...";
    sSeq.push(Math.floor(Math.random()*4));
    
    const btn = document.querySelector('.simon-container .start-btn');
    if(btn) btn.style.display = 'none';
    
    sAct = false;
    let i=0;
    const int = setInterval(() => {
        actSim(sSeq[i]); i++;
        if(i >= sSeq.length) { clearInterval(int); sAct=true; document.getElementById('s-msg').innerText = "Jij!"; }
    }, 800);
}

function actSim(i) {
    const b = document.getElementById(`sb-${i}`);
    if(b) {
        b.classList.add('lit');
        if(typeof playSound === 'function') playSound('pop');
        setTimeout(() => b.classList.remove('lit'), 400);
    }
}

function hSim(i) {
    if(!sAct) return;
    actSim(i); pSeq.push(i);
    if(pSeq[pSeq.length-1] !== sSeq[pSeq.length-1]) {
        if(typeof playSound === 'function') playSound('lose');
        document.getElementById('s-msg').innerText = "Fout!";
        sAct = false;
        if(typeof showWinnerModal === 'function') showWinnerModal("Simon", [{name:"Jij", score: sLvl-1}]);
        return;
    }
    if(pSeq.length === sSeq.length) {
        sAct = false;
        document.getElementById('s-msg').innerText = "Goed zo!";
        setTimeout(nextSim, 1000);
    }
}
function stopSimonGame() { sAct = false; }


// --- 4. TEKENBORD (MET OPSLAAN) ---
let isDrawing = false, ctx, dColor='black', dSize=5;

function startDrawing() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="drawing-container">
            <div class="drawing-controls">
                <button class="tool-btn" onclick="openAlbum()">📂</button>
                <button class="tool-btn" style="background:#4CAF50; color:white;" onclick="saveDraw()">💾</button>
                <div class="control-divider"></div>
                <div class="color-swatch active" style="background:black" onclick="setCol('black',this)"></div>
                <div class="color-swatch" style="background:red" onclick="setCol('red',this)"></div>
                <div class="color-swatch" style="background:blue" onclick="setCol('blue',this)"></div>
                <div class="color-swatch" style="background:yellow" onclick="setCol('yellow',this)"></div>
                <div class="control-divider"></div>
                <div class="size-btn active" onclick="setSize(5,this)"><div class="dot dot-s"></div></div>
                <div class="size-btn" onclick="setSize(15,this)"><div class="dot dot-m"></div></div>
                <button class="tool-btn" onclick="clearCan()">🗑️</button>
            </div>
            <canvas id="drawCanvas"></canvas>
        </div>
    `;
    setTimeout(initCan, 50);
}

function initCan() {
    const c = document.getElementById('drawCanvas');
    const con = document.querySelector('.drawing-container');
    if(!c) return;
    c.width = con.clientWidth * 0.95; c.height = con.clientHeight * 0.8;
    ctx=c.getContext('2d'); ctx.lineCap='round'; ctx.lineJoin='round';
    c.addEventListener('mousedown', sD); c.addEventListener('touchstart', sD, {passive:false});
    c.addEventListener('mousemove', d); c.addEventListener('touchmove', d, {passive:false});
    c.addEventListener('mouseup', eD); c.addEventListener('touchend', eD);
}
function sD(e){isDrawing=true; d(e);} function eD(){isDrawing=false; ctx.beginPath();}
function d(e){
    if(!isDrawing)return; e.preventDefault(); 
    const c=document.getElementById('drawCanvas'); 
    const r=c.getBoundingClientRect(); 
    const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left; 
    const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top; 
    ctx.lineWidth=dSize; ctx.strokeStyle=dColor; 
    ctx.lineTo(x,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y);
}
function setCol(c,b){if(typeof playSound==='function')playSound('click'); dColor=c; document.querySelectorAll('.color-swatch').forEach(x=>x.classList.remove('active')); b.classList.add('active');}
function setSize(s,b){if(typeof playSound==='function')playSound('click'); dSize=s; document.querySelectorAll('.size-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active');}
function clearCan(){if(typeof playSound==='function')playSound('pop'); ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);}

function saveDraw() {
    const img = document.getElementById('drawCanvas').toDataURL("image/png");
    let a = JSON.parse(localStorage.getItem('myDrawings')||'[]');
    a.unshift(img); if(a.length>10) a.pop();
    localStorage.setItem('myDrawings', JSON.stringify(a));
    if(typeof playSound === 'function') playSound('win');
    alert("Opgeslagen!");
}

function openAlbum() {
    const board = document.getElementById('game-board');
    const a = JSON.parse(localStorage.getItem('myDrawings')||'[]');
    let html = `<div class="sticker-header">Mijn Tekeningen 🎨</div>
                <button class="tool-btn" onclick="startDrawing()" style="margin-bottom:10px;">⬅ Terug</button>
                <div class="sticker-container">`;
    if(a.length===0) html += '<p style="text-align:center;">Nog geen tekeningen.</p>';
    a.forEach(src => { html += `<div class="sticker-slot unlocked"><img src="${src}" class="sticker-img"></div>`; });
    board.innerHTML = html + '</div>';
}


// --- 5. PUZZELEN (NIEUW) ---
let pState = { img: '', pieces: [], rows: 3, cols: 2, selectedPiece: null, correctCount: 0, difficulty: 'easy' };

function startPuzzleGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="memory-setup" style="text-align:center;">
            <div class="setup-group">
                <h3>Kies een Puzzel 🧩</h3>
                <div class="option-grid" id="puzzle-themes"></div>
            </div>
            <div class="setup-group">
                <h3>Niveau</h3>
                <div class="option-grid">
                    <button class="option-btn selected" onclick="setPuzzleDiff('easy', this)"><span>🟢</span><span class="btn-label">Makkelijk (6)</span></button>
                    <button class="option-btn" onclick="setPuzzleDiff('hard', this)"><span>🔴</span><span class="btn-label">Moeilijk (32)</span></button>
                </div>
            </div>
            <button id="start-puzzle-btn" class="start-btn" onclick="initPuzzle()" disabled>Kies een plaatje...</button>
        </div>
    `;
    
    // Genereer plaatjes opties (random selectie)
    const container = document.getElementById('puzzle-themes');
    const themes = ['mario', 'pokemon', 'studio100', 'boerderij'];
    let html = '';
    for(let i=0; i<4; i++) {
        const t = themes[i];
        const nr = Math.floor(Math.random() * 10) + 1;
        const src = `assets/images/memory/${t}/${nr}.png`;
        html += `<button class="theme-card-btn" onclick="setPuzzleImg('${src}', this)" style="width:80px; height:80px; padding:0;"><img src="${src}" style="width:100%; height:100%; object-fit:contain;"></button>`;
    }
    container.innerHTML = html;
    pState.difficulty = 'easy'; pState.rows = 3; pState.cols = 2;
}

function setPuzzleImg(src, btn) {
    if(typeof playSound === 'function') playSound('click');
    pState.img = src;
    document.querySelectorAll('.theme-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('start-puzzle-btn').disabled = false;
}

function setPuzzleDiff(diff, btn) {
    if(typeof playSound === 'function') playSound('click');
    pState.difficulty = diff;
    if(diff === 'easy') { pState.cols = 2; pState.rows = 3; } // 6
    else { pState.cols = 4; pState.rows = 8; } // 32
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function initPuzzle() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    pState.correctCount = 0; pState.selectedPiece = null;
    
    const totalPieces = pState.rows * pState.cols;
    let gridHTML = '';
    for(let i=0; i<totalPieces; i++) {
        gridHTML += `<div class="puzzle-slot" data-index="${i}" onclick="placePiece(this)"></div>`;
    }
    
    let pieces = [];
    for(let i=0; i<totalPieces; i++) pieces.push(i);
    pieces.sort(() => Math.random() - 0.5);
    
    let poolHTML = '';
    pieces.forEach(i => {
        const x = (i % pState.cols) * 100 / (pState.cols - 1);
        const y = Math.floor(i / pState.cols) * 100 / (pState.rows - 1);
        poolHTML += `<div class="puzzle-piece" id="piece-${i}" data-index="${i}" onclick="selectPiece(this)" style="background-image: url('${pState.img}'); background-position: ${x}% ${y}%;"></div>`;
    });

    const ghostClass = pState.difficulty === 'easy' ? 'show-ghost' : '';
    const ghostStyle = pState.difficulty === 'easy' ? `background-image: url('${pState.img}');` : '';

    board.innerHTML = `
        <div class="puzzle-game-container">
            <div class="puzzle-board col-${pState.cols} ${ghostClass}" style="${ghostStyle}">${gridHTML}</div>
            <div class="puzzle-pool">${poolHTML}</div>
        </div>
    `;
}

function selectPiece(el) {
    if(el.parentElement.classList.contains('puzzle-slot')) return;
    if(typeof playSound === 'function') playSound('click');
    if(pState.selectedPiece) pState.selectedPiece.classList.remove('selected');
    pState.selectedPiece = el;
    el.classList.add('selected');
}

function placePiece(slot) {
    if(!pState.selectedPiece) return;
    if(slot.hasChildNodes()) return;
    
    if(typeof playSound === 'function') playSound('pop');
    slot.appendChild(pState.selectedPiece);
    pState.selectedPiece.classList.remove('selected');
    
    const slotIndex = parseInt(slot.getAttribute('data-index'));
    const pieceIndex = parseInt(pState.selectedPiece.getAttribute('data-index'));
    
    if(slotIndex === pieceIndex) {
        pState.selectedPiece.classList.add('correct');
        pState.selectedPiece.onclick = null;
        pState.correctCount++;
        if(pState.correctCount === (pState.rows * pState.cols)) {
            setTimeout(() => { if(typeof showWinnerModal === 'function') showWinnerModal("Puzzel", [{name:"Jij", score:"Compleet!"}]); }, 500);
        }
    } else {
        const wrongPiece = pState.selectedPiece;
        wrongPiece.classList.add('wrong');
        setTimeout(() => {
            wrongPiece.classList.remove('wrong');
            document.querySelector('.puzzle-pool').appendChild(wrongPiece);
        }, 500);
    }
    pState.selectedPiece = null;
}
