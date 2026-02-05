// VANG.JS - SIMPEL MENU + GELUIDEN FIX
console.log("Vang.js geladen (Simple & Sounds)...");

let whackState = {
    score: 0, lastHole: null, timeUp: false, 
    scoreGoal: 10, // 10 Sterren om te winnen
    speed: 1000,
    difficulty: 'medium', 
    validImages: [],
    peepTimer: null
};

// SVG codes (geen laadtijd)
const bombSVG = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💣</text></svg>`;
const poopSVG = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💩</text></svg>`;

// --- FILTER ---
function isCutout(src) {
    return new Promise((resolve) => {
        const img = new Image(); img.src = src; img.crossOrigin = "Anonymous"; 
        img.onload = () => {
            const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
            try {
                const corners = [
                    ctx.getImageData(0, 0, 1, 1).data[3], ctx.getImageData(img.width-1, 0, 1, 1).data[3],
                    ctx.getImageData(0, img.height-1, 1, 1).data[3], ctx.getImageData(img.width-1, img.height-1, 1, 1).data[3]
                ];
                resolve(!corners.every(alpha => alpha > 200)); 
            } catch (e) { resolve(true); }
        };
        img.onerror = () => resolve(false);
    });
}

// --- SETUP ---
async function startWhackGame() {
    if(whackState.peepTimer) clearTimeout(whackState.peepTimer);

    const board = document.getElementById('game-board');
    board.innerHTML = `<div style="display:flex; height:100%; justify-content:center; align-items:center; color:white; font-size:1.5rem;">Laden... 🔨</div>`;

    whackState.validImages = [];
    if(typeof memThemes !== 'undefined') {
        let allPool = [];
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=15; i++) allPool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        
        let checked = 0;
        for(let src of allPool) {
            if(checked > 30) break;
            const ok = await isCutout(src);
            if(ok) whackState.validImages.push(src);
            checked++;
        }
    }
    if(whackState.validImages.length === 0) whackState.validImages = ['assets/images/icon.png'];
    renderWhackSetup(board);
}

function renderWhackSetup(board) {
    board.innerHTML = `
        <div class="memory-setup">
            
            <div class="setup-group">
                <h3>Kies een Niveau</h3>
                <div class="level-row">
                    <div class="level-card-btn easy" onclick="vangSetDiff('easy', this)">
                        <div class="level-icon">🟢</div>
                        <div class="level-text">Makkelijk</div>
                        <div class="level-sub">4 Gaten</div>
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
                <button id="vang-start-btn" class="start-btn" onclick="initWhackGame()">START SPEL ▶</button>
                <button class="tool-btn" onclick="location.reload()">⬅ Menu</button>
            </div>
        </div>`;
    whackState.difficulty = 'medium'; 
}

function vangSetDiff(diff, btn) { 
    if(typeof playSound === 'function') playSound('click'); 
    whackState.difficulty = diff; 
    document.querySelectorAll('.level-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// --- GAME ---
function initWhackGame() {
    if(typeof playSound === 'function') playSound('win');
    if(whackState.peepTimer) clearTimeout(whackState.peepTimer);

    const board = document.getElementById('game-board');
    whackState.score = 0; whackState.timeUp = false; whackState.scoreGoal = 10;

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
                    <button class="tool-btn" onclick="startWhackGame()">⬅ Stop</button>
                    <div style="font-weight:bold; color:#333;">Vang ze!</div>
                </div>
                <div class="star-tracker">${starsHTML}</div>
            </div>
            <div class="whack-grid ${gridClass}">${holesHTML}</div>
        </div>`;
    
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
    const isBad = Math.random() < 0.3; 

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
    if(!hole.classList.contains('up')) return; 
    
    const imgEl = hole.querySelector('.mole-img');
    const type = imgEl.dataset.type;

    if(type === "bomb" || type === "poop") {
        // --- FOUT GELUID (Bom/Drol) ---
        if(typeof playSound === 'function') playSound('error'); 
        
        hole.classList.remove('up'); 
        whackState.score = Math.max(0, whackState.score - 1);
        
        // Rood scherm
        document.querySelector('.whack-game-container').style.backgroundColor = "#F44336";
        setTimeout(()=>document.querySelector('.whack-game-container').style.backgroundColor = "", 200);
    } else {
        // --- GOED GELUID (Plaatje) ---
        if(typeof playSound === 'function') playSound('pop'); 
        
        hole.classList.remove('up'); 
        whackState.score++;
        whackState.speed = Math.max(400, whackState.speed - 20);
        
        if(whackState.score >= whackState.scoreGoal) {
            whackState.timeUp = true;
            updateVangStars(); 
            setTimeout(() => { if(typeof showWinnerModal === 'function') showWinnerModal("Jij"); }, 500);
            return;
        }
    }
    
    updateVangStars(); 
}
