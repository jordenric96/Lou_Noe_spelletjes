// PUZZEL.JS - STRENGE FILTER & DUIDELIJKE UI
console.log("Puzzel.js geladen (Full Photo Filter)...");

let pState = { 
    img: '', pieces: [], rows: 3, cols: 2, selectedPiece: null, correctCount: 0, difficulty: 'easy',
    playerNames: [], hintsLeft: 5, pendingName: null, pendingIcon: null
};
const puzColors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#FFC107', '#FF9800'];

// --- FILTER FUNCTIE: IS DIT EEN VOLLEDIGE FOTO? ---
// (Checkt of de hoeken ONDOORZICHTIG zijn. Zo ja = foto. Zo nee = cutout/png)
function isFullImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "Anonymous"; 
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
                // Check 4 hoeken
                const corners = [
                    ctx.getImageData(0, 0, 1, 1).data[3],
                    ctx.getImageData(img.width-1, 0, 1, 1).data[3],
                    ctx.getImageData(0, img.height-1, 1, 1).data[3],
                    ctx.getImageData(img.width-1, img.height-1, 1, 1).data[3]
                ];
                // Als ALLE hoeken zichtbaar zijn (>200 alpha), is het een rechthoek (FOTO)
                const isRectangle = corners.every(alpha => alpha > 200); 
                resolve(isRectangle); 
            } catch (e) { resolve(true); } // Bij twijfel: laat maar door
        };
        img.onerror = () => resolve(false);
    });
}

// ASYNC SETUP: Eerst plaatjes keuren, dan tonen
async function startPuzzleGame() {
    const board = document.getElementById('game-board');
    // Eerst even een laadschermpje tonen, want filteren kost 1 seconde
    board.innerHTML = `<div style="display:flex; height:100%; justify-content:center; align-items:center; color:white; font-size:1.5rem;">Plaatjes zoeken... 🧩</div>`;

    const config = (typeof memThemes !== 'undefined') ? memThemes : {};
    let puzzleOptions = '';
    
    const keys = Object.keys(config);
    const usedSrcs = [];
    let foundCount = 0;
    
    // We proberen max 30 keer een plaatje te pakken om er 8 te vinden
    for(let i=0; i<40 && foundCount < 8; i++) {
        const t = keys[Math.floor(Math.random() * keys.length)];
        const tData = config[t];
        
        // Sla 'mix' en 'locked' over
        if(tData && !tData.locked && !tData.isMix) {
            const nr = Math.floor(Math.random() * 15) + 1; 
            const src = `${tData.path}${nr}.${tData.extension}`;
            
            if(!usedSrcs.includes(src)) {
                // DE BELANGRIJKE CHECK: IS HET EEN VOLLEDIGE FOTO?
                const isGood = await isFullImage(src);
                
                if(isGood) {
                    usedSrcs.push(src);
                    puzzleOptions += `
                        <div class="theme-card-btn" onclick="puzSetImg('${src}', this)">
                            <div class="theme-img-container"><img src="${src}"></div>
                            <div class="btn-label">Kies mij!</div>
                        </div>`;
                    foundCount++;
                }
            }
        }
    }

    // HTML OPBOUW
    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-group">
                <h3>1. Wie Puzzelt?</h3>
                <div class="name-row">
                    <button class="player-btn" onclick="puzSelectPerson('Lou', '👦🏼', this)">👦🏼 Lou</button>
                    <button class="player-btn" onclick="puzSelectPerson('Noé', '👶🏼', this)">👶🏼 Noé</button>
                    <button class="player-btn" onclick="puzSelectPerson('Mama', '👩🏻', this)">👩🏻 Mama</button>
                    <button class="player-btn" onclick="puzSelectPerson('Papa', '👨🏻', this)">👨🏻 Papa</button>
                </div>
                
                <div class="color-grid-6" id="puz-colors">
                    ${puzColors.map(c => `<div class="color-dot" style="background:${c}" onclick="puzSetColor('${c}', this)"></div>`).join('')}
                </div>
                
                <div id="puz-active-players" style="margin-top:10px; min-height:30px;"></div>
            </div>

            <div class="setup-group">
                <h3>2. Kies een Plaatje</h3>
                <div class="theme-grid-wrapper">
                    ${puzzleOptions}
                </div>
            </div>

            <div class="setup-group">
                <h3>3. Niveau</h3>
                <div class="name-row">
                    <button class="player-btn selected-pending" onclick="puzSetDiff('easy', this)">🟢 6 Stukjes</button>
                    <button class="player-btn" onclick="puzSetDiff('medium', this)">🟠 20 Stukjes</button>
                    <button class="player-btn" onclick="puzSetDiff('hard', this)">🔴 30 Stukjes</button>
                </div>
            </div>

            <div class="bottom-actions">
                <button id="puz-start-btn" class="start-btn" onclick="initPuzzle()" disabled>Kies eerst een plaatje...</button>
                <button class="tool-btn" onclick="location.reload()">⬅ Menu</button>
            </div>
        </div>
    `;
    pState.playerNames = []; pState.img = ''; pState.difficulty = 'easy';
}

// --- SELECTIE FUNCTIES (Nu met sterke visuele feedback) ---
function puzSelectPerson(name, icon, btn) { 
    if(typeof playSound === 'function') playSound('click'); 
    // Reset alle namen in deze rij
    btn.parentElement.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending')); 
    // Zet deze aan
    btn.classList.add('selected-pending'); 
    
    pState.pendingName = name; 
    pState.pendingIcon = icon; 
    
    // Even schudden met kleuren om aandacht te vragen
    const c=document.getElementById('puz-colors'); 
    c.style.animation="shake 0.5s"; setTimeout(()=>c.style.animation="",500); 
}

function puzSetColor(color, btn) { 
    if(!pState.pendingName) { alert("Klik eerst op een naam!"); return; } 
    if(typeof playSound === 'function') playSound('pop'); 
    
    // Reset kleuren borders
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected-color'));
    btn.classList.add('selected-color'); // Dikke rand om gekozen kleur

    pState.playerNames = [{ name: pState.pendingName, icon: pState.pendingIcon, color: color }]; 
    pState.pendingName = null; 
    
    // Reset naam selectie (visueel klaar)
    const nameRow = document.querySelector('.setup-group .name-row'); 
    if(nameRow) nameRow.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending')); 

    document.getElementById('puz-active-players').innerHTML = pState.playerNames.map(p => `<div class="active-player-tag" style="background:${p.color}"><span>${p.icon} ${p.name}</span></div>`).join(''); 
    puzCheckStart(); 
}

function puzSetImg(src, btn) { 
    if(typeof playSound === 'function') playSound('click'); 
    pState.img = src; 
    // Reset andere plaatjes
    document.querySelectorAll('.theme-card-btn').forEach(b => b.classList.remove('selected')); 
    // Selecteer deze (CSS regelt de groene rand en vinkje)
    btn.classList.add('selected'); 
    puzCheckStart(); 
}

function puzSetDiff(diff, btn) { 
    if(typeof playSound === 'function') playSound('click'); 
    pState.difficulty = diff; 
    // Reset niveau knoppen
    btn.parentElement.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending')); 
    btn.classList.add('selected-pending'); 
}

function puzCheckStart() { 
    const btn = document.getElementById('puz-start-btn'); 
    if (pState.playerNames.length > 0 && pState.img !== '') { 
        btn.disabled = false; btn.innerText = "START PUZZEL ▶"; 
        btn.style.transform = "scale(1.05)"; // Even laten ploppen
    } 
}

// ... (Rest van de logica voor het spelbord blijft hetzelfde) ...
function puzUpdateSize() { const wrapper = document.querySelector('.puzzle-board-wrapper'); const board = document.querySelector('.puzzle-board'); if (!wrapper || !board) return; const availW = wrapper.clientWidth - 10; const availH = wrapper.clientHeight - 10; if (availW <= 0 || availH <= 0) return; const maxPieceW = availW / pState.cols; const maxPieceH = availH / pState.rows; const pieceSize = Math.floor(Math.min(maxPieceW, maxPieceH)); board.style.setProperty('--piece-size', `${pieceSize}px`); board.style.width = `${pieceSize * pState.cols}px`; board.style.height = `${pieceSize * pState.rows}px`; }
function initPuzzle() { if(typeof playSound === 'function') playSound('win'); const board = document.getElementById('game-board'); board.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:white;"><h2>Even geduld...</h2></div>'; const tempImg = new Image(); tempImg.src = pState.img; tempImg.onload = function() { const isLandscape = tempImg.naturalWidth >= tempImg.naturalHeight; if(pState.difficulty === 'easy') { pState.cols = isLandscape ? 3 : 2; pState.rows = isLandscape ? 2 : 3; } else if(pState.difficulty === 'medium') { pState.cols = isLandscape ? 5 : 4; pState.rows = isLandscape ? 4 : 5; } else { pState.cols = isLandscape ? 6 : 5; pState.rows = isLandscape ? 5 : 6; } puzBuildBoard(board); }; }
function puzBuildBoard(board) {
    pState.correctCount = 0; pState.selectedPiece = null; pState.hintsLeft = 5;
    const totalPieces = pState.rows * pState.cols;
    const player = pState.playerNames[0] || {name:'Jij', icon:'👤', color:'#333'};
    let gridHTML = ''; for(let i=0; i<totalPieces; i++) gridHTML += `<div class="puzzle-slot" id="slot-${i}" data-index="${i}" onclick="puzPlacePiece(this)"></div>`;
    let pieces = []; for(let i=0; i<totalPieces; i++) pieces.push(i); pieces.sort(() => Math.random() - 0.5); 
    let leftPoolHTML = '', rightPoolHTML = ''; pieces.forEach((i, index) => { const x = (i % pState.cols) * 100 / (pState.cols - 1); const y = Math.floor(i / pState.cols) * 100 / (pState.rows - 1); const sizeX = pState.cols * 100; const sizeY = pState.rows * 100; const pieceHTML = `<div class="puzzle-piece" id="piece-${i}" data-index="${i}" onclick="puzSelectPiece(this)" style="background-image: url('${pState.img}'); background-position: ${x}% ${y}%; background-size: ${sizeX}% ${sizeY}%;"></div>`; if(index % 2 === 0) leftPoolHTML += pieceHTML; else rightPoolHTML += pieceHTML; });
    let boardClass = (pState.difficulty === 'easy') ? 'ghost-mode' : ''; let boardStyle = (pState.difficulty === 'easy') ? `background-image: url('${pState.img}');` : ''; let previewHTML = (pState.difficulty !== 'easy') ? `<div class="preview-mini"><img src="${pState.img}"></div>` : ''; const cssVars = `style="--puz-cols: ${pState.cols}; --puz-rows: ${pState.rows}; ${boardStyle}"`; let bulbsHTML = ''; for(let i=0; i<5; i++) bulbsHTML += `<span id="bulb-${i}" class="hint-bulb">💡</span>`;
    board.innerHTML = `<div class="puzzle-game-container"><div class="puzzle-header"><button class="tool-btn" onclick="startPuzzleGame()">⬅</button><div class="puzzle-score" style="border-color:${player.color}; color:${player.color}">${player.icon} <span id="puz-score-txt">0</span>/${totalPieces}</div><div class="hint-container"><button class="tip-btn" onclick="puzGiveHint()">TIP</button><div class="bulb-row">${bulbsHTML}</div></div>${previewHTML}</div><div class="puzzle-main-area"><div class="puzzle-pool side-pool" id="pool-left">${leftPoolHTML}</div><div class="puzzle-board-wrapper"><div class="puzzle-board ${boardClass}" ${cssVars}>${gridHTML}</div></div><div class="puzzle-pool side-pool" id="pool-right">${rightPoolHTML}</div></div></div>`;
    puzUpdateSize(); window.addEventListener('resize', puzUpdateSize);
    setTimeout(() => { const starterIndex = Math.floor(Math.random() * totalPieces); const starterPiece = document.getElementById(`piece-${starterIndex}`); const starterSlot = document.getElementById(`slot-${starterIndex}`); if(starterPiece && starterSlot) { starterSlot.appendChild(starterPiece); starterPiece.classList.add('correct'); starterPiece.onclick = null; pState.correctCount = 1; puzUpdateScore(); } }, 100);
}
function puzUpdateScore() { const el = document.getElementById('puz-score-txt'); if(el) el.innerText = pState.correctCount; }
function puzSelectPiece(el) { if(el.parentElement.classList.contains('puzzle-slot')) return; if(typeof playSound === 'function') playSound('click'); if(pState.selectedPiece) pState.selectedPiece.classList.remove('selected'); pState.selectedPiece = el; el.classList.add('selected'); }
function puzPlacePiece(slot) {
    if(!pState.selectedPiece) return; if(slot.hasChildNodes()) return; if(typeof playSound === 'function') playSound('pop');
    slot.appendChild(pState.selectedPiece); pState.selectedPiece.classList.remove('selected');
    const slotIndex = parseInt(slot.getAttribute('data-index')); const pieceIndex = parseInt(pState.selectedPiece.getAttribute('data-index'));
    if(slotIndex === pieceIndex) {
        pState.selectedPiece.classList.add('correct'); pState.selectedPiece.onclick = null; pState.correctCount++; puzUpdateScore(); puzCheckWin();
    } else {
        const wrongPiece = pState.selectedPiece; wrongPiece.classList.add('wrong'); const originPool = (Math.random() > 0.5) ? 'pool-left' : 'pool-right'; setTimeout(() => { wrongPiece.classList.remove('wrong'); const origin = document.getElementById(originPool) || document.querySelector('.puzzle-pool'); origin.appendChild(wrongPiece); }, 500);
    }
    pState.selectedPiece = null;
}
function puzGiveHint() {
    if(pState.hintsLeft <= 0) { if(typeof playSound === 'function') playSound('error'); return; }
    const pools = document.querySelectorAll('.puzzle-pool .puzzle-piece'); const piecesInPool = Array.from(pools); if(piecesInPool.length === 0) return;
    const piece = piecesInPool[0]; const index = piece.getAttribute('data-index'); const targetSlot = document.getElementById(`slot-${index}`); 
    if(targetSlot && !targetSlot.hasChildNodes()) {
        if(typeof playSound === 'function') playSound('win'); targetSlot.appendChild(piece); piece.classList.add('correct'); piece.onclick = null; pState.correctCount++; pState.hintsLeft--; for(let i=0; i<5; i++) { const bulb = document.getElementById(`bulb-${i}`); if(i < pState.hintsLeft) { bulb.classList.remove('used'); bulb.style.opacity = '1'; bulb.style.filter = 'grayscale(0%)'; } else { bulb.classList.add('used'); bulb.style.opacity = '0.3'; bulb.style.filter = 'grayscale(100%)'; } } const btn = document.querySelector('.tip-btn'); if(pState.hintsLeft === 0) { btn.disabled = true; btn.innerText = "OP"; } puzUpdateScore(); puzCheckWin();
    }
}
function puzCheckWin() {
    if(pState.correctCount === (pState.rows * pState.cols)) {
        setTimeout(() => {
            const winner = pState.playerNames.length > 0 ? pState.playerNames[0].name : "Jij";
            if(typeof showWinnerModal === 'function') { showWinnerModal(winner); }
        }, 500);
    }
}
