// MEMORY.JS - MAXIMALE KADER GROOTTE (FIX)
console.log("Memory.js geladen (Full Fill)...");

let memoryState = { 
    theme: 'boerderij', 
    gridSize: 30, // VAST 30
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

// --- SETUP ---
function startMemorySetup() {
    const board = document.getElementById('game-board');
    if (!board) return;

    let themeBtns = Object.keys(themes).map(key => {
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
                    <h3>1. Spelers</h3>
                    <div class="option-grid">
                        <button class="option-btn player-btn" onclick="selectPerson('Lou', this)">👦🏼 Lou</button>
                        <button class="option-btn player-btn" onclick="selectPerson('Noé', this)">👶🏼 Noé</button>
                        <button class="option-btn player-btn" onclick="selectPerson('Mama', this)">👩🏻 Mama</button>
                        <button class="option-btn player-btn" onclick="selectPerson('Papa', this)">👨🏻 Papa</button>
                    </div>
                    <div class="custom-name-container">
                        <input type="text" id="custom-player-name" placeholder="Of typ naam...">
                        <button class="add-btn" onclick="addCustomPerson()">OK</button>
                    </div>
                    <div class="color-row" id="color-palette"></div>
                    <div id="active-players-list"></div>
                </div>
                <div class="setup-group">
                    <h3>2. Thema</h3>
                    <div class="theme-grid">${themeBtns}</div>
                </div>
            </div>
            <button id="start-btn" class="start-btn" onclick="startMemoryGame()" disabled>Voeg speler toe...</button>
        </div>`;
    
    renderPalette(); renderActivePlayers(); checkStartButton();
}

// --- SETUP HELPERS ---
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
    if(btn) btn.classList.add('selected-pending');
    memoryState.pendingPlayer = name;
    const p = document.getElementById('color-palette'); p.style.animation="shake 0.5s"; setTimeout(()=>p.style.animation="",500);
}
function addCustomPerson() {
    const i = document.getElementById('custom-player-name'); const n = i.value.trim();
    if(n){ if(typeof playSound==='function')playSound('click'); memoryState.pendingPlayer=n; document.querySelectorAll('.player-btn').forEach(b=>b.classList.remove('selected-pending')); i.value=''; i.placeholder=n+" gekozen!"; const p=document.getElementById('color-palette'); p.style.animation="shake 0.5s"; setTimeout(()=>p.style.animation="",500); }
}
function renderPalette() {
    const cp = document.getElementById('color-palette'); if(!cp)return;
    const used = memoryState.playerNames.map(p => p.color);
    cp.innerHTML = palette.map(c => {
        const u = used.includes(c);
        return `<div class="color-dot" style="background:${c}; opacity:${u?0.2:1}" onclick="${u?'':`selectColor('${c}')`}"></div>`;
    }).join('');
}
function selectColor(c) {
    if(!memoryState.pendingPlayer) return alert("Kies eerst een naam!");
    if(typeof playSound==='function')playSound('pop');
    memoryState.playerNames = memoryState.playerNames.filter(p=>p.name!==memoryState.pendingPlayer);
    memoryState.playerNames.push({name:memoryState.pendingPlayer, color:c});
    memoryState.pendingPlayer=null; document.getElementById('custom-player-name').placeholder="Typ naam...";
    renderPalette(); renderActivePlayers(); checkStartButton();
}
function renderActivePlayers() {
    document.getElementById('active-players-list').innerHTML = memoryState.playerNames.map(p=>`<div class="active-player-tag" style="background:${p.color}" onclick="removePlayer('${p.name}')">${p.name} ×</div>`).join('');
}
function removePlayer(n) { memoryState.playerNames=memoryState.playerNames.filter(p=>p.name!==n); renderPalette(); renderActivePlayers(); checkStartButton(); }
function checkStartButton() { 
    const b=document.getElementById('start-btn'); if(b){b.disabled=memoryState.playerNames.length===0; b.innerText=b.disabled?"VOEG SPELER TOE...":"START SPEL ▶️";}
}

// --- GAME LOGIC (MAXIMALE GROOTTE) ---

function calculateCardSize(cols, rows) {
    const board = document.getElementById('game-board');
    if(!board) return 60; // Fallback

    // Totale beschikbare ruimte
    const w = board.clientWidth;
    const h = board.clientHeight;

    // Trek scorebalk eraf (ongeveer 60px) + marges (20px totaal)
    // We willen dat het spelbord de rest vult
    const availableW = w - 10; // Kleine marge zijkant
    const availableH = h - 70; // Marge voor scorebord bovenin

    const gap = 6; // De ruimte tussen de kaarten

    // Bereken hoeveel ruimte 1 kaart mag innemen in de breedte
    const widthPerCard = (availableW - ((cols - 1) * gap)) / cols;
    
    // Bereken hoeveel ruimte 1 kaart mag innemen in de hoogte
    const heightPerCard = (availableH - ((rows - 1) * gap)) / rows;

    // We willen VIERKANTE kaarten die overal passen. 
    // Pak de kleinste waarde, zodat het nooit buiten beeld valt.
    // Geen limiet meer van 110px!
    let size = Math.floor(Math.min(widthPerCard, heightPerCard));
    
    return size;
}

function startMemoryGame() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    
    // Vast 30 kaarten
    memoryState.gridSize = 30;
    
    // Bepaal rooster: Liggend = 6 breed, Staand = 5 breed
    let cols = 6; let rows = 5;
    if(board.clientHeight > board.clientWidth) { cols = 5; rows = 6; }

    let scoreHTML = `<div class="score-board">${memoryState.playerNames.map((p, i) => `<div class="player-badge" id="badge-${i}" style="border-color:${p.color}; color:${p.color}"><span class="badge-name">${p.name}</span>: <span id="score-${i}">0</span></div>`).join('')}</div>`;

    board.innerHTML = `<div class="memory-game-container">${scoreHTML}<div class="memory-grid" id="memory-grid"></div></div>`;
    
    const grid = document.getElementById('memory-grid');
    
    // Bereken grootte
    const cardSize = calculateCardSize(cols, rows);
    
    grid.style.gridTemplateColumns = `repeat(${cols}, ${cardSize}px)`;
    grid.style.gap = '6px';
    
    memoryState.matchedPairs = 0; memoryState.flippedCards = []; memoryState.lockBoard = false; memoryState.currentPlayerIndex = 0;
    updateActiveBadgeColor();
    generateCards(cardSize, cols * rows);

    // Resize listener
    window.onresize = () => {
        if(document.getElementById('memory-grid')) {
            const newCols = (board.clientHeight > board.clientWidth) ? 5 : 6;
            const newRows = (board.clientHeight > board.clientWidth) ? 6 : 5;
            const newSize = calculateCardSize(newCols, newRows);
            const g = document.getElementById('memory-grid');
            g.style.gridTemplateColumns = `repeat(${newCols}, ${newSize}px)`;
            document.querySelectorAll('.memory-card').forEach(c => {
                c.style.width = newSize+'px'; c.style.height = newSize+'px';
            });
        }
    };
}

function generateCards(sizePx, totalCards) {
    const grid = document.getElementById('memory-grid');
    const themeData = themes[memoryState.theme];
    const pairsNeeded = 15;
    
    let deck = [];
    for (let i = 1; i <= pairsNeeded; i++) deck.push(i, i);
    deck.sort(() => 0.5 - Math.random());

    grid.innerHTML = '';
    deck.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'memory-card'; card.dataset.value = item;
        // DE KADER GROOTTE:
        card.style.width = `${sizePx}px`; 
        card.style.height = `${sizePx}px`;
        
        card.innerHTML = `<div class="memory-card-inner"><div class="card-front"><img src="${themeData.path}cover.png"></div><div class="card-back"><img src="${themeData.path}${item}.${themeData.extension}"></div></div>`;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (memoryState.lockBoard || this.classList.contains('flipped')) return;
    if(typeof playSound === 'function') playSound('pop');
    this.classList.add('flipped'); memoryState.flippedCards.push(this);
    if (memoryState.flippedCards.length === 2) {
        memoryState.lockBoard = true;
        const [c1, c2] = memoryState.flippedCards;
        if (c1.dataset.value === c2.dataset.value) {
            let p = memoryState.playerNames[memoryState.currentPlayerIndex];
            memoryState.scores[p.name]++; document.getElementById(`score-${memoryState.currentPlayerIndex}`).innerText = memoryState.scores[p.name];
            memoryState.matchedPairs++; c1.classList.add('matched'); c2.classList.add('matched');
            c1.querySelector('.card-back').style.borderColor = p.color; c2.querySelector('.card-back').style.borderColor = p.color;
            memoryState.flippedCards = []; memoryState.lockBoard = false;
            if(typeof playSound === 'function') playSound('win');
            if (memoryState.matchedPairs === 15) setTimeout(() => { let lb = memoryState.playerNames.map(pn => ({name:pn.name, score:memoryState.scores[pn.name]})).sort((a,b)=>b.score-a.score); showWinnerModal(lb[0].name, lb); }, 500);
        } else {
            setTimeout(() => { c1.classList.remove('flipped'); c2.classList.remove('flipped'); memoryState.flippedCards = []; memoryState.lockBoard = false; switchPlayer(); }, 1000);
        }
    }
}
function switchPlayer() { memoryState.currentPlayerIndex = (memoryState.currentPlayerIndex + 1) % memoryState.playerNames.length; updateActiveBadgeColor(); }
function updateActiveBadgeColor() { memoryState.playerNames.forEach((p, i) => { let b = document.getElementById(`badge-${i}`); if(b) { const a = i === memoryState.currentPlayerIndex; b.classList.toggle('active', a); b.style.backgroundColor = a ? p.color : 'white'; b.style.color = a ? 'white' : p.color; } }); }
