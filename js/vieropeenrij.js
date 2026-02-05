// VIEROPEENRIJ.JS - FIXED GRID & IMPROVED SETUP
console.log("4-op-een-rij geladen (Perfect Grid)...");

let c4State = {
    step: 0, // 0=P1, 1=P2, 2=Game
    winsNeeded: 3,
    p1: { name: 'Speler 1', img: '', color: '#F44336', wins: 0, type: 'human' },
    p2: { name: 'Speler 2', img: '', color: '#2196F3', wins: 0, type: 'human' },
    board: [], 
    currentPlayer: 1, 
    gameActive: false,
    isDropping: false
};

const ROWS = 6;
const COLS = 7;
const c4Colors = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#00BCD4', '#4CAF50', '#FFEB3B', '#FF9800'];

// --- SETUP ---
function startConnect4() {
    c4State.step = 0;
    c4State.p1.wins = 0; c4State.p2.wins = 0;
    // Reset defaults
    c4State.p1.name = ''; c4State.p1.img = ''; c4State.p1.color = '#F44336';
    c4State.p2.name = ''; c4State.p2.img = ''; c4State.p2.color = '#2196F3';
    renderSetup();
}

function renderSetup() {
    const board = document.getElementById('game-board');
    const pNum = c4State.step + 1;
    const isP1 = pNum === 1;
    const currPlayer = isP1 ? c4State.p1 : c4State.p2;
    
    // Thema Chips
    let chipsHTML = '';
    if(typeof memThemes !== 'undefined') {
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=5; i++) {
                    const src = `${t.path}${i}.${t.extension}`;
                    // Markeer als geselecteerd
                    const selected = currPlayer.img === src ? 'selected' : '';
                    chipsHTML += `<div class="chip-option ${selected}" style="background:${currPlayer.color}" onclick="c4SetChip('${src}', this)"><img src="${src}"></div>`;
                }
            }
        });
    }

    // Kleuren
    let colorsHTML = c4Colors.map(c => 
        `<div class="c4-color-dot ${currPlayer.color===c?'active':''}" style="background:${c}" onclick="c4SetColor('${c}')"></div>`
    ).join('');

    // Goal Buttons (Alleen bij Stap 1 zichtbaar)
    let goalSection = '';
    if (c4State.step === 0) {
        goalSection = `
            <div class="c4-subtitle">Eerst tot hoeveel gewonnen?</div>
            <div class="goal-btn-row">
                <button class="goal-btn ${c4State.winsNeeded===3?'selected':''}" onclick="c4SetGoal(3)">3</button>
                <button class="goal-btn ${c4State.winsNeeded===5?'selected':''}" onclick="c4SetGoal(5)">5</button>
                <button class="goal-btn ${c4State.winsNeeded===7?'selected':''}" onclick="c4SetGoal(7)">7</button>
            </div>
            <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
        `;
    }

    // VS Preview (Onderaan)
    let vsHTML = `
        <div class="vs-preview-box">
            <div class="c4-subtitle">De Strijd:</div>
            <div class="vs-container">
                <div class="vs-player">
                    <div class="vs-chip-big" style="background:${c4State.p1.color}">
                        ${c4State.p1.img ? `<img src="${c4State.p1.img}">` : '1'}
                    </div>
                    <div class="vs-name">${c4State.p1.name || 'Speler 1'}</div>
                </div>
                <div class="vs-mid">VS</div>
                <div class="vs-player">
                    <div class="vs-chip-big" style="background:${c4State.p2.color}">
                        ${c4State.p2.img ? `<img src="${c4State.p2.img}">` : (c4State.step===0 ? '?' : '2')}
                    </div>
                    <div class="vs-name">${c4State.p2.name || 'Speler 2'}</div>
                </div>
            </div>
            ${!isP1 ? `<button class="start-btn" style="margin-top:15px;" onclick="c4InitGame()">START WEDSTRIJD ▶</button>` : ''}
        </div>
    `;

    board.innerHTML = `
        <div class="c4-setup-container">
            <div class="c4-step-box">
                ${goalSection}
                <div class="c4-title">Wie is Speler ${pNum}?</div>
                
                <div class="preset-row">
                    <button class="preset-btn" onclick="c4SetName('Lou', '👦🏼')">👦🏼 Lou</button>
                    <button class="preset-btn" onclick="c4SetName('Noé', '👶🏼')">👶🏼 Noé</button>
                    <button class="preset-btn" onclick="c4SetName('Mama', '👩🏻')">👩🏻 Mama</button>
                    <button class="preset-btn" onclick="c4SetName('Papa', '👨🏻')">👨🏻 Papa</button>
                </div>

                <input type="text" id="c4-name" placeholder="Of typ een naam..." value="${currPlayer.name}" oninput="c4UpdateName(this.value)"
                    style="width:90%; padding:10px; border-radius:10px; border:1px solid #ccc; font-family:'Fredoka One'; text-align:center;">

                <div class="c4-subtitle" style="margin-top:15px">Kies je kleur & chip:</div>
                <div class="color-picker-row">${colorsHTML}</div>
                <div class="chip-grid">${chipsHTML}</div>

                ${isP1 ? `<button class="start-btn" style="margin-top:15px; background:#2196F3;" onclick="c4NextStep()">VOLGENDE ➡</button>` : ''}
                
                ${vsHTML}
            </div>
            <button class="tool-btn" onclick="location.reload()">Annuleren</button>
        </div>
    `;
}

// SETUP ACTIONS
function c4SetGoal(n) { if(typeof playSound==='function') playSound('click'); c4State.winsNeeded = n; renderSetup(); }
function c4SetName(n, icon) { if(typeof playSound==='function') playSound('click'); const p = c4State.step===0 ? c4State.p1 : c4State.p2; p.name = n; /*Icon wordt niet gebruikt in game, alleen naam/chip*/ renderSetup(); }
function c4UpdateName(val) { const p = c4State.step===0 ? c4State.p1 : c4State.p2; p.name = val; } // Live update
function c4SetColor(c) { if(typeof playSound==='function') playSound('click'); const p = c4State.step===0 ? c4State.p1 : c4State.p2; p.color = c; renderSetup(); }
function c4SetChip(src, btn) { if(typeof playSound==='function') playSound('pop'); const p = c4State.step===0 ? c4State.p1 : c4State.p2; p.img = src; renderSetup(); }

function c4NextStep() {
    if(!c4State.p1.name) c4State.p1.name = "Speler 1";
    if(!c4State.p1.img) { alert("Kies eerst een plaatje!"); return; }
    c4State.step = 1; 
    renderSetup();
}

// --- GAME ---
function c4InitGame() {
    if(!c4State.p2.name) c4State.p2.name = "Speler 2";
    if(!c4State.p2.img) { alert("Kies een plaatje voor speler 2!"); return; }
    if(typeof playSound==='function') playSound('win');
    
    c4State.board = Array(COLS).fill(null).map(() => Array(ROWS).fill(0));
    c4State.gameActive = true;
    c4State.isDropping = false;
    // Speler 1 begint altijd in ronde 1
    c4State.currentPlayer = 1;
    
    renderBoard();
}

function renderBoard() {
    const board = document.getElementById('game-board');
    const makeDots = (wins) => { let h=''; for(let i=0; i<c4State.winsNeeded; i++) h+=`<div class="win-dot ${i<wins?'filled':''}"></div>`; return h; };

    let gridHTML = '';
    // Let op: id is c-r (kolom-rij)
    for(let r=ROWS-1; r>=0; r--) { 
        for(let c=0; c<COLS; c++) {
            gridHTML += `<div class="c4-cell" id="cell-${c}-${r}"></div>`;
        }
    }
    
    // Klik kolommen
    let colHTML = '';
    for(let c=0; c<COLS; c++) {
        // We gebruiken inline style voor left position, maar css var is beter. 
        // Hier doen we een simpele loop.
        colHTML += `<div class="c4-column" id="col-${c}" onclick="c4Drop(${c})"></div>`;
    }

    board.innerHTML = `
        <div class="c4-game-container">
            <div class="c4-header">
                <div class="score-pill ${c4State.currentPlayer===1?'active-turn':''}" style="border-left:5px solid ${c4State.p1.color}">
                    <div class="mini-chip" style="background:${c4State.p1.color}"><img src="${c4State.p1.img}"></div>
                    <div>
                        <div style="font-weight:bold; font-size:0.8rem;">${c4State.p1.name}</div>
                        <div class="wins-dots">${makeDots(c4State.p1.wins)}</div>
                    </div>
                </div>
                <button class="tool-btn" onclick="startConnect4()">Stop</button>
                <div class="score-pill ${c4State.currentPlayer===2?'active-turn':''}" style="border-right:5px solid ${c4State.p2.color}">
                    <div style="text-align:right;">
                        <div style="font-weight:bold; font-size:0.8rem;">${c4State.p2.name}</div>
                        <div class="wins-dots" style="justify-content:flex-end">${makeDots(c4State.p2.wins)}</div>
                    </div>
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
    window.addEventListener('resize', c4Resize);
}

function c4Resize() {
    const wrapper = document.getElementById('board-visual');
    if(!wrapper) return;
    
    // Bereken celgrootte: (Breedte - Padding - Gaps) / 7
    // Padding = 20px (10 links + 10 rechts), Gap = 8px * 6 = 48px
    const w = wrapper.clientWidth;
    const totalGap = 6 * 8; 
    const padding = 20; 
    const cellSize = (w - padding - totalGap) / 7;
    
    // Update CSS variabele voor perfecte sync
    wrapper.style.setProperty('--cell-size', `${cellSize}px`);
    
    // Update kolom posities
    for(let c=0; c<COLS; c++) {
        const colDiv = document.getElementById(`col-${c}`);
        if(colDiv) {
            // Left = Padding + (Cell + Gap) * index
            const left = 10 + (cellSize + 8) * c;
            colDiv.style.left = `${left}px`;
        }
    }
}

// --- DROP LOGICA ---
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

    // Positie bepalen via grid logic
    const wrapper = document.getElementById('board-visual');
    // We moeten de chip exact boven de kolom plaatsen
    // De wrapper heeft padding: 10px. 
    // Gap = 8px.
    // CSS var --cell-size is gezet.
    const cellSize = parseFloat(wrapper.style.getPropertyValue('--cell-size'));
    const leftPos = 10 + (cellSize + 8) * col;
    
    chip.style.left = `${leftPos}px`;
    chip.style.width = `${cellSize}px`;
    chip.style.height = `${cellSize}px`;
    
    // Val afstand berekenen (Rij 0 is onderaan, maar visueel 'hoog' getal in top-pixels)
    // Rij 5 (bovenste) heeft minder valweg dan Rij 0
    // Elke rij is (cellSize + 8) hoog.
    // Target Top (relatief aan wrapper) = PaddingTop + (5-row)*(Size+Gap)
    const targetTop = 10 + (5 - row) * (cellSize + 8);
    
    // We animeren met keyframes die we dynamisch injecteren of simuleren
    // Makkelijkste: CSS transition op 'top', maar bounce is lastig.
    // We gebruiken de @keyframes uit CSS, maar passen de 'to' waarde aan via variabele?
    // Nee, we maken dynamische keyframe style
    
    const animName = `bounce-${col}-${row}`;
    const keyframes = `
        @keyframes ${animName} {
            0% { top: -80px; }
            60% { top: ${targetTop}px; }
            75% { top: ${targetTop - 20}px; }
            100% { top: ${targetTop}px; }
        }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = keyframes;
    document.head.appendChild(styleSheet);
    
    chip.style.animation = `${animName} 0.5s ease-in forwards`;
    
    document.getElementById('chips-layer').appendChild(chip);
    
    setTimeout(() => { if(typeof playSound==='function') playSound('click'); }, 300);

    setTimeout(() => {
        c4State.isDropping = false;
        document.head.removeChild(styleSheet); // Opruimen
        
        if (c4CheckWin(col, row)) c4Win();
        else if (c4CheckDraw()) { alert("Gelijkspel!"); c4InitGame(); }
        else {
            c4State.currentPlayer = c4State.currentPlayer===1?2:1;
            c4InitGameHeader(); // Update beurt
        }
    }, 550);
}

function c4InitGameHeader() { renderBoard(); } // refresh header status

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
    renderBoard(); // Update dots
    
    if(p.wins >= c4State.winsNeeded) {
        setTimeout(() => { if(typeof showWinnerModal==='function') showWinnerModal(p.name); }, 1000);
    } else {
        setTimeout(() => { c4InitGame(); }, 1500); // Volgende ronde
    }
}
