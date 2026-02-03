// REKENEN.JS - TELLEN VOOR KLEUTERS
console.log("Rekenen.js geladen...");

let mathState = {
    currentCount: 0,
    score: 0,
    isAnimating: false
};

// We gebruiken de thema's uit memory.js als die geladen is. 
// Anders een fallback lijstje voor de zekerheid.
function getMathImages() {
    // Probeer memory themes te vinden
    if(typeof themes !== 'undefined') {
        let pool = [];
        Object.values(themes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=15; i++) pool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        if(pool.length > 0) return pool;
    }
    // Fallback als memory niet geladen is (zou niet moeten gebeuren)
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
    
    // Reset knoppen
    document.querySelectorAll('.num-btn').forEach(b => {
        b.className = 'num-btn';
    });

    // 1. Kies een getal tussen 1 en 10
    // Tip: Voor hele kleintjes (Lou/Noé) is 1-10 misschien soms veel. 
    // Je kunt dit aanpassen naar Math.ceil(Math.random() * 5) voor 1-5.
    const targetNumber = Math.ceil(Math.random() * 10);
    mathState.currentCount = targetNumber;

    // 2. Kies een willekeurig plaatje uit de collectie
    const images = getMathImages();
    const randomImg = images[Math.floor(Math.random() * images.length)];

    // 3. Teken de plaatjes
    const field = document.getElementById('math-field');
    field.innerHTML = ''; // Leegmaken

    for(let i=0; i<targetNumber; i++) {
        const img = document.createElement('img');
        img.src = randomImg;
        img.className = 'count-item';
        // Geef ze een beetje willekeurige vertraging in animatie
        img.style.animationDelay = `${i * 0.1}s`;
        field.appendChild(img);
    }
}

function checkAnswer(number, btn) {
    if(mathState.isAnimating) return;

    if(number === mathState.currentCount) {
        // GOED!
        if(typeof playSound === 'function') playSound('win');
        btn.classList.add('correct');
        mathState.score++;
        document.getElementById('math-score').innerText = mathState.score;
        mathState.isAnimating = true;

        // Viering
        if(typeof fireConfetti === 'function') fireConfetti();

        // Volgende ronde na 1.5 seconde
        setTimeout(nextRound, 1500);

    } else {
        // FOUT
        if(typeof playSound === 'function') playSound('error');
        btn.classList.add('wrong');
        setTimeout(() => btn.classList.remove('wrong'), 500);
    }
}
