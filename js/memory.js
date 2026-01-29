// MEMORY SPEL LOGICA

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
    activeColor: '#2196F3' // Standaard blauw geselecteerd
};

// Kleurenpalet (De verfpotjes)
const palette = [
    '#F44336', // Rood
    '#E91E63', // Roze
    '#9C27B0', // Paars
    '#2196F3', // Blauw
    '#4CAF50', // Groen
    '#FF9800', // Oranje
];

const predefinedPlayers = [
    { name: "Lou", icon: "👦🏼" },
    { name: "Noé", icon: "👶🏼" },
    { name: "Mama", icon: "👩🏻" },
    { name: "Papa", icon: "👨🏻" }
];

const themes = {
    'boerderij': { locked: false, coverIcon: '🚜', emoji: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐶', '🐱', '🦆', '🚜', '🌾', '🍎', '🥕'], path: 'assets/images/memory/boerderij/' },
    'dino': { locked: true, coverIcon: '🦖', emoji: [], path: 'assets/images/memory/dino/' },
    'studio100': { locked: true, coverIcon: '🤡', emoji: [], path: 'assets/images/memory/studio100/' },
    'marvel': { locked: true, coverIcon: '🛡️', emoji: [], path: 'assets/images/memory/marvel/' },
    'natuur': { locked: true, coverIcon: '🌳', emoji: [], path: 'assets/images/memory/natuur/' },
    'beroepen': { locked: true, coverIcon: '🚒', emoji: [], path: 'assets/images/memory/beroepen/' }
};

// 1. SETUP SCHERM
function startMemorySetup() {
    const board = document.getElementById('game-board');
    
    // HTML voor de kleurencirkels
    let paletteHTML = palette.map(color => 
        `<div class="color-dot" 
              style="background-color: ${color}" 
              onclick="selectPaletteColor('${color}', this)">
         </div>`
    ).join('');

    // HTML voor de spelers
    let playerButtonsHTML = predefinedPlayers.map(p => 
        `<button class="option-btn player-btn" onclick="togglePlayer('${p.name}', this)">
            <span>${p.icon}</span>
            <span class="btn-label">${p.name}</span>
        </button>`
    ).join('');

    // HTML voor de thema's
    let themeButtonsHTML = Object.keys(themes).map(key => {
        const t = themes[key];
        const isLocked = t.locked ? 'locked' : '';
        const lockIcon = t.locked ? '<span class="lock-overlay">🔒</span>' : '';
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        
        return `<button class="option-btn ${isLocked}" onclick="setTheme('${key}', this)">
            ${lockIcon}
            <span>${t.coverIcon}</span>
            <span class="btn-label">${label}</span>
        </button>`;
    }).join('');

    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-columns">
                <div class="setup-group group-players">
                    <h3>Wie speelt er?</h3>
                    
                    <div class="color-picker-title">1. Kies een kleur</div>
                    <div class="color-row" id="color-palette">
                        ${paletteHTML}
                    </div>

                    <div class="color-picker-title">2. Kies wie meedoet</div>
                    <div class="option-grid" id="player-selection">
                        ${playerButtonsHTML}
                    </div>
                    
                    <div class="player-input-container">
                        <input type="text" id="custom-player-name" placeholder="Andere naam...">
                        <button class="add-btn" onclick="addCustomPlayer()">+</button>
                    </div>
                </div>

                <div class="setup-group group-theme">
                    <h3>Wat spelen we?</h3>
                    <div class="option-grid">
                        ${themeButtonsHTML}
                    </div>
                </div>

                <div class="setup-group group-size">
                    <h3>Grootte?</h3>
                    <div class="option-grid">
                        <button class="option-btn selected" onclick="setSize(12, this)">
                            <span><span class="star">★</span></span>
                            <span class="btn-label">12</span>
                        </button>
                        <button class="option-btn" onclick="setSize(16, this)">
                            <span><span class="star">★</span><span class="star">★</span></span>
                            <span class="btn-label">16</span>
                        </button>
                        <button class="option-btn" onclick="setSize(24, this)">
                            <span><span class="star">★</span><span class="star">★</span><span class="star">★</span></span>
                            <span class="btn-label">24</span>
                        </button>
                    </div>
                </div>
            </div>
            <button id="start-btn" class="start-btn" onclick="startMemoryGame()" disabled>Kies eerst spelers...</button>
        </div>
    `;
    
    // Initialisatie
    memoryState.playerNames = [];
    memoryState.theme = 'boerderij';
    
    // Zet de eerste kleur op actief
    setTimeout(() => {
        const dots = document.querySelectorAll('.color-dot');
        if(dots.length > 3) selectPaletteColor(palette[3], dots[3]); // Start met Blauw als voorbeeld
        
        // Selecteer standaard thema
        const defaultThemeBtn = document.querySelector(`.option-btn[onclick="setTheme('boerderij', this)"]`);
        if(defaultThemeBtn) selectSingleBtn(defaultThemeBtn);
    }, 10);
}

// KLEUR KIEZEN
function selectPaletteColor(color, dotElement) {
    memoryState.activeColor = color;
    
    // Visuele update van de cirkels
    const allDots = document.querySelectorAll('.color-dot');
    allDots.forEach(d => d.classList.remove('active'));
    dotElement.classList.add('active');

    // Hint: geef de niet-geselecteerde spelers alvast een randje in deze kleur
    const unselectedBtns = document.querySelectorAll('.player-btn:not(.selected)');
    unselectedBtns.forEach(btn => {
        btn.style.borderColor = color;
        btn.style.color = color; // Icoon kleur
        btn.querySelector('.btn-label').style.color = '#888';
    });
}

// SPELER AANKLIKKEN
function togglePlayer(name, btn) {
    const existingIndex = memoryState.playerNames.findIndex(p => p.name === name);
    
    if (existingIndex === -1) {
        // --- TOEVOEGEN ---
        if (memoryState.playerNames.length >= 4) return; 

        const colorToUse = memoryState.activeColor; // Pak de kleur die NU aan staat

        memoryState.playerNames.push({ name: name, color: colorToUse });
        btn.classList.add('selected');
        
        // Maak de knop helemaal die kleur
        btn.style.backgroundColor = colorToUse;
        btn.style.borderColor = colorToUse;
        btn.style.color = 'white'; // Icoon wit
        btn.querySelector('.btn-label').style.color = 'white';
        
    } else {
        // --- VERWIJDEREN ---
        memoryState.playerNames.splice(existingIndex, 1);
        btn.classList.remove('selected');
        
        // Reset naar wit met randje van de huidige actieve kleur
        btn.style.backgroundColor = 'white';
        btn.style.borderColor = memoryState.activeColor;
        btn.style.color = memoryState.activeColor;
        btn.querySelector('.btn-label').style.color = '#888';
    }
    checkStartButton();
}

function addCustomPlayer() {
    const input = document.getElementById('custom-player-name');
    const name = input.value.trim();
    const exists = memoryState.playerNames.some(p => p.name === name);

    if (name && !exists) {
        const container = document.getElementById('player-selection');
        const btnHTML = document.createElement('button');
        btnHTML.className = 'option-btn player-btn';
        
        // Koppel functie
        btnHTML.onclick = function() { togglePlayer(name, this) };
        btnHTML.innerHTML = `<span>👤</span><span class="btn-label">${name}</span>`;
        
        container.appendChild(btnHTML);
        
        // Direct toevoegen met huidige kleur
        togglePlayer(name, btnHTML);
        input.value = '';
    }
}

function checkStartButton() {
    const btn = document.getElementById('start-btn');
    if (memoryState.playerNames.length > 0) {
        btn.disabled = false;
        const namesOnly = memoryState.playerNames.map(p => p.name);
        if(namesOnly.length <= 3) {
             btn.innerText = `START MET ${namesOnly.join(' & ').toUpperCase()} ▶️`;
        } else {
             btn.innerText = `START SPEL (${namesOnly.length} SPELERS) ▶️`;
        }
    } else {
        btn.disabled = true;
        btn.innerText = "KIES EERST SPELERS...";
    }
}

// THEMA & GROOTTE FUNCTIES (Dezelfde als voorheen)
function setTheme(name, btn) {
    if(themes[name].locked) return;
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
    
    // Scorebord badges maken
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

    let gridStyle = '';
    if(memoryState.gridSize === 12) gridStyle = 'grid-template-columns: repeat(4, 1fr);'; 
    if(memoryState.gridSize === 16) gridStyle = 'grid-template-columns: repeat(4, 1fr);'; 
    if(memoryState.gridSize === 24) gridStyle = 'grid-template-columns: repeat(6, 1fr);'; 

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

    updateActiveBadgeColor();
    generateCards();
}

function updateActiveBadgeColor() {
    // Reset alle badges
    memoryState.playerNames.forEach((p, idx) => {
        let b = document.getElementById(`badge-${idx}`);
        if(b) {
            b.style.backgroundColor = 'white';
            b.style.color = p.color; // Tekst is kleur
            b.classList.remove('active');
        }
    });

    // Actieve badge inkleuren
    let currentP = memoryState.playerNames[memoryState.currentPlayerIndex];
    let activeBadge = document.getElementById(`badge-${memoryState.currentPlayerIndex}`);
    if(activeBadge) {
        activeBadge.classList.add('active');
        activeBadge.style.backgroundColor = currentP.color; // Achtergrond is kleur
        activeBadge.style.color = 'white'; // Tekst wit
    }
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
            : `<span class="card-emoji">${item}</span>`;

        // Cover
        let coverContent = '';
        if (memoryState.useImages) {
            coverContent = `<img src="${themeData.path}cover.jpg" class="card-cover-img" draggable="false" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
                            <span class="fallback-icon" style="display:none; font-size:3rem; color:white;">${themeData.coverIcon}</span>`;
        } else {
            coverContent = `<span class="card-cover-emoji">${themeData.coverIcon}</span>`;
        }

        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="card-front">${coverContent}</div>
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

    if (card1.dataset.value === card2.dataset.value) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    memoryState.flippedCards = [];
    memoryState.matchedPairs++;
    
    let currentP = memoryState.playerNames[memoryState.currentPlayerIndex];
    memoryState.scores[currentP.name]++;
    
    document.getElementById(`score-${memoryState.currentPlayerIndex}`).innerText = memoryState.scores[currentP.name];

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
    memoryState.currentPlayerIndex++;
    if (memoryState.currentPlayerIndex >= memoryState.playerNames.length) {
        memoryState.currentPlayerIndex = 0;
    }
    updateActiveBadgeColor();
}
