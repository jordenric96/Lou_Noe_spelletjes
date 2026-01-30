// NIEUWE SPELLEN & STICKERS LOGICA

// Configuratie van afbeeldingen (Moet kloppen met Memory mapjes!)
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
    
    // FILTER: Pak alleen stickers die we nog NIET hebben
    const lockedStickers = allStickers.filter(s => !unlockedIds.includes(s.id));
    
    if (lockedStickers.length === 0) return null; // Alles al verzameld!
    
    // KANS: 50% kans op sticker bij winst (zet op > 0 om altijd te winnen tijdens testen)
    if (Math.random() > 0.5) { 
        const newSticker = lockedStickers[Math.floor(Math.random() * lockedStickers.length)];
        unlockedIds.push(newSticker.id);
        localStorage.setItem('myStickers', JSON.stringify(unlockedIds));
        return newSticker; // We geven het HELE sticker object terug om te tonen
    }
    return null; // Geen sticker deze keer
}

function openStickerBook() {
    const board = document.getElementById('game-board');
    const unlockedIds = getUnlockedStickers();
    const allStickers = generateAllStickers();
    
    let html = `<div class="sticker-header">Mijn Verzameling (${unlockedIds.length}/${allStickers.length})</div>`;
    html += '<div class="sticker-container">';
    
    if(unlockedIds.length === 0) {
        html += '<div class="empty-msg">Win spelletjes om stickers te verdienen!</div>';
    }
    
    // We tonen ALLE stickers (ook de dichte) zodat je ziet wat je mist
    allStickers.forEach(s => {
        const isUnlocked = unlockedIds.includes(s.id);
        if (isUnlocked) {
            html += `<div class="sticker-slot unlocked">
                        <img src="${s.src}" class="sticker-img" loading="lazy">
                     </div>`;
        } else {
            html += `<div class="sticker-slot locked">
                        <span class="sticker-lock-icon">🔒</span>
                     </div>`;
        }
    });
    
    html += '</div>';
    board.innerHTML = html;
}


// --- VANG DE ... (WHACK A MOLE) ---

let whackState = { player: null, score: 0, timer: 30, active: false, gridSize: 9, speed: 1000, moleTimer: null, gameTimer: null };

function startWhackGame() {
    const board = document.getElementById('game-board');
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
    whackState.player = null; whackState.speed = 900; whackState.gridSize = 9;
}

function setWhackPlayer(name, btn) {
    playSound('click'); whackState.player = name;
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('start-whack-btn').disabled = false;
    document.getElementById('start-whack-btn').innerText = "START " + name.toUpperCase() + " ▶️";
}

function setWhackDiff(diff, btn) {
    playSound('click');
    document.querySelectorAll('.group-size .option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    if(diff === 'easy') { whackState.gridSize = 4; whackState.speed = 1500; }
    else if(diff === 'medium') { whackState.gridSize = 9; whackState.speed = 900; }
    else if(diff === 'hard') { whackState.gridSize = 16; whackState.speed = 550; }
}

function runWhackGame() {
    playSound('win');
    const board = document.getElementById('game-board');
    whackState.score = 0; whackState.timer = 30; whackState.active = true;
    
    let gridClass = whackState.gridSize === 4 ? 'grid-2' : (whackState.gridSize === 16 ? 'grid-4' : 'grid-3');
    let gridHTML = '';
    for(let i=0; i<whackState.gridSize; i++) {
        gridHTML += `<div class="whack-hole" id="hole-${i}" onmousedown="whack(this)" ontouchstart="whack(this)"><div class="whack-character"></div></div>`;
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
    
    if(whackState.gameTimer) clearInterval(whackState.gameTimer);
    whackState.gameTimer = setInterval(() => {
        if(!whackState.active) return;
        whackState.timer--;
        const timeEl = document.getElementById('whack-time');
        if(timeEl) timeEl.innerText = whackState.timer;
        if(whackState.timer <= 0) endWhackGame();
    }, 1000);
    popUpMole();
}

function getRandomCharacterImage() {
    const themes = ['mario', 'pokemon']; // Gebruik deze thema's
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomNr = Math.floor(Math.random() * 10) + 1;
    return `assets/images/memory/${randomTheme}/${randomNr}.png`;
}

function popUpMole() {
    if(!whackState.active) return;
    const holes = document.querySelectorAll('.whack-hole');
    const randomIdx = Math.floor(Math.random() * holes.length);
    const hole = holes[randomIdx];
    const char = hole.querySelector('.whack-character');
    char.style.backgroundImage = `url('${getRandomCharacterImage()}')`;
    hole.classList.add('up');
    const duration = whackState.speed * (0.8 + Math.random() * 0.4); 
    whackState.moleTimer = setTimeout(() => {
        hole.classList.remove('up');
        if(whackState.active) setTimeout(popUpMole, Math.random() * 300);
    }, duration);
}

function whack(hole) {
    if(!whackState.active || !hole.classList.contains('up') || hole.classList.contains('whacked')) return;
    playSound('pop');
    hole.classList.remove('up'); hole.classList.add('whacked');
    setTimeout(() => hole.classList.remove('whacked'), 200);
    whackState.score++;
    document.getElementById('whack-score').innerText = whackState.score;
}

function endWhackGame() {
    whackState.active = false;
    clearInterval(whackState.gameTimer); clearTimeout(whackState.moleTimer);
    playSound('win');
    showWinnerModal(whackState.player, [{name: whackState.player, score: whackState.score + " ptn"}]);
}
function stopWhackGame() { whackState.active = false; clearInterval(whackState.gameTimer); clearTimeout(whackState.moleTimer); }


// --- SIMON ZEGT (Met Vriendjes) ---

let simonSequence = []; let playerSequence = []; let simonLevel = 0; let simonActive = false; let simonTheme = 'mario';

const simonThemes = {
    'mario':     { type: 'img', path: 'assets/images/memory/mario/', ext: 'png' },
    'pokemon':   { type: 'img', path: 'assets/images/memory/pokemon/', ext: 'png' },
    'studio100': { type: 'img', path: 'assets/images/memory/studio100/', ext: 'png' },
    'boerderij': { type: 'img', path: 'assets/images/memory/boerderij/', ext: 'png' },
    'kleuren':   { type: 'color', colors: ['#4CAF50', '#F44336', '#FFEB3B', '#2196F3'] }
};

function startSimonGame() {
    const board = document.getElementById('game-board');
    let themeHTML = '';
    const themesList = ['mario', 'pokemon', 'studio100', 'boerderij', 'kleuren'];
    
    themesList.forEach(key => {
        let label = key.charAt(0).toUpperCase() + key.slice(1);
        let icon = key === 'mario' ? '🍄' : (key === 'pokemon' ? '⚡' : (key === 'studio100' ? '🎈' : (key === 'boerderij' ? '🐮' : '🎨')));
        themeHTML += `<button class="option-btn" onclick="setSimonTheme('${key}', this)"><span>${icon}</span><span class="btn-label">${label}</span></button>`;
    });

    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-group" style="width:100%"><h3>Kies je vriendjes!</h3><div class="option-grid">${themeHTML}</div></div>
            <button id="start-simon-real" class="start-btn" onclick="initSimonPlay()" disabled>Kies een thema...</button>
        </div>
    `;
    setTimeout(() => { const btn = document.querySelector(`.option-btn[onclick="setSimonTheme('mario', this)"]`); if(btn) setSimonTheme('mario', btn); }, 10);
}

function setSimonTheme(key, btn) {
    playSound('click'); simonTheme = key;
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('start-simon-real').disabled = false;
    document.getElementById('start-simon-real').innerText = "START SIMON ▶️";
}

function initSimonPlay() {
    const board = document.getElementById('game-board');
    const highScore = localStorage.getItem('simonHighScore') || 0;
    let buttonsHTML = '';
    const t = simonThemes[simonTheme];
    
    for(let i=0; i<4; i++) {
        let style = t.type === 'color' ? `background-color: ${t.colors[i]};` : `background-image: url('${t.path}${i+1}.${t.ext}'); background-size: cover; background-position: center; border: 4px solid white;`;
        buttonsHTML += `<button class="simon-btn" id="btn-${i}" style="${style}" onclick="handleSimonInput(${i})"></button>`;
    }

    board.innerHTML = `
        <div class="simon-container">
            <div class="simon-info"><div class="simon-score">Score: <span id="simon-current-score">0</span></div><div class="simon-highscore">Record: ${highScore}</div><div id="simon-msg" class="simon-message">Let op...</div></div>
            <div class="simon-board theme-${simonTheme}">${buttonsHTML}</div>
            <button class="start-btn" id="simon-action-btn" onclick="nextSimonRound()" style="width:auto; padding: 10px 30px;">Start!</button>
        </div>
    `;
    simonSequence = []; simonLevel = 0; simonActive = false;
}

function nextSimonRound() {
    document.getElementById('simon-action-btn').style.display = 'none';
    simonLevel++; playerSequence = [];
    document.getElementById('simon-current-score').innerText = simonLevel - 1;
    document.getElementById('simon-msg').innerText = "Kijk goed...";
    simonSequence.push(Math.floor(Math.random() * 4));
    setTimeout(playSequence, 500);
}

function playSequence() {
    simonActive = false; let i = 0;
    const interval = setInterval(() => {
        activateSimonBtn(simonSequence[i]); i++;
        if (i >= simonSequence.length) { clearInterval(interval); simonActive = true; document.getElementById('simon-msg').innerText = "Jouw beurt!"; }
    }, 800);
}

function activateSimonBtn(index) {
    const btn = document.getElementById(`btn-${index}`);
    if(!btn) return;
    btn.classList.add('lit'); playSound('pop');
    setTimeout(() => btn.classList.remove('lit'), 400);
}

function handleSimonInput(index) {
    if (!simonActive) return;
    activateSimonBtn(index); playerSequence.push(index);
    if (playerSequence[playerSequence.length - 1] !== simonSequence[playerSequence.length - 1]) {
        playSound('lose'); document.getElementById('simon-msg').innerText = "Oei, foutje!"; simonActive = false;
        const currentHigh = localStorage.getItem('simonHighScore') || 0;
        if ((simonLevel - 1) > currentHigh) localStorage.setItem('simonHighScore', simonLevel - 1);
        const actionBtn = document.getElementById('simon-action-btn'); actionBtn.innerText = "Opnieuw"; actionBtn.style.display = 'block'; actionBtn.onclick = initSimonPlay;
        return;
    }
    if (playerSequence.length === simonSequence.length) {
        simonActive = false; document.getElementById('simon-msg').innerText = "Goed zo! 👍"; playSound('win'); setTimeout(nextSimonRound, 1000);
    }
}
function stopSimonGame() { simonActive = false; }

// --- TEKENBORD ---
let isDrawing = false; 
let ctx; 
let drawColor = '#000000'; 
let drawSize = 5; // Standaard dikte

function startDrawing() {
    const board = document.getElementById('game-board');
    
    // HTML met KLEUREN, LIJNTJE, DIKTES en GUM
    board.innerHTML = `
        <div class="drawing-container">
            <div class="drawing-controls">
                <div class="color-swatch active" style="background:black" onclick="setColor('black', this)"></div>
                <div class="color-swatch" style="background:#F44336" onclick="setColor('#F44336', this)"></div> <div class="color-swatch" style="background:#2196F3" onclick="setColor('#2196F3', this)"></div> <div class="color-swatch" style="background:#4CAF50" onclick="setColor('#4CAF50', this)"></div> <div class="color-swatch" style="background:#FFEB3B" onclick="setColor('#FFEB3B', this)"></div> <div class="color-swatch" style="background:#9C27B0" onclick="setColor('#9C27B0', this)"></div> <div class="control-divider"></div>
                
                <div class="size-btn active" onclick="setBrushSize(5, this)"><div class="dot dot-s"></div></div>
                <div class="size-btn" onclick="setBrushSize(15, this)"><div class="dot dot-m"></div></div>
                <div class="size-btn" onclick="setBrushSize(30, this)"><div class="dot dot-l"></div></div>

                <div class="control-divider"></div>

                <button class="tool-btn" onclick="clearCanvas()">🗑️</button>
            </div>
            <canvas id="drawCanvas"></canvas>
        </div>
    `;
    
    const canvas = document.getElementById('drawCanvas');
    const container = document.querySelector('.drawing-container');
    
    // Canvas grootte instellen
    canvas.width = container.clientWidth * 0.95; 
    canvas.height = container.clientHeight * 0.85;
    
    ctx = canvas.getContext('2d'); 
    ctx.lineCap = 'round'; 
    ctx.lineJoin = 'round';
    
    // Event Listeners (Touch & Muis)
    canvas.addEventListener('mousedown', startDraw); 
    canvas.addEventListener('touchstart', startDraw, {passive: false});
    canvas.addEventListener('mousemove', draw); 
    canvas.addEventListener('touchmove', draw, {passive: false});
    canvas.addEventListener('mouseup', stopDraw); 
    canvas.addEventListener('touchend', stopDraw);
}

function startDraw(e) { isDrawing = true; draw(e); }
function stopDraw() { isDrawing = false; ctx.beginPath(); }

function draw(e) { 
    if (!isDrawing) return; 
    e.preventDefault(); 
    
    const canvas = document.getElementById('drawCanvas');
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; 
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; 
    
    ctx.lineWidth = drawSize; // Hier gebruiken we de gekozen dikte
    ctx.strokeStyle = drawColor; 
    
    ctx.lineTo(x, y); 
    ctx.stroke(); 
    ctx.beginPath(); 
    ctx.moveTo(x, y); 
}

function setColor(color, btn) { 
    if(typeof playSound === 'function') playSound('click');
    drawColor = color; 
    document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active')); 
    btn.classList.add('active'); 
}

function setBrushSize(size, btn) {
    if(typeof playSound === 'function') playSound('click');
    drawSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function clearCanvas() { 
    if(typeof playSound === 'function') playSound('pop');
    const canvas = document.getElementById('drawCanvas'); 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
}
