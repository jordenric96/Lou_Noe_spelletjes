// MEMORY.JS - VOLLEDIG GECORRIGEERD (Met Leaderboard & Geluid)
console.log("Memory.js geladen (Fixed)...");

let memoryState = { 
    theme: 'boerderij', gridSize: 30, playerNames: [], currentPlayerIndex: 0, scores: {}, 
    cards: [], flippedCards: [], lockBoard: false, matchedPairs: 0, pendingPlayer: null 
};

const memPalette = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#FFC107', '#FF9800'];

const memThemes = {
    'boerderij': { locked: false, extension: 'png', path: 'assets/images/memory/boerderij/' },
    'mario':     { locked: false, extension: 'png', path: 'assets/images/memory/mario/' },
    'pokemon':   { locked: false, extension: 'png', path: 'assets/images/memory/pokemon/' },
    'studio100': { locked: false, extension: 'png', path: 'assets/images/memory/studio100/' },
    'marvel':    { locked: false, extension: 'png', path: 'assets/images/memory/marvel/' },
    'dino':      { locked: false, extension: 'png', path: 'assets/images/memory/dino/' },
    'sonic':     { locked: false, extension: 'png', path: 'assets/images/memory/natuur/' },
    'cars':      { locked: false, extension: 'png', path: 'assets/images/memory/beroepen/' },
    'toystory':  { locked: false, extension: 'png', path: 'assets/images/memory/toystory/' },
    'mix':       { locked: false, extension: 'png', path: '', isMix: true }
};

const mixCoverIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23FF9800' stroke='white' stroke-width='5'/%3E%3Ctext x='50' y='70' font-family='Arial' font-size='60' font-weight='bold' fill='white' text-anchor='middle'%3E?%3C/text%3E%3C/svg%3E";

// --- CONFETTI FUNCTIE ---
function memFireConfetti() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    for(let i=0; i<100; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'fixed'; conf.style.width = '10px'; conf.style.height = '10px';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.left = Math.random() * 100 + 'vw'; conf.style.top = '-10px'; conf.style.zIndex = '9999';
        conf.style.borderRadius = '50%'; conf.style.transform = `rotate(${Math.random() * 360}deg)`;
        const duration = Math.random() * 2 + 1; 
        conf.style.transition = `top ${duration}s linear, transform ${duration}s linear`;
        document.body.appendChild(conf);
        setTimeout(() => { conf.style.top = '110vh'; conf.style.transform = `rotate(${Math.random() * 720}deg)`; }, 100);
        setTimeout(() => conf.remove(), duration * 1000);
    }
}

// --- SETUP SCHERM ---
function startMemorySetup() {
    const board = document.getElementById('game-board'); if (!board) return;
    
    // Thema knoppen
    let themeBtns = Object.keys(memThemes).map(key => {
        const t = memThemes[key]; const selected = memoryState.theme === key ? 'selected' : '';
        let imgTag = t.isMix ? `<img src="${mixCoverIcon}">` : `<img src="${t.path}cover.png" onerror="this.src='assets/images/icon.png'">`;
        return `<div class="theme-card-btn ${t.locked ? 'locked' : ''} ${selected}" onclick="memSetTheme('${key}', this)"><div class="theme-img-container">${imgTag}</div><div class="btn-label">${key.charAt(0).toUpperCase() + key.slice(1)}</div></div>`;
    }).join('');
    
    // HTML Opbouw (Correcte classes en functies)
    board.innerHTML = `
    <div class="memory-setup">
        <div class="setup-group">
            <h3>1. Spelers</h3>
            
            <div class="name-row">
                <button class="player-btn" onclick="memSelectPerson('Lou', this)">👦🏻<br>Lou</button>
                <button class="player-btn" onclick="memSelectPerson('Noé', this)">👶🏼<br>Noé</button>
                <button class="player-btn" onclick="memSelectPerson('Oliver', this)">👦🏼<br>Oliver</button>
                <button class="player-btn" onclick="memSelectPerson('Manon', this)">👧🏼<br>Manon</button>
                <button class="player-btn" onclick="memSelectPerson('Lore', this)">👩🏻<br>Lore</button>
                <button class="player-btn" onclick="memSelectPerson('Jorden', this)">🧔🏻<br>Jorden</button>
                <button class="player-btn" onclick="memSelectPerson('Karen', this)">👱🏼‍♀️<br>Karen</button>
                <button class="player-btn" onclick="memSelectPerson('Bert', this)">👨🏻<br>Bert</button>
            </div>

            <div style="display:flex; gap:5px; margin-top:10px; justify-content:center;">
                <input type="text" id="mem-custom-name" placeholder="Naam..." style="width:100px; padding:8px; border-radius:10px; border:1px solid #ccc;">
                <button class="add-btn" onclick="memAddCustomPerson()" style="padding:8px 15px; border-radius:10px; background:#4CAF50; color:white; border:none;">OK</button>
            </div>
            
            <div class="color-grid-6" id="mem-color-palette"></div>
            <div id="mem-active-players"></div>
        </div>

        <div class="setup-group">
            <h3>2. Thema</h3>
            <div class="theme-grid-wrapper">${themeBtns}</div>
        </div>

        <div class="bottom-actions">
            <button id="mem-start-btn" class="start-btn" onclick="startMemoryGame()" disabled>Eerst spelers kiezen...</button>
            <button class="tool-btn" onclick="location.reload()">⬅ Terug naar Menu</button>
        </div>
    </div>`;
    
    memRenderPalette(); memRenderActivePlayers(); memCheckStartButton();
}

function memSetTheme(name, btn) { 
    if(memThemes[name].locked) return; 
    if(typeof playSound === 'function') playSound('click');
    memoryState.theme = name; 
    document.querySelectorAll('.theme-card-btn').forEach(b => b.classList.remove('selected')); 
    btn.classList.add('selected'); 
}

function memSelectPerson(name, btn) { 
    if(typeof playSound === 'function') playSound('click');
    
    // Visuele selectie (geel randje)
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending')); 
    if(btn) btn.classList.add('selected-pending'); 
    
    memoryState.pendingPlayer = name; 
    
    // Schud het kleurenpalet om aandacht te trekken
    const p = document.getElementById('mem-color-palette'); 
    if(p) { p.style.animation="shake 0.5s"; setTimeout(()=>p.style.animation="",500); } 
}

function memAddCustomPerson() { 
    const i = document.getElementById('mem-custom-name'); const n = i.value.trim(); 
    if(n){ 
        if(typeof playSound==='function') playSound('click');
        memoryState.pendingPlayer=n; 
        document.querySelectorAll('.player-btn').forEach(b=>b.classList.remove('selected-pending')); 
        i.value=''; i.placeholder="Gekozen!"; memRenderPalette(); 
    } 
}

function memRenderPalette() { 
    const cp = document.getElementById('mem-color-palette'); if(!cp)return; 
    const used = memoryState.playerNames.map(p => p.color); 
    cp.innerHTML = memPalette.map(c => { 
        const u = used.includes(c); 
        return `<div class="color-dot" style="background:${c}; opacity:${u?0.2:1}" onclick="${u?'':`memSelectColor('${c}')`}"></div>`; 
    }).join(''); 
}

function memSelectColor(c) { 
    if(!memoryState.pendingPlayer) return alert("Kies eerst een naam!"); 
    if(typeof playSound==='function') playSound('pop');
    
    memoryState.playerNames.push({name:memoryState.pendingPlayer, color:c}); 
    memoryState.pendingPlayer=null; 
    
    const inp = document.getElementById('mem-custom-name'); if(inp) inp.placeholder="Naam..."; 
    memRenderPalette(); memRenderActivePlayers(); memCheckStartButton(); 
}

function memRenderActivePlayers() { 
    document.getElementById('mem-active-players').innerHTML = memoryState.playerNames.map(p=>
        `<div class="active-player-tag" style="background:${p.color}" onclick="memRemovePlayer('${p.name}')">${p.name} ×</div>`
    ).join(''); 
}

function memRemovePlayer(n) { 
    memoryState.playerNames=memoryState.playerNames.filter(p=>p.name!==n); 
    memRenderPalette(); memRenderActivePlayers(); memCheckStartButton(); 
}

function memCheckStartButton() { 
    const b=document.getElementById('mem-start-btn'); 
    if(b){ 
        b.disabled=memoryState.playerNames.length===0; 
        b.innerText=b.disabled?"SPELERS KIEZEN...":"START SPEL ▶️"; 
    } 
}

// --- GAME LOGICA ---
function startMemoryGame() {
    if(typeof playSound === 'function') playSound('win');
    
    const board = document.getElementById('game-board'); 
    memoryState.gridSize = 30; 
    memoryState.scores = {}; 
    memoryState.playerNames.forEach(p => { memoryState.scores[p.name] = 0; });
    
    let headerHTML = `<div class="memory-header-row"><div class="score-board">${memoryState.playerNames.map((p, i) => 
        `<div class="player-badge" id="badge-${i}" style="border-color:${p.color}"><span style="color:${p.color}">${p.name}: <span id="score-${i}">0</span></span></div>`
    ).join('')}</div></div>`;
    
    let footerHTML = `<div class="memory-footer"><button class="mini-back-btn" onclick="startMemorySetup()">⬅ Terug</button></div>`;
    
    board.innerHTML = `<div class="memory-game-container">${headerHTML}<div class="memory-grid" id="memory-grid"></div>${footerHTML}</div>`;
    
    setTimeout(memUpdateCardSize, 20); 
    memoryState.matchedPairs = 0; 
    memoryState.flippedCards = []; 
    memoryState.lockBoard = false; 
    memoryState.currentPlayerIndex = 0; 
    memUpdateActiveBadgeColor(); 
    memGenerateCards(30);
    
    window.onresize = () => { setTimeout(memUpdateCardSize, 100); };
}

function memUpdateCardSize() { 
    const board = document.getElementById('game-board'); 
    const grid = document.getElementById('memory-grid'); 
    const header = document.querySelector('.memory-header-row'); 
    if (!board || !grid) return; 
    
    const windowH = window.innerHeight; const windowW = window.innerWidth; 
    const headerH = header ? header.offsetHeight : 50; const footerH = 40; 
    const availableH = windowH - headerH - footerH - 20; const availableW = windowW - 20; 
    
    const gap = 6; 
    const sizeA_W = (availableW - (5 * gap)) / 6; const sizeA_H = (availableH - (4 * gap)) / 5; 
    const sizeA = Math.floor(Math.min(sizeA_W, sizeA_H)); 
    
    const sizeB_W = (availableW - (4 * gap)) / 5; const sizeB_H = (availableH - (5 * gap)) / 6; 
    const sizeB = Math.floor(Math.min(sizeB_W, sizeB_H)); 
    
    let finalSize, finalCols; 
    if (sizeA >= sizeB) { finalSize = sizeA; finalCols = 6; } else { finalSize = sizeB; finalCols = 5; } 
    
    grid.style.setProperty('--card-size', `${finalSize}px`); 
    grid.style.setProperty('--grid-cols', finalCols); 
}

function memGenerateCards(totalCards) { 
    const grid = document.getElementById('memory-grid'); 
    const pairsNeeded = totalCards / 2; 
    let selectedImages = []; 
    const isMix = memThemes[memoryState.theme].isMix; 
    
    if(isMix) { 
        let allPool = []; 
        Object.keys(memThemes).forEach(tName => { 
            const tData = memThemes[tName]; 
            if(!tData.locked && !tData.isMix) { 
                for(let i=1; i<=15; i++) { allPool.push({ src: `${tData.path}${i}.${tData.extension}`, cover: mixCoverIcon }); } 
            } 
        }); 
        allPool.sort(() => 0.5 - Math.random()); 
        selectedImages = allPool.slice(0, pairsNeeded); 
    } else { 
        const tData = memThemes[memoryState.theme]; 
        for(let i=1; i<=pairsNeeded; i++) { 
            selectedImages.push({ src: `${tData.path}${i}.${tData.extension}`, cover: `${tData.path}cover.png` }); 
        } 
        selectedImages.sort(() => 0.5 - Math.random()); 
    } 
    
    let deck = []; 
    selectedImages.forEach((imgObj, index) => { 
        deck.push({ id: index, img: imgObj.src, cover: imgObj.cover }); 
        deck.push({ id: index, img: imgObj.src, cover: imgObj.cover }); 
    }); 
    deck.sort(() => 0.5 - Math.random()); 
    
    grid.innerHTML = ''; 
    deck.forEach((cardData) => { 
        const card = document.createElement('div'); 
        card.className = 'memory-card'; 
        card.dataset.value = cardData.id; 
        card.innerHTML = `<div class="memory-card-inner"><div class="card-front"><img src="${cardData.cover}" alt="cover"></div><div class="card-back"><img src="${cardData.img}" alt="card"></div></div>`; 
        card.addEventListener('click', memFlipCard); 
        grid.appendChild(card); 
    }); 
}

function memFlipCard() {
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
            
            const scoreEl = document.getElementById(`score-${memoryState.currentPlayerIndex}`);
            if(scoreEl) { 
                scoreEl.innerText = memoryState.scores[p.name]; 
                scoreEl.parentElement.style.transform = "scale(1.3)"; 
                setTimeout(() => scoreEl.parentElement.style.transform = "scale(1)", 200); 
            }
            
            memoryState.matchedPairs++; 
            c1.classList.add('matched'); c2.classList.add('matched');
            c1.querySelector('.card-back').style.borderColor = p.color; 
            c2.querySelector('.card-back').style.borderColor = p.color;
            
            memoryState.flippedCards = []; 
            memoryState.lockBoard = false;
            
            if(typeof playSound === 'function') playSound('win');
            
            // EINDE SPEL CHECK
            if (memoryState.matchedPairs === 15) {
                setTimeout(() => { 
                    let leaderboardData = memoryState.playerNames.map(pn => ({ name: pn.name, score: memoryState.scores[pn.name] }));
                    leaderboardData.sort((a,b) => b.score - a.score);
                    
                    // --- OPSLAAN VOOR TUSSENSTAND (LEADERBOARD) ---
                    if(memoryState.playerNames.length === 2 && typeof saveDuelResult === 'function') {
                        const p1 = leaderboardData[0].name;
                        const p2 = leaderboardData[1].name;
                        let winner = 'draw';
                        // Bij gelijke stand: winner blijft 'draw', anders naam van winnaar
                        if(leaderboardData[0].score > leaderboardData[1].score) {
                            winner = leaderboardData[0].name;
                        }
                        saveDuelResult('memory', p1, p2, winner);
                    }
                    // ----------------------------------------------

                    if(typeof showWinnerModal === 'function') { 
                        showWinnerModal(leaderboardData[0].name, leaderboardData); 
                    }
                }, 1000);
            }
        } else {
            // GEEN MATCH
            setTimeout(() => { 
                c1.classList.remove('flipped'); 
                c2.classList.remove('flipped'); 
                memoryState.flippedCards = []; 
                memoryState.lockBoard = false; 
                memSwitchPlayer(); 
            }, 1200);
        }
    }
}

function memSwitchPlayer() { 
    memoryState.currentPlayerIndex = (memoryState.currentPlayerIndex + 1) % memoryState.playerNames.length; 
    memUpdateActiveBadgeColor(); 
}

function memUpdateActiveBadgeColor() { 
    memoryState.playerNames.forEach((p, i) => { 
        let b = document.getElementById(`badge-${i}`); 
        if(b) { 
            const active = i === memoryState.currentPlayerIndex; 
            b.classList.toggle('active', active); 
            if(active) {
                b.style.borderColor = p.color;
                b.style.boxShadow = `0 0 15px ${p.color}`;
            } else {
                b.style.borderColor = 'transparent';
                b.style.boxShadow = 'none';
            }
        } 
    }); 
}
