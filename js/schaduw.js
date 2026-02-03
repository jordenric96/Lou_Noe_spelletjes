// SCHADUW.JS - WIE IS HET? (MET ANTI-RECHTHOEK FILTER)
console.log("Schaduw.js geladen (Smart Filter)...");

let shadowState = {
    currentImg: null,
    score: 0,
    isLocked: false,
    processing: false // Om te voorkomen dat je dubbel klikt tijdens laden
};

// Functie om plaatjes te verzamelen
function getShadowImages() {
    if(typeof themes !== 'undefined') {
        let pool = [];
        Object.values(themes).forEach(t => {
            // We pakken plaatjes uit alle open thema's
            if(!t.locked && !t.isMix) {
                // Pak een ruim aantal (bijv 1 t/m 15)
                for(let i=1; i<=15; i++) pool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        return pool;
    }
    return [];
}

// --- DE MAGISCHE TRUC: IS DIT EEN RECHTHOEK? ---
function checkIfCutout(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        // Belangrijk voor sommige browsers om pixels te mogen lezen
        img.crossOrigin = "Anonymous"; 
        
        img.onload = () => {
            // We maken een onzichtbaar canvas aan
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            try {
                // We checken de 4 hoekpunten
                // (Links-boven, Rechts-boven, Links-onder, Rechts-onder)
                const corners = [
                    ctx.getImageData(0, 0, 1, 1).data[3],                  // Alpha (transparantie)
                    ctx.getImageData(img.width-1, 0, 1, 1).data[3],
                    ctx.getImageData(0, img.height-1, 1, 1).data[3],
                    ctx.getImageData(img.width-1, img.height-1, 1, 1).data[3]
                ];

                // Als ALLE 4 de hoeken zichtbaar zijn (alpha niet 0), is het waarschijnlijk een rechthoek
                const isRectangle = corners.every(alpha => alpha > 200); 
                
                // We willen GEEN rechthoek (dus return true als het GEEN rechthoek is)
                resolve(!isRectangle);

            } catch (e) {
                // Als we de pixels niet mogen lezen (security), laten we hem door voor de zekerheid
                console.warn("Kon pixels niet lezen:", src);
                resolve(true); 
            }
        };
        
        // Als plaatje niet laadt, negeer hem
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
            
            <div class="shadow-options" id="shadow-options">
                </div>
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
    
    // Reset
    imgEl.style.opacity = '0.3'; // Even dimmen tijdens zoeken
    imgEl.className = 'mystery-img'; // Zwart maken
    txtEl.innerText = "Zoeken...";
    optContainer.innerHTML = ''; // Leegmaken

    let pool = getShadowImages();
    if(pool.length < 3) { alert("Niet genoeg plaatjes!"); return; }
    
    // Hussel de pool zodat we willekeurig zoeken
    pool.sort(() => 0.5 - Math.random());

    let correctImg = null;

    // We proberen maximaal 10 plaatjes te checken tot we een 'cutout' (geen rechthoek) vinden
    for(let i=0; i<Math.min(pool.length, 10); i++) {
        let candidate = pool[i];
        let isGood = await checkIfCutout(candidate);
        if(isGood) {
            correctImg = candidate;
            break;
        }
    }

    // Als we echt niks konden vinden, pakken we gewoon de eerste (noodgeval)
    if(!correctImg) correctImg = pool[0];

    shadowState.currentImg = correctImg;

    // Kies 2 foute antwoorden (deze mogen wél rechthoeken zijn, dat maakt niet uit)
    let wrong1 = correctImg; 
    while(wrong1 === correctImg) wrong1 = pool[Math.floor(Math.random() * pool.length)];
    
    let wrong2 = correctImg;
    while(wrong2 === correctImg || wrong2 === wrong1) wrong2 = pool[Math.floor(Math.random() * pool.length)];

    let options = [correctImg, wrong1, wrong2];
    options.sort(() => 0.5 - Math.random());

    // Renderen
    imgEl.src = correctImg;
    imgEl.onload = () => { imgEl.style.opacity = '1'; }; // Weer zichtbaar
    txtEl.innerText = "Wie is dit?";
    
    optContainer.innerHTML = options.map(src => `
        <div class="option-card" onclick="checkShadow('${src}', this)">
            <img src="${src}">
        </div>
    `).join('');
    
    shadowState.processing = false;
}

function checkShadow(src, card) {
    if(shadowState.isLocked || shadowState.processing) return;

    if(src === shadowState.currentImg) {
        // GOED!
        if(typeof playSound === 'function') playSound('win');
        card.classList.add('correct');
        shadowState.score++;
        document.getElementById('shadow-score').innerText = shadowState.score;
        
        // Onthul het plaatje
        document.getElementById('mystery-img').classList.add('revealed');
        
        shadowState.isLocked = true;
        
        if(typeof fireConfetti === 'function') fireConfetti();

        // Iets langer wachten zodat je het plaatje goed ziet
        setTimeout(nextShadowRound, 2000);
    } else {
        // FOUT
        if(typeof playSound === 'function') playSound('error');
        card.classList.add('wrong');
    }
}
