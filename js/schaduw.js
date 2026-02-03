// SCHADUW.JS - MET PROGRESSIE SYSTEEM
console.log("Schaduw.js geladen (Stars Mode)...");

let shadowState = {
    currentImg: null,
    stars: 0,           // Aantal sterren
    maxStars: 5,        // Doel
    isLocked: false,
    processing: false 
};

// ... (getShadowImages en checkIfCutout blijven hetzelfde als voorheen) ...
function getShadowImages() {
    if(typeof memThemes !== 'undefined') {
        let pool = [];
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=15; i++) pool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        return pool;
    }
    return [];
}

function checkIfCutout(src) {
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
                resolve(corners.some(alpha => alpha < 200)); 
            } catch (e) { resolve(true); }
        };
        img.onerror = () => resolve(false);
    });
}

// --- START GAME ---
function startShadowGame() {
    const board = document.getElementById('game-board');
    shadowState.stars = 0; // Reset sterren bij start
    shadowState.isLocked = false;
    shadowState.processing = false;

    // We bouwen de HTML met de sterrenbalk
    board.innerHTML = `
        <div class="shadow-game-container">
            <div class="shadow-header">
                <button class="tool-btn" onclick="location.reload()">⬅ Terug</button>
                
                <div class="progress-container">
                    <span id="star-1" class="star-icon">★</span>
                    <span id="star-2" class="star-icon">★</span>
                    <span id="star-3" class="star-icon">★</span>
                    <span id="star-4" class="star-icon">★</span>
                    <span id="star-5" class="star-icon">★</span>
                    <span class="goal-icon">🎁</span>
                </div>
            </div>
            
            <div class="shadow-stage">
                <div class="mystery-card">
                    <img id="mystery-img" class="mystery-img" src="" style="opacity:0">
                </div>
                <div class="shadow-question" id="shadow-txt">Wie is dit?</div>
            </div>
            
            <div class="shadow-options" id="shadow-options"></div>
        </div>
    `;

    nextShadowRound();
}

async function nextShadowRound() {
    if(shadowState.processing) return;
    shadowState.processing = true;
    shadowState.isLocked = false;

    // UPDATE STERREN UI
    for(let i=1; i<=5; i++) {
        const star = document.getElementById(`star-${i}`);
        if(star) {
            if(i <= shadowState.stars) star.classList.add('earned');
            else star.classList.remove('earned');
        }
    }

    const imgEl = document.getElementById('mystery-img');
    const txtEl = document.getElementById('shadow-txt');
    const optContainer = document.getElementById('shadow-options');
    
    if(!imgEl) return;
    
    // Reset view
    imgEl.style.opacity = '0.3'; 
    imgEl.className = 'mystery-img'; // Weer zwart maken!
    txtEl.innerText = "Zoeken...";
    optContainer.innerHTML = ''; 

    // OPHALEN
    let pool = getShadowImages();
    if(pool.length < 3) { alert("Te weinig plaatjes!"); return; }
    
    // We zoeken een 'cutout' (transparante achtergrond)
    pool.sort(() => 0.5 - Math.random());
    let correctImg = null;
    for(let i=0; i<Math.min(pool.length, 10); i++) {
        let isGood = await checkIfCutout(pool[i]);
        if(isGood) { correctImg = pool[i]; break; }
    }
    if(!correctImg) correctImg = pool[0]; // Fallback

    shadowState.currentImg = correctImg;

    // Foute antwoorden
    let wrong1 = correctImg; 
    while(wrong1 === correctImg) wrong1 = pool[Math.floor(Math.random() * pool.length)];
    let wrong2 = correctImg;
    while(wrong2 === correctImg || wrong2 === wrong1) wrong2 = pool[Math.floor(Math.random() * pool.length)];

    let options = [correctImg, wrong1, wrong2];
    options.sort(() => 0.5 - Math.random());

    imgEl.src = correctImg;
    imgEl.onload = () => { imgEl.style.opacity = '1'; }; 
    txtEl.innerText = "Wie is dit?";
    
    optContainer.innerHTML = options.map(src => `
        <div class="option-card" onclick="checkShadow('${src}', this)"><img src="${src}"></div>
    `).join('');
    
    shadowState.processing = false;
}

function checkShadow(src, card) {
    if(shadowState.isLocked || shadowState.processing) return;

    if(src === shadowState.currentImg) {
        // GOED ANTWOORD!
        if(typeof playSound === 'function') playSound('win');
        card.classList.add('correct');
        
        // 1. Onthul plaatje
        document.getElementById('mystery-img').classList.add('revealed');
        document.getElementById('shadow-txt').innerText = "Ja! Goed zo!";
        
        shadowState.isLocked = true;
        
        // 2. Ster erbij!
        shadowState.stars++;
        
        // Update direct de ster (visueel)
        const starEl = document.getElementById(`star-${shadowState.stars}`);
        if(starEl) {
            starEl.classList.add('earned');
            starEl.style.transform = "scale(1.5)"; // Even ploppen
            setTimeout(() => starEl.style.transform = "scale(1.3)", 300);
        }

        // 3. Hebben we er 5? -> GROOT FEEST
        if(shadowState.stars >= shadowState.maxStars) {
            if(typeof memFireConfetti === 'function') memFireConfetti();
            setTimeout(showRewardModal, 1000); // Toon beloning na 1 sec
        } else {
            // Gewoon volgende ronde
            setTimeout(nextShadowRound, 1500);
        }

    } else {
        // FOUT
        if(typeof playSound === 'function') playSound('error');
        card.classList.add('wrong');
    }
}

// De Beloning Scherm
function showRewardModal() {
    const board = document.getElementById('game-board');
    
    // Maak een overlay
    const modal = document.createElement('div');
    modal.className = 'reward-modal';
    modal.innerHTML = `
        <div class="reward-content">
            <div class="reward-emoji">🎁✨</div>
            <h2>Cadeautje Open!</h2>
            <p>Wat goed! Je hebt ze alle 5 geraden!</p>
            <button class="reward-btn" onclick="resetShadowGame()">Nog een keer!</button>
        </div>
    `;
    board.appendChild(modal);
    
    if(typeof playSound === 'function') playSound('win');
}

function resetShadowGame() {
    // Verwijder modal en begin opnieuw
    const modal = document.querySelector('.reward-modal');
    if(modal) modal.remove();
    
    shadowState.stars = 0;
    // Visueel resetten sterren
    document.querySelectorAll('.star-icon').forEach(s => s.classList.remove('earned'));
    
    nextShadowRound();
}
