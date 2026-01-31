// MEMORY SPEL LOGICA - FIXED VERSION
console.log("Memory.js geladen (v2.0)...");

let memoryState = { 
    theme: 'boerderij', 
    gridSize: 12, 
    playerNames: [], 
    currentPlayerIndex: 0, 
    scores: {}, 
    cards: [], 
    flippedCards: [], 
    lockBoard: false, 
    useImages: true, 
    matchedPairs: 0, 
    pendingPlayer: null 
};

const palette = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FFEB3B', '#FF9800'];
const predefinedPlayers = [
    { name: "Lou", icon: "👦🏼" }, 
    { name: "Noé", icon: "👶🏼" }, 
    { name: "Mama", icon: "👩🏻" }, 
    { name: "Papa", icon: "👨🏻" }
];

const themes = {
    'boerderij': { locked: false, extension: 'png', path: 'assets/images/memory/boerderij/' },
    'mario':     { locked: false, extension: 'png', path: 'assets/images/memory/mario/' },
    'pokemon':   { locked: false, extension: 'png', path: 'assets/images/memory/pokemon/' },
    'studio100': { locked: false, extension: 'png', path: 'assets/images/memory/studio100/' },
    'dino':      { locked: true, extension: 'jpg', path: 'assets/images/memory/dino/' },
    'marvel':    { locked: true, extension: 'jpg', path: 'assets/images/memory/marvel/' },
    'natuur':    { locked: true, extension: 'jpg', path: 'assets/images/memory/natuur/' },
    'beroepen':  { locked: true, extension: 'jpg', path: 'assets/images/memory/beroepen/' }
};

function startMemorySetup() {
    const board = document.getElementById('game-board');
    let themeButtonsHTML = Object.keys(themes).map(key => {
        const t = themes[key];
        const isLocked = t.locked ? 'locked' : '';
        const lockIcon = t.locked ? '<div class="lock-overlay">🔒</div>' : '';
        return `
            <button class="theme-card-btn ${isLocked} ${memoryState.theme === key ? 'selected' : ''}" onclick="setTheme('${key}', this)">
                <div class="theme-img-container">
                    <img src="${t.path}cover.png" onerror="this.src='assets/images/icon.png'">
                    ${lockIcon}
                </div>
                <span class="btn-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
            </button>`;
    }).join('');

    let playerButtonsHTML = predefinedPlayers.map(p => 
        `<button class="option-btn player-btn" onclick="selectPerson('${p.name}', this)">
            <span>${p.icon}</span><span class="btn-label">${p.name}</span>
        </button>`
    ).join('');

    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-columns">
                <div class="setup-group group-players">
                    <h3>1. Wie speelt er?</h3>
                    <div class="option-grid">${playerButtonsHTML}</div>
                    <div class="player-input-container">
                        <input type="text" id="custom-player-name" placeholder="Eigen naam...">
                        <button class="add-btn" onclick="addCustomPerson()">OK</button>
                    </div>
                    <div class="divider-line"></div>
                    <h3>2. Kies een kleur</h3>
                    <div class="color-row" id="color-palette"></div>
                    <div id="active-players-list"></div>
                </div>
                <div class="setup-group group-theme">
                    <h3>3. Kies Thema</h3>
                    <div class="theme-grid">${themeButtonsHTML}</div>
                </div>
                <div class="setup-group group-size">
                    <h3>4. Aantal Kaartjes</h3>
                    <div class="option-grid">
                        <button class="option-btn ${memoryState.gridSize === 12 ? 'selected' : ''}" onclick="setSize(12, this)"><span>★</span><span class="btn-label">12</span></button>
                        <button class="option-btn ${memoryState.gridSize === 16 ? 'selected' : ''}" onclick="setSize(16, this)"><span>★★</span><span class="btn-label">16</span></button>
                        <button class="option-btn ${memoryState.gridSize === 30 ? 'selected' : ''}" onclick="setSize(30, this)"><span>★★★</span><span class="btn-label">30</span></button>
                    </div>
                </div>
            </div>
            <button id="start-btn" class="start-btn" onclick="startMemoryGame()" disabled>Kies een speler...</button>
        </div>`;
    
    renderPalette(); 
    checkStartButton();
}

function setSize(size, btn) { 
    if(typeof playSound === 'function') playSound('click');
    memoryState.gridSize = size; 
    const parent = btn.parentElement;
    parent.querySelectorAll('.option-btn').forEach(c => c.classList.remove('selected')); 
    btn.classList.add('selected'); 
    console.log("Niveau ingesteld op:", size);
}

function setTheme(name, btn) { 
    if(themes[name].locked) return; 
    if(typeof playSound === 'function') playSound('click');
    memoryState.theme = name; 
    document.querySelectorAll('.theme-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function renderPalette() {
    const container = document.getElementById('color-palette');
    const usedColors = memoryState.playerNames.map(p => p.color);
    if(!container) return;
    container.innerHTML = palette.map(color => {
        const isTaken = usedColors.includes(color);
        const style = isTaken ? 'opacity: 0.2; cursor: not-allowed;' : '';
        return `<div class="color-dot" style="background-color: ${color}; ${style}" onclick="${isTaken ? '' : `selectColor('${color}')`}"></div>`;
    }).join('');
}

function selectPerson(name, btn) {
    if(typeof playSound === 'function') playSound('click');
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending');
    memoryState.pendingPlayer = name;
}

function selectColor(color) {
    if(!memoryState.pendingPlayer) return alert("Klik eerst op een naam!");
    if(typeof playSound === 'function') playSound('pop');
    memoryState.playerNames = memoryState.playerNames.filter(p => p.name !== memoryState.pendingPlayer);
    memoryState.playerNames.push({ name: memoryState.pendingPlayer, color: color });
    memoryState.pendingPlayer = null;
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    renderPalette();
    renderActivePlayers();
    checkStartButton();
}

function renderActivePlayers() {
    const list = document.getElementById('active-players-list');
    list.innerHTML = memoryState.playerNames.map(p => `
        <div class="active-player-tag" style="background-color: ${p.color}" onclick="removePlayer('${p.name}')">
            <span>${p.name}</span><span class="remove-x">×</span>
        </div>`).join('');
}

function removePlayer(name) {
    memoryState.playerNames = memoryState.playerNames.filter(p => p.name !== name);
    renderPalette(); renderActivePlayers(); checkStartButton();
}

function checkStartButton() {
    const btn = document.getElementById('start-btn');
    if(!btn) return;
    btn.disabled = memoryState.playerNames.length === 0;
    btn.innerText = btn.disabled ? "KIES EEN SPELER..." : "START SPEL ▶️";
}

function calculateCardSize(cols, rows) {
    const board = document.getElementById('game-board');
    const containerW = board.offsetWidth * 0.95;
    const containerH = board.offsetHeight * 0.85;
    const cardW = Math.floor((containerW - (cols * 12)) / cols);
    const cardH = Math.floor((containerH - (rows * 12)) / rows);
    return Math.min(cardW, cardH, 120);
}

function startMemoryGame() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    let cols = 4, rows = 3;
    if(memoryState.gridSize === 16) { cols = 4; rows = 4; }
    if(memoryState.gridSize === 30) { cols = 6; rows = 5; }
    if(window.innerWidth < 650 && memoryState.gridSize === 30) { cols = 5; rows = 6; }

    let scoreHTML = '<div class="score-board">';
    memoryState.playerNames.forEach((p, i) => {
        scoreHTML += `<div class="player-badge" id="badge-${i}" style="border-color:${p.color}; color:${p.color}">
            <span class="badge-name">${p.name}</span>: <span id="score-${i}">0</span>
        </div>`;
        memoryState.scores[p.name] = 0;
    });
    scoreHTML += '</div>';

    board.innerHTML = `<div class="memory-game-container">${scoreHTML}<div class="memory-grid" id="memory-grid"></div></div>`;
    
    const cardSize = calculateCardSize(cols, rows);
    const grid = document.getElementById('memory-grid');
    grid.style.gridTemplateColumns = `repeat(${cols}, ${cardSize}px)`;
    
    memoryState.currentPlayerIndex = 0; 
    memoryState.flippedCards = []; 
    memoryState.lockBoard = false; 
    memoryState.matchedPairs = 0;
    
    updateActiveBadgeColor();
    generateCards(cardSize);
}

function generateCards(sizePx) {
    const grid = document.getElementById('memory-grid');
    const themeData = themes[memoryState.theme];
    const pairsNeeded = memoryState.gridSize / 2;
    let deck = [];
    for (let i = 1; i <= pairsNeeded; i++) deck.push(i, i);
    deck.sort(() => 0.5 - Math.random());

    deck.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.value = item;
        card.style.width = `${sizePx}px`; card.style.height = `${sizePx}px`;
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="card-front"><img src="${themeData.path}cover.png" class="card-cover-img"></div>
                <div class="card-back"><img src="${themeData.path}${item}.${themeData.extension}" class="card-img"></div>
            </div>`;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (memoryState.lockBoard || this.classList.contains('flipped')) return;
    if(typeof playSound === 'function') playSound('pop');
    this.classList.add('flipped');
    memoryState.flippedCards.push(this);
    if (memoryState.flippedCards.length === 2) {
        memoryState.lockBoard = true;
        const [c1, c2] = memoryState.flippedCards;
        if (c1.dataset.value === c2.dataset.value) {
            let p = memoryState.playerNames[memoryState.currentPlayerIndex];
            memoryState.scores[p.name]++;
            document.getElementById(`score-${memoryState.currentPlayerIndex}`).innerText = memoryState.scores[p.name];
            memoryState.matchedPairs++;
            c1.classList.add('matched'); c2.classList.add('matched');
            memoryState.flippedCards = [];
            memoryState.lockBoard = false;
            if(typeof playSound === 'function') playSound('win');
            if (memoryState.matchedPairs === memoryState.gridSize / 2) {
                setTimeout(() => {
                    let lb = memoryState.playerNames.map(pn => ({name:pn.name, score:memoryState.scores[pn.name]})).sort((a,b)=>b.score-a.score);
                    showWinnerModal(lb[0].name, lb);
                }, 500);
            }
        } else {
            setTimeout(() => {
                c1.classList.remove('flipped'); c2.classList.remove('flipped');
                memoryState.flippedCards = [];
                memoryState.lockBoard = false;
                switchPlayer();
            }, 1000);
        }
    }
}

function switchPlayer() {
    memoryState.currentPlayerIndex = (memoryState.currentPlayerIndex + 1) % memoryState.playerNames.length;
    updateActiveBadgeColor();
}

function updateActiveBadgeColor() {
    memoryState.playerNames.forEach((p, i) => {
        let b = document.getElementById(`badge-${i}`);
        if(b) {
            b.classList.toggle('active', i === memoryState.currentPlayerIndex);
            b.style.backgroundColor = i === memoryState.currentPlayerIndex ? p.color : 'white';
            b.style.color = i === memoryState.currentPlayerIndex ? 'white' : p.color;
        }
    });
}
