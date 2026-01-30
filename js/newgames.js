// NEWGAMES.JS - BASISVERSIE

console.log("Newgames.js geladen");

// --- WHACK A MOLE ---
let whackState = { score: 0, timer: 30, active: false, timerInterval: null };

function startWhackGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="whack-setup" style="text-align:center;">
            <h3>Vang ze!</h3>
            <p>Klik op de plaatjes zo snel als je kan!</p>
            <button class="game-btn btn-purple" onclick="initWhack()" style="margin:20px auto;">START</button>
        </div>
    `;
}

function initWhack() {
    const board = document.getElementById('game-board');
    whackState.score = 0;
    whackState.timer = 30;
    whackState.active = true;
    
    board.innerHTML = `
        <div style="text-align:center; height:100%; display:flex; flex-direction:column;">
            <div style="font-size:1.5rem; margin-bottom:10px; font-family:'Fredoka One';">
                Tijd: <span id="w-time">30</span> | Score: <span id="w-score">0</span>
            </div>
            <div id="mole-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; flex:1;">
                ${Array(9).fill('<div class="mole-hole" onclick="hitMole(this)" style="background:#DDD; border-radius:10px; position:relative; overflow:hidden;"></div>').join('')}
            </div>
        </div>
    `;
    
    whackState.timerInterval = setInterval(() => {
        if(!whackState.active) return;
        whackState.timer--;
        document.getElementById('w-time').innerText = whackState.timer;
        if(whackState.timer <= 0) endWhack();
    }, 1000);
    
    moleLoop();
}

function moleLoop() {
    if(!whackState.active) return;
    const holes = document.querySelectorAll('.mole-hole');
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    
    // Toon plaatje
    randomHole.innerHTML = `<img src="assets/images/memory/mario/1.png" style="width:80%; height:80%; object-fit:contain; pointer-events:none; animation:popIn 0.2s;">`;
    randomHole.classList.add('active');
    
    setTimeout(() => {
        randomHole.innerHTML = '';
        randomHole.classList.remove('active');
        if(whackState.active) setTimeout(moleLoop, 800); 
    }, 800);
}

function hitMole(div) {
    if(!whackState.active || !div.classList.contains('active')) return;
    playSound('pop');
    whackState.score++;
    document.getElementById('w-score').innerText = whackState.score;
    div.classList.remove('active');
    div.innerHTML = '';
}

function endWhack() {
    whackState.active = false;
    clearInterval(whackState.timerInterval);
    showWinnerModal("Jij", [{name:"Jij", score:whackState.score}]);
}

function stopWhackGame() {
    whackState.active = false;
    clearInterval(whackState.timerInterval);
}

// --- SIMON ---
let simonSeq = [];
let playerSeq = [];
let simonLevel = 0;

function startSimonGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; height:80%; padding:20px;">
            <button id="s-0" style="background:#FF5252; border-radius:15px;" onclick="simonHit(0)"></button>
            <button id="s-1" style="background:#448AFF; border-radius:15px;" onclick="simonHit(1)"></button>
            <button id="s-2" style="background:#69F0AE; border-radius:15px;" onclick="simonHit(2)"></button>
            <button id="s-3" style="background:#FFD740; border-radius:15px;" onclick="simonHit(3)"></button>
        </div>
        <button onclick="nextSimon()" style="position:absolute; bottom:20px; padding:10px 30px; font-size:1.5rem;">START</button>
    `;
    simonSeq = [];
    simonLevel = 0;
}

function nextSimon() {
    simonLevel++;
    playerSeq = [];
    simonSeq.push(Math.floor(Math.random()*4));
    playSeq();
}

function playSeq() {
    let i = 0;
    const int = setInterval(() => {
        const btn = document.getElementById(`s-${simonSeq[i]}`);
        btn.style.opacity = 0.3;
        playSound('pop');
        setTimeout(() => btn.style.opacity = 1, 300);
        i++;
        if(i >= simonSeq.length) clearInterval(int);
    }, 600);
}

function simonHit(id) {
    playSound('click');
    playerSeq.push(id);
    if(playerSeq[playerSeq.length-1] !== simonSeq[playerSeq.length-1]) {
        alert("Jammer!");
        startSimonGame();
        return;
    }
    if(playerSeq.length === simonSeq.length) {
        setTimeout(nextSimon, 1000);
    }
}

function stopSimonGame() {} // Leeg
