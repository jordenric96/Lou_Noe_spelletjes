// PUZZEL.JS - Pro Puzzel (Fixed & Styling)
console.log("Puzzel.js geladen");

let pState = { 
    img: '', pieces: [], rows: 3, cols: 2, 
    selectedPiece: null, correctCount: 0, difficulty: 'easy',
    playerNames: [], hintUsed: false, pendingName: null, pendingIcon: null
};

const puzColors = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FFEB3B', '#FF9800'];

function startPuzzleGame() {
    const board = document.getElementById('game-board');
    
    // Check of assetConfig bestaat (uit stickers.js/newgames.js), anders fallback
    const config = (typeof assetConfig !== 'undefined') ? assetConfig : {};
    const themes = Object.keys(config).filter(t => !config[t].locked);
    
    let puzzleOptions = '';
    if(themes.length > 0) {
        // Genereer willekeurige opties
        const usedSrcs = [];
        for(let i=0; i<8; i++) { 
            const t = themes[Math.floor(Math.random() * themes.length)];
            const nr = Math.floor(Math.random() * config[t].count) + 1;
            const src = `assets/images/memory/${t}/${nr}.${config[t].ext}`;
            
            // Voorkom dubbele in de keuzeijst
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
                    <div class="theme-grid" style="max-height: 200px; overflow-y: auto;">
                        ${puzzleOptions}
                    </div>
                </div>

                <div class="setup-group">
                    <h3>3. Niveau</h3>
                    <div class="option-grid">
                        <button class="option-btn selected" onclick="setPuzzleDiff('easy', this)"><span>🟢</span><span class="btn-label">6</span></button>
                        <button class="option-btn" onclick="setPuzzleDiff('medium', this)"><span>🟠</span><span class="btn-label">20</span></button>
                        <button class="option-btn" onclick="setPuzzleDiff('hard', this)"><span>🔴</span><span class="btn-label">30</span></button>
                    </div>
                </div>
            </div>
            <button id="start-puzzle-btn" class="start-btn" onclick="initPuzzle()" disabled>Kies eerst een plaatje...</button>
        </div>
    `;
    
    pState.playerNames = [];
    pState.img = '';
    pState.difficulty = 'easy';
    pState.rows = 3; pState.cols = 2; // Default easy
}

function addPuzzlePlayer(name, icon, btn) {
    if(typeof playSound === 'function') playSound('click');
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending');
    pState.pendingName = name;
    pState.pendingIcon = icon;
    
    const colors = document.getElementById('puz-colors');
    colors.style.animation = "shake 0.5s";
    setTimeout(()=>colors.style.animation="", 500);
}

function setPuzzleColor(color, btn) {
    if(!pState.pendingName) { alert("Klik eerst op een naam!"); return; }
    if(typeof playSound === 'function') playSound('pop');

    // Puzzel is meestal 1 speler, dus we overschrijven de vorige
    pState.playerNames = [{ name: pState.pendingName, icon: pState.pendingIcon, color: color }];
    pState.pendingName = null;
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));

    document.getElementById('puz-active-players').innerHTML = pState.playerNames.map(p => 
        `<div class="active-player-tag" style="background:${p.color}"><span>${p.icon} ${p.name}</span></div>`
    ).join('');
    checkPuzzleStart();
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
    
    // Hier stellen we de grid in
    if(diff === 'easy') { pState.cols = 2; pState.rows = 3; }
    else if(diff === 'medium') { pState.cols = 4; pState.rows = 5; } // 20
    else { pState.cols = 5; pState.rows = 6; } // 30
    
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

function initPuzzle() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    pState.correctCount = 0;
    pState.selectedPiece = null;
    pState.hintUsed = false;
    
    const totalPieces = pState.rows * pState.cols;
    
    // Grid Slots (De lege gaten)
    let gridHTML = '';
    for(let i=0; i<totalPieces; i++) {
        gridHTML += `<div class="puzzle-slot" id="slot-${i}" data-index="${i}" onclick="placePiece(this)"></div>`;
    }
    
    // Pieces (De losse stukjes)
    let pieces = [];
    for(let i=0; i<totalPieces; i++) pieces.push(i);
    pieces.sort(() => Math.random() - 0.5); // Husselen
    
    let poolHTML = '';
    pieces.forEach(i => {
        // Bereken positie van dit stukje in de originele foto
        const x = (i % pState.cols) * 100 / (pState.cols - 1);
        const y = Math.floor(i / pState.cols) * 100 / (pState.rows - 1);
        
        // Bereken de background-size zodat de foto opgeknipt wordt
        // Als je 4 kolommen hebt, moet de afbeelding 400% groot zijn in elk stukje
        const sizeX = pState.cols * 100;
        const sizeY = pState.rows * 100;

        poolHTML += `
            <div class="puzzle-piece" id="piece-${i}" data-index="${i}" onclick="selectPiece(this)" 
                 style="background-image: url('${pState.img}'); 
                        background-position: ${x}% ${y}%;
                        background-size: ${sizeX}% ${sizeY}%;">
            </div>
        `;
    });

    // Layout bepalen op basis van moeilijkheid
    let boardClass = '';
    let boardStyle = ''; // Voor de ghost image
    let previewHTML = '';

    if (pState.difficulty === 'easy') {
        boardClass = 'ghost-mode';
        // Zet de afbeelding wazig op de achtergrond van het bord
        boardStyle = `background-image: url('${pState.img}');`;
    } else {
        // Bij medium/hard geen achtergrond op het bord, maar een preview erboven
        previewHTML = `<div class="preview-mini"><img src="${pState.img}"><span>Voorbeeld</span></div>`;
    }

    // Variabelen voor CSS Grid
    const cssVars = `style="--puz-cols: ${pState.cols}; --puz-rows: ${pState.rows}; ${boardStyle}"`;

    board.innerHTML = `
        <div class="puzzle-game-container">
            <div class="puzzle-header">
                <button class="tool-btn" onclick="startPuzzleGame()">⬅ Terug</button>
                ${previewHTML}
                <button id="tip-btn" class="tip-btn" onclick="givePuzzleHint()">💡 TIP</button>
            </div>
            
            <div class="puzzle-board ${boardClass}" ${cssVars}>
                ${gridHTML}
            </div>
            
            <div class="puzzle-pool">
                ${poolHTML}
            </div>
        </div>
    `;
}

function selectPiece(el) {
    // Als het stukje al in een slot zit, mag je het niet meer selecteren (of verplaatsen als je dat zou willen bouwen)
    if(el.parentElement.classList.contains('puzzle-slot')) return;
    
    if(typeof playSound === 'function') playSound('click');
    
    // Verwijder selectie van vorige
    if(pState.selectedPiece) pState.selectedPiece.classList.remove('selected');
    
    pState.selectedPiece = el;
    el.classList.add('selected');
}

function placePiece(slot) {
    if(!pState.selectedPiece) return; // Niets geselecteerd
    if(slot.hasChildNodes()) return; // Slot is al bezet
    
    if(typeof playSound === 'function') playSound('pop');
    
    slot.appendChild(pState.selectedPiece);
    pState.selectedPiece.classList.remove('selected');
    
    const slotIndex = parseInt(slot.getAttribute('data-index'));
    const pieceIndex = parseInt(pState.selectedPiece.getAttribute('data-index'));
    
    // Check of het goed is
    if(slotIndex === pieceIndex) {
        // JUIST!
        pState.selectedPiece.classList.add('correct');
        pState.selectedPiece.onclick = null; // Niet meer aanklikbaar
        pState.correctCount++;
        checkPuzzleWin();
    } else {
        // FOUT!
        const wrongPiece = pState.selectedPiece;
        wrongPiece.classList.add('wrong');
        // Terug naar pool na korte animatie
        setTimeout(() => {
            wrongPiece.classList.remove('wrong');
            document.querySelector('.puzzle-pool').appendChild(wrongPiece);
        }, 500);
    }
    pState.selectedPiece = null;
}

function givePuzzleHint() {
    if(pState.hintUsed) return;
    
    // Zoek het eerste stukje in de pool
    const piecesInPool = Array.from(document.querySelectorAll('.puzzle-pool .puzzle-piece'));
    if(piecesInPool.length === 0) return;
    
    const piece = piecesInPool[0];
    const index = piece.getAttribute('data-index');
    const targetSlot = document.getElementById(`slot-${index}`); // FIX: TargetSlot definieren
    
    if(targetSlot && !targetSlot.hasChildNodes()) {
        if(typeof playSound === 'function') playSound('win');
        targetSlot.appendChild(piece); // FIX: targetSlot gebruiken
        piece.classList.add('correct');
        piece.onclick = null;
        pState.correctCount++;
        pState.hintUsed = true;
        
        const btn = document.getElementById('tip-btn');
        btn.disabled = true;
        btn.style.opacity = 0.5;
        
        checkPuzzleWin();
    }
}

function checkPuzzleWin() {
    if(pState.correctCount === (pState.rows * pState.cols)) {
        setTimeout(() => {
            const winner = pState.playerNames.length > 0 ? pState.playerNames[0].name : "Jij";
            if(typeof showWinnerModal === 'function') {
                showWinnerModal(winner, [{name:winner, score:"Puzzel Compleet!"}]);
            } else {
                alert("Puzzel Compleet!");
            }
        }, 500);
    }
}
