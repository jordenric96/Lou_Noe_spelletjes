// VANG.JS - STABIELE VERSIE (Geen geflikker & Vierkant check)
console.log("Vang.js geladen (Fixed & Stable)...");

let whackState = {
    score: 0, lastHole: null, timeUp: false, 
    scoreGoal: 10, speed: 1000, difficulty: 'medium', 
    validImages: [],
    peepTimer: null,
    currentPlayer: null, startTime: 0, totalClicks: 0, timerInterval: null
};

const bombSVG = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💣</text></svg>`;
const poopSVG = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💩</text></svg>`;

// --- 1. SLIM FILTER VOOR VIERKANTE PLAATJES ---
// Checkt nu 4 hoeken én een paar pixels naar binnen
function isCutout(src) {
    return new Promise((resolve) => {
        const img = new Image(); img.src = src; img.crossOrigin = "Anonymous"; 
        img.onload = () => {
            const canvas = document.createElement('canvas'); 
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
            
            // Hulpfunctie om alpha van een punt te checken
            const isTransparent = (x, y) => {
                try { return ctx.getImageData(x, y, 1, 1).data[3] < 200; } catch(e) { return true; }
            };

            const w = img.width - 1; const h = img.height - 1;
            // Check exacte hoeken en 5px naar binnen (voor zekerheid)
            const corners = [
                isTransparent(0,0), isTransparent(w,0), isTransparent(0,h), isTransparent(w,h),
                isTransparent(5,5), isTransparent(w-5,5), isTransparent(5,h-5), isTransparent(w-5,h-5)
            ];
            
            // Als ook maar 1 punt transparant is, keuren we hem goed als 'niet-vierkant'
            // Als ALLES ondoorzichtig is (false), dan is het een blok.
            const hasTransparency = corners.some(res => res === true);
            resolve(hasTransparency);
        };
        img.onerror = () => resolve(false);
    });
}

// --- 2. SETUP ---
async function startWhackGame() {
    if(whackState.peepTimer) clearTimeout(whackState.peepTimer);
    if(whackState.timerInterval) clearInterval(whackState.timerInterval);

    const board = document.getElementById('game-board');
    // Toon laadscherm
    board.innerHTML = `<div style="display:flex; height:100%; justify-content:center; align-items:center; flex-direction:column; color:white; font-size:1.5rem;">
        <div>Plaatjes controleren... 🕵️‍♂️</div>
        <div style="font-size:1rem; margin-top:10px;">(Dit duurt heel even)</div>
    </div>`;

    whackState.currentPlayer = null;
    whackState.validImages = []; 

    // Filteren van afbeeldingen
    if(typeof memThemes !== 'undefined') {
        let allPool = [];
        // Verzamel alle plaatjes
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=15; i++) allPool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        
        // Random mixen
        allPool.sort(() => 0.5 - Math.random());
        
        // Checken tot we er 20 hebben (anders duurt laden te lang)
        let count = 0;
        for(let src of allPool) {
            if(count >= 20) break;
            const ok = await isCutout(src);
            if(ok) {
                whackState.validImages.push(src);
                count++;
            }
        }
    }
    
    // Fallback
    if(whackState.validImages.length === 0) whackState.validImages = ['assets/images/icon.png'];

    renderWhackSetup(board);
}

function renderWhackSetup(board) {
    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-group">
                <h3>1. Wie gaat er meppen?</h3>
                <div class="preset-row">
                    <button class="preset-btn ${currPlayer.name==='Lou'?'active':''}" onclick="c4SetName('Lou')">👦🏻<br>Lou</button>
                    <button class="preset-btn ${currPlayer.name==='Noé'?'active':''}" onclick="c4SetName('Noé')">👶🏼<br>Noé</button>
                    <button class="preset-btn ${currPlayer.name==='Oliver'?'active':''}" onclick="c4SetName('Oliver')">👦🏼<br>Oliver</button>
                    <button class="preset-btn ${currPlayer.name==='Manon'?'active':''}" onclick="c4SetName('Manon')">👧🏼<br>Manon</button>
                    <button class="preset-btn ${currPlayer.name==='Lore'?'active':''}" onclick="c4SetName('Lore')">👩🏻<br>Lore</button>
                    <button class="preset-btn ${currPlayer.name==='Jorden'?'active':''}" onclick="c4SetName('Jorden')">🧔🏻<br>Jorden</button>
                    <button class="preset-btn ${currPlayer.name==='Karen'?'active':''}" onclick="c4SetName('Karen')">👱🏼‍♀️<br>Karen</button>
                    <button class="preset-btn ${currPlayer.name==='Bert'?'active':''}" onclick="c4SetName('Bert')">👨🏻<br>Bert</button>
                    <button class="preset-btn ${currPlayer.name==='Vince'?'active':''}" onclick="c4SetName('Vince')">👩🏽‍🦱<br>Vince</button>
                    <button class="preset-btn ${currPlayer.name==='Fran'?'active':''}" onclick="c4SetName('Fran')">👩🏻<br>Fran</button>
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
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending');
    const startBtn = document.getElementById('vang-start-btn');
    if(startBtn) { startBtn.disabled = false; startBtn.innerText = "START HET SPEL! 🔨"; }
}

function vangSetDiff(diff, btn) { 
    if(typeof playSound === 'function') playSound('click'); 
    whackState.difficulty = diff; 
    document.querySelectorAll('.level-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// --- 3. HET SPEL ---
function initWhackGame() {
    if(typeof playSound === 'function') playSound('win');
    if(whackState.peepTimer) clearTimeout(whackState.peepTimer);

    const board = document.getElementById('game-board');
    whackState.score = 0; whackState.timeUp = false; whackState.totalClicks = 0;
    whackState.startTime = Date.now(); 

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

// --- PEEP MET PRELOAD (ANTI-FLIKKER) ---
function peep() {
    if(whackState.timeUp) return;
    if(whackState.score >= whackState.scoreGoal) return; 

    const holes = document.querySelectorAll('.hole');
    const hole = randomHole(holes);
    const imgEl = hole.querySelector('.mole-img');
    
    let isBad = false;
    if (whackState.difficulty !== 'easy') isBad = Math.random() < 0.3;

    let nextSrc = "";
    let type = "good";

    if (isBad) {
        const isBomb = Math.random() > 0.5;
        if(isBomb) { nextSrc = bombSVG; type = "bomb"; } 
        else { nextSrc = poopSVG; type = "poop"; }
    } else {
        const randomImg = whackState.validImages[Math.floor(Math.random() * whackState.validImages.length)];
        nextSrc = randomImg; type = "good";
    }

    // --- FIX: EERST LADEN, DAN OMHOOG ---
    // Dit voorkomt dat je het vorige plaatje ziet of een lege flits
    const tempImg = new Image();
    tempImg.onload = () => {
        // Pas als hij geladen is, zetten we hem in de echte DOM
        if(whackState.timeUp) return; // Check of game al voorbij is
        
        imgEl.src = nextSrc;
        imgEl.dataset.type = type;
        
        hole.classList.add('up');
        
        let time = whackState.speed * (0.8 + Math.random() * 0.4); 
        whackState.peepTimer = setTimeout(() => {
            hole.classList.remove('up');
            if (!whackState.timeUp && whackState.score < whackState.scoreGoal) peep();
        }, time);
    };
    tempImg.src = nextSrc;
}

function bonk(hole) {
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

async function endWhackGame() {
    whackState.timeUp = true;
    clearInterval(whackState.timerInterval); 
    updateVangStars(); 
    
    const finalTime = parseFloat(((Date.now() - whackState.startTime) / 1000).toFixed(2));
    
    let rank = null;
    
    // Opslaan en rang ophalen
    if(typeof saveSoloScore === 'function') {
        rank = await saveSoloScore('vang', whackState.currentPlayer, whackState.difficulty, finalTime, whackState.totalClicks);
    }

    // Modal tonen met details
    setTimeout(() => { 
        if(typeof showWinnerModal === 'function') {
            showWinnerModal(whackState.currentPlayer + " wint!", { 
                time: finalTime, 
                clicks: whackState.totalClicks,
                rank: rank 
            }); 
        }
    }, 500);
}
