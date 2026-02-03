// SCHADUW.JS - WIE IS HET? (FIXED: MEMTHEMES)
console.log("Schaduw.js geladen...");

let shadowState = {
    currentImg: null,
    score: 0,
    isLocked: false,
    processing: false 
};

// --- HIER ZAT DE FOUT ---
function getShadowImages() {
    // Check nu 'memThemes' in plaats van 'themes'
    if(typeof memThemes !== 'undefined') {
        let pool = [];
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=15; i++) pool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        return pool;
    }
    console.warn("Geen thema's gevonden voor schaduwspel!");
    return [];
}

// ... (checkIfCutout blijft hetzelfde) ...
function checkIfCutout(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "Anonymous"; 
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
                const corners = [
                    ctx.getImageData(0, 0, 1, 1).data[3],
                    ctx.getImageData(img.width-1, 0, 1, 1).data[3],
                    ctx.getImageData(0, img.height-1, 1, 1).data[3],
                    ctx.getImageData(img.width-1, img.height-1, 1, 1).data[3]
                ];
                const isRectangle = corners.every(alpha => alpha > 200); 
                resolve(!isRectangle);
            } catch (e) { resolve(true); }
        };
        img.onerror = () => resolve(false);
    });
}

function startShadowGame() {
    const board = document.getElementById('game-board');
    shadowState.score = 0;
    shadowState.isLocked = false;
    shadowState.processing = false;

    board.innerHTML = `
        <div class="shadow-game-container">
            <div class="shadow-header">
                <button class="tool-btn" onclick="location.reload()">⬅ Terug</button>
                <div class="shadow-score-box">🕵️ <span id="shadow-score">0</span></div>
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

    const imgEl = document.getElementById('mystery-img');
    const txtEl = document.getElementById('shadow-txt');
    const optContainer = document.getElementById('shadow-options');
    
    if(!imgEl) return;
    
    imgEl.style.opacity = '0.3'; 
    imgEl.className = 'mystery-img'; 
    txtEl.innerText = "Zoeken...";
    optContainer.innerHTML = ''; 

    // OPHALEN
    let pool = getShadowImages();
    
    // CHECK
    if(pool.length < 3) { 
        txtEl.innerText = "Niet genoeg plaatjes!";
        alert("Niet genoeg plaatjes gevonden! (Check of memory.js geladen is)"); 
        shadowState.processing = false;
        return; 
    }
    
    pool.sort(() => 0.5 - Math.random());
    let correctImg = null;

    for(let i=0; i<Math.min(pool.length, 10); i++) {
        let candidate = pool[i];
        let isGood = await checkIfCutout(candidate);
        if(isGood) { correctImg = candidate; break; }
    }
    if(!correctImg) correctImg = pool[0];
    shadowState.currentImg = correctImg;

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
        if(typeof playSound === 'function') playSound('win');
        card.classList.add('correct');
        shadowState.score++;
        document.getElementById('shadow-score').innerText = shadowState.score;
        document.getElementById('mystery-img').classList.add('revealed');
        shadowState.isLocked = true;
        
        if(typeof memFireConfetti === 'function') memFireConfetti();
        setTimeout(nextShadowRound, 2000);
    } else {
        if(typeof playSound === 'function') playSound('error');
        card.classList.add('wrong');
    }
}
