// MEMORY SPEL LOGICA

// Configuratie en Status
let memoryState = {
    theme: 'boerderij',
    gridSize: 12,
    playerNames: [], 
    currentPlayerIndex: 0,
    scores: {},
    cards: [],
    flippedCards: [],
    lockBoard: false, 
    useImages: false, 
    matchedPairs: 0
};

// Vaste spelers MET hun eigen icoon
const predefinedPlayers = [
    { name: "Lou", icon: "👦🏼" },
    { name: "Noé", icon: "👶🏼" },
    { name: "Mama", icon: "👩🏼" },
    { name: "Papa", icon: "👨🏻" }
];

const themes = {
    'boerderij': { emoji: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐶', '🐱', '🦆', '🚜', '🌾', '🍎', '🥕'], path: 'assets/images/memory/boerderij/' },
    'dino': { emoji: ['🦖', '🦕', '🐊', '🌋', '🥚', '🦴', '🌿', '🦎', '🐢', '🦂', '☄️', '🌴'], path: 'assets/images/memory/dino/' },
    'studio100': { emoji: ['🐶', '🎈', '🤡', '🦸', '🏴‍☠️', '🧚', '🐺', '🌲', '🍄', '🎻', '👓', '🍬'], path: 'assets/images/memory/studio100/' },
    'marvel': { emoji: ['🕷️', '🛡️', '🔨', '👊', '🦇', '🦸‍♂️', '🦹', '🕸️', '⚡', '🟢', '🤖', '🇺🇸'], path: 'assets/images/memory/marvel/' },
    'natuur': { emoji: ['🌳', '🌻', '🌹', '🌵', '🍄', '🍂', '🦋', '🐝', '🐞', '🐌', '🌈', '☀️'], path: 'assets/images/memory/natuur/' },
    'beroepen': { emoji: ['👮', '👩‍🚒', '👨‍⚕️', '👩‍🏫', '👨‍🍳', '👩‍🚀', '👨‍🎨', '👩‍🔧', '👨‍⚖️', '👷', '🕵️', '🧙'], path: 'assets/images/memory/beroepen/' }
};

// 1. SETUP SCHERM
function startMemorySetup() {
    const board = document.getElementById('game-board');
    
    // Spelers knoppen genereren met juiste icoon
    let playerButtonsHTML = predefinedPlayers.map(p => 
        `<button class="option-btn" onclick="togglePlayer('${p.name}', this)">
            <span>${p.icon}</span>
            <span class="btn-label">${p.name}</span>
        </button>`
    ).join('');

    board.innerHTML = `
        <div class="memory-setup">
            
            <div class="setup-group group-players">
                <h3>Wie speelt er mee?</h3>
                <div class="option-grid" id="player-selection">
                    ${playerButtonsHTML}
                </div>
                
                <div class="player-input-container">
                    <input type="text" id="custom-player-name" placeholder="Andere naam...">
                    <button class="add-btn" onclick="addCustomPlayer()">+</button>
                </div>
            </div>

            <div class="setup-group group-theme">
                <h3>Kies een thema</h3>
                <div class="option-grid">
                    <button class="option-btn selected" onclick="setTheme('boerderij', this)"><span>🚜</span><span class="btn-label">Boer</span></button>
                    <button class="option-btn" onclick="setTheme('dino', this)"><span>🦖</span><span class="btn-label">Dino</span></button>
                    <button class="option-btn" onclick="setTheme('studio100', this)"><span>🤡</span><span class="btn-label">Studio</span></button>
                    <button class="option-btn" onclick="setTheme('marvel', this)"><span>🕷️</span><span class="btn-label">Held</span></button>
                    <button class="option-btn" onclick="setTheme('natuur', this)"><span>🌳</span><span class="btn-label">Natuur</span></button>
                    <button class="option-btn" onclick="setTheme('beroepen', this)"><span>👩‍🚒</span><span class="btn-label">Werk</span></button>
                </div>
            </div>

            <div class="setup-group group-size">
                <h3>Hoeveel kaartjes?</h3>
                <div class="option-grid">
                    <button class="option-btn selected" onclick="setSize(12, this)">
                        <span><span class="star">★</span><span class="star dim">★</span><span class="star dim">★</span></span>
                        <span class="btn-label">12</span>
                    </button>
                    <button class="option-btn" onclick="setSize(16, this)">
                        <span><span class="star">★</span><span class="star">★</span><span class="star dim">★</span></span>
                        <span class="btn-label">16</span>
                    </button>
                    <button class="option-btn" onclick="setSize(24, this)">
                        <span><span class="star">★</span><span class="star">★</span><span class="star">★</span></span>
                        <span class="btn-label">24</span>
                    </button>
                </div>
            </div>

            <button id="start-btn" class="start-btn" onclick="startMemoryGame()" disabled>KIES SPELERS...</button>
        </div>
    `;
    
    memoryState.playerNames = [];
    memoryState.theme = 'boerderij';
    memoryState.gridSize = 12;
}

// Speler toevoegen/verwijderen uit lijst
function togglePlayer(name, btn) {
    const index = memoryState.playerNames.indexOf(name);
    
    if (index === -1) {
        if (memoryState.playerNames.length >= 4) return; 
        memoryState.playerNames.push(name);
        btn.classList.add('selected');
    } else {
        memoryState.playerNames.splice(index, 1);
        btn.classList.remove('selected');
    }
    checkStartButton();
}

function addCustomPlayer() {
    const input = document.getElementById('custom-player-name');
    const name = input.value.trim();
    if (name && !memoryState.playerNames.includes(name)) {
        const container = document.getElementById('player-selection');
        const btnHTML = document.createElement('button');
        btnHTML.className = 'option-btn';
        btnHTML.onclick = function() { togglePlayer(name, this) };
        // Standaard icoon voor extra spelers
        btnHTML.innerHTML = `<span>👤</span><span class="btn-label">${name}</span>`;
        container.appendChild(btnHTML);
        
        togglePlayer(name, btnHTML);
        input.value = '';
    }
}

function checkStartButton() {
    const btn = document.getElementById('start-btn');
    if (memoryState.playerNames.length > 0) {
        btn.disabled = false;
        // Alleen namen tonen als het er 3 of minder zijn, anders wordt de knop te vol
        if(memoryState.playerNames.length <= 3) {
             btn.innerText = `START MET ${memoryState.playerNames.join(' & ').toUpperCase()} ▶️`;
        } else {
             btn.innerText = `START SPEL (${memoryState.playerNames.length} SPELERS) ▶️`;
        }
       
    } else {
        btn.disabled = true;
        btn.innerText = "KIES EERST SPELERS...";
    }
}

function setTheme(name, btn) {
    memoryState.theme = name;
    selectSingleBtn(btn);
}

function setSize(size, btn) {
    memoryState.gridSize = size;
    selectSingleBtn(btn);
}

function selectSingleBtn(btn) {
    let parent = btn.parentElement;
    Array.from(parent.children).forEach(child => child.classList.remove('selected'));
    btn.classList.add('selected');
}

// 2. SPEL STARTEN
function startMemoryGame() {
    if (memoryState.playerNames.length === 0) return;

    const board = document.getElementById('game-board');
    
    let scoreHTML = '<div class="score-board">';
    memoryState.playerNames.forEach((name, index) => {
        // Zoek het juiste icoontje erbij voor het scorebord
        let playerIcon = "👤";
        let predefined = predefinedPlayers.find(p => p.name === name);
        if(predefined) playerIcon = predefined.icon;

        scoreHTML += `<div class="player-score ${index===0?'active':''}" id="score-${index}">
            ${playerIcon} ${name}: 0
        </div>`;
        memoryState.scores[name] = 0;
    });
    scoreHTML += '</div>';

    let gridStyle = '';
    if(memoryState.gridSize === 12) gridStyle = 'grid-template-columns: repeat(3, 1fr);'; 
    if(memoryState.gridSize === 16) gridStyle = 'grid-template-columns: repeat(4, 1fr);'; 
    if(memoryState.gridSize === 24) gridStyle = 'grid-template-columns: repeat(4, 1fr);'; 
    // Op mobiel misschien iets andere indeling:
    if(window.innerWidth < 600 && memoryState.gridSize === 24) {
         gridStyle = 'grid-template-columns: repeat(3, 1fr);';
    }


    board.innerHTML = `
        <div class="memory-game-container">
            ${scoreHTML}
            <div class="memory-grid" id="memory-grid" style="${gridStyle}"></div>
        </div>
    `;

    memoryState.currentPlayerIndex = 0;
    memoryState.flippedCards = [];
    memoryState.lockBoard = false;
    memoryState.matchedPairs = 0;

    generateCards();
}

// 3. GENERATE CARDS 
function generateCards() {
    const grid = document.getElementById('memory-grid');
    const themeData = themes[memoryState.theme];
    const pairsNeeded = memoryState.gridSize / 2;
    
    let items = [];
    if (memoryState.useImages) {
        for (let i = 1; i <= pairsNeeded; i++) items.push(i);
    } else {
        items = themeData.emoji.slice(0, pairsNeeded);
    }

    let deck = [...items, ...items];
    deck.sort(() => 0.5 - Math.random());

    grid.innerHTML = '';

    deck.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.value = item;
        
        let content = memoryState.useImages 
            ? `<img src="${themeData.path}${item}.jpg" class="card-img" draggable="false">` 
            : item;

        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${content}</div>
            </div>
        `;

        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

// 4. SPEL LOGICA
function flipCard() {
    if (memoryState.lockBoard) return;
    if (this === memoryState.flippedCards[0]) return;

    this.classList.add('flipped');
    memoryState.flippedCards.push(this);

    if (memoryState.flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    let card1 = memoryState.flippedCards[0];
    let card2 = memoryState.flippedCards[1];

    let isMatch = card1.dataset.value === card2.dataset.value;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    memoryState.flippedCards = [];
    memoryState.matchedPairs++;
    
    let currentPlayerName = memoryState.playerNames[memoryState.currentPlayerIndex];
    memoryState.scores[currentPlayerName]++;
    
    // Update score tekst met icoon
    let playerIcon = "👤";
    let predefined = predefinedPlayers.find(p => p.name === currentPlayerName);
    if(predefined) playerIcon = predefined.icon;

    document.getElementById(`score-${memoryState.currentPlayerIndex}`).innerText = 
        `${playerIcon} ${currentPlayerName}: ${memoryState.scores[currentPlayerName]}`;

    if (memoryState.matchedPairs === memoryState.gridSize / 2) {
        setTimeout(() => alert('Gewonnen! 🎉'), 500);
    }
}

function unflipCards() {
    memoryState.lockBoard = true;
    setTimeout(() => {
        memoryState.flippedCards[0].classList.remove('flipped');
        memoryState.flippedCards[1].classList.remove('flipped');
        memoryState.flippedCards = [];
        memoryState.lockBoard = false;
        switchPlayer();
    }, 1500); 
}

function switchPlayer() {
    document.getElementById(`score-${memoryState.currentPlayerIndex}`).classList.remove('active');

    memoryState.currentPlayerIndex++;
    if (memoryState.currentPlayerIndex >= memoryState.playerNames.length) {
        memoryState.currentPlayerIndex = 0;
    }

    document.getElementById(`score-${memoryState.currentPlayerIndex}`).classList.add('active');
}
