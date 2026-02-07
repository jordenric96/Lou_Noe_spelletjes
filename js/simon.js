// SIMON.JS - Met Spelers & Highscores
console.log("Simon.js geladen (Full Version)...");

let simonState = {
    sequence: [],
    playerSequence: [],
    level: 0,
    isActive: false, // Mag de speler klikken?
    theme: 'mario',
    currentPlayer: null,
    btnSounds: [300, 400, 500, 600] // Frequenties voor piepjes
};

const simonThemes = {
    'mario': { path: 'assets/images/memory/mario/', ext: 'png' },
    'pokemon': { path: 'assets/images/memory/pokemon/', ext: 'png' }
};

// --- 1. SETUP ---
function startSimonGame() {
    const board = document.getElementById('game-board');
    simonState.currentPlayer = null;

    board.innerHTML = `
        <div class="simon-setup">
            <div class="setup-group">
                <h3>1. Wie gaat er spelen?</h3>
                <div class="name-row">
                    <button class="player-btn" onclick="simonSelectPlayer('Lou', this)">👦🏻 Lou</button>
                    <button class="player-btn" onclick="simonSelectPlayer('Noé', this)">👶🏼 Noé</button>
                    <button class="player-btn" onclick="simonSelectPlayer('Oliver', this)">👦🏼 Oliver</button>
                    <button class="player-btn" onclick="simonSelectPlayer('Manon', this)">👧🏼 Manon</button>
                    <button class="player-btn" onclick="simonSelectPlayer('Lore', this)">👩🏻 Lore</button>
                    <button class="player-btn" onclick="simonSelectPlayer('Jorden', this)">🧔🏻 Jorden</button>
                    <button class="player-btn" onclick="simonSelectPlayer('Bert', this)">👨🏻 Bert</button>
                    <button class="player-btn" onclick="simonSelectPlayer('Karen', this)">👩🏼 Karen</button>
                </div>
            </div>

            <div class="setup-group">
                <h3>2. Kies Thema</h3>
                <div class="option-grid">
                    <button class="option-btn selected" onclick="setSimonTheme('mario', this)"><span>🍄</span><span class="btn-label">Mario</span></button>
                    <button class="option-btn" onclick="setSimonTheme('pokemon', this)"><span>⚡</span><span class="btn-label">Pokémon</span></button>
                </div>
            </div>

            <div class="bottom-actions">
                <button id="simon-start-btn" class="start-btn" onclick="initSimon()" disabled>KIES NAAM...</button>
                <button class="tool-btn" onclick="location.reload()">⬅ Menu</button>
            </div>
        </div>
    `;
    simonState.theme = 'mario';
}

function simonSelectPlayer(name, btn) {
    if(typeof playSound === 'function') playSound('click');
    simonState.currentPlayer = name;
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending');
    
    const startBtn = document.getElementById('simon-start-btn');
    if(startBtn) { startBtn.disabled = false; startBtn.innerText = "START SPEL ▶"; }
}

function setSimonTheme(t, btn) {
    if(typeof playSound === 'function') playSound('click');
    simonState.theme = t;
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// --- 2. GAME ---
function initSimon() {
    const board = document.getElementById('game-board');
    const t = simonThemes[simonState.theme];
    
    let buttons = '';
    for(let i=0; i<4; i++) {
        // We zetten de afbeelding als background-image op de ::after via inline style of class is lastig,
        // dus we doen het direct op de button met een inner div of style.
        // Makkelijkste: Style injectie of gewoon img tag erin.
        buttons += `
            <button class="simon-btn" id="sb-${i}" onclick="handleClick(${i})">
                <div style="position:absolute; top:10%; left:10%; width:80%; height:80%; 
                            background-image:url('${t.path}${i+1}.${t.ext}'); 
                            background-size:contain; background-repeat:no-repeat; background-position:center; 
                            opacity:0.8;"></div>
            </button>`;
    }

    board.innerHTML = `
        <div class="simon-container">
            <div class="simon-info">
                <div class="simon-score">Level: <span id="s-score">1</span></div>
                <div class="simon-message" id="s-msg">Let op!</div>
            </div>
            <div class="simon-board">${buttons}</div>
            <button class="tool-btn" style="margin-top:20px; width:auto;" onclick="startSimonGame()">Stoppen</button>
        </div>
    `;
    
    simonState.sequence = [];
    simonState.level = 0;
    setTimeout(nextRound, 1000);
}

function nextRound() {
    simonState.level++;
    simonState.playerSequence = [];
    simonState.isActive = false;
    
    document.getElementById('s-score').innerText = simonState.level;
    document.getElementById('s-msg').innerText = "Kijk goed...";
    
    // Voeg nieuwe stap toe
    simonState.sequence.push(Math.floor(Math.random()*4));
    
    playSequence();
}

function playSequence() {
    let i = 0;
    const interval = setInterval(() => {
        activateButton(simonState.sequence[i]);
        i++;
        if (i >= simonState.sequence.length) {
            clearInterval(interval);
            simonState.isActive = true;
            document.getElementById('s-msg').innerText = "Jij!";
        }
    }, 800); // Snelheid
}

function activateButton(index) {
    const btn = document.getElementById(`sb-${index}`);
    if(btn) {
        btn.classList.add('lit');
        playTone(index);
        setTimeout(() => btn.classList.remove('lit'), 400);
    }
}

function handleClick(index) {
    if(!simonState.isActive) return;
    
    activateButton(index);
    simonState.playerSequence.push(index);
    
    // Check of het goed is
    const currentStep = simonState.playerSequence.length - 1;
    
    if (simonState.playerSequence[currentStep] !== simonState.sequence[currentStep]) {
        gameOver();
        return;
    }
    
    // Check of ronde klaar is
    if (simonState.playerSequence.length === simonState.sequence.length) {
        simonState.isActive = false;
        document.getElementById('s-msg').innerText = "Goed zo!";
        if(typeof playSound === 'function') playSound('win');
        setTimeout(nextRound, 1000);
    }
}

function gameOver() {
    simonState.isActive = false;
    document.getElementById('s-msg').innerText = "Fout!";
    if(typeof playSound === 'function') playSound('error');
    
    // OPSLAAN (Level - 1 want huidige level is gefaald)
    const finalScore = Math.max(0, simonState.level - 1);
    
    if(typeof saveSoloScore === 'function') {
        saveSoloScore('simon', simonState.currentPlayer, 'normal', null, finalScore);
    }
    
    setTimeout(() => {
        if(typeof showWinnerModal === 'function') {
            showWinnerModal(simonState.currentPlayer, {
                rank: null, // Wordt niet berekend voor Simon nog
                time: "Level " + finalScore,
                clicks: "Memory"
            });
        }
    }, 1000);
}

// Simpele toon generator voor Simon
function playTone(idx) {
    if(typeof playSound === 'function') playSound('pop');
}

function stopSimonGame() { simonState.isActive = false; }
