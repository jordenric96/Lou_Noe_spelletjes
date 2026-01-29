let memoryState = { theme: 'boerderij', gridSize: 12, playerNames: [], currentPlayerIndex: 0, scores: {}, cards: [], flippedCards: [], lockBoard: false, useImages: true, matchedPairs: 0, activeColor: '#2196F3' };
const palette = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];
const predefinedPlayers = [{ name: "Lou", icon: "👦🏼" }, { name: "Noé", icon: "👶🏼" }, { name: "Mama", icon: "👩🏻" }, { name: "Papa", icon: "👨🏻" }];

const themes = {
    'boerderij': { locked: false, extension: 'jpg', coverIcon: '🚜', emoji: [], path: 'assets/images/memory/boerderij/' },
    'mario': { locked: false, extension: 'png', coverIcon: '🍄', emoji: [], path: 'assets/images/memory/mario/' },
    'pokemon': { locked: false, extension: 'png', coverIcon: '⚡', emoji: [], path: 'assets/images/memory/pokemon/' },
    'dino': { locked: true, extension: 'jpg', coverIcon: '🦖', emoji: [], path: 'assets/images/memory/dino/' },
    'studio100': { locked: true, extension: 'jpg', coverIcon: '🤡', emoji: [], path: 'assets/images/memory/studio100/' },
    'marvel': { locked: true, extension: 'jpg', coverIcon: '🛡️', emoji: [], path: 'assets/images/memory/marvel/' },
    'natuur': { locked: true, extension: 'jpg', coverIcon: '🌳', emoji: [], path: 'assets/images/memory/natuur/' },
    'beroepen': { locked: true, extension: 'jpg', coverIcon: '🚒', emoji: [], path: 'assets/images/memory/beroepen/' }
};

function startMemorySetup() {
    const board = document.getElementById('game-board');
    let paletteHTML = palette.map(color => `<div class="color-dot" style="background-color: ${color}" onclick="selectPaletteColor('${color}', this)"></div>`).join('');
    let playerButtonsHTML = predefinedPlayers.map(p => `<button class="option-btn player-btn" onclick="togglePlayer('${p.name}', this)"><span>${p.icon}</span><span class="btn-label">${p.name}</span></button>`).join('');
    let themeButtonsHTML = Object.keys(themes).map(key => {
        const t = themes[key];
        const isLocked = t.locked ? 'locked' : '';
        const lockIcon = t.locked ? '<span class="lock-overlay">🔒</span>' : '';
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return `<button class="option-btn ${isLocked}" onclick="setTheme('${key}', this)">${lockIcon}<span>${t.coverIcon}</span><span class="btn-label">${label}</span></button>`;
    }).join('');

    board.innerHTML = `<div class="memory-setup"><div class="setup-columns"><div class="setup-group group-players"><h3>Wie speelt er?</h3><div class="color-picker-title">1. Kies een kleur</div><div class="color-row" id="color-palette">${paletteHTML}</div><div class="color-picker-title">2. Kies wie meedoet</div><div class="option-grid" id="player-selection">${playerButtonsHTML}</div><div class="player-input-container"><input type="text" id="custom-player-name" placeholder="Andere naam..."><button class="add-btn" onclick="addCustomPlayer()">+</button></div></div><div class="setup-group group-theme"><h3>Wat spelen we?</h3><div class="option-grid">${themeButtonsHTML}</div></div><div class="setup-group group-size"><h3>Grootte?</h3><div class="option-grid"><button class="option-btn selected" onclick="setSize(12, this)"><span><span class="star">★</span></span><span class="btn-label">12</span></button><button class="option-btn" onclick="setSize(16, this)"><span><span class="star">★</span><span class="star">★</span></span><span class="btn-label">16</span></button><button class="option-btn" onclick="setSize(30, this)"><span><span class="star">★</span><span class="star">★</span><span class="star">★</span></span><span class="btn-label">30</span></button></div></div></div><button id="start-btn" class="start-btn" onclick="startMemoryGame()" disabled>Kies eerst spelers...</button></div>`;
    
    memoryState.playerNames = [];
    memoryState.theme = 'boerderij'; 
    setTimeout(() => {
        const dots = document.querySelectorAll('.color-dot');
        if(dots.length > 3) selectPaletteColor(palette[3], dots[3]); 
        const defaultThemeBtn = document.querySelector(`.option-btn[onclick="setTheme('boerderij', this)"]`);
        if(defaultThemeBtn) selectSingleBtn(defaultThemeBtn);
    }, 10);
}

function selectPaletteColor(color, dotElement) {
    memoryState.activeColor = color;
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    dotElement.classList.add('active');
    document.querySelectorAll('.player-btn:not(.selected)').forEach(btn => { btn.style.borderColor = color; btn.style.color = color; });
}
function togglePlayer(name, btn) {
    const existingIndex = memoryState.playerNames.findIndex(p => p.name === name);
    if (existingIndex === -1) {
        if (memoryState.playerNames.length >= 4) return; 
        memoryState.playerNames.push({ name: name, color: memoryState.activeColor });
        btn.classList.add('selected'); btn.style.backgroundColor = memoryState.activeColor; btn.style.borderColor = memoryState.activeColor; btn.style.color = 'white'; btn.querySelector('.btn-label').style.color = 'white';
    } else {
        memoryState.playerNames.splice(existingIndex, 1);
        btn.classList.remove('selected'); btn.style.backgroundColor = 'white'; btn.style.borderColor = memoryState.activeColor; btn.style.color = memoryState.activeColor; btn.querySelector('.btn-label').style.color = '#888';
    }
    checkStartButton();
}
function addCustomPlayer() {
    const input = document.getElementById('custom-player-name');
    const name = input.value.trim();
    if (name && !memoryState.playerNames.some(p => p.name === name)) {
        const container = document.getElementById('player-selection');
        const btnHTML = document.createElement('button');
        btnHTML.className = 'option-btn player-btn';
        btnHTML.onclick = function() { togglePlayer(name, this) };
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
        const names = memoryState.playerNames.map(p => p.name);
        btn.innerText = names.length <= 3 ? `START MET ${names.join(' & ').toUpperCase()} ▶️` : `START SPEL (${names.length} SPELERS) ▶️`;
    } else {
        btn.disabled = true;
        btn.innerText = "KIES EERST SPELERS...";
    }
}
function setTheme(name, btn) { if(themes[name].locked) return; memoryState.theme = name; selectSingleBtn(btn); }
function setSize(size, btn) { memoryState.gridSize = size; selectSingleBtn(btn); }
function selectSingleBtn(btn) { Array.from(btn.parentElement.children).forEach(c => c.classList.remove('selected')); btn.classList.add('selected'); }

function startMemoryGame() {
    if (memoryState.playerNames.length === 0) return;
    const board = document.getElementById('game-board');
    let scoreHTML = '<div class="score-board">';
    memoryState.playerNames.forEach((player, index) => {
        let playerIcon = "👤";
        let predefined = predefinedPlayers.find(p => p.name === player.name);
        if(predefined) playerIcon = predefined.icon;
        scoreHTML += `<div class="player-badge ${index===0?'active':''}" id="badge-${index}" style="border-color: ${player.color}; color: ${player.color}"><span class="badge-icon">${playerIcon}</span><span class="badge-name">${player.name}</span><span class="badge-score" id="score-${index}">0</span></div>`;
        memoryState.scores[player.name] = 0;
    });
    scoreHTML += '</div>';

    let gridStyle = '';
    if(memoryState.gridSize === 12) gridStyle = 'grid-template-columns: repeat(4, 1fr);'; 
    if(memoryState.gridSize === 16) gridStyle = 'grid-template-columns: repeat(4, 1fr);'; 
    if(memoryState.gridSize === 30) gridStyle = 'grid-template-columns: repeat(6, 1fr);';
    if(window.innerWidth < 600 && memoryState.gridSize === 30) gridStyle = 'grid-template-columns: repeat(5, 1fr);';

    board.innerHTML = `<div class="memory-game-container">${scoreHTML}<div class="memory-grid" id="memory-grid" style="${gridStyle}"></div></div>`;
    memoryState.currentPlayerIndex = 0; memoryState.flippedCards = []; memoryState.lockBoard = false; memoryState.matchedPairs = 0;
    updateActiveBadgeColor();
    generateCards();
}

function updateActiveBadgeColor() {
    memoryState.playerNames.forEach((p, idx) => { let b = document.getElementById(`badge-${idx}`); if(b) { b.style.backgroundColor = 'white'; b.style.color = p.color; b.classList.remove('active'); } });
    let currentP = memoryState.playerNames[memoryState.currentPlayerIndex];
    let activeBadge = document.getElementById(`badge-${memoryState.currentPlayerIndex}`);
    if(activeBadge) { activeBadge.classList.add('active'); activeBadge.style.backgroundColor = currentP.color; activeBadge.style.color = 'white'; }
}

function generateCards() {
    const grid = document.getElementById('memory-grid');
    const themeData = themes[memoryState.theme];
    const pairsNeeded = memoryState.gridSize / 2;
    const ext = themeData.extension || 'jpg';
    let items = [];
    if (memoryState.useImages) { for (let i = 1; i <= pairsNeeded; i++) items.push(i); } else { items = themeData.emoji.slice(0, pairsNeeded); }
    let deck = [...items, ...items];
    deck.sort(() => 0.5 - Math.random());
    grid.innerHTML = '';

    deck.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.value = item;
        let content = memoryState.useImages ? `<img src="${themeData.path}${item}.${ext}" class="card-img" draggable="false">` : `<span class="card-emoji">${item}</span>`;
        let coverContent = memoryState.useImages ? `<img src="${themeData.path}cover.${ext}" class="card-cover-img" draggable="false" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="fallback-icon" style="display:none; font-size:3rem; color:white;">${themeData.coverIcon}</span>` : `<span class="card-cover-emoji">${themeData.coverIcon}</span>`;
        card.innerHTML = `<div class="memory-card-inner"><div class="card-front">${coverContent}</div><div class="card-back">${content}<div class="match-overlay"><span class="checkmark">✅</span></div></div></div>`;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (memoryState.lockBoard) return;
    if (this === memoryState.flippedCards[0]) return;
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
    memoryState.flippedCards.forEach(card => card.classList.add('matched'));
    memoryState.matchedPairs++;
    let currentP = memoryState.playerNames[memoryState.currentPlayerIndex];
    memoryState.scores[currentP.name]++;
    document.getElementById(`score-${memoryState.currentPlayerIndex}`).innerText = memoryState.scores[currentP.name];
    memoryState.flippedCards = [];
    if (memoryState.matchedPairs === memoryState.gridSize / 2) {
        setTimeout(() => {
            let leaderboard = memoryState.playerNames.map(p => ({ name: p.name, score: memoryState.scores[p.name], color: p.color })).sort((a, b) => b.score - a.score);
            let winner = leaderboard[0].name;
            if (leaderboard.length > 1 && leaderboard[0].score === leaderboard[1].score) winner = "Gelijkspel!";
            showWinnerModal(winner, leaderboard);
        }, 800);
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
    if (memoryState.currentPlayerIndex >= memoryState.playerNames.length) memoryState.currentPlayerIndex = 0;
    updateActiveBadgeColor();
}
