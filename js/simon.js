// SIMON.JS - Met Unieke Geluiden & Alle Memory Thema's
console.log("Simon.js geladen (Pro Audio & Themes)...");

let simonState = {
    sequence: [],
    playerSequence: [],
    level: 0,
    isActive: false, 
    theme: 'mario', // Standaard
    currentPlayer: null,
    // Specifieke frequenties voor Simon (Groen, Rood, Geel, Blauw)
    // E4 (329.6), A3 (220), C#4 (277.2), E3 (164.8) - Klassieke Simon tonen
    frequencies: [329.63, 261.63, 220.00, 164.81] 
};

// We gebruiken memThemes uit memory.js. 
// Als die nog niet geladen is, gebruiken we een fallback.
const getThemes = () => (typeof memThemes !== 'undefined') ? memThemes : {
    'mario': { path: 'assets/images/memory/mario/', ext: 'png', locked: false },
    'pokemon': { path: 'assets/images/memory/pokemon/', ext: 'png', locked: false }
};

// --- 1. SETUP ---
function startSimonGame() {
    const board = document.getElementById('game-board');
    simonState.currentPlayer = null;

    // Genereer Thema Knoppen op basis van Memory Thema's
    const themes = getThemes();
    let themeButtonsHTML = '';
    
    Object.keys(themes).forEach(key => {
        const t = themes[key];
        // We slaan de 'mix' over en gelockte thema's
        if (!t.isMix && !t.locked) {
            const isSelected = simonState.theme === key ? 'selected' : '';
            // Probeer cover.png, anders plaatje 1
            const imgIcon = `${t.path}cover.png`; 
            const fallbackIcon = `${t.path}1.${t.extension}`;
            
            themeButtonsHTML += `
                <button class="option-btn ${isSelected}" onclick="setSimonTheme('${key}', this)">
                    <img src="${imgIcon}" onerror="this.src='${fallbackIcon}'">
                    <span class="btn-label" style="font-size:0.7rem; text-transform:capitalize;">${key}</span>
                </button>
            `;
        }
    });

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
                    ${themeButtonsHTML}
                </div>
            </div>

            <div class="bottom-actions">
                <button id="simon-start-btn" class="start-btn" onclick="initSimon()" disabled>KIES NAAM...</button>
                <button class="tool-btn" onclick="location.reload()">⬅ Menu</button>
            </div>
        </div>
    `;
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
    const themes = getThemes();
    const t = themes[simonState.theme];
    
    let buttons = '';
    for(let i=0; i<4; i++) {
        // We pakken plaatje 1, 2, 3 en 4 van het gekozen thema
        const imgSrc = `${t.path}${i+1}.${t.extension}`;
        
        buttons += `
            <button class="simon-btn" id="sb-${i}" onclick="handleClick(${i})">
                <div style="position:absolute; top:10%; left:10%; width:80%; height:80%; 
                            background-image:url('${imgSrc}'); 
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
    }, 800); // Snelheid tussen piepjes
}

function activateButton(index) {
    const btn = document.getElementById(`sb-${index}`);
    if(btn) {
        btn.classList.add('lit');
        playSimonTone(index); // SPEEL SPECIFIEK GELUID
        setTimeout(() => btn.classList.remove('lit'), 400);
    }
}

function handleClick(index) {
    if(!simonState.isActive) return;
    
    activateButton(index);
    simonState.playerSequence.push(index);
    
    // Check direct
    const currentStep = simonState.playerSequence.length - 1;
    
    if (simonState.playerSequence[currentStep] !== simonState.sequence[currentStep]) {
        gameOver();
        return;
    }
    
    // Ronde klaar?
    if (simonState.playerSequence.length === simonState.sequence.length) {
        simonState.isActive = false;
        document.getElementById('s-msg').innerText = "Goed zo!";
        setTimeout(nextRound, 1000);
    }
}

function gameOver() {
    simonState.isActive = false;
    document.getElementById('s-msg').innerText = "Fout!";
    
    // Fout geluid
    if (typeof audioCtx !== 'undefined') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(150, audioCtx.currentTime); // Lage bromtoon
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    }

    const finalScore = Math.max(0, simonState.level - 1);
    
    if(typeof saveSoloScore === 'function') {
        saveSoloScore('simon', simonState.currentPlayer, 'normal', null, finalScore);
    }
    
    setTimeout(() => {
        if(typeof showWinnerModal === 'function') {
            showWinnerModal(simonState.currentPlayer, {
                rank: null,
                time: "Level " + finalScore,
                clicks: "Memory"
            });
        }
    }, 1000);
}

// --- NIEUW: SPECIFIEKE TONEN GENERATOR ---
function playSimonTone(index) {
    // We gebruiken de audioCtx uit main.js als die bestaat
    if (typeof audioCtx === 'undefined' || audioCtx.state === 'suspended') {
        if(typeof audioCtx !== 'undefined') audioCtx.resume();
        return; // Veiligheid
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Kies frequentie op basis van knop index (0-3)
    const freq = simonState.frequencies[index] || 440;
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Mooi zacht in- en uitfaden (tegen klikjes)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
}

function stopSimonGame() { simonState.isActive = false; }
