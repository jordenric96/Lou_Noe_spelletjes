// VIEROPEENRIJ.JS - BUTTON VISIBILITY FIX
console.log("4-op-een-rij geladen (Button Fix)...");

let c4State = {
    step: 0, winsNeeded: 3,
    p1: { name: '', img: '', color: '#F44336', wins: 0 },
    p2: { name: '', img: '', color: '#2196F3', wins: 0 },
    board: [], currentPlayer: 1, gameActive: false, isDropping: false
};

const ROWS = 6; const COLS = 7;
const c4Colors = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#00BCD4', '#4CAF50', '#FFEB3B', '#FF9800'];

// --- SETUP START ---
function startConnect4() {
    c4State.step = 0; c4State.p1.wins = 0; c4State.p2.wins = 0;
    c4State.p1.name = ''; c4State.p1.img = ''; c4State.p1.color = '#F44336';
    c4State.p2.name = ''; c4State.p2.img = ''; c4State.p2.color = '#2196F3';
    renderWizardStep();
}

function renderWizardStep() {
    const board = document.getElementById('game-board');
    const isP1 = c4State.step === 0;
    const currPlayer = isP1 ? c4State.p1 : c4State.p2;
    const title = isP1 ? "WIE IS SPELER 1?" : "WIE IS SPELER 2?";
    
    // Check of we klaar zijn
    const isReady = currPlayer.name !== '' && currPlayer.img !== '';
    
    // Knop Tekst (Dynamisch)
    let btnText = "KIES NAAM & PLAATJE...";
    if (isReady) {
        btnText = isP1 ? "BEVESTIG SPELER 1 ➡" : "START HET SPEL! 🚀";
    }

    // Genereer chips
    let chipsHTML = '';
    if(typeof memThemes !== 'undefined') {
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=5; i++) {
                    const src = `${t.path}${i}.${t.extension}`;
                    if (!isP1 && src === c4State.p1.img) return; // Geen dubbele chips
                    const selected = currPlayer.img === src ? 'selected' : '';
                    chipsHTML += `<div class="chip-option ${selected}" style="background:${currPlayer.color}" onclick="c4SetChip('${src}')"><img src="${src}"></div>`;
                }
            }
        });
    }

    // Genereer Kleuren
    let colorsHTML = c4Colors.map(c => 
        `<div class="c4-color-dot ${currPlayer.color===c?'active':''}" style="background:${c}" onclick="c4SetColor('${c}')"></div>`
    ).join('');

    // Goal Section (Alleen P1)
    let goalSection = '';
    if (isP1) {
        goalSection = `
            <div class="c4-subtitle">Eerst tot...</div>
            <div class="goal-btn-row">
                <button class="goal-btn ${c4State.winsNeeded===3?'selected':''}" onclick="c4SetGoal(3)">3</button>
                <button class="goal-btn ${c4State.winsNeeded===5?'selected':''}" onclick="c4SetGoal(5)">5</button>
                <button class="goal-btn ${c4State.winsNeeded===7?'selected':''}" onclick="c4SetGoal(7)">7</button>
            </div>
            <hr style="border:0; border-top:2px dashed #eee; margin:10px 0;">
        `;
    }

    // De HTML
    board.innerHTML = `
        <div class="c4-setup-container">
            <div class="c4-step-box">
                ${goalSection}
                
                <div class="c4-title" style="color:${currPlayer.color}">${title}</div>
                
                <div class="c4-subtitle">Kies naam:</div>
                <div class="preset-row">
                    <button class="preset-btn ${currPlayer.name==='Lou'?'active':''}" onclick="c4SetName('Lou')">👦🏼<br>Lou</button>
                    <button class="preset-btn ${currPlayer.name==='Noé'?'active':''}" onclick="c4SetName('Noé')">👶🏼<br>Noé</button>
                    <button class="preset-btn ${currPlayer.name==='Mama'?'active':''}" onclick="c4SetName('Mama')">👩🏻<br>Mama</button>
                    <button class="preset-btn ${currPlayer.name==='Papa'?'active':''}" onclick="c4SetName('Papa')">👨🏻<br>Papa</button>
                </div>
                <input type="text" class="custom-name-input" placeholder="Of typ zelf..." value="${currPlayer.name}" 
                    oninput="c4UpdateName(this.value)" onclick="this.select()">

                <div class="c4-subtitle">Kies kleur & plaatje:</div>
                <div class="color-picker-row">${colorsHTML}</div>
                <div class="chip-grid" id="c4-chip-grid">${chipsHTML}</div>

                <button class="confirm-action-btn ${isReady ? 'ready' : ''}" onclick="c4NextStep()">
                    ${btnText}
                </button>

                <div class="vs-preview-box">
                    <div class="vs-mini-player ${isP1?'active-setup':''}">
                        <div class="vs-mini-chip" style="background:${c4State.p1.color}">${c4State.p1.img?`<img src="${c4State.p1.img}">`:''}</div>
                        <div class="vs-mini-name">${c4State.p1.name||'...'}</div>
                    </div>
                    <div class="vs-mini-mid">VS</div>
                    <div class="vs-mini-player ${!isP1?'active-setup':''}">
                        <div class="vs-mini-chip" style="background:${c4State.p2.color}">${c4State.p2.img?`<img src="${c4State.p2.img}">`:''}</div>
                        <div class="vs-mini-name">${c4State.p2.name||'...'}</div>
                    </div>
                </div>

            </div>
            <button class="tool-btn" onclick="location.reload()">Stoppen</button>
        </div>
    `;
}

// --- SETUP ACTIES ---

function c4UpdateBtn() {
    const curr = c4State.step === 0 ? c4State.p1 : c4State.p2;
    const btn = document.querySelector('.confirm-action-btn');
    const isP1 = c4State.step === 0;
    
    if (curr.name && curr.img) {
        btn.classList.add('ready');
        btn.innerText = isP1 ? "BEVESTIG SPELER 1 ➡" : "START HET SPEL! 🚀";
    } else {
        btn.classList.remove('ready');
        btn.innerText = "KIES NAAM & PLAATJE...";
    }
}

function c4SetGoal(n) { if(typeof playSound==='function') playSound('click'); c4State.winsNeeded = n; renderWizardStep(); }

function c4SetName(n) {
    if(typeof playSound==='function') playSound('click');
    const p = c4State.step === 0 ? c4State.p1 : c4State.p2;
    p.name = n;
    
    document.querySelector('.custom-name-input').value = n;
    document.querySelectorAll('.preset-btn').forEach(b => {
        if(b.innerText.includes(n)) b.classList.add('active'); else b.classList.remove('active');
    });
    
    // Update VS text
    const vsId = c4State.step === 0 ? '.vs-mini-player:first-child .vs-mini-name' : '.vs-mini-player:last-child .vs-mini-name';
    document.querySelector(vsId).innerText = n;
    c4UpdateBtn();
}

function c4UpdateName(val) {
    const p = c4State.step === 0 ? c4State.p1 : c4State.p2;
    p.name = val;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    c4UpdateBtn();
}

function c4SetColor(c) {
    if(typeof playSound==='function') playSound('click');
    const p = c4State.step === 0 ? c4State.p1 : c4State.p2;
    p.color = c;
    renderWizardStep(); 
}

function c4SetChip(src) {
    if(typeof playSound==='function') playSound('pop');
    const p = c4State.step === 0 ? c4State.p1 : c4State.p2;
    p.img = src;
    
    // Selecteer visueel (zonder refresh van hele pagina)
    document.querySelectorAll('.chip-option').forEach(el => el.classList.remove('selected'));
    const allChips = document.querySelectorAll('.chip-option img');
    allChips.forEach(img => {
        if(img.getAttribute('src') === src) img.parentElement.classList.add('selected');
    });

    const vsId = c4State.step === 0 ? '.vs-mini-player:first-child .vs-mini-chip' : '.vs-mini-player:last-child .vs-mini-chip';
    document.querySelector(vsId).innerHTML = `<img src="${src}">`;
    c4UpdateBtn();
}

function c4NextStep() {
    const curr = c4State.step === 0 ? c4State.p1 : c4State.p2;
    
    // VALIDATIE: Mag niet doorgaan als niet klaar
    if (!curr.name || !curr.img) {
        if(typeof playSound==='function') playSound('error');
        alert("Kies eerst een naam én een plaatje!");
        return;
    }

    if(typeof playSound==='function') playSound('win');
    if (c4State.step === 0) {
        c4State.step = 1; renderWizardStep();
    } else {
        c4InitGame(); 
    }
}

// --- GAME LOGIC ---
function c4InitGame() {
    c4State.board = Array(COLS).fill(null).map(() => Array(ROWS).fill(0));
    c4State.gameActive = true; c4State.isDropping = false; c4State.currentPlayer = 1;
    renderBoard();
}

function renderBoard() {
    const board = document.getElementById('game-board');
    const makeDots = (wins) => { let h=''; for(let i=0; i<c4State.winsNeeded; i++) h+=`<div class="win-dot ${i<wins?'filled':''}"></div>`; return h; };

    let gridHTML = '';
    for(let r=ROWS-1; r>=0; r--) { for(let c=0; c<COLS; c++) gridHTML += `<div class="c4-cell" id="cell-${c}-${r}"></div>`; }
    let colHTML = '';
    for(let c=0; c<COLS; c++) colHTML += `<div class="c4-column" id="col-${c}" onclick="c4Drop(${c})"></div>`;

    board.innerHTML = `
        <div class="c4-game-container">
            <div class="c4-header">
                <div class="score-pill ${c4State.currentPlayer===1?'active-turn':''}" style="border-left:5px solid ${c4State.p1.color}">
                    <div class="mini-chip" style="background:${c4State.p1.color}"><img src="${c4State.p1.img}"></div>
                    <div><div style="font-weight:bold; font-size:0.8rem;">${c4State.p1.name}</div><div class="wins-dots">${makeDots(c4State.p1.wins)}</div></div>
                </div>
                <button class="tool-btn" style="width:auto; margin:0;" onclick="startConnect4()">Stop</button>
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
    setTimeout(c4Resize, 200);
    window.addEventListener('resize', c4Resize);
}

function c4Resize() {
    const wrapper = document.getElementById('board-visual');
    if(!wrapper) return;
    const cellRef = document.querySelector('.c4-cell');
    if(cellRef) {
        const cellSize = cellRef.clientWidth;
        wrapper.style.setProperty('--cell-size', `${cellSize}px`);
        for(let c=0; c<COLS; c++) {
            const colDiv = document.getElementById(`col-${c}`);
            if(colDiv) {
                const cell = document.getElementById(`cell-${c}-0`);
                if(cell) {
                    colDiv.style.left = cell.offsetLeft + 'px';
                    colDiv.style.width = cell.clientWidth + 'px';
                }
            }
        }
    }
}

function c4Drop(col) {
    if(!c4State.gameActive || c4State.isDropping) return;
    let row = -1;
    for(let r=0; r<ROWS; r++) { if(c4State.board[col][r] === 0) { row = r; break; } }
    if(row === -1) { if(typeof playSound==='function') playSound('error'); return; }

    c4State.isDropping = true;
    c4State.board[col][row] = c4State.currentPlayer;
    const p = c4State.currentPlayer === 1 ? c4State.p1 : c4State.p2;

    const chip = document.createElement('div');
    chip.className = 'game-chip chip-falling';
    chip.style.background = p.color;
    chip.innerHTML = `<img src="${p.img}">`;

    const wrapper = document.getElementById('board-visual');
    const targetCell = document.getElementById(`cell-${col}-${row}`);
    const startCell = document.getElementById(`cell-${col}-${ROWS-1}`);
    
    if(targetCell && startCell) {
        chip.style.left = startCell.offsetLeft + 'px';
        chip.style.width = startCell.clientWidth + 'px';
        chip.style.height = startCell.clientHeight + 'px';
        const targetTop = targetCell.offsetTop;
        
        const animName = `bounce-${col}-${row}-${Date.now()}`;
        const keyframes = `@keyframes ${animName} { 0% { top: -150%; } 60% { top: ${targetTop}px; } 75% { top: ${targetTop - 15}px; } 100% { top: ${targetTop}px; } }`;
        const styleSheet = document.createElement("style");
        styleSheet.innerText = keyframes;
        document.head.appendChild(styleSheet);
        
        chip.style.animation = `${animName} 0.5s ease-in forwards`;
        document.getElementById('chips-layer').appendChild(chip);
        
        setTimeout(() => { if(typeof playSound==='function') playSound('click'); }, 300);

        setTimeout(() => {
            c4State.isDropping = false;
            chip.style.top = targetTop + 'px';
            chip.style.animation = 'none';
            chip.classList.remove('chip-falling');
            document.head.removeChild(styleSheet);
            
            if (c4CheckWin(col, row)) c4Win();
            else if (c4CheckDraw()) { alert("Gelijkspel!"); c4InitGame(); }
            else {
                c4State.currentPlayer = c4State.currentPlayer===1?2:1;
                c4InitGameHeader(); 
            }
        }, 550);
    }
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
