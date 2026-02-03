// SCHADUW.JS - STRENGE FILTER + STERREN + WINNER MODAL
console.log("Schaduw.js geladen (Final Fix)...");

let shadowState = {
    currentImg: null,
    stars: 0,
    maxStars: 5,
    isLocked: false,
    processing: false 
};

// 1. OPHALEN PLAATJES (Uit Memory Thema's)
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

// 2. DE FILTER: IS DIT EEN UITKNIPSEL?
// (Checkt de 4 hoeken: als ze allemaal gekleurd zijn = rechthoek = FOUT)
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
                // Pak de 4 hoekpixels
                const corners = [
                    ctx.getImageData(0, 0, 1, 1).data[3],                  // Links-boven
                    ctx.getImageData(img.width-1, 0, 1, 1).data[3],        // Rechts-boven
                    ctx.getImageData(0, img.height-1, 1, 1).data[3],       // Links-onder
                    ctx.getImageData(img.width-1, img.height-1, 1, 1).data[3] // Rechts-onder
                ];

                // Als ALLE hoeken zichtbaar zijn (>200 alpha), is het een rechthoek.
                // Wij willen GEEN rechthoek.
                const isRectangle = corners.every(alpha => alpha > 200); 
                resolve(!isRectangle); // Return TRUE als het een cutout is

            } catch (e) {
                // Bij twijfel (security error), negeer plaatje voor de zekerheid
                resolve(false); 
            }
        };
        // Als plaatje niet laadt, is het zeker fout
        img.onerror = () => resolve(false);
    });
}

// 3. ZOEKER: BLIJF ZOEKEN TOT JE EEN GOEIE HEBT
async function findRandomCutout(pool, excludeList = []) {
    // Probeer maximaal 30 keer een goede te vinden
    for(let i=0; i<30; i++) {
        const randomSrc = pool[Math.floor(Math.random() * pool.length)];
        
        // Mag niet al gebruikt zijn in deze ronde
        if(excludeList.includes(randomSrc)) continue;

        // CHECK DE FILTER
        const isGood = await checkIfCutout(randomSrc);
        if(isGood) return randomSrc;
    }
    return null; // Niks gevonden
}

// --- START GAME ---
function startShadowGame() {
    const board = document.getElementById('game-board');
    shadowState.stars = 0; 
    shadowState.isLocked = false;
    shadowState.processing = false;

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
                <div class="shadow-question" id="shadow-txt">Zoeken...</div>
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

    // UI Updates
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
    imgEl.className = 'mystery-img'; 
    txtEl.innerText = "Plaatje zoeken...";
    optContainer.innerHTML = ''; 

    let pool = getShadowImages();
    if(pool.length < 3) { alert("Te weinig plaatjes!"); return; }
    
    // STAP 1: Zoek het goede antwoord (MOET cutout zijn)
    const correctImg = await findRandomCutout(pool, []);
    
    if(!correctImg) {
        txtEl.innerText = "Geen geschikt plaatje...";
        // Probeer het over 1 seconde nog eens (misschien pech gehad)
        setTimeout(() => { shadowState.processing = false; nextShadowRound(); }, 1000);
        return;
    }

    shadowState.currentImg = correctImg;

    // STAP 2: Zoek 2 foute antwoorden (MOETEN OOK cutouts zijn)
    const wrong1 = await findRandomCutout(pool, [correctImg]);
    const wrong2 = await findRandomCutout(pool, [correctImg, wrong1]);

    if(!wrong1 || !wrong2) {
        // Als we geen foute opties kunnen vinden die cutouts zijn, herstart
        setTimeout(() => { shadowState.processing = false; nextShadowRound(); }, 500);
        return;
    }

    let options = [correctImg, wrong1, wrong2];
    options.sort(() => 0.5 - Math.random());

    // Renderen
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
        // GOED!
        if(typeof playSound === 'function') playSound('win');
        card.classList.add('correct');
        
        // Onthul en update tekst
        document.getElementById('mystery-img').classList.add('revealed');
        document.getElementById('shadow-txt').innerText = "Ja! Goed zo!";
        
        shadowState.isLocked = true;
        shadowState.stars++;
        
        // Visuele ster update
        const starEl = document.getElementById(`star-${shadowState.stars}`);
        if(starEl) {
            starEl.classList.add('earned');
            starEl.style.transform = "scale(1.5)"; 
            setTimeout(() => starEl.style.transform = "scale(1.3)", 300);
        }

        // GEWONNEN? (5 Sterren)
        if(shadowState.stars >= shadowState.maxStars) {
            setTimeout(() => {
                // ROEP HET NIEUWE CENTRALE WINNAARS SCHERM AAN
                if(typeof showWinnerModal === 'function') {
                    showWinnerModal("Jij");
                } else {
                    alert("Gewonnen!");
                    location.reload();
                }
            }, 1000);
        } else {
            // Volgende ronde
            setTimeout(nextShadowRound, 1500);
        }

    } else {
        // FOUT
        if(typeof playSound === 'function') playSound('error');
        card.classList.add('wrong');
    }
}
