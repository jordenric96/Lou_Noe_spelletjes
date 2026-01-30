// MEMORY.JS - SLIMME SCHERMVULLER

console.log("Memory loaded (Smart Resize Version)");

let memoryState = { 
    theme: 'boerderij', 
    gridSize: 12, 
    playerNames: [], 
    currentPlayerIndex: 0, 
    scores: {}, 
    flippedCards: [], 
    lockBoard: false, 
    matchedPairs: 0, 
    pendingPlayer: null 
};

// Config
const themes = {
    'boerderij': { ext: 'png', path: 'assets/images/memory/boerderij/' },
    'mario':     { ext: 'png', path: 'assets/images/memory/mario/' },
    'pokemon':   { ext: 'png', path: 'assets/images/memory/pokemon/' },
    'studio100': { ext: 'png', path: 'assets/images/memory/studio100/' },
    'dino':      { ext: 'jpg', path: 'assets/images/memory/dino/' },
    'marvel':    { ext: 'jpg', path: 'assets/images/memory/marvel/' },
    'natuur':    { ext: 'jpg', path: 'assets/images/memory/natuur/' },
    'beroepen':  { ext: 'jpg', path: 'assets/images/memory/beroepen/' }
};

const colors = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FFEB3B', '#FF9800'];

// --- SETUP ---
function startMemorySetup() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="memory-setup-container">
            <div class="setup-panel">
                <h3>1. Spelers</h3>
                <div class="player-controls">
                    <button class="icon-btn" onclick="addPlayer('Lou', '👦🏼')">👦🏼 Lou</button>
                    <button class="icon-btn" onclick="addPlayer('Noé', '👶🏼')">👶🏼 Noé</button>
                    <button class="icon-btn" onclick="addPlayer('Mama', '👩🏻')">👩🏻 Mama</button>
                    <button class="icon-btn" onclick="addPlayer('Papa', '👨🏻')">👨🏻 Papa</button>
                </div>
                <div id="active-players"></div>
            </div>
            
            <div class="setup-panel">
                <h3>2. Thema</h3>
                <div class="theme-scroll">
                    ${Object.keys(themes).map(k => `
                        <button class="theme-btn" onclick="selectTheme('${k}', this)">
                            <img src="${themes[k].path}cover.png" onerror="this.src='assets/images/icon.png'">
                            <span>${k}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="setup-panel">
                <h3>3. Aantal</h3>
                <div class="size-controls">
                    <button class="size-btn selected" onclick="setSize(12, this)">12</button>
                    <button class="size-btn" onclick="setSize(16, this)">16</button>
                    <button class="size-btn" onclick="setSize(30, this)">30</button>
                </div>
            </div>
            
            <button id="start-game-btn" class="big-start-btn" onclick="startGame()" disabled>START SPEL ▶</button>
        </div>
    `;
    
    memoryState.playerNames = [];
    memoryState.theme = 'boerderij';
    memoryState.gridSize = 12;
    setTimeout(()=> selectTheme('boerderij', document.querySelector('.theme-btn')), 50);
}

function addPlayer(name, icon) {
    if(typeof playSound === 'function') playSound('click');
    if(memoryState.playerNames.find(p => p.name === name)) return;
    const color = colors[memoryState.playerNames.length % colors.length];
    memoryState.playerNames.push({name, icon, color});
    renderPlayers();
    checkStart();
}

function renderPlayers() {
    document.getElementById('active-players').innerHTML = memoryState.playerNames.map(p => 
        `<span class="player-tag" style="background:${p.color}">${p.icon} ${p.name}</span>`
    ).join('');
}

function selectTheme(t, btn) {
    if(typeof playSound === 'function') playSound('click');
    memoryState.theme = t;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function setSize(s, btn) {
    if(typeof playSound === 'function') playSound('click');
    memoryState.gridSize = parseInt(s);
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function checkStart() {
    document.getElementById('start-game-btn').disabled = (memoryState.playerNames.length === 0);
}

// --- GAME LOGICA MET SLIMME REKENMACHINE ---

function calculateDimensions(totalCards) {
    // 1. Meet de beschikbare ruimte
    // We trekken de hoogte van header (60px) en scorebalk (~50px) en padding (20px) af
    const headerH = 60;
    const scoreH = 60;
    const padding = 20;
    
    const w = window.innerWidth - padding;
    const h = window.innerHeight - headerH - scoreH - padding;
    
    const isLandscape = w > h;

    // 2. Bepaal kolommen en rijen
    let cols, rows;
    
    if (totalCards === 12) {
        cols = isLandscape ? 4 : 3;
        rows = isLandscape ? 3 : 4;
    } else if (totalCards === 16) {
        cols = 4; rows = 4;
    } else if (totalCards === 30) {
        cols = isLandscape ? 6 : 5;
        rows = isLandscape ? 5 : 6;
    } else {
        cols = 4; rows = Math.ceil(totalCards/4);
    }

    // 3. Bereken maximale grootte per kaart (vierkant blijven!)
    const gap = 8; // Ruimte tussen kaarten
    const totalGapW = (cols - 1) * gap;
    const totalGapH = (rows - 1) * gap;
    
    const maxW = (w - totalGapW) / cols;
    const maxH = (h - totalGapH) / rows;
    
    // De kleinste wint, want het moet vierkant zijn
    const cardSize = Math.floor(Math.min(maxW, maxH));
    
    return { cols, rows, cardSize };
}

function startGame() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    let size = memoryState.gridSize || 12;

    // Scorebord
    let scoreHTML = '<div class="score-bar">';
    memoryState.playerNames.forEach((p, i) => {
        memoryState.scores[p.name] = 0;
        scoreHTML += `<div id="p-badge-${i}" class="p-badge" style="color:${p.color}">
            ${p.icon} ${p.name}: <span id="score-${i}">0</span>
        </div>`;
    });
    scoreHTML += '</div>';
    
    board.innerHTML = `
        <div class="game-container">
            ${scoreHTML}
            <div class="memory-grid" id="grid"></div>
        </div>
    `;
    
    // Wacht even tot de HTML staat, dan rekenen
    setTimeout(() => {
        applyGrid(size);
    }, 10);
    
    memoryState.currentPlayerIndex = 0;
    memoryState.flippedCards = [];
    memoryState.matchedPairs = 0;
    memoryState.lockBoard = false;
    updateActivePlayer();
    generateCards(size);
}

function applyGrid(totalCards) {
    const grid = document.getElementById('grid');
    if(!grid) return;
    
    const dims = calculateDimensions(totalCards);
    
    grid.style.gridTemplateColumns = `repeat(${dims.cols}, ${dims.cardSize}px)`;
    grid.style.gap = '8px';
    // Belangrijk: hierdoor worden de kaarten ook echt die grootte
    document.documentElement.style.setProperty('--card-size', `${dims.cardSize}px`);
}

function generateCards(totalCards) {
    const grid = document.getElementById('grid');
    const pairs = totalCards / 2;
    const t = themes[memoryState.theme];
    let items = [];
    
    for(let i=1; i<=pairs; i++) {
        let imgNum = i; 
        if (imgNum > 15) imgNum = i - 15; 
        items.push(imgNum);
    }
    
    let deck = [...items, ...items].sort(() => 0.5 - Math.random());
    
    grid.innerHTML = deck.map(val => `
        <div class="card" data-val="${val}" onclick="flipCard(this)">
            <div class="inner">
                <div class="front"><img src="${t.path}cover.png"></div>
                <div class="back"><img src="${t.path}${val}.${t.ext}"></div>
            </div>
        </div>
    `).join('');
}

function flipCard(card) {
    if(memoryState.lockBoard) return;
    if(card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    if(typeof playSound === 'function') playSound('pop');
    card.classList.add('flipped');
    memoryState.flippedCards.push(card);
    
    if(memoryState.flippedCards.length === 2) checkMatch();
}

function checkMatch() {
    memoryState.lockBoard = true;
    const [c1, c2] = memoryState.flippedCards;
    
    if(c1.dataset.val === c2.dataset.val) {
        if(typeof playSound === 'function') playSound('win');
        c1.classList.add('matched');
        c2.classList.add('matched');
        
        const p = memoryState.playerNames[memoryState.currentPlayerIndex];
        c1.querySelector('.back').style.borderColor = p.color;
        c2.querySelector('.back').style.borderColor = p.color;
        
        memoryState.scores[p.name]++;
        document.getElementById(`score-${memoryState.currentPlayerIndex}`).innerText = memoryState.scores[p.name];
        
        memoryState.flippedCards = [];
        memoryState.matchedPairs++;
        memoryState.lockBoard = false;
        
        if(memoryState.matchedPairs === memoryState.gridSize / 2) {
            setTimeout(() => { if(typeof showWinnerModal === 'function') showWinnerModal(p.name, []); }, 1000);
        }
    } else {
        setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            memoryState.flippedCards = [];
            memoryState.lockBoard = false;
            nextPlayer();
        }, 1200);
    }
}

function nextPlayer() {
    memoryState.currentPlayerIndex = (memoryState.currentPlayerIndex + 1) % memoryState.playerNames.length;
    updateActivePlayer();
}

function updateActivePlayer() {
    document.querySelectorAll('.p-badge').forEach((el, i) => {
        el.style.opacity = (i === memoryState.currentPlayerIndex) ? '1' : '0.5';
        el.style.transform = (i === memoryState.currentPlayerIndex) ? 'scale(1.1)' : 'scale(1)';
        el.style.border = (i === memoryState.currentPlayerIndex) ? '2px solid currentColor' : 'none';
    });
}

// Luister naar scherm draaien om rooster aan te passen
window.addEventListener('resize', () => {
    if(document.getElementById('grid') && memoryState.playerNames.length > 0) {
        applyGrid(memoryState.gridSize);
    }
});
