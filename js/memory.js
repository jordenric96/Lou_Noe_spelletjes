// MEMORY SPEL LOGICA

// Configuratie en Status
let memoryState = {
    theme: 'boerderij',
    players: 1,
    gridSize: 12, // Aantal kaarten (12, 16, 24)
    currentPlayer: 1,
    scores: [0, 0, 0, 0], // Max 4 spelers
    cards: [],
    flippedCards: [],
    lockBoard: false, // Voorkomt klikken tijdens animatie
    useImages: false // <--- ZET DEZE OP TRUE ZODRA JE FOTO'S HEBT
};

// De Thema's (Nu met emoji's, later bestandsnamen)
const themes = {
    'boerderij': {
        emoji: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐶', '🐱', '🦆', '🚜', '🌾', '🍎', '🥕'],
        path: 'assets/images/memory/boerderij/' 
    },
    'dino': {
        emoji: ['🦖', '🦕', '🐊', '🌋', '🥚', '🦴', '🌿', '🦎', '🐢', '🦂', '☄️', '🌴'],
        path: 'assets/images/memory/dino/'
    },
    'studio100': {
        emoji: ['🐶', '🎈', '🤡', '🦸', '🏴‍☠️', '🧚', '🐺', '🌲', '🍄', '🎻', '👓', '🍬'], // Voorbeelden
        path: 'assets/images/memory/studio100/'
    },
    'marvel': {
        emoji: ['🕷️', '🛡️', '🔨', '👊', '🦇', '🦸‍♂️', '🦹', '🕸️', '⚡', '🟢', '🤖', '🇺🇸'],
        path: 'assets/images/memory/marvel/'
    },
    'natuur': {
        emoji: ['🌳', '🌻', '🌹', '🌵', '🍄', '🍂', '🦋', '🐝', '🐞', '🐌', '🌈', '☀️'],
        path: 'assets/images/memory/natuur/'
    },
    'beroepen': {
        emoji: ['👮', '👩‍🚒', '👨‍⚕️', '👩‍🏫', '👨‍🍳', '👩‍🚀', '👨‍🎨', '👩‍🔧', '👨‍⚖️', '👷', '🕵️', '🧙'],
        path: 'assets/images/memory/beroepen/'
    }
};

// 1. SETUP SCHERM STARTEN
function startMemorySetup() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="memory-setup">
            
            <div class="setup-group">
                <h3>Wie speelt er mee?</h3>
                <button class="option-btn selected" onclick="setPlayers(1, this)">Solo</button>
                <button class="option-btn" onclick="setPlayers(2, this)">2 Spelers</button>
                <button class="option-btn" onclick="setPlayers(3, this)">3</button>
                <button class="option-btn" onclick="setPlayers(4, this)">4</button>
            </div>

            <div class="setup-group">
                <h3>Kies een thema:</h3>
                <button class="option-btn selected" onclick="setTheme('boerderij', this)">Boerderij</button>
                <button class="option-btn" onclick="setTheme('dino', this)">Dino</button>
                <button class="option-btn" onclick="setTheme('studio100', this)">Studio 100</button>
                <button class="option-btn" onclick="setTheme('marvel', this)">Marvel</button>
                <button class="option-btn" onclick="setTheme('natuur', this)">Natuur</button>
                <button class="option-btn" onclick="setTheme('beroepen', this)">Beroepen</button>
            </div>

            <div class="setup-group">
                <h3>Aantal kaartjes:</h3>
                <button class="option-btn selected" onclick="setSize(12, this)">12 (Makkelijk)</button>
                <button class="option-btn" onclick="setSize(16, this)">16 (Gemiddeld)</button>
                <button class="option-btn" onclick="setSize(24, this)">24 (Moeilijk)</button>
            </div>

            <button class="start-btn" onclick="startMemoryGame()">Start Spel!</button>
        </div>
    `;
    
    // Reset state
    memoryState.players = 1;
    memoryState.theme = 'boerderij';
    memoryState.gridSize = 12;
}

// Hulpfuncties voor de knoppen in setup
function setPlayers(num, btn) {
    memoryState.players = num;
    selectBtn(btn);
}
function setTheme(name, btn) {
    memoryState.theme = name;
    selectBtn(btn);
}
function setSize(size, btn) {
    memoryState.gridSize = size;
    selectBtn(btn);
}
function selectBtn(btn) {
    // Haal class 'selected' weg bij broertjes en voeg toe aan deze
    let parent = btn.parentElement;
    Array.from(parent.children).forEach(child => {
        if(child.classList.contains('option-btn')) child.classList.remove('selected');
    });
    btn.classList.add('selected');
}

// 2. SPEL STARTEN
function startMemoryGame() {
    const board = document.getElementById('game-board');
    
    // Maak Scorebord HTML
    let scoreHTML = '<div class="score-board">';
    if (memoryState.players === 1) {
        scoreHTML += `<div class="player-score active" id="p1-score">Beurten: 0</div>`;
    } else {
        for(let i=1; i<=memoryState.players; i++) {
            scoreHTML += `<div class="player-score ${i===1?'active':''}" id="p${i}-score">P${i}: 0</div>`;
        }
    }
    scoreHTML += '</div>';

    // Maak Grid HTML
    let gridStyle = '';
    // Pas kolommen aan op basis van aantal kaarten (simpele logica)
    if(memoryState.gridSize === 12) gridStyle = 'grid-template-columns: repeat(3, 1fr);'; // 3x4
    if(memoryState.gridSize === 16) gridStyle = 'grid-template-columns: repeat(4, 1fr);'; // 4x4
    if(memoryState.gridSize === 24) gridStyle = 'grid-template-columns: repeat(4, 1fr);'; // 6x4 (op mobiel misschien 4x6)

    board.innerHTML = `
        <div class="memory-game-container">
            ${scoreHTML}
            <div class="memory-grid" id="memory-grid" style="${gridStyle}">
                </div>
        </div>
    `;

    // Initialiseer spel data
    memoryState.currentPlayer = 1;
    memoryState.scores = [0,0,0,0]; // Reset scores of beurten
    memoryState.flippedCards = [];
    memoryState.lockBoard = false;
    memoryState.matchedPairs = 0;

    generateCards();
}

// 3. KAARTEN GENEREREN
function generateCards() {
    const grid = document.getElementById('memory-grid');
    const themeData = themes[memoryState.theme];
    const pairsNeeded = memoryState.gridSize / 2;
    
    // Kies items uit het thema
    let items = themeData.emoji.slice(0, pairsNeeded); // Pak de eerste X items
    // Verdubbel ze
    let deck = [...items, ...items];
    
    // Schudden (Fisher-Yates shuffle)
    deck.sort(() => 0.5 - Math.random());

    // HTML maken
    deck.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.value = item; // Om te checken of het een match is
        card.dataset.index = index; // Uniek ID

        // Hier bepalen we of we een Emoji tonen of een Plaatje
        let content = '';
        if (memoryState.useImages) {
            // STRAKS: Als je foto's hebt, zoekt hij hier naar 1.jpg, 2.jpg etc.
            // Zorg dat je bestandsnamen overeenkomen met de index in de array, of gebruik een mapping.
            // Voor nu houden we het simpel:
            // content = `<img src="${themeData.path}${item}.jpg" class="card-img">`;
            // Omdat we nu nog geen map hebben met plaatjes die matchen met emoji namen, 
            // is dit deel nog even commentaar.
        } else {
            content = item; // Emoji
        }

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

// 4. KAART OMDRAAIEN
function flipCard() {
    if (memoryState.lockBoard) return; // Wacht tot animatie klaar is
    if (this === memoryState.flippedCards[0]) return; // Klik niet op dezelfde kaart

    this.classList.add('flipped');
    
    // Geluidje afspelen (placeholder)
    // playSound('flip'); 

    memoryState.flippedCards.push(this);

    if (memoryState.flippedCards.length === 2) {
        checkForMatch();
    }
}

// 5. CHECK MATCH
function checkForMatch() {
    let card1 = memoryState.flippedCards[0];
    let card2 = memoryState.flippedCards[1];

    let isMatch = card1.dataset.value === card2.dataset.value;

    if (isMatch) {
        disableCards();
        updateScore(true);
    } else {
        unflipCards();
        updateScore(false);
    }
}

function disableCards() {
    // Kaarten blijven open
    memoryState.flippedCards = [];
    memoryState.matchedPairs++;
    
    // Check winst
    if (memoryState.matchedPairs === memoryState.gridSize / 2) {
        setTimeout(() => alert('Gewonnen! Goed gedaan!'), 500);
    }
}

function unflipCards() {
    memoryState.lockBoard = true;

    setTimeout(() => {
        memoryState.flippedCards[0].classList.remove('flipped');
        memoryState.flippedCards[1].classList.remove('flipped');

        memoryState.flippedCards = [];
        memoryState.lockBoard = false;
        
        // Wissel beurt als het multiplayer is
        if (memoryState.players > 1) {
            switchPlayer();
        }
    }, 1000); // Wacht 1 seconde zodat kind kan kijken
}

// 6. SCORE & WISSELEN
function updateScore(match) {
    if (memoryState.players === 1) {
        // Solo: tel beurten
        if (!match) { // Of altijd tellen, afhankelijk van regels. Meestal is 'pogingen' tellen.
            memoryState.scores[0]++;
            document.getElementById('p1-score').innerText = `Beurten: ${memoryState.scores[0]}`;
        }
    } else {
        // Multiplayer
        if (match) {
            // Huidige speler krijgt punt en mag nog eens
            let pIdx = memoryState.currentPlayer - 1;
            memoryState.scores[pIdx]++;
            document.getElementById(`p${memoryState.currentPlayer}-score`).innerText = `P${memoryState.currentPlayer}: ${memoryState.scores[pIdx]}`;
        }
    }
}

function switchPlayer() {
    // Verwijder active class van huidige speler
    document.getElementById(`p${memoryState.currentPlayer}-score`).classList.remove('active');

    // Volgende speler
    memoryState.currentPlayer++;
    if (memoryState.currentPlayer > memoryState.players) {
        memoryState.currentPlayer = 1;
    }

    // Voeg active class toe aan nieuwe speler
    document.getElementById(`p${memoryState.currentPlayer}-score`).classList.add('active');
}
