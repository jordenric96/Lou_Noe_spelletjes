// MEMORY.JS - DEFINITIEVE VERSIE (Met Eigen Naam & Niveau Fix)
console.log("Memory.js geladen (Final Restoration)...");

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

// --- SETUP SCHERM ---
function startMemorySetup() {
    const board = document.getElementById('game-board');
    
    // Thema knoppen genereren
    let themeButtonsHTML = Object.keys(themes).map(key => {
        const t = themes[key];
        const selected = memoryState.theme === key ? 'selected' : '';
        return `
            <button class="theme-card-btn ${t.locked ? 'locked' : ''} ${selected}" onclick="setTheme('${key}', this)">
                <div class="theme-img-container">
                    <img src="${t.path}cover.png" onerror="this.src='assets/images/icon.png'">
                    ${t.locked ? '<div class="lock-overlay">🔒</div>' : ''}
                </div>
                <span class="btn-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
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
                    
                    <div class="custom-name-container">
                        <input type="text" id="custom-player-name" placeholder="Of typ een naam...">
                        <button class="add-btn" onclick="addCustomPerson()">OK</button>
                    </div>

                    <div class="divider-line"></div>
                    
                    <h3>2. Kies Kleur</h3>
                    <div class="color-row" id="color-palette"></div>
                    
                    <div id="active-players-list"></div>
                </div>

                <div class="setup-group">
                    <h3>3. Kies Thema</h3>
                    <div class="theme-grid">${themeButtonsHTML}</div>
                    
                    <div class="divider-line"></div>

                    <h3>4. Aantal Kaartjes</h3>
                    <div class="option-grid">
                        <button class="option-btn lvl-btn ${memoryState.gridSize === 12 ? 'selected' : ''}" onclick="setSize(12, this)">12</button>
                        <button class="option-btn lvl-btn ${memoryState.gridSize === 16 ? 'selected' : ''}" onclick="setSize(16, this)">16</button>
                        <button class="option-btn lvl-btn ${memoryState.gridSize === 30 ? 'selected' : ''}" onclick="setSize(30, this)">30</button>
                    </div>
                </div>
            </div>
            <button id="start-btn" class="start-btn" onclick="startMemoryGame()" disabled>Voeg eerst een speler toe...</button>
        </div>`;
    
    renderPalette();
    renderActivePlayers();
    checkStartButton();
}

// --- SETUP FUNCTIES ---

function setSize(size, btn) {
    if(typeof playSound === 'function') playSound('click');
    memoryState.gridSize = parseInt(size);
    
    // Visuele update
    document.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    console.log("Niveau ingesteld op:", memoryState.gridSize);
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
    
    // Focus effectje voor de kleur
    const palette = document.getElementById('color-palette');
    palette.style.animation = "shake 0.5s";
    setTimeout(() => palette.style.animation = "", 500);
}

function addCustomPerson() {
    const input = document.getElementById('custom-player-name');
    const name = input.value.trim();
    if(name) {
        if(typeof playSound === 'function') playSound('click');
        memoryState.pendingPlayer = name;
        
        // Reset selectie van knoppen
        document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
        input.value = '';
        input.placeholder = name + " gekozen!";
        
        // Focus op kleur
        const palette = document.getElementById('color-palette');
        palette.style.animation = "shake 0.5s";
        setTimeout(() => palette.style.animation = "", 500);
    }
}

function renderPalette() {
    const cp = document.getElementById('color-palette');
    if(!cp) return;
    const used = memoryState.playerNames.map(p => p.color);
    
    cp.innerHTML = palette.map(c => {
        const isUsed = used.includes(c);
        return `<div class="color-dot" style="background:${c}; opacity:${isUsed ? 0.2 : 1}; transform:${isUsed ? 'scale(0.8)' : 'scale(1)'}" 
                onclick="${isUsed ? '' : `selectColor('${c}')`}"></div>`;
    }).join('');
}

function selectColor(color) {
    if(!memoryState.pendingPlayer) {
        alert("Klik eerst op een naam of typ een eigen naam!");
        return;
    }
    if(typeof playSound === 'function') playSound('pop');
    
    // Verwijder speler als die al bestond (update kleur), voeg dan toe
    memoryState.playerNames = memoryState.playerNames.filter(p => p.name !== memoryState.pendingPlayer);
    memoryState.playerNames.push({ name: memoryState.pendingPlayer, color: color });
    
    memoryState.pendingPlayer = null;
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    document.getElementById('custom-player-name').placeholder = "Of typ een naam...";
    
    renderPalette();
    renderActivePlayers();
    checkStartButton();
}

function renderActivePlayers() {
    const list = document.getElementById('active-players-list');
    list.innerHTML = memoryState.playerNames.map(p => `
        <div class="active-player-tag" style="background:${p.color}" onclick="removePlayer('${p.name}')">
            ${p.name} <span style="background:rgba(0,0,0,0.2); border-radius:50%; width:15px; height:15px; display:inline-flex; justify-content:center; align-items:center;">×</span>
        </div>`).join('');
}

function removePlayer(name) {
    if(typeof playSound === 'function') playSound('click');
    memoryState.playerNames = memoryState.playerNames.filter(p => p.name !== name);
    renderPalette(); renderActivePlayers(); checkStartButton();
}

function checkStartButton() {
    const btn = document.getElementById('start-btn');
    btn.disabled = memoryState.playerNames.length === 0;
    btn.innerText = btn.disabled ? "VOEG SPELER TOE..." : "START SPEL ▶️";
}

// --- GAME LOGICA ---
function calculateCardSize(cols, rows) {
    const board = document.getElementById('game-board');
    // We gebruiken 90% van de breedte en 80% van de hoogte om ruimte te houden
    const containerW = board.offsetWidth * 0.95;
    const containerH = board.offsetHeight * 0.80; // Iets minder hoog ivm scorebord
    
    const cardW = Math.floor((containerW - (cols * 10)) / cols);
    const cardH = Math.floor((containerH - (rows * 10)) / rows);
    return Math.min(cardW, cardH, 130); // Maximaal 130px groot
}

function startMemoryGame() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    
    // Bepaal rooster
    let cols = 4, rows = 3; // 12
    if(memoryState.gridSize === 16) { cols = 4; rows = 4; }
    else if(memoryState.gridSize === 30) { cols = 6; rows = 5; }
    
    // Mobiele aanpassing voor 30 kaarten
    if(window.innerWidth < 650 && memoryState.gridSize === 30) { cols = 5; rows = 6; }

    // Scorebord HTML genereren
    let scoreHTML = '<div class="score-board">';
    memoryState.playerNames.forEach((p, i) => {
        scoreHTML += `<div class="player-badge" id="badge-${i}" style="border-color:${p.color}; color:${p.color}">
            <span class="badge-name">${p.name}</span>: <span id="score-${i}">0</span>
        </div>`;
        memoryState.scores[p.name] = 0;
    });
    scoreHTML += '</div>';

    board.innerHTML = `<div class="memory-game-container">${scoreHTML}<div class="memory-grid" id="memory-grid"></div></div>`;
    
    // Grid instellen
    const cardSize = calculateCardSize(cols, rows);
    const grid = document.getElementById('memory-grid');
    grid.style.gridTemplateColumns = `repeat(${cols}, ${cardSize}px)`;
    
    // State reset
    memoryState.matchedPairs = 0;
    memoryState.flippedCards = [];
    memoryState.lockBoard = false;
    memoryState.currentPlayerIndex = 0;

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
            // MATCH!
            let p = memoryState.playerNames[memoryState.currentPlayerIndex];
            memoryState.scores[p.name]++;
            document.getElementById(`score-${memoryState.currentPlayerIndex}`).innerText = memoryState.scores[p.name];
            memoryState.matchedPairs++;
            
            c1.classList.add('matched'); c2.classList.add('matched');
            // Rand kleuren in spelerkleur
            const back1 = c1.querySelector('.card-back');
            const back2 = c2.querySelector('.card-back');
            if(back1) back1.style.borderColor = p.color;
            if(back2) back2.style.borderColor = p.color;

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
            // MIS!
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
            const active = i === memoryState.currentPlayerIndex;
            b.classList.toggle('active', active);
            b.style.backgroundColor = active ? p.color : 'white';
            b.style.color = active ? 'white' : p.color;
            if(active) b.style.transform = "scale(1.1)";
            else b.style.transform = "scale(1)";
        }
    });
}
