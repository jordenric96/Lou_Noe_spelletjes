// MEMORY SPEL LOGICA - DEFINITIEF (Met Match Fix & Geluid)

console.log("Memory.js geladen (Bug Fix Version)...");

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

// KLEUREN PALET
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

// 1. SETUP SCHERM
function startMemorySetup() {
    const board = document.getElementById('game-board');
    
    let themeButtonsHTML = Object.keys(themes).map(key => {
        const t = themes[key];
        const isLocked = t.locked ? 'locked' : '';
        const lockIcon = t.locked ? '<div class="lock-overlay">🔒</div>' : '';
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        
        return `
            <button class="theme-card-btn ${isLocked}" onclick="setTheme('${key}', this)">
                <div class="theme-img-container">
                    <img src="${t.path}cover.png" alt="${key}" onerror="this.src='assets/images/icon.png'">
                    ${lockIcon}
                </div>
                <span class="btn-label">${label}</span>
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
                    <div class="option-grid" id="player-selection">${playerButtonsHTML}</div>
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
                        <button class="option-btn selected" onclick="setSize(12, this)"><span><span class="star">★</span></span><span class="btn-label">12</span></button>
                        <button class="option-btn" onclick="setSize(16, this)"><span><span class="star">★</span><span class="star">★</span></span><span class="btn-label">16</span></button>
                        <button class="option-btn" onclick="setSize(30, this)"><span><span class="star">★</span><span class="star">★</span><span class="star">★</span></span><span class="btn-label">30</span></button>
                    </div>
                </div>
            </div>
            <button id="start-btn" class="start-btn" onclick="startMemoryGame()" disabled>Kies eerst een speler...</button>
        </div>`;
    
    memoryState.playerNames = [];
    memoryState.theme = 'boerderij'; 
    memoryState.pendingPlayer = null; 
    
    renderPalette(); 
    setTimeout(() => {
        const defaultThemeBtn = document.querySelector(`.theme-card-btn[onclick="setTheme('boerderij', this)"]`);
        if(defaultThemeBtn) defaultThemeBtn.classList.add('selected');
    }, 10);
}

function renderPalette() {
    const container = document.getElementById('color-palette');
    const usedColors = memoryState.playerNames.map(p => p.color);
    
    container.innerHTML = palette.map(color => {
        const isTaken = usedColors.includes(color);
        const style = isTaken ? 'opacity: 0.2; cursor: not-allowed;' : '';
        const action = isTaken ? '' : `selectColor('${color}')`;
        return `<div class="color-dot" style="background-color: ${color}; ${style}" onclick="${action}"></div>`;
    }).join('');
}

function selectPerson(name, btn) {
    if(typeof playSound === 'function') playSound('click');
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending');
    memoryState.pendingPlayer = name;
}

function addCustomPerson() {
    const input = document.getElementById('custom-player-name');
    const name = input.value.trim();
    if(name) {
        if(typeof playSound === 'function') playSound('click');
        memoryState.pendingPlayer = name;
        input.style.borderColor = "#4CAF50";
    }
}

function selectColor(color) {
    if(!memoryState.pendingPlayer) {
        alert("Klik eerst op een naam (Lou, Noé...), kies daarna een kleur!");
        return;
    }
    if(typeof playSound === 'function') playSound('pop');

    const name = memoryState.pendingPlayer;
    const existingIdx = memoryState.playerNames.findIndex(p => p.name === name);
    if(existingIdx > -1) memoryState.playerNames.splice(existingIdx, 1);

    memoryState.playerNames.push({ name: name, color: color });
    memoryState.pendingPlayer = null;
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    document.getElementById('custom-player-name').value = '';
    document.getElementById('custom-player-name').style.borderColor = '#B3E5FC';

    renderPalette();
    renderActivePlayers();
    checkStartButton();
}

function renderActivePlayers() {
    const list = document.getElementById('active-players-list');
    list.innerHTML = memoryState.playerNames.map(p => `
        <div class="active-player-tag" style="background-color: ${p.color}" onclick="removePlayer('${p.name}')">
            <span>${p.name}</span>
            <span class="remove-x">×</span>
        </div>
    `).join('');
}

function removePlayer(name) {
    if(typeof playSound === 'function') playSound('click');
    memoryState.playerNames = memoryState.playerNames.filter(p => p.name !== name);
    renderPalette();
    renderActivePlayers();
    checkStartButton();
}

function checkStartButton() {
    const btn = document.getElementById('start-btn');
    if (memoryState.playerNames.length > 0) {
        btn.disabled = false;
        const names = memoryState.playerNames.map(p => p.name);
        btn.innerText = names.length <= 3 ? `START MET ${names.join(' & ').toUpperCase()} ▶️` : `START (${names.length} SPELERS) ▶️`;
    } else {
        btn.disabled = true;
        btn.innerText = "KIES EERST EEN SPELER EN KLEUR...";
    }
}

function setTheme(name, btn) { 
    if(themes[name].locked) return; 
    if(typeof playSound === 'function') playSound('click');
    memoryState.theme = name; 
    document.querySelectorAll('.theme-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}
function setSize(size, btn) { 
    if(typeof playSound === 'function') playSound('click');
    memoryState.gridSize = size; 
    Array.from(btn.parentElement.children).forEach(c => c.classList.remove('selected')); 
    btn.classList.add('selected'); 
}

// 2. SPEL LOGICA
function calculateCardSize(cols, rows) {
    const containerW = document.getElementById('game-board').offsetWidth;
    const containerH = document.getElementById('game-board').offsetHeight - 80;
    const cardW = Math.floor((containerW - (cols * 10)) / cols);
    const cardH = Math.floor((containerH - (rows * 10)) / rows);
    return Math.min(cardW, cardH, 120);
}

function startMemoryGame() {
    if(typeof playSound === 'function') playSound('win');
    if (memoryState.playerNames.length === 0) return;
    const board = document.getElementById('game-board');
    
    let scoreHTML = '<div class="score-board">';
    memoryState.playerNames.forEach((player, index) => {
        let playerIcon = "👤";
        let predefined = predefinedPlayers.find(p => p.name === player.name);
        if(predefined) playerIcon = predefined.icon;
        
        scoreHTML += `
            <div class="player-badge ${index===0?'active':''}" id="badge-${index}" 
                 style="border-color: ${player.color}; color: ${player.color}">
                <span class="badge-icon">${playerIcon}</span>
                <span class="badge-name">${player.name}</span>
                <span class="badge-score" id="score-${index}">0</span>
            </div>`;
        memoryState.scores[player.name] = 0;
    });
    scoreHTML += '</div>';

    let cols = 4, rows = 3;
    if(memoryState.gridSize === 16) { cols = 4; rows = 4; }
    if(memoryState.gridSize === 30) { cols = 6; rows = 5; }
    if(window.innerWidth < 650 && memoryState.gridSize === 30) { cols = 5; rows = 6; }

    board.innerHTML = `<div class="memory-game-container">${scoreHTML}<div class="memory-grid" id="memory-grid"></div></div>`;
    
    const grid = document.getElementById('memory-grid');
    const cardSize = calculateCardSize(cols, rows);
    
    grid.style.gridTemplateColumns = `repeat(${cols}, ${cardSize}px)`;
    grid.style.width = 'fit-content';
    
    memoryState.currentPlayerIndex = 0; 
    memoryState.flippedCards = []; 
    memoryState.lockBoard = false; 
    memoryState.matchedPairs = 0;
    
    updateActiveBadgeColor();
    generateCards(cardSize);
}

function updateActiveBadgeColor() {
    memoryState.playerNames.forEach((p, idx) => { 
        let b = document.getElementById(`badge-${idx}`); 
        if(b) { 
            b.style.backgroundColor = 'white'; 
            b.style.color = p.color; 
            b.classList.remove('active'); 
        } 
    });
    let currentP = memoryState.playerNames[memoryState.currentPlayerIndex];
    let activeBadge = document.getElementById(`badge-${memoryState.currentPlayerIndex}`);
    if(activeBadge) { 
        activeBadge.classList.add('active'); 
        activeBadge.style.backgroundColor = currentP.color; 
        activeBadge.style.color = 'white'; 
    }
}

function generateCards(sizePx) {
    const grid = document.getElementById('memory-grid');
    const themeData = themes[memoryState.theme];
    const pairsNeeded = memoryState.gridSize / 2;
    const ext = themeData.extension; 
    
    let items = [];
    if (memoryState.useImages) { for (let i = 1; i <= pairsNeeded; i++) items.push(i); }
    let deck = [...items, ...items];
    deck.sort(() => 0.5 - Math.random());
    grid.innerHTML = '';

    deck.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.value = item;
        if(sizePx) { card.style.width = `${sizePx}px`; card.style.height = `${sizePx}px`; }

        let content = `<img src="${themeData.path}${item}.${ext}" class="card-img" draggable="false">`;
        let cover = `<img src="${themeData.path}cover.png" class="card-cover-img" draggable="false">`;
        
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="card-front">${cover}</div>
                <div class="card-back">${content}</div>
            </div>`;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    // 1. Veiligheidscheck: Is bord op slot?
    if (memoryState.lockBoard) return;
    // 2. Veiligheidscheck: Klikken we op dezelfde kaart?
    if (this === memoryState.flippedCards[0]) return;
    // 3. VEILIGHEIDSCHECK (DE FIX): Is deze kaart al gevonden?
    if (this.classList.contains('matched')) return;
    
    if(typeof playSound === 'function') playSound('pop');
    
    this.classList.add('flipped');
    memoryState.flippedCards.push(this);
    if (memoryState.flippedCards.length === 2) checkForMatch();
}

function checkForMatch() {
    let card1 = memoryState.flippedCards[0];
    let card2 = memoryState.flippedCards[1];
    if (card1.dataset.value === card2.dataset.value) disableCards(); else unflipCards();
}

function disableCards() {
    let currentP = memoryState.playerNames[memoryState.currentPlayerIndex];
    
    if(typeof playSound === 'function') playSound('win');
    
    memoryState.flippedCards.forEach(card => {
        card.classList.add('matched');
        
        // DE FIX: Verwijder de klik-listener fysiek
        card.removeEventListener('click', flipCard);
        
        const back = card.querySelector('.card-back');
        if(back) {
            back.style.borderColor = currentP.color;
            back.style.boxShadow = `0 0 15px ${currentP.color}`;
        }
    });

    memoryState.matchedPairs++;
    memoryState.scores[currentP.name]++;
    const scoreEl = document.getElementById(`score-${memoryState.currentPlayerIndex}`);
    if(scoreEl) scoreEl.innerText = memoryState.scores[currentP.name];
    
    memoryState.flippedCards = [];
    
    if (memoryState.matchedPairs >= memoryState.gridSize / 2) {
        setTimeout(() => {
            let leaderboard = memoryState.playerNames.map(p => ({ 
                name: p.name, 
                score: memoryState.scores[p.name], 
                color: p.color 
            })).sort((a, b) => b.score - a.score);
            
            if(typeof showWinnerModal === 'function') {
                showWinnerModal(leaderboard[0].name, leaderboard);
            } else {
                alert("Gewonnen! (Reload pagina)");
            }
        }, 800);
    }
}

function unflipCards() {
    memoryState.lockBoard = true;
    setTimeout(() => {
        if(memoryState.flippedCards[0] && memoryState.flippedCards[1]) {
            memoryState.flippedCards[0].classList.remove('flipped');
            memoryState.flippedCards[1].classList.remove('flipped');
        }
        memoryState.flippedCards = [];
        memoryState.lockBoard = false;
        switchPlayer();
    }, 800); 
}

function switchPlayer() {
    memoryState.currentPlayerIndex++;
    if (memoryState.currentPlayerIndex >= memoryState.playerNames.length) memoryState.currentPlayerIndex = 0;
    updateActiveBadgeColor();
}

window.addEventListener('resize', () => {
    if(document.getElementById('memory-grid') && memoryState.playerNames.length > 0 && !document.querySelector('.memory-setup')) {
        startMemoryGame(); 
    }
});
