// VANG.JS - NO GLITCH, 10 STARS
console.log("Vang.js geladen (Stars & Anti-Glitch)...");

let whackState = {
    score: 0, lastHole: null, timeUp: false, 
    scoreGoal: 10, // DOEL = 10 STERREN
    speed: 1000,
    difficulty: 'medium', player: { name: '', color: '#333', icon: '👤' },
    pendingName: null, pendingIcon: null, validImages: [],
    peepTimer: null // Om de loop netjes te stoppen
};

const vangColors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#FFC107', '#FF9800'];

// Directe SVG data voor Bom en Drol (Geen laadtijd = Geen geflits!)
const bombSVG = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💣</text></svg>`;
const poopSVG = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💩</text></svg>`;

// --- FILTER FUNCTIE ---
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

// --- SETUP START ---
async function startWhackGame() {
    // Reset timer als die nog loopt
    if(whackState.peepTimer) clearTimeout(whackState.peepTimer);

    const board = document.getElementById('game-board');
    board.innerHTML = `<div style="display:flex; height:100%; justify-content:center; align-items:center; color:white; font-size:1.5rem;">Even wachten... 🔨</div>`;

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
                <h3>1. Wie gaat er vangen?</h3>
                <div class="name-row">
                    <button class="player-btn" onclick="vangSelectPerson('Lou', '👦🏼', this)">👦🏼 Lou</button>
                    <button class="player-btn" onclick="vangSelectPerson('Noé', '👶🏼', this)">👶🏼 Noé</button>
                    <button class="player-btn" onclick="vangSelectPerson('Mama', '👩🏻', this)">👩🏻 Mama</button>
                    <button class="player-btn" onclick="vangSelectPerson('Papa', '👨🏻', this)">👨🏻 Papa</button>
                </div>
                <div class="color-grid-6" id="vang-colors">
                    ${vangColors.map(c => `<div class="color-dot" style="background:${c}" onclick="vangSetColor('${c}', this)"></div>`).join('')}
                </div>
                <div id="vang-active-players" style="margin-top:10px; min-height:30px;"></div>
            </div>
            <div class="setup-group">
                <h3>2. Moeilijkheid</h3>
                <div class="name-row" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                    <button class="player-btn" onclick="vangSetDiff('easy', this)"><div>🟢</div>Makkelijk<br><small>4 gaten</small></button>
                    <button class="player-btn selected-pending" onclick="vangSetDiff('medium', this)"><div>🟠</div>Medium<br><small>9 gaten</small></button>
                    <button class="player-btn" onclick="vangSetDiff('hard', this)"><div>🔴</div>Moeilijk<br><small>12 gaten</small></button>
                </div>
            </div>
            <div class="bottom-actions">
                <button id="vang-start-btn" class="start-btn" onclick="initWhackGame()" disabled>Kies eerst een speler...</button>
                <button class="tool-btn" onclick="location.reload()">⬅ Menu</button>
            </div>
        </div>`;
    whackState.difficulty = 'medium'; whackState.player = null;
}

function vangSelectPerson(name, icon, btn) { if(typeof playSound === 'function') playSound('click'); btn.parentElement.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending')); btn.classList.add('selected-pending'); whackState.pendingName = name; whackState.pendingIcon = icon; const c=document.getElementById('vang-colors'); c.style.animation="shake 0.5s"; setTimeout(()=>c.style.animation="",500); }
function vangSetColor(color, btn) { if(!whackState.pendingName) { alert("Kies eerst een naam!"); return; } if(typeof playSound === 'function') playSound('pop'); document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected-color')); btn.classList.add('selected-color'); whackState.player = { name: whackState.pendingName, icon: whackState.pendingIcon, color: color }; whackState.pendingName = null; document.querySelector('.setup-group .name-row').querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending')); document.getElementById('vang-active-players').innerHTML = `<div class="active-player-tag" style="background:${color}"><span>${whackState.player.icon} ${whackState.player.name}</span></div>`; const sBtn = document.getElementById('vang-start-btn'); sBtn.disabled = false; sBtn.innerText = "START SPEL ▶"; sBtn.style.transform = "scale(1.05)"; }
function vangSetDiff(diff, btn) { if(typeof playSound === 'function') playSound('click'); whackState.difficulty = diff; btn.parentElement.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending')); btn.classList.add('selected-pending'); }

// --- GAME ---
function initWhackGame() {
    if(typeof playSound === 'function') playSound('win');
    if(whackState.peepTimer) clearTimeout(whackState.peepTimer); // Timer reset

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

    // STERREN GENEREREN (10 stuks)
    let starsHTML = '';
    for(let i=1; i<=10; i++) starsHTML += `<span id="star-${i}" class="star-icon">★</span>`;

    board.innerHTML = `
        <div class="whack-game-container">
            <div class="whack-header">
                <div class="header-top">
                    <button class="tool-btn" onclick="startWhackGame()">⬅ Stop</button>
                    <div class="player-icon-display" style="text-shadow: 2px 2px 0 ${whackState.player.color}">
                        ${whackState.player.icon}
                    </div>
                </div>
                <div class="star-tracker">${starsHTML}</div>
            </div>
            <div class="whack-grid ${gridClass}">${holesHTML}</div>
        </div>`;
    
    // Start de loop
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
        // GEBRUIK DIRECT DE SVG (Geen knipperen meer!)
        const isBomb = Math.random() > 0.5;
        if(isBomb) { 
            imgEl.src = bombSVG; 
            imgEl.dataset.type = "bomb"; 
        } else { 
            imgEl.src = poopSVG; 
            imgEl.dataset.type = "poop"; 
        }
    } else {
        const randomImg = whackState.validImages[Math.floor(Math.random() * whackState.validImages.length)];
        imgEl.src = randomImg; 
        imgEl.dataset.type = "good";
    }

    hole.classList.add('up');
    
    let time = whackState.speed * (0.8 + Math.random() * 0.4); 

    // Sla de timer ID op zodat we hem kunnen stoppen
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
        if(typeof playSound === 'function') playSound('error'); 
        hole.classList.remove('up'); 
        whackState.score = Math.max(0, whackState.score - 1);
        
        // Rood scherm
        document.querySelector('.whack-game-container').style.backgroundColor = "#F44336";
        setTimeout(()=>document.querySelector('.whack-game-container').style.backgroundColor = "", 200);
    } else {
        if(typeof playSound === 'function') playSound('pop'); 
        hole.classList.remove('up'); 
        whackState.score++;
        
        // Versnellen!
        whackState.speed = Math.max(400, whackState.speed - 20);
        
        if(whackState.score >= whackState.scoreGoal) {
            whackState.timeUp = true;
            updateVangStars(); // Laatste ster vullen
            setTimeout(() => { 
                if(typeof showWinnerModal === 'function') showWinnerModal(whackState.player.name); 
            }, 500);
            return;
        }
    }
    
    updateVangStars(); // Update de sterrenbalk
}
