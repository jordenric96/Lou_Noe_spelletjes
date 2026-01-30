// --- STICKERBOEK LOGICA ---
const stickersList = [
    {id: 'mario', icon: '🍄'}, {id: 'star', icon: '⭐'}, {id: 'car', icon: '🚗'},
    {id: 'pika', icon: '⚡'}, {id: 'heart', icon: '❤️'}, {id: 'crown', icon: '👑'},
    {id: 'dog', icon: '🐶'}, {id: 'cat', icon: '🐱'}, {id: 'rocket', icon: '🚀'},
    {id: 'ball', icon: '⚽'}, {id: 'music', icon: '🎵'}, {id: 'sun', icon: '☀️'}
];

function getUnlockedStickers() {
    const stored = localStorage.getItem('myStickers');
    return stored ? JSON.parse(stored) : [];
}

function unlockRandomSticker() {
    const unlocked = getUnlockedStickers();
    const locked = stickersList.filter(s => !unlocked.includes(s.id));
    
    if (locked.length === 0) return false; // Alles al verzameld!
    
    // 30% kans op sticker (of zet op 100% om te testen)
    if (Math.random() > 0.1) { 
        const newSticker = locked[Math.floor(Math.random() * locked.length)];
        unlocked.push(newSticker.id);
        localStorage.setItem('myStickers', JSON.stringify(unlocked));
        return true; // Sticker verdiend!
    }
    return false;
}

function openStickerBook() {
    const board = document.getElementById('game-board');
    const unlocked = getUnlockedStickers();
    
    let html = '<div class="sticker-container">';
    if(unlocked.length === 0) {
        html += '<div class="empty-msg">Speel spelletjes om stickers te verdienen!</div>';
    }
    
    stickersList.forEach(s => {
        const isUnlocked = unlocked.includes(s.id);
        if (isUnlocked) {
            html += `<div class="sticker-slot unlocked"><span style="font-size:3rem">${s.icon}</span></div>`;
        } else {
            html += `<div class="sticker-slot"><span class="sticker-locked">🔒</span></div>`;
        }
    });
    html += '</div>';
    board.innerHTML = html;
}


// --- SIMON ZEGT (Met Score) ---
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
    simonSequence = [];
    simonLevel = 0;
    simonActive = false;
}

function nextSimonRound() {
    simonLevel++;
    playerSequence = [];
    document.getElementById('simon-current-score').innerText = simonLevel - 1;
    document.getElementById('simon-msg').innerText = "Kijk goed...";
    
    // Voeg willekeurige kleur toe
    simonSequence.push(Math.floor(Math.random() * 4));
    
    playSequence();
}

function playSequence() {
    simonActive = false; // Speler mag niet klikken
    let i = 0;
    const interval = setInterval(() => {
        activateSimonBtn(simonSequence[i]);
        i++;
        if (i >= simonSequence.length) {
            clearInterval(interval);
            simonActive = true;
            document.getElementById('simon-msg').innerText = "Jouw beurt!";
        }
    }, 800); // Snelheid
}

function activateSimonBtn(index) {
    const btn = document.getElementById(`btn-${index}`);
    btn.classList.add('lit');
    playSound('pop'); // Gebruik synthesizer geluid
    setTimeout(() => btn.classList.remove('lit'), 400);
}

function handleSimonInput(index) {
    if (!simonActive) return;
    
    activateSimonBtn(index);
    playerSequence.push(index);
    
    // Check of juist
    if (playerSequence[playerSequence.length - 1] !== simonSequence[playerSequence.length - 1]) {
        // FOUT!
        playSound('lose');
        document.getElementById('simon-msg').innerText = "Fout! Game Over.";
        simonActive = false;
        
        // Save high score
        const currentHigh = localStorage.getItem('simonHighScore') || 0;
        if ((simonLevel - 1) > currentHigh) {
            localStorage.setItem('simonHighScore', simonLevel - 1);
        }
        
        setTimeout(() => showWinnerModal("Simon", [{name: "Jij", score: simonLevel - 1}]), 1000);
        return;
    }
    
    // Hele reeks goed?
    if (playerSequence.length === simonSequence.length) {
        simonActive = false;
        document.getElementById('simon-msg').innerText = "Goed zo!";
        setTimeout(nextSimonRound, 1000);
    }
}

function stopSimonGame() { simonActive = false; }


// --- VANG DE ... (WHACK A MOLE) ---
let whackScore = 0;
let whackTimer = 30;
let whackActive = false;
let whackInterval = null;

function startWhackGame() {
    const board = document.getElementById('game-board');
    whackScore = 0;
    whackTimer = 30;
    
    let gridHTML = '';
    for(let i=0; i<9; i++) gridHTML += `<div class="whack-hole" id="hole-${i}"><div class="whack-character" onclick="whack(this)"></div></div>`;
    
    board.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; height:100%">
            <div class="whack-score-board">
                <span>Tijd: <span id="whack-time">30</span>s</span>
                <span>Score: <span id="whack-score">0</span></span>
            </div>
            <div class="whack-grid">${gridHTML}</div>
            <button class="start-btn" onclick="runWhackGame()" style="margin-top:10px; width:auto;">Start!</button>
        </div>
    `;
}

function runWhackGame() {
    whackActive = true;
    document.querySelector('.start-btn').disabled = true;
    
    // Timer
    const timerInt = setInterval(() => {
        if(!whackActive) { clearInterval(timerInt); return; }
        whackTimer--;
        document.getElementById('whack-time').innerText = whackTimer;
        if(whackTimer <= 0) {
            clearInterval(timerInt);
            stopWhackGame();
            showWinnerModal("Vang ze!", [{name: "Jij", score: whackScore + " ptn"}]);
        }
    }, 1000);
    
    // Mollen laten opkomen
    popUpMole();
}

function popUpMole() {
    if(!whackActive) return;
    const time = randomTime(500, 1000);
    const hole = randomHole(document.querySelectorAll('.whack-hole'));
    
    // Zet plaatje (kan Mario, Pokemon, etc zijn - hier gebruiken we paddenstoel emoji voor simpelheid of een image)
    const char = hole.querySelector('.whack-character');
    char.style.backgroundImage = "url('assets/images/memory/mario/cover.png')"; // Hergebruik Mario cover
    
    hole.classList.add('up');
    
    setTimeout(() => {
        hole.classList.remove('up');
        if(whackActive) popUpMole();
    }, time);
}

function whack(element) {
    if(!element.parentNode.classList.contains('up')) return;
    playSound('pop');
    whackScore++;
    document.getElementById('whack-score').innerText = whackScore;
    element.parentNode.classList.remove('up');
}

function randomTime(min, max) { return Math.round(Math.random() * (max - min) + min); }
let lastHole;
function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) return randomHole(holes);
    lastHole = hole;
    return hole;
}
function stopWhackGame() { whackActive = false; }


// --- TEKENBORD ---
let isDrawing = false;
let ctx;
let drawColor = '#000000';
let drawSize = 5;

function startDrawing() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="drawing-container">
            <div class="drawing-controls">
                <div class="color-swatch active" style="background:black" onclick="setColor('black', this)"></div>
                <div class="color-swatch" style="background:red" onclick="setColor('red', this)"></div>
                <div class="color-swatch" style="background:blue" onclick="setColor('blue', this)"></div>
                <div class="color-swatch" style="background:green" onclick="setColor('green', this)"></div>
                <div class="color-swatch" style="background:yellow" onclick="setColor('yellow', this)"></div>
                <button class="tool-btn" onclick="clearCanvas()">🗑️</button>
            </div>
            <canvas id="drawCanvas"></canvas>
        </div>
    `;
    
    const canvas = document.getElementById('drawCanvas');
    const container = document.querySelector('.drawing-container');
    canvas.width = container.clientWidth * 0.95;
    canvas.height = container.clientHeight * 0.8;
    
    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Events
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('touchstart', startDraw, {passive: false});
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchmove', draw, {passive: false});
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('touchend', stopDraw);
}

function startDraw(e) {
    isDrawing = true;
    draw(e);
}
function stopDraw() {
    isDrawing = false;
    ctx.beginPath();
}
function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = document.getElementById('drawCanvas');
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    
    ctx.lineWidth = drawSize;
    ctx.strokeStyle = drawColor;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function setColor(color, btn) {
    drawColor = color;
    document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}
function clearCanvas() {
    const canvas = document.getElementById('drawCanvas');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    playSound('pop');
}
