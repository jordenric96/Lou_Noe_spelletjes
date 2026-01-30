// MEMORY.JS - STABIELE VERSIE

console.log("Memory loaded (Stable Version)");

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

// 1. SETUP LOGICA
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
                <h3>3. Aantal Kaartjes</h3>
                <div class="size-controls">
                    <button class="size-btn selected" onclick="setSize(12, this)">12</button>
                    <button class="size-btn" onclick="setSize(16, this)">16</button>
                    <button class="size-btn" onclick="setSize(30, this)">30</button>
                </div>
            </div>
            
            <button id="start-game-btn" class="big-start-btn" onclick="startGame()" disabled>Kies een speler...</button>
        </div>
    `;
    
    // Reset state
    memoryState.playerNames = [];
    memoryState.theme = 'boerderij';
    memoryState.gridSize = 12;
    // Selecteer standaard thema
    setTimeout(()=> selectTheme('boerderij', document.querySelector('.theme-btn')), 50);
}

function addPlayer(name, icon) {
    playSound('click');
    // Check of speler al bestaat
    if(memoryState.playerNames.find(p => p.name === name)) return;
    
    // Wijs kleur toe
    const color = colors[memoryState.playerNames.length % colors.length];
    memoryState.playerNames.push({name, icon, color});
    renderPlayers();
    checkStart();
}

function renderPlayers() {
    const div = document.getElementById('active-players');
    div.innerHTML = memoryState.playerNames.map(p => 
        `<span class="player-tag" style="background:${p.color}">${p.icon} ${p.name}</span>`
    ).join('');
}

function selectTheme(t, btn) {
    playSound('click');
    memoryState.theme = t;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function setSize(s, btn) {
    playSound('click');
    memoryState.gridSize = parseInt(s);
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function checkStart() {
    document.getElementById('start-game-btn').disabled = (memoryState.playerNames.length === 0);
}

// 2. SPEL STARTEN
function startGame() {
    playSound('win');
    const board = document.getElementById('game-board');
    const size = memoryState.gridSize;
    
    // Scorebord
    let scoreHTML = '<div class="score-bar">';
    memoryState.playerNames.forEach((p, i) => {
        memoryState.scores[p.name] = 0;
        scoreHTML += `<div id="p-badge-${i}" class="p-badge" style="color:${p.color}">
            ${p.icon} ${p.name}: <span id="score-${i}">0</span>
        </div>`;
    });
    scoreHTML += '</div>';
    
    // Grid Setup
    let gridClass = 'grid-4'; // Standaard (12 of 16)
    if(size === 30) gridClass = 'grid-6'; // 30 kaarten (6 breed, 5 hoog)
    
    board.innerHTML = `
        <div class="game-container">
            ${scoreHTML}
            <div class="memory-grid ${gridClass}" id="grid"></div>
        </div>
    `;
    
    memoryState.currentPlayerIndex = 0;
    memoryState.flippedCards = [];
    memoryState.matchedPairs = 0;
    memoryState.lockBoard = false;
    updateActivePlayer();
    
    generateCards(size);
}

function generateCards(totalCards) {
    const grid = document.getElementById('grid');
    const pairs = totalCards / 2;
    const t = themes[memoryState.theme];
    let items = [];
    
    // HIER ZIT DE FIX VOOR 30 KAARTEN:
    for(let i=1; i<=pairs; i++) {
        // Als we bijv. 15 paren nodig hebben (voor 30 kaarten),
        // maar er zijn misschien maar 10 of 15 plaatjes.
        // We gebruiken modulo om te zorgen dat het altijd past.
        // Als i = 16 (bestaat niet), wordt het (16 % 15) + 1 = plaatje 2.
        // Zorg wel dat je mappen minstens 15 plaatjes hebben voor het mooiste resultaat.
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
    
    playSound('pop');
    card.classList.add('flipped');
    memoryState.flippedCards.push(card);
    
    if(memoryState.flippedCards.length === 2) checkMatch();
}

function checkMatch() {
    memoryState.lockBoard = true;
    const [c1, c2] = memoryState.flippedCards;
    
    if(c1.dataset.val === c2.dataset.val) {
        // MATCH!
        playSound('win');
        c1.classList.add('matched');
        c2.classList.add('matched');
        
        // Rand kleuren
        const p = memoryState.playerNames[memoryState.currentPlayerIndex];
        c1.querySelector('.back').style.borderColor = p.color;
        c2.querySelector('.back').style.borderColor = p.color;
        
        memoryState.scores[p.name]++;
        document.getElementById(`score-${memoryState.currentPlayerIndex}`).innerText = memoryState.scores[p.name];
        
        memoryState.flippedCards = [];
        memoryState.matchedPairs++;
        memoryState.lockBoard = false;
        
        if(memoryState.matchedPairs === memoryState.gridSize / 2) {
            setTimeout(() => showWinnerModal(p.name, []), 1000);
        }
    } else {
        // GEEN MATCH
        setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            memoryState.flippedCards = [];
            memoryState.lockBoard = false;
            nextPlayer();
        }, 1000);
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
    });
}
