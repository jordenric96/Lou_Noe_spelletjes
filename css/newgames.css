// NEWGAMES.JS - UPDATE: GESLOTEN MAPPEN & MOOIERE SETUP

console.log("Newgames.js Pro Puzzle Loaded");

// Configuratie (Gelijkgetrokken met Memory.js)
const assetConfig = {
    'mario':     { count: 15, ext: 'png', locked: false },
    'pokemon':   { count: 15, ext: 'png', locked: false },
    'studio100': { count: 15, ext: 'png', locked: false },
    'boerderij': { count: 15, ext: 'png', locked: false },
    // Deze zijn gesloten (locked: true), dus worden genegeerd bij puzzels:
    'dino':      { count: 15, ext: 'jpg', locked: true },
    'marvel':    { count: 15, ext: 'jpg', locked: true },
    'natuur':    { count: 15, ext: 'jpg', locked: true },
    'beroepen':  { count: 15, ext: 'jpg', locked: true }
};

// Kleuren voor spelers
const ngColors = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FFEB3B', '#FF9800'];

// --- 1. PUZZELEN ---
let pState = { 
    img: '', 
    pieces: [], 
    rows: 3, cols: 2, 
    selectedPiece: null, 
    correctCount: 0, 
    difficulty: 'easy',
    playerNames: [],
    hintUsed: false
};

function startPuzzleGame() {
    const board = document.getElementById('game-board');
    
    // Genereer puzzel-opties (ALLEEN DE OPEN MAPPEN)
    let puzzleOptions = '';
    const themes = Object.keys(assetConfig);
    const unlockedThemes = themes.filter(t => !assetConfig[t].locked); // Filter de gesloten mappen eruit

    // We tonen 8 opties om uit te kiezen
    for(let i=0; i<8; i++) {
        // Kies willekeurig thema uit de OPEN mappen
        const t = unlockedThemes[Math.floor(Math.random() * unlockedThemes.length)];
        const nr = Math.floor(Math.random() * assetConfig[t].count) + 1;
        const ext = assetConfig[t].ext;
        const src = `assets/images/memory/${t}/${nr}.${ext}`;
        
        puzzleOptions += `
            <button class="theme-card-btn" onclick="setPuzzleImg('${src}', this)" style="min-width:70px; height:70px; padding:0;">
                <img src="${src}" style="width:100%; height:100%; object-fit:contain;">
            </button>
        `;
    }

    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-columns">
                
                <div class="setup-group group-players">
                    <h3>Wie Puzzelt? 🧩</h3>
                    <div class="option-grid">
                        <button class="option-btn player-btn" onclick="addPuzzlePlayer('Lou', '👦🏼', this)"><span>👦🏼</span><span class="btn-label">Lou</span></button>
                        <button class="option-btn player-btn" onclick="addPuzzlePlayer('Noé', '👶🏼', this)"><span>👶🏼</span><span class="btn-label">Noé</span></button>
                        <button class="option-btn player-btn" onclick="addPuzzlePlayer('Mama', '👩🏻', this)"><span>👩🏻</span><span class="btn-label">Mama</span></button>
                        <button class="option-btn player-btn" onclick="addPuzzlePlayer('Papa', '👨🏻', this)"><span>👨🏻</span><span class="btn-label">Papa</span></button>
                    </div>
                    
                    <div class="divider-line"></div>
                    <div class="color-row" id="puz-color-row">
                        ${ngColors.map(c => `<div class="color-dot" style="background:${c}" onclick="setPuzzleColor('${c}', this)"></div>`).join('')}
                    </div>

                    <div id="puz-active-players" class="active-players-box"></div>
                </div>

                <div class="setup-group group-theme">
                    <h3>Kies een Plaatje</h3>
                    <div class="theme-grid" style="grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); max-height:200px; overflow-y:auto;">
                        ${puzzleOptions}
                    </div>
                </div>

                <div class="setup-group group-size">
                    <h3>Niveau</h3>
                    <div class="option-grid">
                        <button class="option-btn selected" onclick="setPuzzleDiff('easy', this)"><span>🟢</span><span class="btn-label">6</span></button>
                        <button class="option-btn" onclick="setPuzzleDiff('medium', this)"><span>🟠</span><span class="btn-label">20</span></button>
                        <button class="option-btn" onclick="setPuzzleDiff('hard', this)"><span>🔴</span><span class="btn-label">32</span></button>
                    </div>
                </div>
            </div>
            <button id="start-puzzle-btn" class="start-btn" onclick="initPuzzle()" disabled>Kies een speler & plaatje...</button>
        </div>
    `;
    
    pState.playerNames = [];
    pState.img = '';
    pState.difficulty = 'easy';
    pState.rows = 3; pState.cols = 2;
}

// SETUP HULPFUNCTIES
function addPuzzlePlayer(name, icon, btn) {
    if(typeof playSound === 'function') playSound('click');
    
    // Visuele feedback op knop
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending');

    // We slaan de naam even tijdelijk op tot er een kleur gekozen is (net als bij Memory)
    pState.pendingName = name;
    pState.pendingIcon = icon;
}

function setPuzzleColor(color, btn) {
    if(!pState.pendingName) {
        alert("Klik eerst op een naam!");
        return;
    }
    if(typeof playSound === 'function') playSound('pop');

    // Voeg speler toe
    // Verwijder eerst als hij al bestaat (update kleur)
    pState.playerNames = pState.playerNames.filter(p => p.name !== pState.pendingName);
    pState.playerNames.push({ name: pState.pendingName, icon: pState.pendingIcon, color: color });
    
    // Reset selectie
    pState.pendingName = null;
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));

    // Update lijstje
    renderPuzzleActivePlayers();
    checkPuzzleStart();
}

function renderPuzzleActivePlayers() {
    document.getElementById('puz-active-players').innerHTML = pState.playerNames.map(p => 
        `<div class="active-player-tag" style="background:${p.color}"><span>${p.icon} ${p.name}</span></div>`
    ).join('');
}

function setPuzzleImg(src, btn) {
    if(typeof playSound === 'function') playSound('click');
    pState.img = src;
    document.querySelectorAll('.theme-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    checkPuzzleStart();
}

function setPuzzleDiff(diff, btn) {
    if(typeof playSound === 'function') playSound('click');
    pState.difficulty = diff;
    
    if(diff === 'easy') { pState.cols = 2; pState.rows = 3; } // 6
    else if(diff === 'medium') { pState.cols = 4; pState.rows = 5; } // 20
    else { pState.cols = 4; pState.rows = 8; } // 32
    
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function checkPuzzleStart() {
    const btn = document.getElementById('start-puzzle-btn');
    if (pState.playerNames.length > 0 && pState.img !== '') {
        btn.disabled = false;
        btn.innerText = "START PUZZEL ▶";
    }
}

// GAME START
function initPuzzle() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    pState.correctCount = 0;
    pState.selectedPiece = null;
    pState.hintUsed = false;
    
    const totalPieces = pState.rows * pState.cols;
    
    // Maak het rooster (slots)
    let gridHTML = '';
    for(let i=0; i<totalPieces; i++) {
        gridHTML += `<div class="puzzle-slot" id="slot-${i}" data-index="${i}" onclick="placePiece(this)"></div>`;
    }
    
    // Maak de stukjes (pieces)
    let pieces = [];
    for(let i=0; i<totalPieces; i++) pieces.push(i);
    pieces.sort(() => Math.random() - 0.5); // Husselen
    
    let poolHTML = '';
    pieces.forEach(i => {
        // Bereken positie van background image voor dit stukje
        const x = (i % pState.cols) * 100 / (pState.cols - 1);
        const y = Math.floor(i / pState.cols) * 100 / (pState.rows - 1);
        
        // Let op: we gebruiken inline style voor de background-image zodat het zeker klopt
        poolHTML += `
            <div class="puzzle-piece" id="piece-${i}" data-index="${i}" onclick="selectPiece(this)" 
                 style="background-image: url('${pState.img}'); background-position: ${x}% ${y}%;">
            </div>
        `;
    });

    // Bepaal weergave (Ghost vs Mini Preview)
    let extraHTML = '';
    let boardClass = `col-${pState.cols}`;
    let boardStyle = '';

    if (pState.difficulty === 'easy') {
        // Makkelijk: Grote doorzichtige foto op achtergrond
        boardClass += ' show-ghost';
        boardStyle = `background-image: url('${pState.img}');`;
    } else {
        // Gemiddeld/Moeilijk: Kleine preview foto in de hoek
        extraHTML = `<div class="preview-mini"><img src="${pState.img}"><span>Voorbeeld</span></div>`;
    }

    // De HTML van het spelbord
    board.innerHTML = `
        <div class="puzzle-game-container">
            <div class="puzzle-header">
                ${extraHTML}
                <button id="tip-btn" class="tip-btn" onclick="giveHint()">💡 TIP (1x)</button>
            </div>

            <div class="puzzle-board ${boardClass}" style="${boardStyle}">
                ${gridHTML}
            </div>
            
            <div class="puzzle-pool">
                ${poolHTML}
            </div>
        </div>
    `;
}

// SPEL LOGICA
function selectPiece(el) {
    if(el.parentElement.classList.contains('puzzle-slot')) return; // Al geplaatst
    if(typeof playSound === 'function') playSound('click');
    
    if(pState.selectedPiece) pState.selectedPiece.classList.remove('selected');
    pState.selectedPiece = el;
    el.classList.add('selected');
}

function placePiece(slot) {
    if(!pState.selectedPiece) return;
    if(slot.hasChildNodes()) return; // Slot bezet
    
    if(typeof playSound === 'function') playSound('pop');
    
    // Verplaatsen
    slot.appendChild(pState.selectedPiece);
    pState.selectedPiece.classList.remove('selected');
    
    const slotIndex = parseInt(slot.getAttribute('data-index'));
    const pieceIndex = parseInt(pState.selectedPiece.getAttribute('data-index'));
    
    if(slotIndex === pieceIndex) {
        // GOED
        pState.selectedPiece.classList.add('correct');
        pState.selectedPiece.onclick = null;
        pState.correctCount++;
        checkPuzzleWin();
    } else {
        // FOUT
        const wrongPiece = pState.selectedPiece;
        wrongPiece.classList.add('wrong');
        setTimeout(() => {
            wrongPiece.classList.remove('wrong');
            document.querySelector('.puzzle-pool').appendChild(wrongPiece);
        }, 500);
    }
    pState.selectedPiece = null;
}

function giveHint() {
    if(pState.hintUsed) return;
    
    // Zoek een stukje dat nog in de pool zit (dus niet .correct)
    const piecesInPool = Array.from(document.querySelectorAll('.puzzle-pool .puzzle-piece'));
    if(piecesInPool.length === 0) return;
    
    // Pak de eerste
    const piece = piecesInPool[0];
    const index = piece.getAttribute('data-index');
    const targetSlot = document.getElementById(`slot-${index}`);
    
    if(targetSlot && !targetSlot.hasChildNodes()) {
        if(typeof playSound === 'function') playSound('win'); 
        
        targetSlot.appendChild(piece);
        piece.classList.add('correct');
        piece.onclick = null;
        pState.correctCount++;
        
        pState.hintUsed = true;
        const btn = document.getElementById('tip-btn');
        btn.disabled = true;
        btn.innerText = "Tip gebruikt";
        btn.style.opacity = 0.5;
        
        checkPuzzleWin();
    }
}

function checkPuzzleWin() {
    if(pState.correctCount === (pState.rows * pState.cols)) {
        setTimeout(() => {
            const winner = pState.playerNames.length > 0 ? pState.playerNames[0].name : "Jij";
            if(typeof showWinnerModal === 'function') showWinnerModal(winner, [{name:winner, score:"Puzzel Compleet!"}]);
        }, 500);
    }
}


// --- 2. STICKERBOEK ---
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
    const unlocked = getUnlockedStickers(); const all = generateAllStickers();
    let html = `<div class="sticker-header">Mijn Verzameling (${unlocked.length}/${all.length})</div><div class="sticker-container">`;
    if(unlocked.length === 0) html += '<div class="empty-msg">Win spelletjes om stickers te verdienen!</div>';
    all.forEach(s => {
        if(unlocked.includes(s.id)) html+=`<div class="sticker-slot unlocked"><img src="${s.src}" class="sticker-img"></div>`;
        else html+=`<div class="sticker-slot locked"><span class="sticker-lock-icon">🔒</span></div>`;
    });
    board.innerHTML = html + '</div>';
}

// --- 3. VANG ZE! (Met Vallen) ---
let wState = { score: 0, timer: 30, active: false, speed: 1000, grid: 9, timerInt: null, moleInt: null };
function startWhackGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="memory-setup" style="text-align:center;">
            <div class="setup-group"><h3>Vang ze! 🔨</h3><p>Pas op voor 💣 en 💩!</p>
                <div class="option-grid"><button class="option-btn" onclick="setWhackDiff('easy',this)">Makkelijk</button><button class="option-btn selected" onclick="setWhackDiff('medium',this)">Normaal</button><button class="option-btn" onclick="setWhackDiff('hard',this)">Snel!</button></div>
            </div><button class="start-btn" onclick="runWhackGame()">START</button>
        </div>`; wState.speed = 900; wState.grid = 9;
}
function setWhackDiff(diff, btn) {
    if(typeof playSound==='function')playSound('click'); document.querySelectorAll('.option-btn').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected');
    if(diff==='easy'){wState.speed=1200;wState.grid=4;}else if(diff==='medium'){wState.speed=900;wState.grid=9;}else{wState.speed=550;wState.grid=12;}
}
function runWhackGame() {
    if(typeof playSound==='function')playSound('win'); const board = document.getElementById('game-board'); wState.score=0;wState.timer=30;wState.active=true;
    let gc = wState.grid===4?'grid-2':(wState.grid===12?'grid-4':'grid-3'); let h='';
    for(let i=0;i<wState.grid;i++) h+=`<div class="whack-hole" id="hole-${i}" onmousedown="whack(this)" ontouchstart="whack(this)"><div class="whack-character"></div></div>`;
    board.innerHTML=`<div class="whack-container"><div class="whack-score-board"><span>Tijd: <span id="w-time">30</span></span><span>Score: <span id="w-score">0</span></span></div><div class="whack-grid ${gc}">${h}</div></div>`;
    wState.timerInt=setInterval(()=>{if(!wState.active)return;wState.timer--;document.getElementById('w-time').innerText=wState.timer;if(wState.timer<=0)endWhack(false);},1000); popMole();
}
function popMole(){
    if(!wState.active)return; const holes=document.querySelectorAll('.whack-hole'); const hole=holes[Math.floor(Math.random()*holes.length)];
    const char=hole.querySelector('.whack-character'); hole.classList.remove('trap-bomb','trap-poop'); char.innerHTML=''; char.style.backgroundImage='';
    if(Math.random()<0.2){ if(Math.random()<0.5){hole.classList.add('trap-bomb');char.innerText='💣';}else{hole.classList.add('trap-poop');char.innerText='💩';} }
    else { const nr=Math.floor(Math.random()*10)+1; char.style.backgroundImage=`url('assets/images/memory/mario/${nr}.png')`; }
    hole.classList.add('up'); wState.moleInt=setTimeout(()=>{hole.classList.remove('up');if(wState.active)setTimeout(popMole,Math.random()*500);},wState.speed);
}
function whack(h){
    if(!wState.active||!h.classList.contains('up')||h.classList.contains('whacked'))return;
    if(h.classList.contains('trap-bomb')||h.classList.contains('trap-poop')){if(typeof playSound==='function')playSound('lose');h.querySelector('.whack-character').innerText='💥';h.style.backgroundColor='red';wState.active=false;setTimeout(()=>endWhack(true),500);return;}
    if(typeof playSound==='function')playSound('pop');wState.score++;document.getElementById('w-score').innerText=wState.score;h.classList.remove('up');h.classList.add('whacked');setTimeout(()=>h.classList.remove('whacked'),200);
}
function endWhack(boom){wState.active=false;clearInterval(wState.timerInt);clearTimeout(wState.moleInt);if(typeof showWinnerModal==='function')showWinnerModal(boom?"BOEM!":"Tijd op!",[{name:"Score",score:wState.score}]);}
function stopWhackGame(){wState.active=false;clearInterval(wState.timerInt);clearTimeout(wState.moleInt);}

// --- 4. SIMON & TEKENEN ---
let sSeq=[],pSeq=[],sLvl=0,sAct=false,sThm='mario';
function startSimonGame(){const b=document.getElementById('game-board'); b.innerHTML=`<div class="memory-setup"><div class="setup-group"><h3>Kies Vriendjes</h3><div class="option-grid"><button class="option-btn selected" onclick="sT('mario',this)">Mario</button><button class="option-btn" onclick="sT('pokemon',this)">Pokemon</button></div></div><button class="start-btn" onclick="iS()">START</button></div>`;}
function sT(t,b){sThm=t;document.querySelectorAll('.option-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');}
function iS(){const b=document.getElementById('game-board');let h='';for(let i=0;i<4;i++)h+=`<button class="simon-btn" id="sb-${i}" style="background-image:url('assets/images/memory/${sThm}/${i+1}.png');" onclick="hS(${i})"></button>`;b.innerHTML=`<div class="simon-container"><div class="simon-info">Score: <span id="sc">0</span> <span id="msg">Let op...</span></div><div class="simon-board theme-${sThm}">${h}</div><button class="start-btn" onclick="nS()" style="width:auto;margin-top:20px">Start</button></div>`;sSeq=[];sLvl=0;}
function nS(){sLvl++;pSeq=[];document.getElementById('sc').innerText=sLvl-1;document.getElementById('msg').innerText="Kijk...";sSeq.push(Math.floor(Math.random()*4));document.querySelector('.simon-container .start-btn').style.display='none';sAct=false;let i=0;const int=setInterval(()=>{aS(sSeq[i]);i++;if(i>=sSeq.length){clearInterval(int);sAct=true;document.getElementById('msg').innerText="Jij!";}},800);}
function aS(i){const b=document.getElementById(`sb-${i}`);if(b){b.classList.add('lit');if(typeof playSound==='function')playSound('pop');setTimeout(()=>b.classList.remove('lit'),400);}}
function hS(i){if(!sAct)return;aS(i);pSeq.push(i);if(pSeq[pSeq.length-1]!==sSeq[pSeq.length-1]){if(typeof playSound==='function')playSound('lose');document.getElementById('msg').innerText="Fout!";sAct=false;if(typeof showWinnerModal==='function')showWinnerModal("Simon",[{name:"Score",score:sLvl-1}]);return;}if(pSeq.length===sSeq.length){sAct=false;document.getElementById('msg').innerText="Goed!";setTimeout(nS,1000);}}
function stopSimonGame(){sAct=false;}

let isD=false,ctx,dC='black',dS=5;
function startDrawing(){const b=document.getElementById('game-board');b.innerHTML=`<div class="drawing-container"><div class="drawing-controls"><button class="tool-btn" onclick="openAlbum()">📂</button><button class="tool-btn" style="background:#4CAF50;color:white" onclick="sDr()">💾</button><div class="control-divider"></div><div class="color-swatch active" style="background:black" onclick="sC('black',this)"></div><div class="color-swatch" style="background:red" onclick="sC('red',this)"></div><div class="color-swatch" style="background:blue" onclick="sC('blue',this)"></div><div class="control-divider"></div><div class="size-btn active" onclick="sSz(5,this)"><div class="dot dot-s"></div></div><div class="size-btn" onclick="sSz(15,this)"><div class="dot dot-m"></div></div><button class="tool-btn" onclick="cC()">🗑️</button></div><canvas id="drawCanvas"></canvas></div>`;setTimeout(iCn,50);}
function iCn(){const c=document.getElementById('drawCanvas');const con=document.querySelector('.drawing-container');if(!c)return;c.width=con.clientWidth*0.95;c.height=con.clientHeight*0.8;ctx=c.getContext('2d');ctx.lineCap='round';ctx.lineJoin='round';c.addEventListener('mousedown',sDrw);c.addEventListener('touchstart',sDrw,{passive:false});c.addEventListener('mousemove',drw);c.addEventListener('touchmove',drw,{passive:false});c.addEventListener('mouseup',eDrw);c.addEventListener('touchend',eDrw);}
function sDrw(e){isD=true;drw(e);}function eDrw(){isD=false;ctx.beginPath();}
function drw(e){if(!isD)return;e.preventDefault();const c=document.getElementById('drawCanvas');const r=c.getBoundingClientRect();const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top;ctx.lineWidth=dS;ctx.strokeStyle=dC;ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y);}
function sC(c,b){if(typeof playSound==='function')playSound('click');dC=c;document.querySelectorAll('.color-swatch').forEach(x=>x.classList.remove('active'));b.classList.add('active');}
function sSz(s,b){if(typeof playSound==='function')playSound('click');dS=s;document.querySelectorAll('.size-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');}
function cC(){if(typeof playSound==='function')playSound('pop');ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);}
function sDr(){const i=document.getElementById('drawCanvas').toDataURL("image/png");let a=JSON.parse(localStorage.getItem('myDrawings')||'[]');a.unshift(i);if(a.length>10)a.pop();localStorage.setItem('myDrawings',JSON.stringify(a));if(typeof playSound==='function')playSound('win');alert("Opgeslagen!");}
