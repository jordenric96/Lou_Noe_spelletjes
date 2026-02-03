// SCHADUW.JS - WIE IS HET?
console.log("Schaduw.js geladen...");

let shadowState = {
    currentImg: null,
    score: 0,
    isLocked: false
};

// Hergebruik de functie om plaatjes te vinden uit rekenen.js/memory.js
function getShadowImages() {
    if(typeof themes !== 'undefined') {
        let pool = [];
        Object.values(themes).forEach(t => {
            if(!t.locked && !t.isMix) {
                // We pakken alleen plaatjes 1 t/m 10 om zeker te zijn dat ze bestaan
                for(let i=1; i<=10; i++) pool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        if(pool.length > 3) return pool;
    }
    return []; // Leeg als backup
}

function startShadowGame() {
    const board = document.getElementById('game-board');
    shadowState.score = 0;
    shadowState.isLocked = false;

    board.innerHTML = `
        <div class="shadow-game-container">
            <div class="shadow-header">
                <button class="tool-btn" onclick="location.reload()">⬅ Terug</button>
                <div class="shadow-score-box">🕵️ <span id="shadow-score">0</span></div>
            </div>
            
            <div class="shadow-stage">
                <div class="mystery-card">
                    <img id="mystery-img" class="mystery-img" src="">
                </div>
                <div class="shadow-question">Wie is dit?</div>
            </div>
            
            <div class="shadow-options" id="shadow-options">
                </div>
        </div>
    `;

    nextShadowRound();
}

function nextShadowRound() {
    shadowState.isLocked = false;
    const imgEl = document.getElementById('mystery-img');
    if(!imgEl) return;
    
    // Reset naar zwart (voor het geval hij onthuld was)
    imgEl.className = 'mystery-img';

    const pool = getShadowImages();
    if(pool.length < 3) { alert("Niet genoeg thema's open!"); return; }

    // 1. Kies het juiste plaatje
    const correctImg = pool[Math.floor(Math.random() * pool.length)];
    shadowState.currentImg = correctImg;

    // 2. Kies 2 foute plaatjes (die niet hetzelfde zijn)
    let wrong1 = correctImg; 
    while(wrong1 === correctImg) wrong1 = pool[Math.floor(Math.random() * pool.length)];
    
    let wrong2 = correctImg;
    while(wrong2 === correctImg || wrong2 === wrong1) wrong2 = pool[Math.floor(Math.random() * pool.length)];

    // 3. Hussel de opties
    let options = [correctImg, wrong1, wrong2];
    options.sort(() => 0.5 - Math.random());

    // 4. Render
    document.getElementById('mystery-img').src = correctImg;
    
    const optContainer = document.getElementById('shadow-options');
    optContainer.innerHTML = options.map(src => `
        <div class="option-card" onclick="checkShadow('${src}', this)">
            <img src="${src}">
        </div>
    `).join('');
}

function checkShadow(src, card) {
    if(shadowState.isLocked) return;

    if(src === shadowState.currentImg) {
        // GOED!
        if(typeof playSound === 'function') playSound('win');
        card.classList.add('correct');
        shadowState.score++;
        document.getElementById('shadow-score').innerText = shadowState.score;
        
        // Onthul het plaatje in het midden
        document.getElementById('mystery-img').classList.add('revealed');
        
        shadowState.isLocked = true;
        
        if(typeof fireConfetti === 'function') fireConfetti();

        setTimeout(nextShadowRound, 1500);
    } else {
        // FOUT
        if(typeof playSound === 'function') playSound('error');
        card.classList.add('wrong');
    }
}
