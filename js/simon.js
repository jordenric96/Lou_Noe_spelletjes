// SIMON.JS - Simon Zegt
console.log("Simon.js geladen");

let sSeq=[], pSeq=[], sLvl=0, sAct=false, sThm='mario';
const sThms = {
    'mario': { path: 'assets/images/memory/mario/', ext: 'png' },
    'pokemon': { path: 'assets/images/memory/pokemon/', ext: 'png' }
};

function startSimonGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="memory-setup" style="text-align:center;">
            <div class="setup-group">
                <h3>Kies Vriendjes 💡</h3>
                <div class="option-grid">
                    <button class="option-btn selected" onclick="setSimonTheme('mario', this)"><span>🍄</span><span class="btn-label">Mario</span></button>
                    <button class="option-btn" onclick="setSimonTheme('pokemon', this)"><span>⚡</span><span class="btn-label">Pokémon</span></button>
                </div>
            </div>
            <button class="start-btn" onclick="initSimon()">START</button>
        </div>
    `;
    sThm = 'mario';
}

function setSimonTheme(t, btn) {
    if(typeof playSound === 'function') playSound('click');
    sThm = t;
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function initSimon() {
    const board = document.getElementById('game-board');
    const t = sThms[sThm];
    let buttons = '';
    for(let i=0; i<4; i++) {
        buttons += `<button class="simon-btn" id="sb-${i}" style="background-image:url('${t.path}${i+1}.${t.ext}'); background-size:cover;" onclick="hSim(${i})"></button>`;
    }
    board.innerHTML = `
        <div class="simon-container">
            <div class="simon-info"><div class="simon-score">Score: <span id="s-score">0</span></div><div class="simon-message" id="s-msg">Let op...</div></div>
            <div class="simon-board theme-${sThm}">${buttons}</div>
            <button class="start-btn" onclick="nextSim()" style="width:auto; padding:10px 20px; margin-top:20px;">Start!</button>
        </div>
    `;
    sSeq=[]; sLvl=0;
}

function nextSim() {
    sLvl++; pSeq=[]; 
    document.getElementById('s-score').innerText = sLvl-1;
    document.getElementById('s-msg').innerText = "Kijk goed...";
    sSeq.push(Math.floor(Math.random()*4));
    
    document.querySelector('.simon-container .start-btn').style.display = 'none';
    
    sAct = false; let i=0;
    const int = setInterval(() => {
        actSim(sSeq[i]); i++;
        if(i >= sSeq.length) { clearInterval(int); sAct=true; document.getElementById('s-msg').innerText = "Jij!"; }
    }, 800);
}

function actSim(i) {
    const b = document.getElementById(`sb-${i}`);
    if(b) {
        b.classList.add('lit');
        if(typeof playSound === 'function') playSound('pop');
        setTimeout(() => b.classList.remove('lit'), 400);
    }
}

function hSim(i) {
    if(!sAct) return;
    actSim(i); pSeq.push(i);
    if(pSeq[pSeq.length-1] !== sSeq[pSeq.length-1]) {
        if(typeof playSound === 'function') playSound('lose');
        document.getElementById('s-msg').innerText = "Fout!";
        sAct = false;
        if(typeof showWinnerModal === 'function') showWinnerModal("Simon", [{name:"Jij", score: sLvl-1}]);
        return;
    }
    if(pSeq.length === sSeq.length) {
        sAct = false; document.getElementById('s-msg').innerText = "Goed zo!";
        setTimeout(nextSim, 1000);
    }
}
function stopSimonGame() { sAct = false; }
