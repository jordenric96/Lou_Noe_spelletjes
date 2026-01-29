// MEMORY SPEL LOGICA

// Configuratie
let memoryState = {
    theme: 'boerderij',
    gridSize: 12,
    playerNames: [], // Wordt nu: [{name: 'Lou', color: '#FF5722'}, ...]
    currentPlayerIndex: 0,
    scores: {},
    cards: [],
    flippedCards: [],
    lockBoard: false, 
    
    // --- HIER ZET JE DE FOTO'S AAN ---
    useImages: true, 
    
    matchedPairs: 0
};

// Vaste spelers MET hun eigen KLEUR
// Tip: Je kunt hier hex-codes kiezen (bijv #FF0000) of namen (red, blue)
const predefinedPlayers = [
    { name: "Lou", icon: "👦🏼", color: "#2196F3" }, // Blauw
    { name: "Noé", icon: "👶🏼", color: "#4CAF50" }, // Groen
    { name: "Mama", icon: "👩🏻", color: "#E91E63" }, // Roze
    { name: "Papa", icon: "👨🏻", color: "#FF9800" }  // Oranje
];

// Kleurenpalet voor "Andere" spelers (wordt willekeurig gekozen)
const randomColors = ["#9C27B0", "#00BCD4", "#FFC107", "#795548", "#607D8B"];

// Thema's configuratie
// ZET 'locked: true' ALS JE DE FOTO'S NOG NIET HEBT
const themes = {
    'boerderij': { 
        locked: false, // <--- DEZE IS OPEN
        coverIcon: '🚜', 
        emoji: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐶', '🐱', '🦆', '🚜', '🌾', '🍎', '🥕'], 
        path: 'assets/images/memory/boerderij/' 
    },
    'dino': { 
        locked: true, // <--- DEZE ZIT NOG OP SLOT (verander naar false als mapje klaar is)
        coverIcon: '🦖', 
        emoji: ['🦖', '🦕', '🐊', '🌋', '🥚', '🦴', '🌿', '🦎', '🐢', '🦂', '☄️', '🌴'], 
        path: 'assets/images/memory/dino/' 
    },
    'studio100': { 
        locked: true, 
        coverIcon: '🤡', 
        emoji: ['🐶', '🎈', '🤡', '🦸', '🏴‍☠️', '🧚', '🐺', '🌲', '🍄', '🎻', '👓', '🍬'], 
        path: 'assets/images/memory/studio100/' 
    },
    'marvel': { 
        locked: true, 
        coverIcon: '🛡️', 
        emoji: ['🕷️', '🛡️', '🔨', '👊', '🦇', '🦸‍♂️', '🦹', '🕸️', '⚡', '🟢', '🤖', '🇺🇸'], 
        path: 'assets/images/memory/marvel/' 
    },
    'natuur': { 
        locked: true, 
        coverIcon: '🌳', 
        emoji: ['🌳', '🌻', '🌹', '🌵', '🍄', '🍂', '🦋', '🐝', '🐞', '🐌', '🌈', '☀️'], 
        path: 'assets/images/memory/natuur/' 
    },
    'beroepen': { 
        locked: true, 
        coverIcon: '🚒', 
        emoji: ['👮', '👩‍🚒', '👨‍⚕️', '👩‍🏫', '👨‍🍳', '👩‍🚀', '👨‍🎨', '👩‍🔧', '👨‍⚖️', '👷', '🕵️', '🧙'], 
        path: 'assets/images/memory/beroepen/' 
    }
};

// 1. SETUP SCHERM GENEREREN
function startMemorySetup() {
    const board = document.getElementById('game-board');
    
    // Spelers knoppen genereren met kleur-indicatie
    let playerButtonsHTML = predefinedPlayers.map(p => 
        `<button class="option-btn player-btn" onclick="togglePlayer('${p.name}', '${p.color}', this)" style="border-bottom-color: ${p.color}">
            <span>${p.icon}</span>
            <span class="btn-label" style="color: ${p.color}">${p.name}</span>
        </button>`
    ).join('');

    // Thema knoppen genereren (Checken op slotjes!)
    let themeButtonsHTML = Object.keys(themes).map(key => {
        const t = themes[key];
        const isLocked = t.locked ? 'locked' : '';
        const lockIcon = t.locked ? '<span class="lock-overlay">🔒</span>' : '';
        // We halen de naam uit de key (boerderij) en maken 1e letter hoofdletter
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
                    <h3>Wie?</h3>
                    <div class="option-grid" id="player-selection">
                        ${playerButtonsHTML}
                    </div>
                    <div class="player-input-container">
                        <input type="text" id="custom-player-name" placeholder="Naam...">
                        <button class="add-btn" onclick="addCustomPlayer()">+</button>
                    </div>
                </div>

                <div class="setup-group group-theme">
                    <h3>Wat?</h3>
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
    
    // Selecteer standaard de eerste beschikbare (niet gelockte) thema
    // Of fallback naar boerderij
    memoryState.playerNames = [];
    memoryState.theme = 'boerderij';
    
    // Zoek de juiste knop om 'selected' te maken bij start
    setTimeout(() => {
        const defaultThemeBtn = document.querySelector(`.option-btn[onclick="setTheme('boerderij', this)"]`);
        if(defaultThemeBtn) selectSingleBtn(defaultThemeBtn);
    }, 10);
}

// SPELER FUNCTIES (Nu met kleur!)
function togglePlayer(name, color, btn) {
    // Check of speler al bestaat in de lijst
    const existingIndex = memoryState.playerNames.findIndex(p => p.name === name);
    
    if (existingIndex === -1) {
        // Toevoegen
        if (memoryState.playerNames.length >= 4) return; 
        memoryState.playerNames.push({ name: name, color: color });
        btn.classList.add('selected');
        // Geef de knop de kleur van de speler als achtergrond bij selectie
        btn.style.backgroundColor = color;
        btn.querySelector('.btn-label').style.color = 'white';
    } else {
        // Verwijderen
        memoryState.playerNames.splice(existingIndex, 1);
        btn.classList.remove('selected');
        // Reset kleuren
        btn.style.backgroundColor = '#E1F5FE';
        btn.querySelector('.btn-label').style.color = color;
    }
    checkStartButton();
}

function addCustomPlayer() {
    const input = document.getElementById('custom-player-name');
    const name = input.value.trim();
    // Check of naam niet al bestaat
    const exists = memoryState.playerNames.some(p => p.name === name);

    if (name && !exists) {
        // Kies een random kleur
        const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
        
        const container = document.getElementById('player-selection');
        const btnHTML = document.createElement('button');
        btnHTML.className = 'option-btn player-btn';
        btnHTML.style.borderBottomColor = randomColor;
        
        // We moeten de onclick functie dynamisch koppelen
        btnHTML.onclick = function() { togglePlayer(name, randomColor, this) };
        btnHTML.innerHTML = `<span>👤</span><span class="btn-label" style="color:${randomColor}">${name}</span>`;
        
        container.appendChild(btnHTML);
        togglePlayer(name, randomColor, btnHTML);
        input.value = '';
    }
}

function checkStartButton() {
    const btn = document.getElementById('start-btn');
    if (memoryState.playerNames.length > 0) {
        btn.disabled = false;
        // Map alleen de namen voor de tekst op de knop
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

function setTheme(name, btn) {
    // Als thema locked is, doe niets!
    if(themes[name].locked) return;

    memoryState.theme = name;
    selectSingleBtn(btn);
}
function setSize(size, btn) {
    memoryState.gridSize = size;
    selectSingleBtn(btn);
}
function selectSingleBtn(btn) {
    // Zoek de parent en haal selected weg bij kinderen
    let parent = btn.parentElement;
    Array.from(parent.children).forEach(child => child.classList.remove('selected'));
    
    // Voeg selected toe (maar let op bij thema's voor custom styling)
    btn.classList.add('selected');
}

// 2. SPEL STARTEN (Met gekleurde badges!)
function startMemoryGame() {
    if (memoryState.playerNames.length === 0) return;

    const board = document.getElementById('game-board');
    
    // Scorebord Genereren
    let scoreHTML = '<div class="score-board">';
    memoryState.playerNames.forEach((player, index) => {
        // Zoek icoon
        let playerIcon = "👤";
        let predefined = predefinedPlayers.find(p => p.name === player.name);
        if(predefined) playerIcon = predefined.icon;

        // Hier passen we de kleur toe op de badge (border en tekst)
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

    generateCards();
}

// 3. GENERATE CARDS (Ongewijzigd, behalve dat lock logic in thema zit)
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

        // Check cover logic
        let coverContent = '';
        if (memoryState.useImages) {
            // Probeer cover.jpg te gebruiken, maar voor veiligheid (als hij mist) fallback naar icoon kan later
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

// 4. SPEL LOGICA (KLEINE UPDATE VOOR SCORE UPDATE)
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
    
    // Let op: playerNames is nu een lijst van objecten!
    let currentPlayerObj = memoryState.playerNames[memoryState.currentPlayerIndex];
    memoryState.scores[currentPlayerObj.name]++;
    
    document.getElementById(`score-${memoryState.currentPlayerIndex}`).innerText = memoryState.scores[currentPlayerObj.name];

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
    // Verwijder active en extra stijlen van huidige
    let oldBadge = document.getElementById(`badge-${memoryState.currentPlayerIndex}`);
    oldBadge.classList.remove('active');
    oldBadge.style.backgroundColor = "white"; 
    oldBadge.style.color = memoryState.playerNames[memoryState.currentPlayerIndex].color; // Terug naar tekstkleur

    memoryState.currentPlayerIndex++;
    if (memoryState.currentPlayerIndex >= memoryState.playerNames.length) {
        memoryState.currentPlayerIndex = 0;
    }

    // Nieuwe speler highlighten
    let newBadge = document.getElementById(`badge-${memoryState.currentPlayerIndex}`);
    newBadge.classList.add('active');
    let pColor = memoryState.playerNames[memoryState.currentPlayerIndex].color;
    
    // Maak de badge helemaal ingekleurd voor duidelijkheid
    newBadge.style.backgroundColor = pColor;
    newBadge.style.color = "white"; // Witte tekst op gekleurde achtergrond
}
