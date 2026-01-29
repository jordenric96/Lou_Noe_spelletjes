// BLOKKEN SPEL - "MCQUEEN RACE" EDITIE
// Versie: Fixed & Standalone

console.log("Blokken.js is geladen!"); // Check of dit in de console verschijnt

let blokkenState = {
    playerNames: [],
    difficulty: 'medium', 
    scores: {},
    currentPlayerIndex: 0,
    currentLevelData: null,
    gridSize: 6,
    cellSize: 0,
    timer: null,
    timeLeft: 60,
    isGameActive: false,
    activeColor: '#2196F3' // Standaard blauw
};

const blokkenPalette = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];

// DE PUZZELS
const levelsDatabase = {
    'easy': [
        [ // Level 1
            { id: 'hero', x: 1, y: 2, w: 2, h: 1, color: 'hero', dir: 'h' },
            { id: 'b1', x: 3, y: 1, w: 1, h: 3, color: 'car', dir: 'v' },
            { id: 'b2', x: 0, y: 0, w: 1, h: 2, color: 'car', dir: 'v' },
            { id: 'b3', x: 4, y: 4, w: 2, h: 1, color: 'car', dir: 'h' }
        ],
        [ // Level 2
            { id: 'hero', x: 0, y: 2, w: 2, h: 1, color: 'hero', dir: 'h' },
            { id: 'b1', x: 2, y: 2, w: 1, h: 3, color: 'car', dir: 'v' },
            { id: 'b2', x: 3, y: 3, w: 3, h: 1, color: 'car', dir: 'h' }
        ]
    ],
    'medium': [
        [ // Level 1
            { id: 'hero', x: 1, y: 2, w: 2, h: 1, color: 'hero', dir: 'h' },
            { id: 'b1', x: 3, y: 1, w: 1, h: 2, color: 'car', dir: 'v' },
            { id: 'b2', x: 0, y: 0, w: 1, h: 3, color: 'car', dir: 'v', type: 'truck' },
            { id: 'b3', x: 3, y: 3, w: 2, h: 1, color: 'car', dir: 'h' },
            { id: 'b4', x: 5, y: 0, w: 1, h: 3, color: 'car', dir: 'v', type: 'truck' }
        ],
         [ // Level 2
            { id: 'hero', x: 0, y: 2, w: 2, h: 1, color: 'hero', dir: 'h' },
            { id: 'b1', x: 2, y: 0, w: 1, h: 3, color: 'car', dir: 'v', type: 'truck' },
            { id: 'b2', x: 3, y: 1, w: 1, h: 2, color: 'car', dir: 'v' },
            { id: 'b3', x: 2, y: 3, w: 2, h: 1, color: 'car', dir: 'h' },
            { id: 'b4', x: 4, y: 4, w: 2, h: 1, color: 'car', dir: 'h' }
        ]
    ],
    'hard': [
        [ // Level 1 (Complex)
            { id: 'hero', x: 0, y: 2, w: 2, h: 1, color: 'hero', dir: 'h' },
            { id: 'b1', x: 2, y: 0, w: 1, h: 3, color: 'car', dir: 'v', type: 'truck' },
            { id: 'b2', x: 3, y: 0, w: 3, h: 1, color: 'car', dir: 'h', type: 'truck' },
            { id: 'b3', x: 2, y: 3, w: 2, h: 1, color: 'car', dir: 'h' },
            { id: 'b4', x: 4, y: 4, w: 2, h: 1, color: 'car', dir: 'h' },
            { id: 'b5', x: 0, y: 5, w: 3, h: 1, color: 'car', dir: 'h', type: 'truck' }
        ]
    ]
};

// 1. SETUP SCHERM
function startBlokkenGame() {
    console.log("Start Blokken Game...");
    const board = document.getElementById('game-board');
    
    // HTML Genereren
    let paletteHTML = blokkenPalette.map(color => 
        `<div class="color-dot" style="background-color: ${color}" onclick="selectBlokkenColor('${color}', this)"></div>`
    ).join('');
    
    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-columns">
                <div class="setup-group group-players">
                    <h3>Wie racet er?</h3>
                    <div class="color-row">${paletteHTML}</div>
                    <div class="option-grid" id="blokken-player-selection"></div>
                    <div class="player-input-container">
                        <input type="text" id="custom-blokken-name" placeholder="Naam...">
                        <button class="add-btn" onclick="addBlokkenPlayer()">+</button>
                    </div>
                </div>

                <div class="setup-group group-size">
                    <h3>Moeilijkheid</h3>
                    <div class="option-grid">
                        <button class="option-btn" onclick="setBlokkenDiff('easy', this)"><span>⭐</span><span class="btn-label">Easy</span></button>
                        <button class="option-btn selected" onclick="setBlokkenDiff('medium', this)"><span>⭐⭐</span><span class="btn-label">Medium</span></button>
                        <button class="option-btn" onclick="setBlokkenDiff('hard', this)"><span>⭐⭐⭐</span><span class="btn-label">Hard</span></button>
                    </div>
                </div>
            </div>
            <button id="start-blokken-btn" class="start-btn" onclick="initRace()" disabled>Kies spelers...</button>
        </div>
    `;

    blokkenState.playerNames = [];
    blokkenState.difficulty = 'medium';
    selectBlokkenColor(blokkenPalette[3], document.querySelector('.color-dot:nth-child(4)'));
}

function selectBlokkenColor(color, btn) {
    if(!btn) return;
    blokkenState.activeColor = color;
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    btn.classList.add('active');
}

function setBlokkenDiff(diff, btn) {
    blokkenState.difficulty = diff;
    Array.from(btn.parentElement.children).forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
}

function addBlokkenPlayer() {
    const input = document.getElementById('custom-blokken-name');
    const name = input.value.trim();
    if (name && !blokkenState.playerNames.some(p => p.name === name)) {
        blokkenState.playerNames.push({ name: name, color: blokkenState.activeColor });
        renderBlokkenPlayers();
        input.value = '';
        checkBlokkenStart();
    }
}

function renderBlokkenPlayers() {
    const container = document.getElementById('blokken-player-selection');
    container.innerHTML = blokkenState.playerNames.map(p => 
        `<button class="option-btn selected" style="background-color:${p.color}; color:white;" onclick="removeBlokkenPlayer('${p.name}')">
            <span>👤</span><span class="btn-label" style="color:white">${p.name}</span>
        </button>`
    ).join('');
}

function removeBlokkenPlayer(name) {
    blokkenState.playerNames = blokkenState.playerNames.filter(p => p.name !== name);
    renderBlokkenPlayers();
    checkBlokkenStart();
}

function checkBlokkenStart() {
    const btn = document.getElementById('start-blokken-btn');
    btn.disabled = blokkenState.playerNames.length === 0;
    btn.innerText = blokkenState.playerNames.length > 0 ? "START DE RACE! 🏁" : "Kies spelers...";
}

// 2. GAME LOOP
function initRace() {
    blokkenState.scores = {};
    blokkenState.playerNames.forEach(p => blokkenState.scores[p.name] = 0);
    blokkenState.currentPlayerIndex = 0;
    startTurn();
}

function startTurn() {
    const currentPlayer = blokkenState.playerNames[blokkenState.currentPlayerIndex];
    const board = document.getElementById('game-board');
    
    const possibleLevels = levelsDatabase[blokkenState.difficulty];
    const randomLevel = possibleLevels[Math.floor(Math.random() * possibleLevels.length)];
    
    board.innerHTML = `
        <div id="blokken-container">
            <div id="status-bar" style="border-left-color: ${currentPlayer.color}">
                <div class="player-info">
                    <span style="color:${currentPlayer.color}">👤 ${currentPlayer.name}</span>
                    <span>Punten: ${blokkenState.scores[currentPlayer.name]} / 5</span>
                </div>
                <div id="timer-bar-bg"><div id="timer-bar"></div></div>
            </div>
            
            <div id="game-area">
                <div id="exit-marker"></div>
            </div>
            
            <button class="reset-btn" onclick="resetCurrentLevel()">Reset Puzzel ↺</button>
        </div>
    `;
    
    blokkenState.currentLevelData = JSON.parse(JSON.stringify(randomLevel));
    // Even wachten zodat DOM klaar is voor grootte berekening
    setTimeout(() => {
        loadBlocks(blokkenState.currentLevelData);
        startTimer();
    }, 50);

    window.addEventListener('resize', handleResize);
}

function handleResize() {
    if(document.getElementById('game-area') && blokkenState.currentLevelData) {
        loadBlocks(blokkenState.currentLevelData);
    }
}

function startTimer() {
    blokkenState.timeLeft = 60;
    blokkenState.isGameActive = true;
    if(blokkenState.timer) clearInterval(blokkenState.timer);
    
    const bar = document.getElementById('timer-bar');
    blokkenState.timer = setInterval(() => {
        if(!blokkenState.isGameActive) return;
        blokkenState.timeLeft -= 0.1;
        let percentage = (blokkenState.timeLeft / 60) * 100;
        
        if(bar) {
            bar.style.width = `${percentage}%`;
            if(percentage < 20) bar.style.backgroundColor = '#FF5252';
            else bar.style.backgroundColor = '#4CAF50';
        }

        if(blokkenState.timeLeft <= 0) endTurn(false);
    }, 100);
}

function endTurn(success) {
    clearInterval(blokkenState.timer);
    blokkenState.isGameActive = false;
    const currentPlayer = blokkenState.playerNames[blokkenState.currentPlayerIndex];
    
    let msg = success ? "Goed gedaan! +1 punt" : "Tijd is op!";
    if(success) {
        blokkenState.scores[currentPlayer.name]++;
        if(blokkenState.scores[currentPlayer.name] >= 5) {
             // Oplossing voor ranglijst: Map scores naar array
             let leaderboard = Object.keys(blokkenState.scores).map(name => ({
                name: name, 
                score: blokkenState.scores[name], 
                color: blokkenState.playerNames.find(p => p.name === name).color
            })).sort((a,b) => b.score - a.score);

            showWinnerModal(currentPlayer.name, leaderboard);
            return;
        }
    }
    
    const board = document.getElementById('blokken-container');
    const overlay = document.createElement('div');
    overlay.className = 'turn-overlay';
    overlay.innerHTML = `<h2>${msg}</h2>`;
    board.appendChild(overlay);
    
    setTimeout(() => {
        blokkenState.currentPlayerIndex++;
        if(blokkenState.currentPlayerIndex >= blokkenState.playerNames.length) blokkenState.currentPlayerIndex = 0;
        startTurn();
    }, 2000);
}

function resetCurrentLevel() {
    // Simpele reset: herlaad de blokken op hun huidige posities (of herstart beurt als je echt opnieuw wilt)
    // Voor nu: we herstarten de beurt NIET, maar zetten blokken terug.
    // Omdat we 'original' data niet hebben opgeslagen in deze simpele versie, doen we reloadTurn
    // Maar dat reset de tijd... voor nu prima.
    startTurn(); 
}

// 3. RENDER & DRAG
function loadBlocks(blocksData) {
    const gameArea = document.getElementById('game-area');
    if(!gameArea) return;
    Array.from(gameArea.querySelectorAll('.block')).forEach(e => e.remove());

    const rect = gameArea.getBoundingClientRect();
    blokkenState.cellSize = (rect.width - 16) / 6; 

    blocksData.forEach((block, index) => {
        const el = document.createElement('div');
        el.className = `block ${block.color} ${block.type || ''}`;
        el.style.width = (block.w * blokkenState.cellSize) + 'px';
        el.style.height = (block.h * blokkenState.cellSize) + 'px';
        el.style.left = (block.x * blokkenState.cellSize) + 'px';
        el.style.top = (block.y * blokkenState.cellSize) + 'px';
        
        if(block.id === 'hero') el.style.backgroundImage = `url('assets/images/blokken/hero.png')`;

        el.addEventListener('mousedown', (e) => startDrag(e, index, el));
        el.addEventListener('touchstart', (e) => startDrag(e, index, el), {passive: false});
        gameArea.appendChild(el);
    });
}

let activeBlock = null; let startX, startY, initialBlockPos, minLimit, maxLimit;

function startDrag(e, index, el) {
    if(!blokkenState.isGameActive) return;
    e.preventDefault(); 
    activeBlock = { index, el, data: blokkenState.currentLevelData[index] };
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX; startY = clientY;
    if(activeBlock.data.dir === 'h') initialBlockPos = activeBlock.data.x * blokkenState.cellSize;
    else initialBlockPos = activeBlock.data.y * blokkenState.cellSize;
    calculateLimits(activeBlock.data);
    document.addEventListener('mousemove', onDrag); document.addEventListener('touchmove', onDrag, {passive: false});
    document.addEventListener('mouseup', endDrag); document.addEventListener('touchend', endDrag);
}

function calculateLimits(block) {
    minLimit = 0; maxLimit = (6 * blokkenState.cellSize);
    blokkenState.currentLevelData.forEach(other => {
        if (other === block) return;
        if (block.dir === 'h') {
            if (other.y < block.y + block.h && other.y + other.h > block.y) {
                if (other.x + other.w <= block.x) { let limit = (other.x + other.w) * blokkenState.cellSize; if (limit > minLimit) minLimit = limit; }
                if (other.x >= block.x + block.w) { let limit = other.x * blokkenState.cellSize; if (limit < maxLimit) maxLimit = limit; }
            }
        } else {
            if (other.x < block.x + block.w && other.x + other.w > block.x) {
                if (other.y + other.h <= block.y) { let limit = (other.y + other.h) * blokkenState.cellSize; if (limit > minLimit) minLimit = limit; }
                if (other.y >= block.y + block.h) { let limit = other.y * blokkenState.cellSize; if (limit < maxLimit) maxLimit = limit; }
            }
        }
    });
    if(block.dir === 'h') maxLimit -= (block.w * blokkenState.cellSize); else maxLimit -= (block.h * blokkenState.cellSize);
}

function onDrag(e) {
    if (!activeBlock) return; e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let delta = 0; if (activeBlock.data.dir === 'h') delta = clientX - startX; else delta = clientY - startY;
    let newPos = initialBlockPos + delta;
    newPos = Math.max(minLimit, Math.min(newPos, maxLimit));
    if (activeBlock.data.dir === 'h') activeBlock.el.style.left = newPos + 'px'; else activeBlock.el.style.top = newPos + 'px';
}

function endDrag() {
    if (!activeBlock) return;
    let currentPos = parseFloat(activeBlock.data.dir === 'h' ? activeBlock.el.style.left : activeBlock.el.style.top) || 0;
    let gridPos = Math.round(currentPos / blokkenState.cellSize);
    if (activeBlock.data.dir === 'h') activeBlock.data.x = gridPos; else activeBlock.data.y = gridPos;
    
    activeBlock.el.style.transition = 'left 0.2s, top 0.2s';
    activeBlock.el.style.left = (activeBlock.data.x * blokkenState.cellSize) + 'px';
    activeBlock.el.style.top = (activeBlock.data.y * blokkenState.cellSize) + 'px';
    
    setTimeout(() => { if(activeBlock && activeBlock.el) activeBlock.el.style.transition = ''; }, 200);
    
    // WIN CHECK (X=4 met breedte 2 = rechts aan de rand)
    if (activeBlock.data.id === 'hero' && activeBlock.data.x === 4) { 
        endTurn(true);
    }
    
    document.removeEventListener('mousemove', onDrag); document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', endDrag); document.removeEventListener('touchend', endDrag);
    activeBlock = null;
}
