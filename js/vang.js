// VANG.JS - MET SPELERS, TIJD & KLIK STATS
console.log("Vang.js geladen (Competitief)...");

let whackState = {
    score: 0, lastHole: null, timeUp: false, 
    scoreGoal: 10, // Aantal sterren om te winnen
    speed: 1000,
    difficulty: 'medium', 
    validImages: [],
    peepTimer: null,
    // NIEUW:
    currentPlayer: null,
    startTime: 0,
    totalClicks: 0,
    timerInterval: null
};

const bombSVG = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💣</text></svg>`;
const poopSVG = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💩</text></svg>`;

// --- 1. SETUP & SPELER KIEZEN ---
async function startWhackGame() {
    if(whackState.peepTimer) clearTimeout(whackState.peepTimer);
    if(whackState.timerInterval) clearInterval(whackState.timerInterval);

    const board = document.getElementById('game-board');
    // Reset state
    whackState.currentPlayer = null;
    whackState.validImages = []; // Wordt gevuld...

    // Plaatjes voorladen (uit memory thema's)
    if(typeof memThemes !== 'undefined') {
        let allPool = [];
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=15; i++) allPool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        // Pak random 20 plaatjes zonder zware check om het snel te houden
        whackState.validImages = allPool.sort(() => 0.5 - Math.random()).slice(0, 20);
    }
    if(whackState.validImages.length === 0) whackState.validImages = ['assets/images/icon.png'];

    renderWhackSetup(board);
}

function renderWhackSetup(board) {
    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-group">
                <h3>1. Wie gaat er meppen?</h3>
                <div class="name-row">
                    <button class="player-btn" onclick="vangSelectPlayer('Lou', this)">👦🏻 Lou</button>
                    <button class="player-btn" onclick="vangSelectPlayer('Noé', this)">👶🏼 Noé</button>
                    <button class="player-btn" onclick="vangSelectPlayer('Oliver', this)">👦🏼 Oliver</button>
                    <button class="player-btn" onclick="vangSelectPlayer('Manon', this)">👧🏼 Manon</button>
                    <button class="player-btn" onclick="vangSelectPlayer('Lore', this)">👩🏻 Lore</button>
                    <button class="player-btn" onclick="vangSelectPlayer('Jorden', this)">🧔🏻 Jorden</button>
                    <button class="player-btn" onclick="vangSelectPlayer('Bert', this)">👨🏻 Bert</button>
                    <button class="player-btn" onclick="vangSelectPlayer('Karen', this)">👩🏼 Karen</button>
                </div>
            </div>

            <div class="setup-group">
                <h3>2. Kies Niveau</h3>
                <div class="level-row">
                    <div class="level-card-btn easy" onclick="vangSetDiff('easy', this)">
                        <div class="level-icon">🟢</div>
                        <div class="level-text">Makkelijk</div>
                        <div class="level-sub">4 Gaten<br>(Geen 💣)</div>
                    </div>
                    <div class="level-card-btn medium selected" onclick="vangSetDiff('medium', this)">
                        <div class="level-icon">🟠</div>
                        <div class="level-text">Normaal</div>
                        <div class="level-sub">9 Gaten</div>
                    </div>
                    <div class="level-card-btn hard" onclick="vangSetDiff('hard', this)">
                        <div class="level-icon">🔴</div>
                        <div class="level-text">Moeilijk</div>
                        <div class="level-sub">12 Gaten</div>
                    </div>
                </div>
            </div>

            <div class="bottom-actions">
                <button id="vang-start-btn" class="start-btn" onclick="initWhackGame()" disabled>KIES EERST EEN NAAM...</button>
                <button class="tool-btn" onclick="location.reload()">⬅ Menu</button>
            </div>
        </div>`;
    whackState.difficulty = 'medium'; 
}

function vangSelectPlayer(name, btn) {
    if(typeof playSound === 'function') playSound('click');
    whackState.currentPlayer = name;
    
    // Visuele update
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending');
    
    // Knop aanzetten
    const startBtn = document.getElementById('vang-start-btn');
    if(startBtn) {
        startBtn.disabled = false;
        startBtn.innerText = "START HET SPEL! 🔨";
    }
}

function vangSetDiff(diff, btn) { 
    if(typeof playSound === 'function') playSound('click'); 
    whackState.difficulty = diff; 
    document.querySelectorAll('.level-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// --- 2. HET SPEL ---
function initWhackGame() {
    if(typeof playSound === 'function') playSound('win');
    if(whackState.peepTimer) clearTimeout(whackState.peepTimer);

    const board = document.getElementById('game-board');
    
    // Reset variabelen
    whackState.score = 0; 
    whackState.timeUp = false; 
    whackState.totalClicks = 0;
    whackState.startTime = Date.now(); // Start de klok

    let holesCount = 9; let gridClass = 'medium';
    if (whackState.difficulty === 'easy') { holesCount = 4; gridClass = 'easy'; whackState.speed = 1500; } 
    else if (whackState.difficulty === 'hard') { holesCount = 12; gridClass = 'hard'; whackState.speed = 700; } 
    else { whackState.speed = 1000; }

    let holesHTML = '';
    for(let i=0; i<holesCount; i++) {
        holesHTML += `<div class="hole" id="hole-${i}" onclick="bonk(this)"><img src="" class="mole-img" id="img-${i}"></div>`;
    }

    let starsHTML = '';
    for(let i=1; i<=10; i++) starsHTML += `<span id="star-${i}" class="star-icon">★</span>`;

    board.innerHTML = `
        <div class="whack-game-container">
            <div class="whack-header">
                <div class="header-top">
                    <button class="tool-btn" style="width:auto; padding:5px 10px;" onclick="startWhackGame()">⬅ Stop</button>
                    <div style="text-align:center;">
                        <div style="font-size:0.8rem; color:#555;">${whackState.currentPlayer}</div>
                        <div id="vang-timer" style="font-weight:bold; font-size:1.2rem; color:#333;">0.0s</div>
                    </div>
                    <div style="font-size:0.9rem;">Kliks: <span id="vang-clicks">0</span></div>
                </div>
                <div class="star-tracker">${starsHTML}</div>
            </div>
            <div class="whack-grid ${gridClass}">${holesHTML}</div>
        </div>`;
    
    // Start de timer weergave
    whackState.timerInterval = setInterval(() => {
        const delta = (Date.now() - whackState.startTime) / 1000;
        const timerEl = document.getElementById('vang-timer');
        if(timerEl) timerEl.innerText = delta.toFixed(1) + 's';
    }, 100);

    peep();
}

function updateVangStars() {
    for(let i=1; i<=10; i++) {
        const star = document.getElementById(`star-${i}`);
        if(star) {
            if (i <= whackState.score) star.classList.add('active');
            else star.classList.remove('active');
        }
    }
}

function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === whackState.lastHole) return randomHole(holes);
    whackState.lastHole = hole;
    return hole;
}

function peep() {
    if(whackState.timeUp) return;
    if(whackState.score >= whackState.scoreGoal) return; 

    const holes = document.querySelectorAll('.hole');
    const hole = randomHole(holes);
    const imgEl = hole.querySelector('.mole-img');
    
    // Geen bommen bij easy
    let isBad = false;
    if (whackState.difficulty !== 'easy') isBad = Math.random() < 0.3;

    if (isBad) {
        const isBomb = Math.random() > 0.5;
        if(isBomb) { imgEl.src = bombSVG; imgEl.dataset.type = "bomb"; } 
        else { imgEl.src = poopSVG; imgEl.dataset.type = "poop"; }
    } else {
        const randomImg = whackState.validImages[Math.floor(Math.random() * whackState.validImages.length)];
        imgEl.src = randomImg; imgEl.dataset.type = "good";
    }

    hole.classList.add('up');
    let time = whackState.speed * (0.8 + Math.random() * 0.4); 

    whackState.peepTimer = setTimeout(() => {
        hole.classList.remove('up');
        if (!whackState.timeUp && whackState.score < whackState.scoreGoal) peep();
    }, time);
}

function bonk(hole) {
    // We tellen ELKE klik, ook als je mis slaat (op een leeg gat of bom)
    whackState.totalClicks++;
    document.getElementById('vang-clicks').innerText = whackState.totalClicks;

    if(!hole.classList.contains('up')) return; 
    
    const imgEl = hole.querySelector('.mole-img');
    const type = imgEl.dataset.type;

    if(type === "bomb" || type === "poop") {
        if(typeof playSound === 'function') playSound('error'); 
        hole.classList.remove('up'); 
        whackState.score = Math.max(0, whackState.score - 1);
        document.querySelector('.whack-game-container').style.backgroundColor = "#F44336";
        setTimeout(()=>document.querySelector('.whack-game-container').style.backgroundColor = "", 200);
    } else {
        if(typeof playSound === 'function') playSound('pop'); 
        hole.classList.remove('up'); 
        whackState.score++;
        whackState.speed = Math.max(400, whackState.speed - 20);
        
        if(whackState.score >= whackState.scoreGoal) {
            endWhackGame();
            return;
        }
    }
    updateVangStars(); 
}

function endWhackGame() {
    whackState.timeUp = true;
    clearInterval(whackState.timerInterval); // Stop de klok
    updateVangStars(); 
    
    // Bereken eindtijd
    const finalTime = parseFloat(((Date.now() - whackState.startTime) / 1000).toFixed(2));
    
    // OPSLAAN IN FIREBASE
    if(typeof saveSoloScore === 'function') {
        // We slaan op: Spel, Naam, Niveau, Tijd, Aantal Kliks
        saveSoloScore('vang', whackState.currentPlayer, whackState.difficulty, finalTime, whackState.totalClicks);
    }

    setTimeout(() => { 
        if(typeof showWinnerModal === 'function') showWinnerModal(whackState.currentPlayer); 
    }, 500);
}
