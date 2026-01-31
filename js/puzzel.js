// PUZZEL.JS - Side Pools & 5 Tips
console.log("Puzzel.js geladen (Side Layout)...");

let pState = { 
    img: '', pieces: [], rows: 3, cols: 2, 
    selectedPiece: null, correctCount: 0, difficulty: 'easy',
    playerNames: [], 
    hintsLeft: 5, // We starten met 5 tips
    pendingName: null, pendingIcon: null
};

const puzColors = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FFEB3B', '#FF9800'];

// --- SETUP (Ongewijzigd) ---
function startPuzzleGame() {
    const board = document.getElementById('game-board');
    const config = (typeof assetConfig !== 'undefined') ? assetConfig : {};
    const themes = Object.keys(config).filter(t => !config[t].locked);
    
    let puzzleOptions = '';
    if(themes.length > 0) {
        const usedSrcs = [];
        for(let i=0; i<8; i++) { 
            const t = themes[Math.floor(Math.random() * themes.length)];
            const nr = Math.floor(Math.random() * config[t].count) + 1;
            const src = `assets/images/memory/${t}/${nr}.${config[t].ext}`;
            if(!usedSrcs.includes(src)) {
                usedSrcs.push(src);
                puzzleOptions += `
                    <button class="theme-card-btn" onclick="setPuzzleImg('${src}', this)" style="padding:0; overflow:hidden;">
                        <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
                    </button>`;
            }
        }
    }

    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-columns">
                <div class="setup-group">
                    <h3>1. Wie Puzzelt? 🧩</h3>
                    <div class="option-grid">
                        <button class="option-btn player-btn" onclick="addPuzzlePlayer('Lou', '👦🏼', this)">👦🏼 Lou</button>
                        <button class="option-btn player-btn" onclick="addPuzzlePlayer('Noé', '👶🏼', this)">👶🏼 Noé</button>
                        <button class="option-btn player-btn" onclick="addPuzzlePlayer('Mama', '👩🏻', this)">👩🏻 Mama</button>
                        <button class="option-btn player-btn" onclick="addPuzzlePlayer('Papa', '👨🏻', this)">👨🏻 Papa</button>
                    </div>
                    <div class="color-row" id="puz-colors">
                        ${puzColors.map(c => `<div class="color-dot" style="background:${c}" onclick="setPuzzleColor('${c}', this)"></div>`).join('')}
                    </div>
                    <div id="puz-active-players" class="active-players-box"></div>
                </div>
                <div class="setup-group">
                    <h3>2. Kies Plaatje</h3>
                    <div class="theme-grid" style="max-height: 200px; overflow-y: auto;">${puzzleOptions}</div>
                </div>
                <div class="setup-group">
                    <h3>3. Niveau</h3>
                    <div class="option-grid">
                        <button class="option-btn diff-btn selected" onclick="setPuzzleDiff('easy', this)"><span>🟢</span><span class="btn-label">6</span></button>
                        <button class="option-btn diff-btn" onclick="setPuzzleDiff('medium', this)"><span>🟠</span><span class="btn-label">20</span></button>
                        <button class="option-btn diff-btn" onclick="setPuzzleDiff('hard', this)"><span>🔴</span><span class="btn-label">30</span></button>
                    </div>
                </div>
            </div>
            <button id="start-puzzle-btn" class="start-btn" onclick="initPuzzle()" disabled>Kies eerst een plaatje...</button>
        </div>
    `;
    pState.playerNames = []; pState.img = ''; pState.difficulty = 'easy'; pState.rows = 3; pState.cols = 2;
}

function addPuzzlePlayer(name, icon, btn) {
    if(typeof playSound === 'function') playSound('click');
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending'); pState.pendingName = name; pState.pendingIcon = icon;
    const c=document.getElementById('puz-colors'); c.style.animation="shake 0.5s"; setTimeout(()=>c.style.animation="",500);
}
function setPuzzleColor(color, btn) {
    if(!pState.pendingName) { alert("Klik eerst op een naam!"); return; }
    if(typeof playSound === 'function') playSound('pop');
    pState.playerNames = [{ name: pState.pendingName, icon: pState.pendingIcon, color: color }];
    pState.pendingName = null;
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    document.getElementById('puz-active-players').innerHTML = pState.playerNames.map(p => `<div class="active-player-tag" style="background:${p.color}"><span>${p.icon} ${p.name}</span></div>`).join('');
    checkPuzzleStart();
}
function setPuzzleImg(src, btn) {
    if(typeof playSound === 'function') playSound('click'); pState.img = src;
    document.querySelectorAll('.theme-card-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); checkPuzzleStart();
}
function setPuzzleDiff(diff, btn) {
    if(typeof playSound === 'function') playSound('click'); pState.difficulty = diff;
    if(diff === 'easy') { pState.cols = 2; pState.rows = 3; }
    else if(diff === 'medium') { pState.cols = 4; pState.rows = 5; }
    else { pState.cols = 5; pState.rows = 6; }
    btn.parentElement.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected');
}
function checkPuzzleStart() {
    const btn = document.getElementById('start-puzzle-btn');
    if (pState.playerNames.length > 0 && pState.img !== '') { btn.disabled = false; btn.innerText = "START PUZZEL ▶"; }
}

// --- GAME LOGIC ---

function initPuzzle() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    pState.correctCount = 0;
    pState.selectedPiece = null;
    
    // RESET TIPS NAAR 5
    pState.hintsLeft = 5;
    
    const totalPieces = pState.rows * pState.cols;
    
    // Grid maken
    let gridHTML = '';
    for(let i=0; i<totalPieces; i++) {
        gridHTML += `<div class="puzzle-slot" id="slot-${i}" data-index="${i}" onclick="placePiece(this)"></div>`;
    }
    
    // Stukjes maken en verdelen (Links en Rechts)
    let pieces = [];
    for(let i=0; i<totalPieces; i++) pieces.push(i);
    pieces.sort(() => Math.random() - 0.5); 
    
    let leftPoolHTML = '';
    let rightPoolHTML = '';

    pieces.forEach((i, index) => {
        const x = (i % pState.cols) * 100 / (pState.cols - 1);
        const y = Math.floor(i / pState.cols) * 100 / (pState.rows - 1);
        const sizeX = pState.cols * 100;
        const sizeY = pState.rows * 100;

        const pieceHTML = `
            <div class="puzzle-piece" id="piece-${i}" data-index="${i}" onclick="selectPiece(this)" 
                 style="background-image: url('${pState.img}'); 
                        background-position: ${x}% ${y}%;
                        background-size: ${sizeX}% ${sizeY}%;">
            </div>
        `;
        
        // Verdeel om en om
        if(index % 2 === 0) leftPoolHTML += pieceHTML;
        else rightPoolHTML += pieceHTML;
    });

    // Visuele instellingen
    let boardClass = (pState.difficulty === 'easy') ? 'ghost-mode' : '';
    let boardStyle = (pState.difficulty === 'easy') ? `background-image: url('${pState.img}');` : '';
    let previewHTML = (pState.difficulty !== 'easy') ? `<div class="preview-mini"><img src="${pState.img}"></div>` : '';

    const cssVars = `style="--puz-cols: ${pState.cols}; --puz-rows: ${pState.rows}; ${boardStyle}"`;

    // Lampjes genereren (5 stuks)
    let bulbsHTML = '';
    for(let i=0; i<5; i++) {
        bulbsHTML += `<span id="bulb-${i}" class="hint-bulb">💡</span>`;
    }

    board.innerHTML = `
        <div class="puzzle-game-container">
            <div class="puzzle-header">
                <button class="tool-btn" onclick="startPuzzleGame()">⬅ Terug</button>
                
                <div class="hint-container">
                    <button class="tip-btn" onclick="givePuzzleHint()">TIP</button>
                    <div class="bulb-row">${bulbsHTML}</div>
                </div>

                ${previewHTML}
            </div>
            
            <div class="puzzle-main-area">
                <div class="puzzle-pool side-pool" id="pool-left">
                    ${leftPoolHTML}
                </div>
                
                <div class="puzzle-board-wrapper">
                    <div class="puzzle-board ${boardClass}" ${cssVars}>
                        ${gridHTML}
                    </div>
                </div>

                <div class="puzzle-pool side-pool" id="pool-right">
                    ${rightPoolHTML}
                </div>
            </div>
        </div>
    `;
}

function selectPiece(el) {
    if(el.parentElement.classList.contains('puzzle-slot')) return;
    if(typeof playSound === 'function') playSound('click');
    if(pState.selectedPiece) pState.selectedPiece.classList.remove('selected');
    pState.selectedPiece = el; el.classList.add('selected');
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
        checkPuzzleWin();
    } else {
        const wrongPiece = pState.selectedPiece;
        wrongPiece.classList.add('wrong');
        const originPool = (Math.random() > 0.5) ? 'pool-left' : 'pool-right'; // Terug naar willekeurige kant
        setTimeout(() => {
            wrongPiece.classList.remove('wrong');
            // Probeer terug te zetten in een pool
            const pool = document.getElementById(originPool) || document.querySelector('.puzzle-pool');
            pool.appendChild(wrongPiece);
        }, 500);
    }
    pState.selectedPiece = null;
}

function givePuzzleHint() {
    // Check of we nog tips hebben
    if(pState.hintsLeft <= 0) {
        if(typeof playSound === 'function') playSound('error'); // Of ander geluidje
        return;
    }
    
    // Zoek stukjes die nog in de pools zitten
    const pools = document.querySelectorAll('.puzzle-pool .puzzle-piece');
    const piecesInPool = Array.from(pools);
    
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
        
        // VERMINDER TIPS
        pState.hintsLeft--;
        updateHintUI();
        
        checkPuzzleWin();
    }
}

function updateHintUI() {
    // Update de lampjes visualisatie
    // We hebben 5 lampjes (id bulb-0 t/m bulb-4).
    // Als hintsLeft 4 is, moet bulb-4 (de 5e) uit.
    for(let i=0; i<5; i++) {
        const bulb = document.getElementById(`bulb-${i}`);
        if(i < pState.hintsLeft) {
            bulb.classList.remove('used');
            bulb.style.opacity = '1';
            bulb.style.filter = 'grayscale(0%)';
        } else {
            bulb.classList.add('used');
            bulb.style.opacity = '0.3';
            bulb.style.filter = 'grayscale(100%)';
        }
    }
    
    // Update knop tekst/status
    const btn = document.querySelector('.tip-btn');
    if(pState.hintsLeft === 0) {
        btn.disabled = true;
        btn.innerText = "OP";
    } else {
        btn.innerText = `TIP (${pState.hintsLeft})`;
    }
}

function checkPuzzleWin() {
    if(pState.correctCount === (pState.rows * pState.cols)) {
        setTimeout(() => {
            const winner = pState.playerNames.length > 0 ? pState.playerNames[0].name : "Jij";
            if(typeof showWinnerModal === 'function') showWinnerModal(winner, [{name:winner, score:"Puzzel Compleet!"}]);
            else alert("Puzzel Compleet!");
        }, 500);
    }
}
