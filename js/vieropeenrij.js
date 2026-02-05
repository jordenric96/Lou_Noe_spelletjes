// VIEROPEENRIJ.JS - THEME QUEUE & SOLID FIX
console.log("4-op-een-rij geladen (Queue Edition)...");

let c4State = {
    step: 0, winsNeeded: 3,
    p1: { name: '', themeKey: '', color: '#F44336', wins: 0, queue: [] },
    p2: { name: '', themeKey: '', color: '#2196F3', wins: 0, queue: [] },
    board: [], currentPlayer: 1, gameActive: false, isDropping: false
};

const ROWS = 6; const COLS = 7;
const c4Colors = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#00BCD4', '#4CAF50', '#FFEB3B', '#FF9800'];

// --- HELPER: GENERATE QUEUE ---
function generateQueue(themeKey) {
    if (!memThemes || !memThemes[themeKey]) return Array(20).fill('assets/images/icon.png');
    
    const t = memThemes[themeKey];
    const pool = [];
    // Maak een lijst van alle beschikbare plaatjes in dit thema
    for(let i=1; i<=15; i++) pool.push(`${t.path}${i}.${t.extension}`);
    
    // Shuffle en vul aan tot 25 (zodat je nooit op raakt)
    const queue = [];
    while(queue.length < 25) {
        const item = pool[Math.floor(Math.random() * pool.length)];
        queue.push(item);
    }
    return queue;
}

// --- SETUP ---
function startConnect4() {
    c4State.step = 0; c4State.p1.wins = 0; c4State.p2.wins = 0;
    c4State.p1.name = ''; c4State.p1.themeKey = ''; c4State.p1.color = '#F44336';
    c4State.p2.name = ''; c4State.p2.themeKey = ''; c4State.p2.color = '#2196F3';
    renderWizardStep();
}

function renderWizardStep() {
    const board = document.getElementById('game-board');
    const isP1 = c4State.step === 0;
    const currPlayer = isP1 ? c4State.p1 : c4State.p2;
    const title = isP1 ? "WIE IS SPELER 1?" : "WIE IS SPELER 2?";
    const isReady = currPlayer.name !== '' && currPlayer.themeKey !== '';
    let btnText = "KIES NAAM & THEMA...";
    if (isReady) btnText = isP1 ? "BEVESTIG SPELER 1 ➡" : "START HET SPEL! 🚀";

    // Thema opties genereren (Nu kiezen we een MAPJE, geen losse chip)
    let themesHTML = '';
    if(typeof memThemes !== 'undefined') {
        Object.keys(memThemes).forEach(key => {
            const t = memThemes[key];
            if(!t.locked && !t.isMix) {
                // Als P2 kiest, mag hij niet zelfde thema als P1? Nee, mag wel, is leuk.
                // We tonen de cover image van het thema
                const selected = currPlayer.themeKey === key ? 'selected' : '';
                themesHTML += `
                    <div class="theme-option ${selected}" onclick="c4SetTheme('${key}')">
                        <img src="${t.path}cover.png" class="theme-cover">
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
                
                <div class="c4-subtitle">Kies naam:</div>
                <div class="preset-row">
                    <button class="preset-btn ${currPlayer.name==='Lou'?'active':''}" onclick="c4SetName('Lou')">👦🏼<br>Lou</button>
                    <button class="preset-btn ${currPlayer.name==='Noé'?'active':''}" onclick="c4SetName('Noé')">👶🏼<br>Noé</button>
                    <button class="preset-btn ${currPlayer.name==='Mama'?'active':''}" onclick="c4SetName('Mama')">👩🏻<br>Mama</button>
                    <button class="preset-btn ${currPlayer.name==='Papa'?'active':''}" onclick="c4SetName('Papa')">👨🏻<br>Papa</button>
                </div>
                <input type="text" class="custom-name-input" placeholder="Of typ zelf..." value="${currPlayer.name}" 
                    oninput="c4UpdateName(this.value)" onclick="this.select()">

                <div class="c4-subtitle">Kies kleur & thema:</div>
                <div class="color-picker-row">${colorsHTML}</div>
                <div class="chip-grid" style="grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));">${themesHTML}</div>

                <button class="confirm-action-btn ${isReady ? 'ready' : ''}" onclick="c4NextStep()">${btnText}</button>
            </div>
            <button class="tool-btn" onclick="location.reload()">Stoppen</button>
        </div>
    `;
}

// SETUP FUNCTIONS
function c4UpdateBtn() {
    const curr = c4State.step === 0 ? c4State.p1 : c4State.p2;
    const btn = document.querySelector('.confirm-action-btn');
    const isReady = curr.name && curr.themeKey;
    if (isReady) {
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
    // Visuele update zonder refresh (voor snelheid)
    // Maar we hebben geen unieke ID op de div, dus refresh is veiliger
    renderWizardStep();
}
function c4NextStep() {
    const curr = c4State.step === 0 ? c4State.p1 : c4State.p2;
    if (!curr.name || !curr.themeKey) { if(typeof playSound==='function') playSound('error'); return; }
    if(typeof playSound==='function') playSound('win');
    
    // GENERATE QUEUE
    curr.queue = generateQueue(curr.themeKey);
    
    if (c4State.step === 0) { c4State.step = 1; renderWizardStep(); } else { c4InitGame(); }
}

// --- GAME LOGIC ---
function c4InitGame() {
    c4State.board = Array(COLS).fill(null).map(() => Array(ROWS).fill(0));
    c4State.gameActive = true; c4State.isDropping = false; c4State.currentPlayer = 1;
    renderGame();
}

function renderGame() {
    const board = document.getElementById('game-board');
    
    // Functie om queue HTML te maken
    const makeQueue = (player, isActive) => {
        let h = `<div class="chip-queue">`;
        // Toon eerste 6 chips
        player.queue.slice(0, 6).forEach((src, i) => {
            const cls = i === 0 ? (isActive ? 'queue-item next-up' : 'queue-item') : 'queue-item';
            h += `<div class="${cls}" style="background:${player.color}"><img src="${src}"></div>`;
        });
        h += `</div>`;
        return h;
    };

    const makeStars = (p) => {
        let h = '';
        for(let i=0; i<c4State.winsNeeded; i++) {
            h += `<div class="star-dot ${i < p.wins ? 'won' : ''}"></div>`;
        }
        return h;
    };

    board.innerHTML = `
        <div class="c4-game-container">
            
            <div class="player-zone top ${c4State.currentPlayer===1?'active-turn':''}">
                <div class="pz-header">
                    <div class="pz-name" style="color:${c4State.p1.color}">${c4State.p1.name}</div>
                    <div class="pz-stars">${makeStars(c4State.p1)}</div>
                </div>
                ${makeQueue(c4State.p1, c4State.currentPlayer===1)}
            </div>

            <div class="board-area">
                <div class="board-wrapper" id="board-visual">
                    <div id="chips-layer"></div>   <div class="c4-grid">          ${Array(ROWS*COLS).fill('<div class="c4-cell"></div>').join('')}
                    </div>
                    <div class="click-layer">      ${Array(COLS).fill(0).map((_,i) => `<div class="c4-column" onclick="c4Drop(${i})"></div>`).join('')}
                    </div>
                </div>
                <button class="tool-btn" style="width:auto; margin-top:10px;" onclick="startConnect4()">Stoppen</button>
            </div>

            <div class="player-zone bottom ${c4State.currentPlayer===2?'active-turn':''}">
                <div class="pz-header">
                    <div class="pz-name" style="color:${c4State.p2.color}">${c4State.p2.name}</div>
                    <div class="pz-stars">${makeStars(c4State.p2)}</div>
                </div>
                ${makeQueue(c4State.p2, c4State.currentPlayer===2)}
            </div>

        </div>
    `;
}

function c4Drop(col) {
    if(!c4State.gameActive || c4State.isDropping) return;
    
    // 1. Zoek rij
    let row = -1;
    for(let r=0; r<ROWS; r++) { if(c4State.board[col][r] === 0) { row = r; break; } }
    if(row === -1) { if(typeof playSound==='function') playSound('error'); return; }

    c4State.isDropping = true;
    c4State.board[col][row] = c4State.currentPlayer;
    
    const p = c4State.currentPlayer === 1 ? c4State.p1 : c4State.p2;
    // 2. PAK EERSTE CHIP UIT QUEUE
    const chipSrc = p.queue.shift(); 
    // Vul queue aan (zodat hij nooit leeg raakt)
    p.queue.push(generateQueue(p.themeKey)[0]);

    // Update UI (queue schuift op)
    renderGame(); 
    // Door renderGame wordt DOM herbouwd, maar dat geeft niet, we injecteren de vallende chip nu.

    // 3. MAAK CHIP
    const chip = document.createElement('div');
    chip.className = 'game-chip chip-falling';
    chip.style.background = p.color;
    chip.innerHTML = `<img src="${chipSrc}">`;

    const chipsLayer = document.getElementById('chips-layer');
    const boardWrapper = document.getElementById('board-visual');
    
    // BEREKEN AFMETINGEN (Dynamisch)
    const wrapperWidth = boardWrapper.clientWidth;
    const wrapperHeight = boardWrapper.clientHeight;
    // Padding is 2% aan elke kant = 4% totaal.
    // Effectieve breedte = 96%
    const effW = wrapperWidth * 0.96;
    const cellW = effW / 7;
    const cellH = cellW; // Vierkant
    
    // Left offset = 2% padding + (col * cellW)
    const leftPos = (wrapperWidth * 0.02) + (col * cellW);
    
    // Target Top = WrapperHeight - 2% PaddingBottom - (row+1)*cellH
    // Of makkelijker: 2% PaddingTop + (5-row)*cellH
    // Rij 0 (onder) = index 5 in visual grid (boven naar beneden)?
    // Nee: Board array 0 = onder.
    // Visual grid: Top (row 5) naar Bottom (row 0).
    // CSS Grid in mask bouwt van linksboven.
    // Laten we de "Top" berekenen:
    // Bord is 6 hoog. Rij 0 (onder) is de 6e cel van boven.
    // Top = PaddingTop + (5 - row) * cellH
    const topPos = (wrapperHeight * 0.02) + ((5 - row) * cellH);
    
    // Stel grootte in (ietsje kleiner dan gat voor mooie fit)
    const chipSize = cellW * 0.9;
    const offset = (cellW - chipSize) / 2;
    
    chip.style.width = chipSize + 'px';
    chip.style.height = chipSize + 'px';
    chip.style.left = (leftPos + offset) + 'px';
    
    // Animatie
    const animName = `drop-${Date.now()}`;
    const keyframes = `@keyframes ${animName} { 
        0% { top: -100px; } 
        60% { top: ${topPos + offset}px; } 
        80% { top: ${topPos + offset - 20}px; } 
        100% { top: ${topPos + offset}px; } 
    }`;
    const style = document.createElement('style');
    style.innerText = keyframes;
    document.head.appendChild(style);
    
    chip.style.animation = `${animName} 0.5s ease-in forwards`;
    chipsLayer.appendChild(chip);
    
    setTimeout(() => { if(typeof playSound==='function') playSound('click'); }, 300);

    setTimeout(() => {
        c4State.isDropping = false;
        // FINAL POSITION LOCK
        chip.style.top = (topPos + offset) + 'px';
        chip.style.animation = 'none';
        chip.classList.remove('chip-falling');
        document.head.removeChild(style);
        
        if (c4CheckWin(col, row)) c4Win();
        else if (c4CheckDraw()) { alert("Gelijkspel!"); c4InitGame(); }
        else {
            c4State.currentPlayer = c4State.currentPlayer===1?2:1;
            renderGame(); // Update beurt visueel
        }
    }, 550);
}

// WIN & DRAW (Standaard)
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
