// VIEROPEENRIJ.JS - CENTRAL PLAYERS & SOLID CHIPS
console.log("4-op-een-rij geladen (Final Fix)...");

let c4State = {
    step: 0, winsNeeded: 3,
    p1: { name: '', themeKey: '', color: '#F44336', wins: 0, queue: [] },
    p2: { name: '', themeKey: '', color: '#2196F3', wins: 0, queue: [] },
    board: [], currentPlayer: 1, gameActive: false, isDropping: false
};

const ROWS = 6; const COLS = 7;
const c4Colors = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#00BCD4', '#4CAF50', '#FFEB3B', '#FF9800'];

// --- SETUP ---
function startConnect4() {
    c4State.step = 0; c4State.p1.wins = 0; c4State.p2.wins = 0;
    c4State.p1.name = ''; c4State.p1.themeKey = ''; c4State.p1.color = '#F44336';
    c4State.p2.name = ''; c4State.p2.themeKey = ''; c4State.p2.color = '#2196F3';
    renderWizardStep();
}

function generateQueue(themeKey) {
    if (!memThemes || !memThemes[themeKey]) return Array(25).fill('assets/images/icon.png');
    const t = memThemes[themeKey];
    const pool = [];
    for(let i=1; i<=15; i++) pool.push(`${t.path}${i}.${t.extension}`);
    const queue = [];
    // Shuffle en vul
    while(queue.length < 30) {
        queue.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return queue;
}

function renderWizardStep() {
    const board = document.getElementById('game-board');
    const isP1 = c4State.step === 0;
    const currPlayer = isP1 ? c4State.p1 : c4State.p2;
    const title = isP1 ? "SPELER 1" : "SPELER 2";
    const isReady = currPlayer.name !== '' && currPlayer.themeKey !== '';
    let btnText = "KIES NAAM & THEMA...";
    if (isReady) btnText = isP1 ? "BEVESTIG SPELER 1 ➡" : "START HET SPEL! 🚀";

    // Thema opties
    let themesHTML = '';
    if(typeof memThemes !== 'undefined') {
        Object.keys(memThemes).forEach(key => {
            const t = memThemes[key];
            if(!t.locked && !t.isMix) {
                const selected = currPlayer.themeKey === key ? 'selected' : '';
                themesHTML += `
                    <div class="theme-option ${selected}" onclick="c4SetTheme('${key}')">
                        <img src="${t.path}cover.png">
                        <div class="theme-name">${key}</div>
                    </div>`;
            }
        });
    }

    let colorsHTML = c4Colors.map(c => 
        `<div class="c4-color-dot ${currPlayer.color===c?'active':''}" style="background:${c}" onclick="c4SetColor('${c}')"></div>`
    ).join('');

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

    board.innerHTML = `
        <div class="c4-setup-container">
            <div class="c4-step-box">
                ${goalSection}
                <div class="c4-title" style="color:${currPlayer.color}">${title}</div>
                
                <div class="c4-subtitle">Naam:</div>
                <div class="preset-row">
                    <button class="preset-btn ${currPlayer.name==='Lou'?'active':''}" onclick="c4SetName('Lou')">👦🏼<br>Lou</button>
                    <button class="preset-btn ${currPlayer.name==='Noé'?'active':''}" onclick="c4SetName('Noé')">👶🏼<br>Noé</button>
                    <button class="preset-btn ${currPlayer.name==='Mama'?'active':''}" onclick="c4SetName('Mama')">👩🏻<br>Mama</button>
                    <button class="preset-btn ${currPlayer.name==='Papa'?'active':''}" onclick="c4SetName('Papa')">👨🏻<br>Papa</button>
                </div>
                <input type="text" class="custom-name-input" placeholder="Of typ zelf..." value="${currPlayer.name}" 
                    oninput="c4UpdateName(this.value)" onclick="this.select()">

                <div class="c4-subtitle">Kleur & Thema:</div>
                <div class="color-picker-row">${colorsHTML}</div>
                <div class="chip-grid" style="grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));">${themesHTML}</div>

                <button class="confirm-action-btn ${isReady ? 'ready' : ''}" onclick="c4NextStep()">${btnText}</button>
            </div>
            <button class="tool-btn" onclick="location.reload()">Terug naar Menu</button>
        </div>
    `;
}

// Setup Helpers
function c4UpdateBtn() {
    const curr = c4State.step === 0 ? c4State.p1 : c4State.p2;
    const btn = document.querySelector('.confirm-action-btn');
    if (curr.name && curr.themeKey) {
        btn.classList.add('ready');
        btn.innerText = c4State.step === 0 ? "BEVESTIG SPELER 1 ➡" : "START HET SPEL! 🚀";
    } else {
        btn.classList.remove('ready');
        btn.innerText = "KIES NAAM & THEMA...";
    }
}
function c4SetGoal(n) { if(typeof playSound==='function') playSound('click'); c4State.winsNeeded = n; renderWizardStep(); }
function c4SetName(n) {
    if(typeof playSound==='function') playSound('click');
    const p = c4State.step === 0 ? c4State.p1 : c4State.p2; p.name = n;
    document.querySelector('.custom-name-input').value = n;
    document.querySelectorAll('.preset-btn').forEach(b => {
        if(b.innerText.includes(n)) b.classList.add('active'); else b.classList.remove('active');
    });
    c4UpdateBtn();
}
function c4UpdateName(val) { const p = c4State.step === 0 ? c4State.p1 : c4State.p2; p.name = val; document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active')); c4UpdateBtn(); }
function c4SetColor(c) {
    if(typeof playSound==='function') playSound('click');
    const p = c4State.step === 0 ? c4State.p1 : c4State.p2; p.color = c;
    renderWizardStep(); 
}
function c4SetTheme(key) {
    if(typeof playSound==='function') playSound('pop');
    const p = c4State.step === 0 ? c4State.p1 : c4State.p2; p.themeKey = key;
    document.querySelectorAll('.theme-option').forEach(el => el.classList.remove('selected'));
    renderWizardStep();
}
function c4NextStep() {
    const curr = c4State.step === 0 ? c4State.p1 : c4State.p2;
    if (!curr.name || !curr.themeKey) { if(typeof playSound==='function') playSound('error'); return; }
    if(typeof playSound==='function') playSound('win');
    curr.queue = generateQueue(curr.themeKey);
    if (c4State.step === 0) { c4State.step = 1; renderWizardStep(); } else { c4InitGame(); }
}

// --- GAME ---
function c4InitGame() {
    c4State.board = Array(COLS).fill(null).map(() => Array(ROWS).fill(0));
    c4State.gameActive = true; c4State.isDropping = false; c4State.currentPlayer = 1;
    renderGame();
}

function renderGame() {
    const board = document.getElementById('game-board');
    
    // Helper voor Queue en Stars
    const makeQueue = (p, isActive) => {
        let h = `<div class="chip-queue">`;
        p.queue.slice(0, 5).forEach((src, i) => {
            const cls = (i === 0 && isActive) ? 'queue-item next-up' : 'queue-item';
            h += `<div class="${cls}" style="background:${p.color}"><img src="${src}"></div>`;
        });
        h += `</div>`;
        return h;
    };
    const makeStars = (p) => {
        let h = ''; for(let i=0; i<c4State.winsNeeded; i++) h += `<div class="star-dot ${i<p.wins?'won':''}"></div>`; return h;
    };

    // Masker Grid (Gaten)
    const maskCells = Array(ROWS*COLS).fill('<div class="c4-hole"></div>').join('');
    // Klik Grid
    const clickCols = Array(COLS).fill(0).map((_,i) => `<div class="c4-col-click" onclick="c4Drop(${i})"></div>`).join('');

    board.innerHTML = `
        <div class="c4-game-container">
            <div class="player-zone top ${c4State.currentPlayer===1?'active-turn':''}">
                <div class="pz-info">
                    <div class="pz-name" style="color:${c4State.p1.color}">${c4State.p1.name}</div>
                    <div class="pz-stars">${makeStars(c4State.p1)}</div>
                </div>
                ${makeQueue(c4State.p1, c4State.currentPlayer===1)}
            </div>

            <div class="board-area">
                <div class="board-wrapper" id="board-visual">
                    <div class="layer-chips" id="chips-layer"></div>
                    <div class="layer-mask">${maskCells}</div>
                    <div class="layer-click">${clickCols}</div>
                </div>
                <button class="tool-btn" style="width:auto; margin-top:5px; padding:5px 20px; font-size:0.8rem;" onclick="startConnect4()">Stoppen</button>
            </div>

            <div class="player-zone bottom ${c4State.currentPlayer===2?'active-turn':''}">
                ${makeQueue(c4State.p2, c4State.currentPlayer===2)}
                <div class="pz-info">
                    <div class="pz-name" style="color:${c4State.p2.color}">${c4State.p2.name}</div>
                    <div class="pz-stars">${makeStars(c4State.p2)}</div>
                </div>
            </div>
        </div>
    `;
}

function c4Drop(col) {
    if(!c4State.gameActive || c4State.isDropping) return;
    
    // Zoek rij
    let row = -1;
    for(let r=0; r<ROWS; r++) { if(c4State.board[col][r] === 0) { row = r; break; } }
    if(row === -1) { if(typeof playSound==='function') playSound('error'); return; }

    c4State.isDropping = true;
    c4State.board[col][row] = c4State.currentPlayer;
    
    const p = c4State.currentPlayer === 1 ? c4State.p1 : c4State.p2;
    const chipSrc = p.queue.shift(); // Pak chip
    p.queue.push(generateQueue(p.themeKey)[0]); // Vul aan
    renderGame(); // Update queue UI

    // 1. Bereken Dimensies
    const boardEl = document.getElementById('board-visual');
    const boardRect = boardEl.getBoundingClientRect();
    
    // We weten: Bord is 7 kolommen breed, 6 rijen hoog.
    // De breedte van één cel is BordBreedte / 7
    const cellW = boardRect.width / 7;
    const cellH = boardRect.height / 6;
    
    // Chip is ietsje kleiner dan de cel
    const chipSize = cellW * 0.92;
    const margin = (cellW - chipSize) / 2; // Centreren
    
    // Bereken posities relatief aan de chips-layer (0,0 is linksboven in het bord)
    const finalLeft = (col * cellW) + margin;
    
    // Rij 0 (onderaan) = 5 * cellH (van bovenaf geteld)
    // Rij 5 (boven) = 0 * cellH
    // Formule: Y = (5 - row) * cellH + margin
    const finalTop = ((5 - row) * cellH) + margin;

    // 2. Maak Chip
    const chip = document.createElement('div');
    chip.className = 'game-chip';
    chip.style.width = `${chipSize}px`;
    chip.style.height = `${chipSize}px`;
    chip.style.left = `${finalLeft}px`;
    chip.style.background = p.color;
    chip.innerHTML = `<img src="${chipSrc}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    
    // Stel CSS variabele in voor animatie (eindpunt)
    chip.style.setProperty('--final-top', `${finalTop}px`);
    chip.style.animation = `dropBounce 0.5s cubic-bezier(0.5, 0.05, 1, 0.5) forwards`;
    
    document.getElementById('chips-layer').appendChild(chip);
    
    setTimeout(() => { if(typeof playSound==='function') playSound('click'); }, 350);

    setTimeout(() => {
        c4State.isDropping = false;
        // FINAL FIX: Harde positie zetten
        chip.style.top = `${finalTop}px`;
        chip.style.animation = 'none'; // Stop animatie
        
        if (c4CheckWin(col, row)) c4Win();
        else if (c4CheckDraw()) { alert("Gelijkspel!"); c4InitGame(); }
        else {
            c4State.currentPlayer = c4State.currentPlayer===1?2:1;
            renderGame(); 
        }
    }, 550);
}

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
    renderGame(); 
    if(p.wins >= c4State.winsNeeded) {
        setTimeout(() => { if(typeof showWinnerModal==='function') showWinnerModal(p.name); }, 1000);
    } else {
        setTimeout(() => { c4InitGame(); }, 1500);
    }
}
