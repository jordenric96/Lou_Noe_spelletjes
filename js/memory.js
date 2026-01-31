// MEMORY.JS - REPAIRED & OPTIMIZED
console.log("Memory.js geladen (Full Repair)...");

let memoryState = { 
    theme: 'boerderij', 
    gridSize: 12, 
    playerNames: [], 
    currentPlayerIndex: 0, 
    scores: {}, 
    cards: [], 
    flippedCards: [], 
    lockBoard: false, 
    matchedPairs: 0, 
    pendingPlayer: null 
};

const palette = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FFEB3B', '#FF9800'];
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
        const selected = memoryState.theme === key ? 'selected' : '';
        return `
            <button class="theme-card-btn ${t.locked ? 'locked' : ''} ${selected}" onclick="setTheme('${key}', this)">
                <div class="theme-img-container">
                    <img src="${t.path}cover.png" onerror="this.src='assets/images/icon.png'">
                    ${t.locked ? '<div class="lock-overlay">🔒</div>' : ''}
                </div>
                <span class="btn-label">${key}</span>
            </button>`;
    }).join('');

    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-columns">
                <div class="setup-group">
                    <h3>1. Wie speelt er?</h3>
                    <div class="option-grid">
                        <button class="option-btn player-btn" onclick="selectPerson('Lou', this)">👦🏼 Lou</button>
                        <button class="option-btn player-btn" onclick="selectPerson('Noé', this)">👶🏼 Noé</button>
                        <button class="option-btn player-btn" onclick="selectPerson('Mama', this)">👩🏻 Mama</button>
                        <button class="option-btn player-btn" onclick="selectPerson('Papa', this)">👨🏻 Papa</button>
                    </div>
                    <div class="divider-line"></div>
                    <h3>2. Kies een kleur</h3>
                    <div class="color-row" id="color-palette"></div>
                    <div id="active-players-list"></div>
                </div>

                <div class="setup-group">
                    <h3>3. Kies Thema</h3>
                    <div class="theme-grid">${themeButtonsHTML}</div>
                </div>

                <div class="setup-group">
                    <h3>4. Niveau</h3>
                    <div class="option-grid">
                        <button class="option-btn lvl-btn ${memoryState.gridSize === 12 ? 'selected' : ''}" onclick="setSize(12, this)">12</button>
                        <button class="option-btn lvl-btn ${memoryState.gridSize === 16 ? 'selected' : ''}" onclick="setSize(16, this)">16</button>
                        <button class="option-btn lvl-btn ${memoryState.gridSize === 30 ? 'selected' : ''}" onclick="setSize(30, this)">30</button>
                    </div>
                </div>
            </div>
            <button id="start-btn" class="start-btn" onclick="startMemoryGame()" disabled>Voeg speler toe...</button>
        </div>`;
    
    renderPalette();
    renderActivePlayers();
}

function setSize(size, btn) {
    if(typeof playSound === 'function') playSound('click');
    memoryState.gridSize = parseInt(size);
    document.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function setTheme(name, btn) {
    if(themes[name].locked) return;
    if(typeof playSound === 'function') playSound('click');
    memoryState.theme = name;
    document.querySelectorAll('.theme-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function selectPerson(name, btn) {
    if(typeof playSound === 'function') playSound('click');
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending');
    memoryState.pendingPlayer = name;
}

function renderPalette() {
    const cp = document.getElementById('color-palette');
    if(!cp) return;
    const used = memoryState.playerNames.map(p => p.color);
    cp.innerHTML = palette.map(c => {
        const isUsed = used.includes(c);
        return `<div class="color-dot" style="background:${c}; opacity:${isUsed?0.2:1}" onclick="${isUsed?'':`selectColor('${c}')`}"></div>`;
    }).join('');
}

function selectColor(color) {
    if(!memoryState.pendingPlayer) return alert("Kies eerst een naam!");
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
    if(!list) return;
    list.innerHTML = memoryState.playerNames.map(p => `
        <div class="active-player-tag" style="background:${p.color}" onclick="removePlayer('${p.name}')">${p.name} ×</div>
    `).join('');
}

function removePlayer(name) {
    memoryState.playerNames = memoryState.playerNames.filter(p => p.name !== name);
    renderPalette(); renderActivePlayers(); checkStartButton();
}

function checkStartButton() {
    const btn = document.getElementById('start-btn');
    if(!btn) return;
    btn.disabled = memoryState.playerNames.length === 0;
    btn.innerText = btn.disabled ? "VOEG SPELER TOE..." : "START SPEL ▶️";
}

// ... (startMemoryGame, generateCards en flipCard blijven zoals in de vorige stap) ...
