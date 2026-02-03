// MEMORY.JS - MET MIX MODUS
console.log("Memory.js geladen (Mix Mode)...");

let memoryState = { 
    theme: 'boerderij', 
    gridSize: 30, 
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
    'marvel':    { locked: false, extension: 'png', path: 'assets/images/memory/marvel/' },
    'dino':      { locked: false, extension: 'png', path: 'assets/images/memory/dino/' },
    'sonic':     { locked: false, extension: 'png', path: 'assets/images/memory/natuur/' },
    'cars':      { locked: false, extension: 'png', path: 'assets/images/memory/beroepen/' },
    
    // SPECIALE MIX MODUS (Geen pad, wordt in code geregeld)
    'mix':       { locked: false, extension: 'png', path: '', isMix: true } 
};

// ... (Confetti functie blijft hetzelfde als vorige keer) ...
function fireConfetti() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    const container = document.body;
    for(let i=0; i<100; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'fixed';
        conf.style.width = '10px'; conf.style.height = '10px';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10px';
        conf.style.zIndex = '9999';
        conf.style.borderRadius = '50%';
        conf.style.transform = `rotate(${Math.random() * 360}deg)`;
        const duration = Math.random() * 2 + 1; 
        conf.style.transition = `top ${duration}s linear, transform ${duration}s linear`;
        container.appendChild(conf);
        setTimeout(() => {
            conf.style.top = '110vh';
            conf.style.transform = `rotate(${Math.random() * 720}deg)`;
        }, 100);
        setTimeout(() => conf.remove(), duration * 1000);
    }
}

function startMemorySetup() {
    const board = document.getElementById('game-board');
    if (!board) return;

    let themeBtns = Object.keys(themes).map(key => {
        const t = themes[key];
        const selected = memoryState.theme === key ? 'selected' : '';
        
        // Speciale cover voor MIX
        let imgTag = '';
        if(t.isMix) {
            // Een icoontje van een blender of vraagteken, of gewoon tekst
            imgTag = `<div style="width:100%; height:100%; background:#333; display:flex; justify-content:center; align-items:center; font-size:3rem;">🔀</div>`;
        } else {
            imgTag = `<img src="${t.path}cover.png" onerror="this.src='assets/images/icon.png'">`;
        }

        return `
            <button class="theme-card-btn ${t.locked ? 'locked' : ''} ${selected}" onclick="setTheme('${key}', this)">
                <div class="theme-img-container">
                    ${imgTag}
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

// ... (Andere helpers zoals setTheme, selectPerson blijven exact hetzelfde als vorige versie) ...
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
    const p = document.getElementById('color-palette'); if(p) {p.style.animation="shake 0.5s"; setTimeout(()=>p.style.animation="",500);}
}
function addCustomPerson() {
    const i = document.getElementById('custom-player-name'); const n = i.value.trim();
    if(n){ if(typeof playSound==='function')playSound('click'); memoryState.pendingPlayer=n; document.querySelectorAll('.player-btn').forEach(b=>b.classList.remove('selected-pending')); i.value=''; i.placeholder=n+" gekozen!"; const p=document.getElementById('color-palette'); if(p){p.style.animation="shake 0.5s"; setTimeout(()=>p.style.animation="",500);} }
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
function updateCardSize() {
    const board = document.getElementById('game-board');
    const grid = document.getElementById('memory-grid');
    const scoreBoard = document.querySelector('.score-board');
    if (!board || !grid) return;
    const windowH = window.innerHeight;
    const windowW = window.innerWidth;
    const scoreHeight = scoreBoard ? scoreBoard.offsetHeight : 60;
    const availableH = windowH - scoreHeight - 20;
    const availableW = windowW - 20;
    const gap = 4;
    const sizeA_W = (availableW - (5 * gap)) / 6;
    const sizeA_H = (availableH - (4 * gap)) / 5;
    const sizeA = Math.floor(Math.min(sizeA_W, sizeA_H));
    const sizeB_W = (availableW - (4 * gap)) / 5;
    const sizeB_H = (availableH - (5 * gap)) / 6;
    const sizeB = Math.floor(Math.min(sizeB_W, sizeB_H));
    let finalSize, finalCols;
    if (sizeA >= sizeB) { finalSize = sizeA; finalCols = 6; } else { finalSize = sizeB; finalCols = 5; }
    grid.style.setProperty('--card-size', `${finalSize}px`);
    grid.style.setProperty('--grid-cols', finalCols);
    grid.style.gap = `${gap}px`;
}
function startMemoryGame() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    memoryState.gridSize = 30; 
    memoryState.scores = {};
    memoryState.playerNames.forEach(p => { memoryState.scores[p.name] = 0; });
    let scoreHTML = `<div class="score-board">
        ${memoryState.playerNames.map((p, i) => `
            <div class="player-badge" id="badge-${i}" style="border-color:${p.color}">
                <div class="score-fill" id="fill-${i}" style="background-color:${p.color}; width:0%;"></div>
                <span class="badge-content" style="color:${p.color}">
                    ${p.name}: <span id="score-${i}">0</span>
                </span>
            </div>
        `).join('')}
    </div>`;
    board.innerHTML = `<div class="memory-game-container">${scoreHTML}<div class="memory-grid" id="memory-grid"></div></div>`;
    setTimeout(updateCardSize, 20); 
    memoryState.matchedPairs = 0; memoryState.flippedCards = []; memoryState.lockBoard = false; memoryState.currentPlayerIndex = 0;
    updateActiveBadgeColor();
    generateCards(30);
    window.onresize = () => { setTimeout(updateCardSize, 100); };
}

// --- GENERATE CARDS (AANGEPAST VOOR MIX) ---
function generateCards(totalCards) {
    const grid = document.getElementById('memory-grid');
    const pairsNeeded = totalCards / 2;
    let selectedImages = [];

    // CHECK OF HET MIX IS
    if(themes[memoryState.theme].isMix) {
        // Verzamel ALLE plaatjes uit ALLE open thema's
        let allPool = [];
        Object.keys(themes).forEach(tName => {
            const tData = themes[tName];
            if(!tData.locked && !tData.isMix) {
                // We gaan ervan uit dat elk thema 15 plaatjes heeft (1.png t/m 15.png)
                for(let i=1; i<=15; i++) {
                    allPool.push({
                        src: `${tData.path}${i}.${tData.extension}`,
                        cover: `${tData.path}cover.png` // We gebruiken cover van het thema
                    });
                }
            }
        });

        // Schud alles en pak er 15
        allPool.sort(() => 0.5 - Math.random());
        selectedImages = allPool.slice(0, pairsNeeded);

    } else {
        // Normaal: Pak 1 t/m 15 van één thema
        const tData = themes[memoryState.theme];
        for(let i=1; i<=pairsNeeded; i++) {
            selectedImages.push({
                src: `${tData.path}${i}.${tData.extension}`,
                cover: `${tData.path}cover.png`
            });
        }
        // Shuffle welke plaatjes (als we er minder dan 15 zouden hebben, maar we hebben er 15)
        selectedImages.sort(() => 0.5 - Math.random());
    }

    // Maak paren
    let deck = [];
    selectedImages.forEach((imgObj, index) => {
        // We gebruiken index als ID voor de match
        deck.push({ id: index, img: imgObj.src, cover: imgObj.cover });
        deck.push({ id: index, img: imgObj.src, cover: imgObj.cover });
    });

    // Schud het deck
    deck.sort(() => 0.5 - Math.random());

    grid.innerHTML = '';
    deck.forEach((cardData) => {
        const card = document.createElement('div');
        card.className = 'memory-card'; 
        card.dataset.value = cardData.id;
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="card-front"><img src="${cardData.cover}" alt="cover"></div>
                <div class="card-back"><img src="${cardData.img}" alt="card"></div>
            </div>`;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}
// ... (flipCard, switchPlayer, updateActiveBadgeColor zijn ongewijzigd) ...
function flipCard() {
    if (memoryState.lockBoard || this.classList.contains('flipped')) return;
    if(typeof playSound === 'function') playSound('pop');
    this.classList.add('flipped'); memoryState.flippedCards.push(this);
    if (memoryState.flippedCards.length === 2) {
        memoryState.lockBoard = true;
        const [c1, c2] = memoryState.flippedCards;
        if (c1.dataset.value === c2.dataset.value) {
            let p = memoryState.playerNames[memoryState.currentPlayerIndex];
            if (typeof memoryState.scores[p.name] === 'undefined' || isNaN(memoryState.scores[p.name])) { memoryState.scores[p.name] = 0; }
            memoryState.scores[p.name]++; 
            document.getElementById(`score-${memoryState.currentPlayerIndex}`).innerText = memoryState.scores[p.name];
            const totalPairs = memoryState.gridSize / 2;
            const percentage = (memoryState.scores[p.name] / totalPairs) * 100;
            const fillBar = document.getElementById(`fill-${memoryState.currentPlayerIndex}`);
            if(fillBar) fillBar.style.width = `${percentage}%`;
            memoryState.matchedPairs++; 
            c1.classList.add('matched'); c2.classList.add('matched');
            c1.querySelector('.card-back').style.borderColor = p.color; 
            c2.querySelector('.card-back').style.borderColor = p.color;
            memoryState.flippedCards = []; memoryState.lockBoard = false;
            if(typeof playSound === 'function') playSound('win');
            if (memoryState.matchedPairs === 15) {
                fireConfetti();
                setTimeout(() => { 
                    let lb = memoryState.playerNames.map(pn => ({name:pn.name, score:memoryState.scores[pn.name]})).sort((a,b)=>b.score-a.score); 
                    showWinnerModal(lb[0].name, lb); 
                }, 1500);
            }
        } else {
            setTimeout(() => { c1.classList.remove('flipped'); c2.classList.remove('flipped'); memoryState.flippedCards = []; memoryState.lockBoard = false; switchPlayer(); }, 1000);
        }
    }
}
function switchPlayer() { memoryState.currentPlayerIndex = (memoryState.currentPlayerIndex + 1) % memoryState.playerNames.length; updateActiveBadgeColor(); }
function updateActiveBadgeColor() { memoryState.playerNames.forEach((p, i) => { let b = document.getElementById(`badge-${i}`); if(b) { const active = i === memoryState.currentPlayerIndex; b.classList.toggle('active', active); if(active) { b.style.boxShadow = `0 0 10px ${p.color}`; } else { b.style.boxShadow = "none"; } } }); }
