// SCHADUW.JS - ALLES MOET EEN UITKNIPSEL ZIJN
console.log("Schaduw.js geladen (Strict Mode)...");

let shadowState = {
    currentImg: null,
    score: 0,
    isLocked: false,
    processing: false 
};

function getShadowImages() {
    // Check 'memThemes' (uit memory.js)
    if(typeof memThemes !== 'undefined') {
        let pool = [];
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=15; i++) pool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        return pool;
    }
    console.warn("Geen thema's gevonden! (Check memory.js)");
    return [];
}

// Functie: is dit een figuur (true) of een rechthoek (false)?
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
                // Check 4 hoeken
                const corners = [
                    ctx.getImageData(0, 0, 1, 1).data[3],
                    ctx.getImageData(img.width-1, 0, 1, 1).data[3],
                    ctx.getImageData(0, img.height-1, 1, 1).data[3],
                    ctx.getImageData(img.width-1, img.height-1, 1, 1).data[3]
                ];
                // Als alle hoeken zichtbaar zijn (>200 alpha), is het een rechthoek
                const isRectangle = corners.every(alpha => alpha > 200); 
                resolve(!isRectangle); // Return TRUE als het GEEN rechthoek is
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

// HULPFUNCTIE: Zoek een willekeurig GOED plaatje
async function findRandomCutout(pool, excludeList = []) {
    // Probeer maximaal 20 keer een willekeurige te pakken die goed is
    for(let i=0; i<20; i++) {
        const randomSrc = pool[Math.floor(Math.random() * pool.length)];
        
        // Mag niet in de exclude lijst staan (zodat we geen dubbele hebben)
        if(excludeList.includes(randomSrc)) continue;

        // Check of het een cutout is
        const isGood = await checkIfCutout(randomSrc);
        if(isGood) return randomSrc;
    }
    return null; // Niks gevonden na 20 pogingen
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

    let pool = getShadowImages();
    if(pool.length < 3) { 
        txtEl.innerText = "Te weinig plaatjes!"; 
        shadowState.processing = false; 
        return; 
    }
    
    // STAP 1: Zoek het goede antwoord (Mysterie)
    const correctImg = await findRandomCutout(pool, []);
    
    if(!correctImg) {
        txtEl.innerText = "Geen geschikt plaatje gevonden...";
        shadowState.processing = false;
        return;
    }

    shadowState.currentImg = correctImg;

    // STAP 2: Zoek 2 FOUTE antwoorden die OOK cutouts zijn
    // We geven [correctImg] mee zodat hij die niet kiest
    const wrong1 = await findRandomCutout(pool, [correctImg]);
    
    // We geven [correctImg, wrong1] mee zodat hij die niet kiest
    const wrong2 = await findRandomCutout(pool, [correctImg, wrong1]);

    // Als we geen goede opties konden vinden (zeldzaam), stop dan even
    if(!wrong1 || !wrong2) {
        txtEl.innerText = "Even opnieuw proberen...";
        shadowState.processing = false;
        setTimeout(nextShadowRound, 100);
        return;
    }

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
