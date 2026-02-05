// REKENEN.JS - SOMMEN TOT 10 MET BUBBELS
console.log("Rekenen.js geladen (Math Mode)...");

let mathState = {
    answer: 0,
    stars: 0,
    maxStars: 5,
    isAnimating: false
};

// Plaatjes ophalen uit memory thema's
function getMathImages() {
    if(typeof memThemes !== 'undefined') {
        let pool = [];
        Object.values(memThemes).forEach(t => {
            if(!t.locked && !t.isMix) {
                for(let i=1; i<=15; i++) pool.push(`${t.path}${i}.${t.extension}`);
            }
        });
        if(pool.length > 0) return pool;
    }
    return ['assets/images/icon.png']; 
}

function startMathGame() {
    const board = document.getElementById('game-board');
    mathState.stars = 0;
    mathState.isAnimating = false;

    // HTML OPBOUW
    // We genereren knoppen 1 t/m 10 met stippen
    let buttonsHTML = '';
    for(let i=1; i<=10; i++) {
        // Maak stippen HTML
        let dotsHTML = '';
        for(let d=0; d<i; d++) dotsHTML += `<span class="mini-dot"></span>`;
        
        buttonsHTML += `
            <button class="num-btn" onclick="checkMathAnswer(${i}, this)">
                <span class="btn-number">${i}</span>
                <div class="btn-dots">${dotsHTML}</div>
            </button>`;
    }

    board.innerHTML = `
        <div class="math-game-container">
            <div class="math-header">
                <button class="tool-btn" onclick="location.reload()">⬅ Terug</button>
                <div class="star-tracker">
                    <span id="m-star-1" class="star-icon">★</span>
                    <span id="m-star-2" class="star-icon">★</span>
                    <span id="m-star-3" class="star-icon">★</span>
                    <span id="m-star-4" class="star-icon">★</span>
                    <span id="m-star-5" class="star-icon">★</span>
                </div>
            </div>
            
            <div class="math-play-area" id="math-field">
                </div>
            
            <div class="math-numpad">
                ${buttonsHTML}
            </div>
        </div>
    `;

    nextMathRound();
}

function nextMathRound() {
    mathState.isAnimating = false;
    document.querySelectorAll('.num-btn').forEach(b => {
        b.className = 'num-btn'; // Reset kleuren
        b.disabled = false;
    });

    updateMathStars();

    // 1. KIES SOM TYPE (50% kans op plus, 50% op min)
    const isPlus = Math.random() > 0.5;
    
    let numA, numB;

    if (isPlus) {
        // OPTELLEN: Som mag max 10 zijn
        numA = Math.ceil(Math.random() * 5); // 1-5
        numB = Math.ceil(Math.random() * (10 - numA)); // Rest tot 10
        mathState.answer = numA + numB;
    } else {
        // AFTREKKEN: Resultaat moet positief zijn (>0)
        numA = Math.ceil(Math.random() * 8) + 1; // 2-9
        numB = Math.ceil(Math.random() * (numA - 1)); // Iets lager dan A
        mathState.answer = numA - numB;
    }

    // 2. KIES PLAATJE
    const images = getMathImages();
    let imgSrc = images.length > 0 ? images[Math.floor(Math.random() * images.length)] : 'assets/images/icon.png';

    // 3. RENDER DE BUBBELS
    const field = document.getElementById('math-field');
    
    // Functie om bubbels te maken
    const makeBubbles = (count, delayStart) => {
        let html = `<div class="bubble-group">`;
        for(let i=0; i<count; i++) {
            html += `<img src="${imgSrc}" class="math-item" style="animation-delay:${delayStart + (i*0.1)}s">`;
        }
        html += `</div>`;
        return html;
    };

    field.innerHTML = `
        ${makeBubbles(numA, 0)}
        <div class="operator-sign">${isPlus ? '+' : '-'}</div>
        ${makeBubbles(numB, 0.5)}
    `;
}

function checkMathAnswer(number, btn) {
    if(mathState.isAnimating) return;

    if(number === mathState.answer) {
        // GOED
        if(typeof playSound === 'function') playSound('win');
        btn.classList.add('correct');
        mathState.isAnimating = true;
        
        mathState.stars++;
        updateMathStars();

        if(mathState.stars >= mathState.maxStars) {
            // GEWONNEN!
            setTimeout(() => {
                if(typeof showWinnerModal === 'function') showWinnerModal("Jij");
                else alert("Gewonnen!");
            }, 800);
        } else {
            // Volgende ronde
            setTimeout(nextMathRound, 1200);
        }

    } else {
        // FOUT
        if(typeof playSound === 'function') playSound('error');
        btn.classList.add('wrong');
        
        // Ster eraf bij fout
        if(mathState.stars > 0) {
            mathState.stars--;
            updateMathStars();
        }
        
        setTimeout(() => btn.classList.remove('wrong'), 500);
    }
}

function updateMathStars() {
    for(let i=1; i<=5; i++) {
        const star = document.getElementById(`m-star-${i}`);
        if(star) {
            if(i <= mathState.stars) star.classList.add('active');
            else star.classList.remove('active');
        }
    }
}
