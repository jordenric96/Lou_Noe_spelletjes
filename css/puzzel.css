// VANG.JS - WHACK-A-MOLE MET THEMA PLAATJES
console.log("Vang.js geladen...");

let whackState = {
    score: 0,
    lastHole: null,
    timeUp: false,
    scoreGoal: 15, // Aantal punten om te winnen
    speed: 1000    // Snelheid (ms)
};

// 1. OPHALEN ALLE PLAATJES (Uit Memory Thema's)
function getWhackPool() {
    if(typeof memThemes !== 'undefined') {
        let pool = [];
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                // Pak plaatje 1 t/m 15 van elk thema
                for(let i=1; i<=15; i++) pool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        if(pool.length > 0) return pool;
    }
    // Fallback als er iets mis is
    return ['assets/images/icon.png'];
}

function startWhackGame() {
    const board = document.getElementById('game-board');
    whackState.score = 0;
    whackState.timeUp = false;
    whackState.speed = 1000;

    // Maak 9 gaten (3x3)
    let holesHTML = '';
    for(let i=0; i<9; i++) {
        holesHTML += `
            <div class="hole" id="hole-${i}" onclick="bonk(this)">
                <img src="" class="mole-img" id="img-${i}">
            </div>`;
    }

    board.innerHTML = `
        <div class="whack-game-container">
            <div class="whack-header">
                <button class="tool-btn" onclick="location.reload()">⬅ Stop</button>
                <div class="whack-score">🔨 Score: <span id="whack-score">0</span> / ${whackState.scoreGoal}</div>
            </div>
            
            <div class="whack-grid">
                ${holesHTML}
            </div>
            
            <div style="margin-top:20px; color:white; font-size:0.9rem;">
                Tik op de plaatjes! Pas op voor 💣 en 💩!
            </div>
        </div>
    `;

    // Start het spel
    peep();
}

// 2. KIES EEN WILLEKEURIG GAT
function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === whackState.lastHole) return randomHole(holes);
    whackState.lastHole = hole;
    return hole;
}

// 3. LAAT IETS OMHOOG KOMEN (PEEP)
function peep() {
    if(whackState.timeUp) return;
    if(whackState.score >= whackState.scoreGoal) return; // Gewonnen

    const holes = document.querySelectorAll('.hole');
    const hole = randomHole(holes);
    const imgEl = hole.querySelector('.mole-img');

    // KIES: GOED of FOUT?
    // 30% kans op Bom/Drol, 70% kans op Leuk Plaatje
    const isBad = Math.random() < 0.3; 

    if (isBad) {
        // BOM of DROL (Gebruik emoji als plaatje of een bestand indien je dat hebt)
        // We gebruiken hier een DATA-URI voor een drol/bom zodat het altijd werkt
        const isBomb = Math.random() > 0.5;
        if(isBomb) {
            imgEl.src = "assets/images/bomb.png"; // Zorg dat je deze hebt, of gebruik emoji hieronder
            // Als je geen bomb.png hebt, gebruiken we een emoji truc:
            imgEl.onerror = function(){ this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💣</text></svg>'; };
            imgEl.dataset.type = "bomb";
        } else {
            imgEl.src = "assets/images/poop.png"; 
            imgEl.onerror = function(){ this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💩</text></svg>'; };
            imgEl.dataset.type = "poop";
        }
    } else {
        // GOED PLAATJE (Uit de lijst)
        const pool = getWhackPool();
        const randomImg = pool[Math.floor(Math.random() * pool.length)];
        imgEl.src = randomImg;
        imgEl.dataset.type = "good";
    }

    // Omhoog!
    hole.classList.add('up');

    // Snelheid aanpassen (hoe verder, hoe sneller)
    const time = whackState.speed; // Tussen 0.4s en 1s

    setTimeout(() => {
        hole.classList.remove('up');
        if (!whackState.timeUp && whackState.score < whackState.scoreGoal) {
            peep();
        }
    }, time);
}

// 4. KLIKKEN (MEPPEN)
function bonk(hole) {
    if(!hole.classList.contains('up')) return; // Niet spieken!
    
    const imgEl = hole.querySelector('.mole-img');
    const type = imgEl.dataset.type;

    if(type === "bomb" || type === "poop") {
        // AU! FOUT!
        if(typeof playSound === 'function') playSound('error');
        hole.classList.remove('up'); // Direct weg
        // Minpunt? Of gewoon niks? Laten we minpunt doen.
        whackState.score = Math.max(0, whackState.score - 1);
        document.getElementById('whack-score').innerText = whackState.score;
        
        // Rood knipperen
        document.querySelector('.whack-game-container').style.backgroundColor = "#F44336";
        setTimeout(()=>document.querySelector('.whack-game-container').style.backgroundColor = "", 200);

    } else {
        // GOED!
        if(typeof playSound === 'function') playSound('pop');
        hole.classList.remove('up'); // Weg
        
        whackState.score++;
        document.getElementById('whack-score').innerText = whackState.score;
        
        // Iets sneller gaan
        whackState.speed = Math.max(400, whackState.speed - 30);

        // GEWONNEN?
        if(whackState.score >= whackState.scoreGoal) {
            whackState.timeUp = true;
            setTimeout(() => {
                if(typeof showWinnerModal === 'function') showWinnerModal("Jij");
                else alert("Gewonnen!");
            }, 500);
        }
    }
}
