// VIEROPEENRIJ.JS - TABLET & ANDROID READY (FIXED)
console.log("4-op-een-rij geladen (Layer Fix)...");

let c4State = {
    step: 0, winsNeeded: 3,
    p1: { name: '', img: '', color: '#F44336', wins: 0 },
    p2: { name: '', img: '', color: '#2196F3', wins: 0 },
    board: [], currentPlayer: 1, gameActive: false, isDropping: false
};

const ROWS = 6; const COLS = 7;
const c4Colors = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#00BCD4', '#4CAF50', '#FFEB3B', '#FF9800'];

// --- SETUP ---
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
    const title = isP1 ? "SPELER 1" : "SPELER 2";
    const isReady = currPlayer.name !== '' && currPlayer.img !== '';
    let btnText = "KIES NAAM & PLAATJE...";
    if (isReady) btnText = isP1 ? "BEVESTIG SPELER 1 ➡" : "START HET SPEL! 🚀";

    // Chip opties
    let chipsHTML = '';
    if(typeof memThemes !== 'undefined') {
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=5; i++) {
                    const src = `${t.path}${i}.${t.extension}`;
                    if (!isP1 && src === c4State.p1.img) return; 
                    const selected = currPlayer.img === src ? 'selected' : '';
                    chipsHTML += `<div class="chip-option ${selected}" style="background:${currPlayer.color}" onclick="c4SetChip('${src}')"><img src="${src}"></div>`;
                }
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

                <div class="c4-subtitle">Kleur & Chip:</div>
                <div class="color-picker-row">${colorsHTML}</div>
                <div class="chip-grid" id="c4-chip-grid">${chipsHTML}</div>

                <button class="confirm-action-btn ${isReady ? 'ready' : ''}" onclick="c4NextStep()">${btnText}</button>
            </div>
            <button class="tool-btn" onclick="location.reload()">Terug naar Menu</button>
        </div>
    `;
}

function c4UpdateBtn() {
    const curr = c4State.step === 0 ? c4State.p1 : c4State.p2;
    const btn = document.querySelector('.confirm-action-btn');
    if (curr.name && curr.img) {
        btn.classList.add('ready');
        btn.innerText = c4State.step === 0 ? "BEVESTIG SPELER 1 ➡" : "START HET SPEL! 🚀";
    } else {
        btn.classList.remove('ready');
        btn.innerText = "KIES NAAM & PLAATJE...";
    }
}
function c4SetGoal(n) { if(typeof playSound==='function') playSound('click'); c4State.winsNeeded = n; renderWizardStep(); }
function c4SetName(n) { if(typeof playSound==='function') playSound('click'); const p = c4State.step===0?c4State.p1:c4State.p2; p.name=n; document.querySelector('.custom-name-input').value=n; document.querySelectorAll('.preset-btn').forEach(b=>{if(b.innerText.includes(n))b.classList.add('active');else b.classList.remove('active');}); c4UpdateBtn(); }
function c4UpdateName(val) { const p = c4State.step===0?c4State.p1:c4State.p2; p.name=val; document.querySelectorAll('.preset-btn').forEach(b=>b.classList.remove('active')); c4UpdateBtn(); }
function c4SetColor(c) { if(typeof playSound==='function') playSound('click'); const p = c4State.step===0?c4State.p1:c4State.p2; p.color=c; renderWizardStep(); }
function c4SetChip(src) { if(typeof playSound==='function') playSound('pop'); const p = c4State.step===0?c4State.p1:c4State.p2; p.img=src; document.querySelectorAll('.chip-option').forEach(el=>el.classList.remove('selected')); const allChips=document.querySelectorAll('.chip-option img'); allChips.forEach(img=>{if(img.getAttribute('src')===src)img.parentElement.classList.add('selected');}); c4UpdateBtn(); }
function c4NextStep() { const curr=c4State.step===0?c4State.p1:c4State.p2; if(!curr.name||!curr.img){if(typeof playSound==='function')playSound('error');return;} if(typeof playSound==='function')playSound('win'); if(c4State.step===0){c4State.step=1;renderWizardStep();}else{c4InitGame();} }

// --- GAME ---
function c4InitGame() {
    c4State.board = Array(COLS).fill(null).map(() => Array(ROWS).fill(0));
    c4State.gameActive = true; c4State.isDropping = false; c4State.currentPlayer = 1;
    renderGame();
}

function renderGame() {
    const boardDiv = document.getElementById('game-board');
    
    const makeScore = (p) => {
        let h = '<div class="psc-chips-row">';
        for(let i=0; i<c4State.winsNeeded; i++) {
            const cls = i < p.wins ? 'score-token earned' : 'score-token';
            h += `<div class="${cls}" style="background:${p.color}"><img src="${p.img}"></div>`;
        }
        h += '</div>';
        return h;
    };

    // 1. CHIPS LAAG (Achteraan)
    // We geven deze divs de ID's (slot-c-r) zodat de animatie weet waar de posities zijn
    let chipsHTML = '';
    for(let r=ROWS-1; r>=0; r--) {
        for(let c=0; c<COLS; c++) {
            const val = c4State.board[c][r];
            let content = '';
            if (val === 1) content = `<img src="${c4State.p1.img}" class="slotted-chip" style="background:${c4State.p1.color}; --chip-color:${c4State.p1.color}">`;
            if (val === 2) content = `<img src="${c4State.p2.img}" class="slotted-chip" style="background:${c4State.p2.color}; --chip-color:${c4State.p2.color}">`;
            
            chipsHTML += `<div id="slot-${c}-${r}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${content}</div>`;
        }
    }

    // 2. MASKER LAAG (Midden - Het blauwe bord)
    let maskHTML = '';
    for(let r=ROWS-1; r>=0; r--) {
        for(let c=0; c<COLS; c++) {
            maskHTML += `<div class="c4-slot"></div>`; // Alleen blauwe achtergrond met gat
        }
    }

    // 3. KLIK LAAG (Vooraan)
    let clicksHTML = '';
    for(let c=0; c<COLS; c++) {
        const leftPct = c * 14.28;
        clicksHTML += `<div class="column-clicker" style="left:${leftPct}%" onclick="c4Drop(${c})"></div>`;
    }

    boardDiv.innerHTML = `
        <div class="c4-game-container">
            <div class="player-score-card top ${c4State.currentPlayer===1?'active-turn':''}" style="--p-color:${c4State.p1.color}">
                <div class="pz-name" style="color:${c4State.p1.color}">${c4State.p1.name}</div>
                ${makeScore(c4State.p1)}
            </div>

            <div class="board-area">
                <div class="board-wrapper" id="board-visual">
                    <div class="chips-layer">${chipsHTML}</div>
                    <div class="c4-grid-mask">${maskHTML}</div>
                    <div class="click-layer">${clicksHTML}</div>
                </div>
                <button class="tool-btn" style="width:auto; margin-top:10px;" onclick="startConnect4()">Stoppen</button>
            </div>

            <div class="player-score-card bottom ${c4State.currentPlayer===2?'active-turn':''}" style="--p-color:${c4State.p2.color}">
                ${makeScore(c4State.p2)}
                <div class="pz-name" style="color:${c4State.p2.color}">${c4State.p2.name}</div>
            </div>
        </div>
    `;
}

function c4Drop(col) {
    if(!c4State.gameActive || c4State.isDropping) return;

    let row = -1;
    for(let r=0; r<ROWS; r++) { if(c4State.board[col][r] === 0) { row = r; break; } }
    if(row === -1) { if(typeof playSound==='function') playSound('error'); return; }

    c4State.isDropping = true;
    
    // Coordinaten ophalen (werkt omdat we ID's op de chips-layer hebben gezet)
    const targetSlot = document.getElementById(`slot-${col}-${row}`);
    const gridRect = document.getElementById('board-visual').getBoundingClientRect();
    const slotRect = targetSlot.getBoundingClientRect();

    const endTop = slotRect.top - gridRect.top;
    const endLeft = slotRect.left - gridRect.left;
    const startTop = -60;

    // Animatie Chip
    const p = c4State.currentPlayer === 1 ? c4State.p1 : c4State.p2;
    const animChip = document.createElement('div');
    animChip.className = 'game-chip';
    animChip.style.width = slotRect.width + 'px';
    animChip.style.height = slotRect.height + 'px';
    animChip.style.left = endLeft + 'px';
    animChip.style.background = p.color;
    animChip.style.setProperty('--chip-color', p.color);
    animChip.innerHTML = `<img src="${p.img}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    
    const keyframes = [{ top: startTop + 'px' }, { top: endTop + 'px' }];
    const animation = animChip.animate(keyframes, { duration: 400, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' });

    document.getElementById('board-visual').appendChild(animChip);

    animation.onfinish = () => {
        if(typeof playSound==='function') playSound('click');
        animChip.remove();
        
        c4State.board[col][row] = c4State.currentPlayer;
        
        const winResult = c4CheckWin(col, row);
        
        if (winResult) {
            renderGame(); // Tekent de vaste chip
            c4HighlightWinners(winResult);
            setTimeout(c4Win, 1000);
        } else if (c4CheckDraw()) {
            renderGame();
            alert("Gelijkspel!"); setTimeout(c4InitGame, 1000);
        } else {
            c4State.currentPlayer = c4State.currentPlayer === 1 ? 2 : 1;
            renderGame();
            c4State.isDropping = false;
        }
    };
}

function c4CheckWin(c, r) {
    const p = c4State.board[c][r];
    const dirs = [[[0,1]], [[1,0]], [[1,1]], [[1,-1]]];
    for(let d of dirs) {
        let winningCells = [{c:c, r:r}]; 
        for(let side of [-1,1]) {
            let dc=d[0][0]*side, dr=d[0][1]*side, nc=c+dc, nr=r+dr;
            while(nc>=0 && nc<COLS && nr>=0 && nr<ROWS && c4State.board[nc][nr]===p) {
                winningCells.push({c:nc, r:nr});
                nc+=dc; nr+=dr;
            }
        }
        if(winningCells.length >= 4) return winningCells; 
    }
    return null;
}

function c4HighlightWinners(cells) {
    cells.forEach(pos => {
        const slot = document.getElementById(`slot-${pos.c}-${pos.r}`);
        if(slot) {
            const img = slot.querySelector('img');
            if(img) img.classList.add('winning-chip');
        }
    });
    if(typeof memFireConfetti === 'function') memFireConfetti();
}

function c4CheckDraw() { return c4State.board.every(c => c[ROWS-1] !== 0); }

function c4Win() {
    if(typeof playSound==='function') playSound('victory');
    const p = c4State.currentPlayer === 1 ? c4State.p1 : c4State.p2;
    p.wins++;
    renderGame(); 
    
    c4State.isDropping = true; 

    if(p.wins >= c4State.winsNeeded) {
        setTimeout(() => { if(typeof showWinnerModal==='function') showWinnerModal(p.name); }, 500);
    } else {
        setTimeout(() => { 
            c4State.gameActive = true; 
            c4State.isDropping = false; 
            c4InitGame(); 
        }, 1500);
    }
}
