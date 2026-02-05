// VIEROPEENRIJ.JS - FIXED CHIP PERSISTENCE
console.log("4-op-een-rij geladen (Fixed Drops)...");

let c4State = {
    step: 0, winsNeeded: 3,
    p1: { name: 'Speler 1', img: '', color: '#F44336', wins: 0 },
    p2: { name: 'Speler 2', img: '', color: '#2196F3', wins: 0 },
    board: [], currentPlayer: 1, gameActive: false, isDropping: false
};

const ROWS = 6; const COLS = 7;
const c4Colors = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#00BCD4', '#4CAF50', '#FFEB3B', '#FF9800'];

// --- SETUP ---
function startConnect4() {
    c4State.step = 0; c4State.p1.wins = 0; c4State.p2.wins = 0;
    c4State.p1.name = ''; c4State.p1.img = ''; c4State.p1.color = '#F44336';
    c4State.p2.name = ''; c4State.p2.img = ''; c4State.p2.color = '#2196F3';
    renderSetup();
}

function renderSetup() {
    const board = document.getElementById('game-board');
    const pNum = c4State.step + 1;
    const isP1 = pNum === 1;
    const currPlayer = isP1 ? c4State.p1 : c4State.p2;
    
    let chipsHTML = '';
    if(typeof memThemes !== 'undefined') {
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=5; i++) {
                    const src = `${t.path}${i}.${t.extension}`;
                    const selected = currPlayer.img === src ? 'selected' : '';
                    chipsHTML += `<div class="chip-option ${selected}" style="background:${currPlayer.color}" onclick="c4SetChip('${src}', this)"><img src="${src}"></div>`;
                }
            }
        });
    }

    let colorsHTML = c4Colors.map(c => 
        `<div class="c4-color-dot ${currPlayer.color===c?'active':''}" style="background:${c}" onclick="c4SetColor('${c}', this)"></div>`
    ).join('');

    let goalSection = '';
    if (c4State.step === 0) {
        goalSection = `
            <div class="c4-subtitle">Eerst tot hoeveel gewonnen?</div>
            <div class="goal-btn-row">
                <button class="goal-btn ${c4State.winsNeeded===3?'selected':''}" onclick="c4SetGoal(3, this)">3</button>
                <button class="goal-btn ${c4State.winsNeeded===5?'selected':''}" onclick="c4SetGoal(5, this)">5</button>
                <button class="goal-btn ${c4State.winsNeeded===7?'selected':''}" onclick="c4SetGoal(7, this)">7</button>
            </div>
            <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
        `;
    }

    board.innerHTML = `
        <div class="c4-setup-container">
            <div class="c4-step-box">
                ${goalSection}
                <div class="c4-title">Wie is Speler ${pNum}?</div>
                <div class="preset-row">
                    <button class="preset-btn" onclick="c4SetName('Lou', this)">👦🏼 Lou</button>
                    <button class="preset-btn" onclick="c4SetName('Noé', this)">👶🏼 Noé</button>
                    <button class="preset-btn" onclick="c4SetName('Mama', this)">👩🏻 Mama</button>
                    <button class="preset-btn" onclick="c4SetName('Papa', this)">👨🏻 Papa</button>
                </div>
                <input type="text" id="c4-name" placeholder="Of typ een naam..." value="${currPlayer.name}" oninput="c4UpdateName(this.value)"
                    style="width:90%; padding:10px; border-radius:10px; border:1px solid #ccc; font-family:'Fredoka One'; text-align:center;">
                <div class="c4-subtitle" style="margin-top:15px">Kies je kleur & chip:</div>
                <div class="color-picker-row">${colorsHTML}</div>
                <div class="chip-grid" id="c4-chip-grid">${chipsHTML}</div>
                ${isP1 ? `<button class="start-btn" style="margin-top:15px; background:#2196F3;" onclick="c4NextStep()">VOLGENDE ➡</button>` : ''}
                
                <div class="vs-preview-box">
                    <div class="c4-subtitle">De Strijd:</div>
                    <div class="vs-container">
                        <div class="vs-player">
                            <div class="vs-chip-big" id="prev-p1-chip" style="background:${c4State.p1.color}">${c4State.p1.img ? `<img src="${c4State.p1.img}">` : '1'}</div>
                            <div class="vs-name" id="prev-p1-name">${c4State.p1.name || 'Speler 1'}</div>
                        </div>
                        <div class="vs-mid">VS</div>
                        <div class="vs-player">
                            <div class="vs-chip-big" id="prev-p2-chip" style="background:${c4State.p2.color}">${c4State.p2.img ? `<img src="${c4State.p2.img}">` : (c4State.step===0 ? '?' : '2')}</div>
                            <div class="vs-name" id="prev-p2-name">${c4State.p2.name || 'Speler 2'}</div>
                        </div>
                    </div>
                    ${!isP1 ? `<button class="start-btn" style="margin-top:15px;" onclick="c4InitGame()">START WEDSTRIJD ▶</button>` : ''}
                </div>
            </div>
            <button class="tool-btn" onclick="location.reload()">Annuleren</button>
        </div>
    `;
}

// UPDATE FUNCTIES
function c4UpdateVs() {
    document.getElementById('prev-p1-name').innerText = c4State.p1.name || 'Speler 1';
    document.getElementById('prev-p1-chip').style.background = c4State.p1.color;
    if(c4State.p1.img) document.getElementById('prev-p1-chip').innerHTML = `<img src="${c4State.p1.img}">`;

    document.getElementById('prev-p2-name').innerText = c4State.p2.name || 'Speler 2';
    document.getElementById('prev-p2-chip').style.background = c4State.p2.color;
    if(c4State.p2.img) document.getElementById('prev-p2-chip').innerHTML = `<img src="${c4State.p2.img}">`;
    else if(c4State.step === 0) document.getElementById('prev-p2-chip').innerHTML = '?';
}

function c4SetName(n, btn) { 
    if(typeof playSound==='function') playSound('click');
    const p = c4State.step===0 ? c4State.p1 : c4State.p2; p.name = n; 
    document.getElementById('c4-name').value = n;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    c4UpdateVs();
}
function c4UpdateName(val) { const p = c4State.step===0 ? c4State.p1 : c4State.p2; p.name = val; document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active')); c4UpdateVs(); }
function c4SetColor(c, btn) { if(typeof playSound==='function') playSound('click'); const p = c4State.step===0 ? c4State.p1 : c4State.p2; p.color = c; document.querySelectorAll('.c4-color-dot').forEach(d => d.classList.remove('active')); if(btn) btn.classList.add('active'); document.querySelectorAll('.chip-option').forEach(co => co.style.background = c); c4UpdateVs(); }
function c4SetChip(src, btn) { if(typeof playSound==='function') playSound('pop'); const p = c4State.step===0 ? c4State.p1 : c4State.p2; p.img = src; document.querySelectorAll('.chip-option').forEach(co => co.classList.remove('selected')); if(btn) btn.classList.add('selected'); c4UpdateVs(); }
function c4SetGoal(n, btn) { if(typeof playSound==='function') playSound('click'); c4State.winsNeeded = n; document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('selected')); if(btn) btn.classList.add('selected'); }
function c4NextStep() { if(!c4State.p1.name) c4State.p1.name = "Speler 1"; if(!c4State.p1.img) { alert("Kies eerst een plaatje!"); return; } c4State.step = 1; renderSetup(); }

// --- GAME ---
function c4InitGame() {
    if(!c4State.p2.name) c4State.p2.name = "Speler 2";
    if(!c4State.p2.img) { alert("Kies een plaatje voor speler 2!"); return; }
    if(typeof playSound==='function') playSound('win');
    
    c4State.board = Array(COLS).fill(null).map(() => Array(ROWS).fill(0));
    c4State.gameActive = true; c4State.isDropping = false; c4State.currentPlayer = 1;
    renderBoard();
}

function renderBoard() {
    const board = document.getElementById('game-board');
    const makeDots = (wins) => { let h=''; for(let i=0; i<c4State.winsNeeded; i++) h+=`<div class="win-dot ${i<wins?'filled':''}"></div>`; return h; };

    let gridHTML = '';
    for(let r=ROWS-1; r>=0; r--) { 
        for(let c=0; c<COLS; c++) {
            gridHTML += `<div class="c4-cell" id="cell-${c}-${r}"></div>`;
        }
    }
    let colHTML = '';
    for(let c=0; c<COLS; c++) colHTML += `<div class="c4-column" id="col-${c}" onclick="c4Drop(${c})"></div>`;

    board.innerHTML = `
        <div class="c4-game-container">
            <div class="c4-header">
                <div class="score-pill ${c4State.currentPlayer===1?'active-turn':''}" style="border-left:5px solid ${c4State.p1.color}">
                    <div class="mini-chip" style="background:${c4State.p1.color}"><img src="${c4State.p1.img}"></div>
                    <div><div style="font-weight:bold; font-size:0.8rem;">${c4State.p1.name}</div><div class="wins-dots">${makeDots(c4State.p1.wins)}</div></div>
                </div>
                <button class="tool-btn" onclick="startConnect4()">Stop</button>
                <div class="score-pill ${c4State.currentPlayer===2?'active-turn':''}" style="border-right:5px solid ${c4State.p2.color}">
                    <div style="text-align:right;"><div style="font-weight:bold; font-size:0.8rem;">${c4State.p2.name}</div><div class="wins-dots" style="justify-content:flex-end">${makeDots(c4State.p2.wins)}</div></div>
                    <div class="mini-chip" style="background:${c4State.p2.color}"><img src="${c4State.p2.img}"></div>
                </div>
            </div>
            <div class="board-wrapper" id="board-visual">
                <div class="c4-grid">${gridHTML}</div>
                <div id="col-layer">${colHTML}</div>
                <div id="chips-layer"></div>
            </div>
            <div class="board-legs"></div>
        </div>
    `;

    setTimeout(c4Resize, 10);
    setTimeout(c4Resize, 200); // Dubbele check
    window.addEventListener('resize', c4Resize);
}

function c4Resize() {
    const wrapper = document.getElementById('board-visual');
    if(!wrapper) return;
    const w = wrapper.clientWidth;
    const totalGap = 30; const padding = 20; 
    const cellSize = Math.floor((w - padding - totalGap) / 7);
    wrapper.style.setProperty('--cell-size', `${cellSize}px`);
    for(let c=0; c<COLS; c++) {
        const colDiv = document.getElementById(`col-${c}`);
        if(colDiv) {
            const left = 10 + (cellSize + 5) * c;
            colDiv.style.left = `${left}px`;
        }
    }
}

// --- DROP LOGICA (MET PERSISTENCE FIX) ---
function c4Drop(col) {
    if(!c4State.gameActive || c4State.isDropping) return;

    let row = -1;
    for(let r=0; r<ROWS; r++) {
        if(c4State.board[col][r] === 0) { row = r; break; }
    }
    if(row === -1) { if(typeof playSound==='function') playSound('error'); return; }

    c4State.isDropping = true;
    c4State.board[col][row] = c4State.currentPlayer;
    const p = c4State.currentPlayer === 1 ? c4State.p1 : c4State.p2;

    const chip = document.createElement('div');
    chip.className = 'game-chip chip-falling';
    chip.style.background = p.color;
    chip.innerHTML = `<img src="${p.img}">`;

    const wrapper = document.getElementById('board-visual');
    const cellSize = parseFloat(wrapper.style.getPropertyValue('--cell-size')) || 40;
    const leftPos = 10 + (cellSize + 5) * col;
    
    chip.style.left = `${leftPos}px`;
    chip.style.width = `${cellSize}px`;
    chip.style.height = `${cellSize}px`;
    
    const targetTop = 10 + (5 - row) * (cellSize + 5);
    
    const animName = `bounce-${col}-${row}`;
    const keyframes = `@keyframes ${animName} { 0% { top: -80px; } 60% { top: ${targetTop}px; } 75% { top: ${targetTop - 15}px; } 100% { top: ${targetTop}px; } }`;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = keyframes;
    document.head.appendChild(styleSheet);
    
    chip.style.animation = `${animName} 0.5s ease-in forwards`;
    document.getElementById('chips-layer').appendChild(chip);
    
    setTimeout(() => { if(typeof playSound==='function') playSound('click'); }, 300);

    setTimeout(() => {
        c4State.isDropping = false;
        
        // --- DE BELANGRIJKE FIX: ---
        // 1. Zet de chip 'hard' op zijn plek
        chip.style.top = `${targetTop}px`;
        // 2. Verwijder de animatie klasse
        chip.style.animation = 'none';
        chip.classList.remove('chip-falling');
        // 3. Ruim de keyframes op
        document.head.removeChild(styleSheet);
        
        if (c4CheckWin(col, row)) c4Win();
        else if (c4CheckDraw()) { alert("Gelijkspel!"); c4InitGame(); }
        else {
            c4State.currentPlayer = c4State.currentPlayer===1?2:1;
            c4InitGameHeader(); 
        }
    }, 550);
}

function c4InitGameHeader() { renderBoard(); }

function c4CheckWin(c, r) {
    const p = c4State.board[c][r];
    const dirs = [[[0,1]], [[1,0]], [[1,1]], [[1,-1]]];
    for(let d of dirs) {
        let count = 1;
        for(let side of [-1,1]) {
            let dc=d[0][0]*side, dr=d[0][1]*side, nc=c+dc, nr=r+dr;
            while(nc>=0 && nc<COLS && nr>=0 && nr<ROWS && c4State.board[nc][nr]===p) {
                count++; nc+=dc; nr+=dr;
            }
        }
        if(count>=4) return true;
    }
    return false;
}

function c4CheckDraw() { return c4State.board.every(c => c[ROWS-1] !== 0); }

function c4Win() {
    if(typeof playSound==='function') playSound('victory');
    const p = c4State.currentPlayer === 1 ? c4State.p1 : c4State.p2;
    p.wins++;
    renderBoard(); 
    if(p.wins >= c4State.winsNeeded) {
        setTimeout(() => { if(typeof showWinnerModal==='function') showWinnerModal(p.name); }, 1000);
    } else {
        setTimeout(() => { c4InitGame(); }, 1500);
    }
}
