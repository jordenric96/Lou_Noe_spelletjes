// REKENEN.JS - TELLEN VOOR KLEUTERS (FIXED)
console.log("Rekenen.js geladen...");

let mathState = {
    currentCount: 0,
    score: 0,
    isAnimating: false
};

// --- HIER ZAT DE FOUT ---
function getMathImages() {
    // We kijken nu naar 'memThemes' in plaats van 'themes'
    if(typeof memThemes !== 'undefined') {
        let pool = [];
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                // Pak plaatje 1 t/m 15
                for(let i=1; i<=15; i++) pool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        if(pool.length > 0) return pool;
    }
    
    // Fallback als memory.js nog niet geladen is
    console.warn("Geen thema's gevonden, check volgorde scripts!");
    return ['assets/images/icon.png']; 
}

function startMathGame() {
    const board = document.getElementById('game-board');
    mathState.score = 0;

    // HTML opbouw
    board.innerHTML = `
        <div class="math-game-container">
            <div class="math-header">
                <button class="tool-btn" onclick="location.reload()">⬅ Terug</button>
                <div class="math-score-box">⭐ <span id="math-score">0</span></div>
            </div>
            
            <div class="math-play-area" id="math-field">
                </div>
            
            <div class="math-numpad">
                <button class="num-btn" onclick="checkAnswer(1, this)">1</button>
                <button class="num-btn" onclick="checkAnswer(2, this)">2</button>
                <button class="num-btn" onclick="checkAnswer(3, this)">3</button>
                <button class="num-btn" onclick="checkAnswer(4, this)">4</button>
                <button class="num-btn" onclick="checkAnswer(5, this)">5</button>
                <button class="num-btn" onclick="checkAnswer(6, this)">6</button>
                <button class="num-btn" onclick="checkAnswer(7, this)">7</button>
                <button class="num-btn" onclick="checkAnswer(8, this)">8</button>
                <button class="num-btn" onclick="checkAnswer(9, this)">9</button>
                <button class="num-btn" onclick="checkAnswer(10, this)">10</button>
            </div>
        </div>
    `;

    nextRound();
}

function nextRound() {
    mathState.isAnimating = false;
    
    document.querySelectorAll('.num-btn').forEach(b => {
        b.className = 'num-btn';
    });

    // 1. Kies getal (1-10)
    const targetNumber = Math.ceil(Math.random() * 10);
    mathState.currentCount = targetNumber;

    // 2. Kies plaatje
    const images = getMathImages();
    // Veiligheidscheck: als er toch geen images zijn, gebruik een nood-url
    let randomImg = 'assets/images/icon.png';
    if(images.length > 0) {
        randomImg = images[Math.floor(Math.random() * images.length)];
    }

    // 3. Teken
    const field = document.getElementById('math-field');
    field.innerHTML = ''; 

    for(let i=0; i<targetNumber; i++) {
        const img = document.createElement('img');
        img.src = randomImg;
        img.className = 'count-item';
        // Willekeurige positie of animatie vertraging
        img.style.animationDelay = `${i * 0.1}s`;
        field.appendChild(img);
    }
}

function checkAnswer(number, btn) {
    if(mathState.isAnimating) return;

    if(number === mathState.currentCount) {
        if(typeof playSound === 'function') playSound('win');
        btn.classList.add('correct');
        mathState.score++;
        document.getElementById('math-score').innerText = mathState.score;
        mathState.isAnimating = true;

        if(typeof memFireConfetti === 'function') memFireConfetti(); // Confetti van memory gebruiken

        setTimeout(nextRound, 1500);

    } else {
        if(typeof playSound === 'function') playSound('error');
        btn.classList.add('wrong');
        setTimeout(() => btn.classList.remove('wrong'), 500);
    }
}
