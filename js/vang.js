// VANG.JS - Vang ze!
console.log("Vang.js geladen");

let wState = { score: 0, timer: 30, active: false, speed: 1000, grid: 9, timerInt: null, moleInt: null };

function startWhackGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="memory-setup" style="text-align:center;">
            <div class="setup-group" style="width:100%; max-width:400px; margin:0 auto;">
                <h3>Vang ze! 🔨</h3>
                <p style="font-size:0.9rem; color:#666; margin-bottom:10px;">Pas op voor de 💣 en de 💩!</p>
                <div class="option-grid">
                    <button class="option-btn" onclick="setWhackDiff('easy', this)"><span>🟢</span><span class="btn-label">Makkelijk</span></button>
                    <button class="option-btn selected" onclick="setWhackDiff('medium', this)"><span>🟠</span><span class="btn-label">Normaal</span></button>
                    <button class="option-btn" onclick="setWhackDiff('hard', this)"><span>🔴</span><span class="btn-label">Snel!</span></button>
                </div>
            </div>
            <button class="start-btn" onclick="runWhackGame()">START SPEL</button>
        </div>
    `;
    wState.speed = 900; wState.grid = 9;
}

function setWhackDiff(diff, btn) {
    if(typeof playSound === 'function') playSound('click');
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    if(diff === 'easy') { wState.speed = 1200; wState.grid = 4; }
    else if(diff === 'medium') { wState.speed = 900; wState.grid = 9; }
    else if(diff === 'hard') { wState.speed = 550; wState.grid = 12; }
}

function runWhackGame() {
    if(typeof playSound === 'function') playSound('win');
    const board = document.getElementById('game-board');
    wState.score = 0; wState.timer = 30; wState.active = true;
    
    let gridClass = wState.grid === 4 ? 'grid-2' : (wState.grid === 12 ? 'grid-4' : 'grid-3');
    let holes = '';
    for(let i=0; i<wState.grid; i++) {
        holes += `<div class="whack-hole" id="hole-${i}" onmousedown="whack(this)" ontouchstart="whack(this)"><div class="whack-character"></div></div>`;
    }
    
    board.innerHTML = `
        <div class="whack-container">
            <div class="whack-score-board">
                <span>Tijd: <span id="w-time">30</span></span>
                <span>Score: <span id="w-score">0</span></span>
            </div>
            <div class="whack-grid ${gridClass}">${holes}</div>
        </div>
    `;
    
    wState.timerInt = setInterval(() => {
        if(!wState.active) return;
        wState.timer--;
        document.getElementById('w-time').innerText = wState.timer;
        if(wState.timer <= 0) endWhack(false);
    }, 1000);
    
    popMole();
}

function popMole() {
    if(!wState.active) return;
    const holes = document.querySelectorAll('.whack-hole');
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    const char = randomHole.querySelector('.whack-character');
    
    randomHole.classList.remove('trap-bomb', 'trap-poop');
    char.innerHTML = ''; char.style.backgroundImage = '';

    if (Math.random() < 0.2) {
        if (Math.random() < 0.5) { randomHole.classList.add('trap-bomb'); char.innerText = '💣'; }
        else { randomHole.classList.add('trap-poop'); char.innerText = '💩'; }
    } else {
        const imgNr = Math.floor(Math.random() * 10) + 1;
        char.style.backgroundImage = `url('assets/images/memory/mario/${imgNr}.png')`;
    }
    
    randomHole.classList.add('up');
    wState.moleInt = setTimeout(() => {
        randomHole.classList.remove('up');
        if(wState.active) setTimeout(popMole, Math.random() * 500);
    }, wState.speed);
}

function whack(hole) {
    if(!wState.active || !hole.classList.contains('up') || hole.classList.contains('whacked')) return;
    
    if (hole.classList.contains('trap-bomb') || hole.classList.contains('trap-poop')) {
        if(typeof playSound === 'function') playSound('lose');
        hole.querySelector('.whack-character').innerText = '💥'; hole.style.backgroundColor = 'red';
        wState.active = false; setTimeout(() => endWhack(true), 500);
        return;
    }

    if(typeof playSound === 'function') playSound('pop');
    wState.score++; document.getElementById('w-score').innerText = wState.score;
    hole.classList.remove('up'); hole.classList.add('whacked');
    setTimeout(() => hole.classList.remove('whacked'), 200);
}

function endWhack(isGameOver) {
    wState.active = false; clearInterval(wState.timerInt); clearTimeout(wState.moleInt);
    let msg = isGameOver ? "BOEM! Verloren!" : "Goed gedaan!";
    if(typeof showWinnerModal === 'function') showWinnerModal(msg, [{name:"Score", score: wState.score}]);
}
function stopWhackGame() { wState.active = false; clearInterval(wState.timerInt); clearTimeout(wState.moleInt); }
