// NIEUWE SPELLEN & STICKERS LOGICA

// Configuratie van je afbeeldingen mappen (moet kloppen met je mappenstructuur!)
const assetConfig = {
    'mario':     { count: 15, ext: 'png' },
    'pokemon':   { count: 15, ext: 'png' },
    'studio100': { count: 15, ext: 'png' },
    'boerderij': { count: 15, ext: 'png' },
    'dino':      { count: 15, ext: 'jpg' },
    'marvel':    { count: 15, ext: 'jpg' },
    'natuur':    { count: 15, ext: 'jpg' },
    'beroepen':  { count: 15, ext: 'jpg' }
};

// --- STICKERBOEK LOGICA ---

function generateAllStickers() {
    let allStickers = [];
    // Loop door alle thema's en maak voor elk plaatje een sticker ID
    for (const [theme, data] of Object.entries(assetConfig)) {
        for (let i = 1; i <= data.count; i++) {
            allStickers.push({
                id: `${theme}-${i}`,
                src: `assets/images/memory/${theme}/${i}.${data.ext}`
            });
        }
    }
    return allStickers;
}

function getUnlockedStickers() {
    const stored = localStorage.getItem('myStickers');
    return stored ? JSON.parse(stored) : [];
}

function unlockRandomSticker() {
    const allStickers = generateAllStickers();
    const unlockedIds = getUnlockedStickers();
    
    // Filter stickers die we nog NIET hebben
    const lockedStickers = allStickers.filter(s => !unlockedIds.includes(s.id));
    
    if (lockedStickers.length === 0) return false; // Alles verzameld!
    
    // 40% kans op een sticker bij winst
    if (Math.random() > 0.6) { 
        const newSticker = lockedStickers[Math.floor(Math.random() * lockedStickers.length)];
        unlockedIds.push(newSticker.id);
        localStorage.setItem('myStickers', JSON.stringify(unlockedIds));
        return true; // Sticker verdiend!
    }
    return false;
}

function openStickerBook() {
    const board = document.getElementById('game-board');
    const unlockedIds = getUnlockedStickers();
    const allStickers = generateAllStickers();
    
    let html = '<div class="sticker-header">Mijn Verzameling (' + unlockedIds.length + '/' + allStickers.length + ')</div>';
    html += '<div class="sticker-container">';
    
    if(unlockedIds.length === 0) {
        html += '<div class="empty-msg">Win spelletjes om stickers te verdienen!</div>';
    }
    
    // Laat eerst de verzamelde stickers zien
    // We tonen alleen de stickers die je hebt, om het overzichtelijk te houden (of placeholders voor de rest)
    // Hier tonen we ALLES (ook de dichte) zodat je ziet wat je mist
    
    allStickers.forEach(s => {
        const isUnlocked = unlockedIds.includes(s.id);
        if (isUnlocked) {
            html += `<div class="sticker-slot unlocked">
                        <img src="${s.src}" class="sticker-img" loading="lazy">
                     </div>`;
        } else {
            // Vergrendeld slotje
            html += `<div class="sticker-slot locked">
                        <span class="sticker-lock-icon">🔒</span>
                     </div>`;
        }
    });
    
    html += '</div>';
    board.innerHTML = html;
}


// --- VANG DE ... (WHACK A MOLE) ---

let whackState = {
    player: null,
    score: 0,
    timer: 30,
    active: false,
    gridSize: 9, // 3x3 default
    speed: 1000,
    moleTimer: null,
    gameTimer: null
};

// 1. SETUP SCHERM VOOR VANG ZE
function startWhackGame() {
    const board = document.getElementById('game-board');
    
    // Hergebruik speler logica (eenvoudige versie hier)
    // We bouwen de HTML voor de setup
    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-columns">
                <div class="setup-group group-players">
                    <h3>Wie speelt?</h3>
                    <div class="option-grid">
                        <button class="option-btn player-btn" onclick="setWhackPlayer('Lou', this)"><span>👦🏼</span><span class="btn-label">Lou</span></button>
                        <button class="option-btn player-btn" onclick="setWhackPlayer('Noé', this)"><span>👶🏼</span><span class="btn-label">Noé</span></button>
                        <button class="option-btn player-btn" onclick="setWhackPlayer('Mama', this)"><span>👩🏻</span><span class="btn-label">Mama</span></button>
                        <button class="option-btn player-btn" onclick="setWhackPlayer('Papa', this)"><span>👨🏻</span><span class="btn-label">Papa</span></button>
                    </div>
                </div>
                <div class="setup-group group-size">
                    <h3>Niveau</h3>
                    <div class="option-grid">
                        <button class="option-btn" onclick="setWhackDiff('easy', this)"><span>🟢</span><span class="btn-label">Makkelijk</span></button>
                        <button class="option-btn selected" onclick="setWhackDiff('medium', this)"><span>🟠</span><span class="btn-label">Normaal</span></button>
                        <button class="option-btn" onclick="setWhackDiff('hard', this)"><span>🔴</span><span class="btn-label">Snel!</span></button>
                    </div>
                </div>
            </div>
            <button id="start-whack-btn" class="start-btn" onclick="runWhackGame()" disabled>Kies een speler...</button>
        </div>
    `;
    
    whackState.player = null;
    whackState.speed = 1000;
    whackState.gridSize = 9; // Medium default
}

function setWhackPlayer(name, btn) {
    playSound('click');
    whackState.player = name;
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('start-whack-btn').disabled = false;
    document.getElementById('start-whack-btn').innerText = "START " + name.toUpperCase() + " ▶️";
}

function setWhackDiff(diff, btn) {
    playSound('click');
    document.querySelectorAll('.group-size .option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    if(diff === 'easy') {
        whackState.gridSize = 4; // 2x2
        whackState.speed = 1500; // Traag
    } else if(diff === 'medium') {
        whackState.gridSize = 9; // 3x3
        whackState.speed = 900;
    } else if(diff === 'hard') {
        whackState.gridSize = 16; // 4x4
        whackState.speed = 550; // Heel snel
    }
}

// 2. HET SPEL ZELF
function runWhackGame() {
    playSound('win');
    const board = document.getElementById('game-board');
    whackState.score = 0;
    whackState.timer = 30;
    whackState.active = true;
    
    // Grid maken op basis van gridSize
    let gridHTML = '';
    // Bepaal CSS class voor grid kolommen
    let gridClass = 'grid-3';
    if(whackState.gridSize === 4) gridClass = 'grid-2';
    if(whackState.gridSize === 16) gridClass = 'grid-4';

    for(let i=0; i<whackState.gridSize; i++) {
        gridHTML += `<div class="whack-hole" id="hole-${i}" onmousedown="whack(this)" ontouchstart="whack(this)">
                        <div class="whack-character"></div>
                     </div>`;
    }
    
    board.innerHTML = `
        <div class="whack-container">
            <div class="whack-score-board">
                <span>Speler: ${whackState.player}</span>
                <span>Tijd: <span id="whack-time">30</span>s</span>
                <span>Score: <span id="whack-score">0</span></span>
            </div>
            <div class="whack-grid ${gridClass}">${gridHTML}</div>
        </div>
    `;
    
    // Start Game Timer
    if(whackState.gameTimer) clearInterval(whackState.gameTimer);
    whackState.gameTimer = setInterval(() => {
        if(!whackState.active) return;
        whackState.timer--;
        const timeEl = document.getElementById('whack-time');
        if(timeEl) timeEl.innerText = whackState.timer;
        
        if(whackState.timer <= 0) {
            endWhackGame();
        }
    }, 1000);
    
    // Start Molletjes
    popUpMole();
}

function getRandomCharacterImage() {
    // Kies willekeurig tussen Mario en Pokemon (omdat we die zeker hebben)
    const themes = ['mario', 'pokemon'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomNr = Math.floor(Math.random() * 10) + 1; // 1 tot 10
    return `assets/images/memory/${randomTheme}/${randomNr}.png`;
}

function popUpMole() {
    if(!whackState.active) return;
    
    // Kies willekeurig gat
    const holes = document.querySelectorAll('.whack-hole');
    const randomIdx = Math.floor(Math.random() * holes.length);
    const hole = holes[randomIdx];
    
    // Zet plaatje
    const char = hole.querySelector('.whack-character');
    char.style.backgroundImage = `url('${getRandomCharacterImage()}')`;
    
    hole.classList.add('up');
    
    // Verdwijn snelheid
    // Variatie: soms iets sneller of trager dan de ingestelde speed
    const duration = whackState.speed * (0.8 + Math.random() * 0.4); 
    
    whackState.moleTimer = setTimeout(() => {
        hole.classList.remove('up');
        if(whackState.active) {
            // Korte pauze voor de volgende
            const pause = Math.random() * 300; 
            setTimeout(popUpMole, pause);
        }
    }, duration);
}

function whack(hole) {
    if(!whackState.active || !hole.classList.contains('up')) return;
    
    // Voorkom dubbel klikken
    if(hole.classList.contains('whacked')) return;
    
    playSound('pop');
    hole.classList.remove('up');
    hole.classList.add('whacked'); // Visuele feedback
    setTimeout(() => hole.classList.remove('whacked'), 200);

    whackState.score++;
    document.getElementById('whack-score').innerText = whackState.score;
}

function endWhackGame() {
    whackState.active = false;
    clearInterval(whackState.gameTimer);
    clearTimeout(whackState.moleTimer);
    
    playSound('win');
    showWinnerModal(whackState.player, [{name: whackState.player, score: whackState.score + " ptn"}]);
}

function stopWhackGame() {
    whackState.active = false;
    clearInterval(whackState.gameTimer);
    clearTimeout(whackState.moleTimer);
}


// --- SIMON ZEGT (Ongewijzigd, maar nodig voor volledigheid) ---
let simonSequence = [];
let playerSequence = [];
let simonLevel = 0;
let simonActive = false;

function startSimonGame() {
    const board = document.getElementById('game-board');
    const highScore = localStorage.getItem('simonHighScore') || 0;
    
    board.innerHTML = `
        <div class="simon-container">
            <div class="simon-info">
                <div class="simon-score">Score: <span id="simon-current-score">0</span></div>
                <div class="simon-highscore">Record: ${highScore}</div>
                <div id="simon-msg" class="simon-message">Let op...</div>
            </div>
            <div class="simon-board">
                <button class="simon-btn simon-green" id="btn-0" onclick="handleSimonInput(0)"></button>
                <button class="simon-btn simon-red" id="btn-1" onclick="handleSimonInput(1)"></button>
                <button class="simon-btn simon-yellow" id="btn-2" onclick="handleSimonInput(2)"></button>
                <button class="simon-btn simon-blue" id="btn-3" onclick="handleSimonInput(3)"></button>
            </div>
            <button class="start-btn" onclick="nextSimonRound()" style="width:auto; padding: 10px 30px;">Start</button>
        </div>
    `;
    simonSequence = []; simonLevel = 0; simonActive = false;
}

function nextSimonRound() {
    simonLevel++; playerSequence = [];
    document.getElementById('simon-current-score').innerText = simonLevel - 1;
    document.getElementById('simon-msg').innerText = "Kijk goed...";
    simonSequence.push(Math.floor(Math.random() * 4));
    playSequence();
}

function playSequence() {
    simonActive = false;
    let i = 0;
    const interval = setInterval(() => {
        activateSimonBtn(simonSequence[i]);
        i++;
        if (i >= simonSequence.length) {
            clearInterval(interval);
            simonActive = true;
            document.getElementById('simon-msg').innerText = "Jouw beurt!";
        }
    }, 800);
}

function activateSimonBtn(index) {
    const btn = document.getElementById(`btn-${index}`);
    btn.classList.add('lit'); playSound('pop');
    setTimeout(() => btn.classList.remove('lit'), 400);
}

function handleSimonInput(index) {
    if (!simonActive) return;
    activateSimonBtn(index);
    playerSequence.push(index);
    if (playerSequence[playerSequence.length - 1] !== simonSequence[playerSequence.length - 1]) {
        playSound('lose');
        document.getElementById('simon-msg').innerText = "Fout! Game Over.";
        simonActive = false;
        const currentHigh = localStorage.getItem('simonHighScore') || 0;
        if ((simonLevel - 1) > currentHigh) localStorage.setItem('simonHighScore', simonLevel - 1);
        setTimeout(() => showWinnerModal("Simon", [{name: "Jij", score: simonLevel - 1}]), 1000);
        return;
    }
    if (playerSequence.length === simonSequence.length) {
        simonActive = false;
        document.getElementById('simon-msg').innerText = "Goed zo!";
        setTimeout(nextSimonRound, 1000);
    }
}
function stopSimonGame() { simonActive = false; }

// --- TEKENBORD (Kort) ---
let isDrawing = false; let ctx; let drawColor = '#000000'; let drawSize = 5;
function startDrawing() {
    const board = document.getElementById('game-board');
    board.innerHTML = `<div class="drawing-container"><div class="drawing-controls"><div class="color-swatch active" style="background:black" onclick="setColor('black', this)"></div><div class="color-swatch" style="background:red" onclick="setColor('red', this)"></div><div class="color-swatch" style="background:blue" onclick="setColor('blue', this)"></div><div class="color-swatch" style="background:green" onclick="setColor('green', this)"></div><div class="color-swatch" style="background:yellow" onclick="setColor('yellow', this)"></div><button class="tool-btn" onclick="clearCanvas()">🗑️</button></div><canvas id="drawCanvas"></canvas></div>`;
    const canvas = document.getElementById('drawCanvas');
    const container = document.querySelector('.drawing-container');
    canvas.width = container.clientWidth * 0.95; canvas.height = container.clientHeight * 0.8;
    ctx = canvas.getContext('2d'); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    canvas.addEventListener('mousedown', startDraw); canvas.addEventListener('touchstart', startDraw, {passive: false});
    canvas.addEventListener('mousemove', draw); canvas.addEventListener('touchmove', draw, {passive: false});
    canvas.addEventListener('mouseup', stopDraw); canvas.addEventListener('touchend', stopDraw);
}
function startDraw(e) { isDrawing = true; draw(e); }
function stopDraw() { isDrawing = false; ctx.beginPath(); }
function draw(e) { if (!isDrawing) return; e.preventDefault(); const canvas = document.getElementById('drawCanvas'); const rect = canvas.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; ctx.lineWidth = drawSize; ctx.strokeStyle = drawColor; ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y); }
function setColor(color, btn) { drawColor = color; document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
function clearCanvas() { const canvas = document.getElementById('drawCanvas'); ctx.clearRect(0, 0, canvas.width, canvas.height); playSound('pop'); }
