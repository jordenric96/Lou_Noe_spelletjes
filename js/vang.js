// VANG.JS - MEP HET MANNETJE
console.log("Vang.js geladen (Grid Style)");

let wState = { 
    score: 0, 
    timer: 30, 
    active: false, 
    speed: 1000, 
    grid: 9, 
    timerInt: null, 
    moleInt: null 
};

// Helper om willekeurige plaatjes uit de thema's te halen
function getWhackImages() {
    if(typeof themes !== 'undefined') {
        let pool = [];
        Object.values(themes).forEach(t => {
            if(!t.locked && !t.isMix) {
                // Pak plaatje 1 t/m 5 van elk thema
                for(let i=1; i<=5; i++) pool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        if(pool.length > 0) return pool;
    }
    return []; // Fallback
}

function startWhackGame() {
    const board = document.getElementById('game-board');
    // We gebruiken de memory-setup stijl voor het startscherm
    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-group" style="max-width:500px; margin: 0 auto;">
                <h3>🔨 Vang ze!</h3>
                <p style="text-align:center; color:#555; margin-bottom:15px;">
                    Tik op de mannetjes, maar pas op voor de 💣 en 💩!
                </p>
                
                <div class="setup-columns" style="display:flex; justify-content:center; gap:10px; margin-bottom:20px;">
                    <button class="option-btn" onclick="setWhackDiff('easy', this)">
                        <div style="font-size:1.5rem">🟢</div>Makkelijk
                    </button>
                    <button class="option-btn selected" onclick="setWhackDiff('medium', this)">
                        <div style="font-size:1.5rem">🟠</div>Normaal
                    </button>
                    <button class="option-btn" onclick="setWhackDiff('hard', this)">
                        <div style="font-size:1.5rem">🔴</div>Snel!
                    </button>
                </div>
                
                <button class="start-btn" onclick="runWhackGame()">START SPEL ▶</button>
                <button class="tool-btn" onclick="location.reload()" style="margin-top:10px; width:100%; background:#ccc;">⬅ Terug</button>
            </div>
        </div>
    `;
    // Standaard instellingen
    wState.speed = 900; 
    wState.grid = 9;
}

function setWhackDiff(diff, btn) {
    if(typeof playSound === 'function') playSound('click');
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    if(diff === 'easy') { wState.speed = 1200; wState.grid = 4; }
    else if(diff === 'medium') { wState.speed = 900; wState.grid = 9; }
    else if(diff === 'hard') { wState.speed = 600; wState.grid = 12; }
}

function runWhackGame() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    wState.score = 0; 
    wState.timer = 30; 
    wState.active = true;
    
    // Bepaal CSS class voor het raster
    let gridClass = 'grid-medium';
    if(wState.grid === 4) gridClass = 'grid-easy';
    if(wState.grid === 12) gridClass = 'grid-hard';

    // Maak de gaten
    let holes = '';
    for(let i=0; i<wState.grid; i++) {
        // Belangrijk: onmousedown én ontouchstart voor snelle reactie
        holes += `
            <div class="whack-hole" id="hole-${i}" onmousedown="whack(this)" ontouchstart="whack(this); return false;">
                <div class="whack-character"></div>
            </div>`;
    }
    
    board.innerHTML = `
        <div class="whack-game-container">
            <div class="whack-header">
                <button class="tool-btn" onclick="stopWhackGame()">⬅ Stop</button>
                <div class="whack-score-box">
                    ⏱️ <span id="w-time">30</span> &nbsp;|&nbsp; 🔨 <span id="w-score">0</span>
                </div>
            </div>
            <div class="whack-grid-container">
                <div class="whack-grid ${gridClass}">${holes}</div>
            </div>
        </div>
    `;
    
    // Timer Loop
    wState.timerInt = setInterval(() => {
        if(!wState.active) return;
        wState.timer--;
        const timeEl = document.getElementById('w-time');
        if(timeEl) timeEl.innerText = wState.timer;
        
        if(wState.timer <= 0) endWhack(false);
    }, 1000);
    
    // Start de mollen!
    popMole();
}

function popMole() {
    if(!wState.active) return;
    
    const holes = document.querySelectorAll('.whack-hole');
    if(holes.length === 0) return;

    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    const char = randomHole.querySelector('.whack-character');
    
    // Reset klassen
    randomHole.classList.remove('trap-bomb', 'trap-poop', 'whacked', 'up');
    char.innerHTML = ''; 
    char.style.backgroundImage = '';

    // Kansberekening: 20% kans op valstrik, 80% kans op plaatje
    if (Math.random() < 0.2) {
        if (Math.random() < 0.5) { 
            randomHole.classList.add('trap-bomb'); 
            char.innerText = '💣'; 
        } else { 
            randomHole.classList.add('trap-poop'); 
            char.innerText = '💩'; 
        }
    } else {
        // Kies een willekeurig plaatje uit de beschikbare thema's
        const availableImages = getWhackImages();
        let img = 'assets/images/icon.png'; // Fallback
        if(availableImages.length > 0) {
            img = availableImages[Math.floor(Math.random() * availableImages.length)];
        }
        char.style.backgroundImage = `url('${img}')`;
    }
    
    // Kom omhoog!
    randomHole.classList.add('up');
    
    // Zak weer naar beneden na verloop van tijd
    wState.moleInt = setTimeout(() => {
        if(!randomHole.classList.contains('whacked')) {
            randomHole.classList.remove('up');
        }
        
        // Volgende mol plannen (als spel nog bezig is)
        if(wState.active) {
            let nextPopTime = Math.random() * 500 + 200; // Tussen 200ms en 700ms pauze
            setTimeout(popMole, nextPopTime);
        }
    }, wState.speed);
}

function whack(hole) {
    // Check of het geldig is
    if(!wState.active || !hole.classList.contains('up') || hole.classList.contains('whacked')) return;
    
    // Voorkom dubbele kliks (door touch + mouse)
    hole.classList.add('whacked');
    
    // Valstrik geraakt?
    if (hole.classList.contains('trap-bomb') || hole.classList.contains('trap-poop')) {
        if(typeof playSound === 'function') playSound('lose');
        
        // Visuele feedback
        hole.querySelector('.whack-character').innerText = '💥'; 
        hole.style.backgroundColor = 'red';
        
        // Game Over
        wState.active = false; 
        setTimeout(() => endWhack(true), 1000);
        return;
    }

    // Goed geraakt!
    if(typeof playSound === 'function') playSound('pop');
    wState.score++; 
    document.getElementById('w-score').innerText = wState.score;
    
    // Zak direct naar beneden
    setTimeout(() => hole.classList.remove('up'), 200);
}

function endWhack(isGameOver) {
    wState.active = false; 
    clearInterval(wState.timerInt); 
    clearTimeout(wState.moleInt);
    
    let msg = isGameOver ? "BOEM! Verloren!" : "Tijd is op!";
    
    // Gebruik de centrale winner modal als die er is
    if(typeof showWinnerModal === 'function') {
        showWinnerModal("Vang ze!", [{name:"Jouw Score", score: wState.score}]);
    } else {
        alert(`${msg} Je score: ${wState.score}`);
        startWhackGame(); // Terug naar startscherm
    }
}

function stopWhackGame() { 
    wState.active = false; 
    clearInterval(wState.timerInt); 
    clearTimeout(wState.moleInt);
    location.reload(); // Of startWhackGame() als je in de app wilt blijven
}
