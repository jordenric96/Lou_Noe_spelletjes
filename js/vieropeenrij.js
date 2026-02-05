// VIEROPEENRIJ.JS - MET SETUP WIZARD & PHYSICS
console.log("4-op-een-rij geladen...");

let c4State = {
    step: 0, // 0=P1, 1=P2, 2=Doel, 3=Game
    p1: { name: 'Speler 1', img: '', wins: 0 },
    p2: { name: 'Speler 2', img: '', wins: 0 },
    winsNeeded: 3,
    board: [], // 7 kolommen, 6 rijen
    currentPlayer: 1, // 1 of 2
    gameActive: false,
    isDropping: false
};

const ROWS = 6;
const COLS = 7;

// --- 1. SETUP FUNCTIES ---

function startConnect4() {
    c4State.step = 0;
    c4State.p1.wins = 0;
    c4State.p2.wins = 0;
    renderSetupStep();
}

function renderSetupStep() {
    const board = document.getElementById('game-board');
    let html = `<div class="c4-setup-container">`;

    if (c4State.step === 0 || c4State.step === 1) {
        // KIES SPELER & CHIP
        const pNum = c4State.step + 1;
        const defaultName = pNum === 1 ? "Speler 1" : "Speler 2";
        
        // Genereer chips uit thema's
        let chipsHTML = '';
        if(typeof memThemes !== 'undefined') {
            Object.values(memThemes).forEach(t => {
                if(!t.locked && !t.isMix) {
                    // Pak eerste 5 plaatjes van elk thema
                    for(let i=1; i<=5; i++) {
                        const src = `${t.path}${i}.${t.extension}`;
                        chipsHTML += `<div class="chip-option" onclick="c4SelectChip('${src}')"><img src="${src}"></div>`;
                    }
                }
            });
        }
        if(chipsHTML === '') chipsHTML = `<div class="chip-option" onclick="c4SelectChip('assets/images/icon.png')"><img src="assets/images/icon.png"></div>`;

        html += `
            <div class="c4-step-box">
                <div class="c4-title">Speler ${pNum}</div>
                <input type="text" id="c4-name-input" placeholder="${defaultName}" value="${pNum===1?'Lou':'Noé'}" 
                    style="font-size:1.2rem; padding:10px; border-radius:10px; border:1px solid #ccc; width:80%; text-align:center; font-family:'Fredoka One'; margin-bottom:15px;">
                <div style="margin-bottom:10px; color:#666;">Kies je chip:</div>
                <div class="chip-grid">${chipsHTML}</div>
            </div>
            <button class="tool-btn" onclick="location.reload()" style="margin-top:auto">Annuleren</button>
        `;
    } 
    else if (c4State.step === 2) {
        // VS SCHERM & DOEL KIEZEN
        html += `
            <div class="c4-step-box">
                <div class="c4-title">DE STRIJD!</div>
                <div class="vs-container">
                    <div class="vs-player">
                        <div class="vs-chip-big" style="border-color:#2196F3"><img src="${c4State.p1.img}"></div>
                        <div class="vs-name" style="color:#2196F3">${c4State.p1.name}</div>
                    </div>
                    <div class="vs-text">VS</div>
                    <div class="vs-player">
                        <div class="vs-chip-big" style="border-color:#F44336"><img src="${c4State.p2.img}"></div>
                        <div class="vs-name" style="color:#F44336">${c4State.p2.name}</div>
                    </div>
                </div>
                
                <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
                
                <div style="margin-bottom:15px; font-weight:bold;">Wie wint er als eerste...</div>
                <div class="goal-btn-row">
                    <button class="goal-btn selected" onclick="c4SetGoal(3, this)">3</button>
                    <button class="goal-btn" onclick="c4SetGoal(5, this)">5</button>
                    <button class="goal-btn" onclick="c4SetGoal(7, this)">7</button>
                </div>
                <div style="color:#666; font-size:0.9rem; margin-bottom:20px;">...potjes?</div>

                <button class="start-btn" onclick="c4InitGame()">START WEDSTRIJD ▶</button>
            </div>
        `;
    }

    html += `</div>`;
    board.innerHTML = html;
}

function c4SelectChip(src) {
    const input = document.getElementById('c4-name-input');
    const name = input.value.trim() || input.placeholder;
    
    if(typeof playSound === 'function') playSound('pop');

    if (c4State.step === 0) {
        c4State.p1.name = name;
        c4State.p1.img = src;
        c4State.step++;
        renderSetupStep();
    } else if (c4State.step === 1) {
        c4State.p2.name = name;
        c4State.p2.img = src;
        // Check of zelfde chip is gekozen, dat mag niet
        if(c4State.p2.img === c4State.p1.img) {
            alert("Kies een andere chip dan " + c4State.p1.name + "!");
            return;
        }
        c4State.step++;
        renderSetupStep();
    }
}

function c4SetGoal(num, btn) {
    if(typeof playSound === 'function') playSound('click');
    c4State.winsNeeded = num;
    document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// --- 2. HET SPEL ---

function c4InitGame() {
    if(typeof playSound === 'function') playSound('win');
    c4State.step = 3;
    c4State.board = Array(COLS).fill(null).map(() => Array(ROWS).fill(0)); // 0=leeg, 1=P1, 2=P2
    c4State.gameActive = true;
    c4State.isDropping = false;
    // P1 begint altijd of wissel af? Laten we P1 laten beginnen.
    // Of: Verliezer begint? Voor nu: beurt wisselt per potje.
    // Laten we simpel houden: Wie aan de beurt is staat in state.
    // We wisselen startspeler per ronde? Nee, gewoon om en om.
    
    renderBoard();
}

function renderBoard() {
    const board = document.getElementById('game-board');
    
    // Genereer dots voor wins
    const makeDots = (wins) => {
        let h = ''; 
        for(let i=0; i<c4State.winsNeeded; i++) h += `<div class="win-dot ${i<wins?'filled':''}"></div>`;
        return h;
    };

    // Grid genereren
    let gridHTML = '';
    let columnsHTML = '';
    
    // Cellen (Visueel)
    for(let r=ROWS-1; r>=0; r--) { // Tekenen van beneden naar boven voor correcte z-index? Nee, gewoon grid.
        for(let c=0; c<COLS; c++) {
            gridHTML += `<div class="c4-cell" id="cell-${c}-${r}"></div>`;
        }
    }
    
    // Klik kolommen (Onzichtbaar eroverheen)
    for(let c=0; c<COLS; c++) {
        columnsHTML += `<div class="c4-column" style="left:${c * 14.28}%" onclick="c4Drop(${c})"></div>`;
    }

    board.innerHTML = `
        <div class="c4-game-container">
            <div class="c4-header">
                <div class="score-pill ${c4State.currentPlayer===1 ? 'active-turn' : ''}" style="border-left:5px solid #2196F3">
                    <div class="mini-chip"><img src="${c4State.p1.img}"></div>
                    <div>
                        <div style="font-weight:bold; font-size:0.9rem;">${c4State.p1.name}</div>
                        <div class="wins-dots">${makeDots(c4State.p1.wins)}</div>
                    </div>
                </div>
                
                <button class="tool-btn" onclick="startConnect4()">Stop</button>
                
                <div class="score-pill ${c4State.currentPlayer===2 ? 'active-turn' : ''}" style="border-right:5px solid #F44336">
                    <div style="text-align:right;">
                        <div style="font-weight:bold; font-size:0.9rem;">${c4State.p2.name}</div>
                        <div class="wins-dots" style="justify-content:flex-end">${makeDots(c4State.p2.wins)}</div>
                    </div>
                    <div class="mini-chip"><img src="${c4State.p2.img}"></div>
                </div>
            </div>

            <div class="board-wrapper" id="board-visual">
                <div class="c4-grid">${gridHTML}</div>
                ${columnsHTML}
                <div id="chips-layer"></div>
            </div>
            <div class="board-legs"></div>
        </div>
    `;
    
    // Resize cellen op basis van schermbreedte
    setTimeout(c4Resize, 10);
    window.onresize = c4Resize;
}

function c4Resize() {
    const wrapper = document.getElementById('board-visual');
    if(!wrapper) return;
    const w = wrapper.clientWidth;
    const cellSize = (w - 20) / 7 - 8; // width - padding / 7 - gap
    
    document.querySelectorAll('.c4-cell, .game-chip').forEach(el => {
        el.style.width = cellSize + 'px';
        el.style.height = cellSize + 'px';
    });
    
    // Grid gap update
    const grid = document.querySelector('.c4-grid');
    if(grid) {
        grid.style.gridTemplateColumns = `repeat(7, ${cellSize}px)`;
        grid.style.gridTemplateRows = `repeat(6, ${cellSize}px)`;
    }
}

// --- 3. DROP LOGICA ---

function c4Drop(col) {
    if(!c4State.gameActive || c4State.isDropping) return;

    // Zoek laagste lege rij
    let row = -1;
    for(let r=0; r<ROWS; r++) {
        if(c4State.board[col][r] === 0) {
            row = r;
            break;
        }
    }

    if(row === -1) {
        // Kolom vol
        if(typeof playSound === 'function') playSound('error');
        return;
    }

    // Drop Starten
    c4State.isDropping = true;
    c4State.board[col][row] = c4State.currentPlayer;
    
    // Visuele chip aanmaken
    const chipLayer = document.getElementById('chips-layer');
    const chip = document.createElement('div');
    chip.className = 'game-chip chip-falling';
    
    const imgSrc = c4State.currentPlayer === 1 ? c4State.p1.img : c4State.p2.img;
    chip.innerHTML = `<img src="${imgSrc}">`;
    
    // Positie berekenen
    const cellRef = document.getElementById(`cell-0-0`); // Referentie voor grootte
    const size = cellRef.clientWidth;
    const gap = 8;
    
    // Left positie
    chip.style.left = ((size + gap) * col) + 'px';
    chip.style.width = size + 'px';
    chip.style.height = size + 'px';
    
    // Top target berekenen (Van boven naar beneden, maar onze grid is 0 beneden... wacht)
    // CSS Grid: Row 1 is bovenaan.
    // Mijn logica: Row 0 is onderaan.
    // Dus Row 0 (onder) = Grid Row 6. Row 5 (boven) = Grid Row 1.
    // CSS Top positie = (5 - row) * (size + gap)
    
    const targetTop = (5 - row) * (size + gap);
    chip.style.setProperty('--target-top', `${targetTop}px`);
    
    // Animatie duur en bounce kiezen op basis van valdiepte
    // Val van rij 5 (boven) naar rij 0 (onder) = VER
    // Val van rij 5 naar rij 5 = DICHTBIJ
    const dropDist = 5 - row; // 0 (bovenste) tot 5 (onderste)
    
    // Kies animatie keyframe
    // Als hij naar row 0 valt (onderaan), stuitert hij hard (dropBounce6)
    // Als hij naar row 5 valt (bovenop), stuitert hij zacht (dropBounce1)
    // Map: row 0 -> anim 6, row 5 -> anim 1
    const animIndex = 6 - row; 
    chip.style.animationName = `dropBounce${animIndex}`;
    chip.style.animationDuration = `${0.4 + (animIndex * 0.05)}s`;
    
    chipLayer.appendChild(chip);
    
    // Geluid bij neerkomen
    setTimeout(() => {
        if(typeof playSound === 'function') playSound('click');
    }, 300);

    // Na animatie
    setTimeout(() => {
        c4State.isDropping = false;
        if (c4CheckWin(col, row)) {
            c4HandleWin();
        } else if (c4CheckDraw()) {
            alert("Gelijkspel!");
            setTimeout(c4InitGame, 1000); // Reset bord
        } else {
            // Wissel beurt
            c4State.currentPlayer = c4State.currentPlayer === 1 ? 2 : 1;
            c4UpdateHeader();
        }
    }, (400 + (animIndex * 50)) + 100);
}

function c4UpdateHeader() {
    // Simpelweg her-renderen is makkelijkst, of classes togglen
    // We togglen classes voor performance
    const pills = document.querySelectorAll('.score-pill');
    if(c4State.currentPlayer === 1) {
        pills[0].classList.add('active-turn');
        pills[1].classList.remove('active-turn');
    } else {
        pills[0].classList.remove('active-turn');
        pills[1].classList.add('active-turn');
    }
}

// --- 4. WIN LOGICA ---

function c4CheckWin(c, r) {
    const player = c4State.board[c][r];
    const directions = [
        [[0,1]], // Verticaal
        [[1,0]], // Horizontaal
        [[1,1]], // Diagonaal /
        [[1,-1]] // Diagonaal \
    ];

    for (let dir of directions) {
        let count = 1;
        // Check beide kanten op
        for (let side of [-1, 1]) {
            let dc = dir[0][0] * side;
            let dr = dir[0][1] * side;
            let nextC = c + dc;
            let nextR = r + dr;
            
            while(nextC >= 0 && nextC < COLS && nextR >= 0 && nextR < ROWS && c4State.board[nextC][nextR] === player) {
                count++;
                nextC += dc;
                nextR += dr;
            }
        }
        if (count >= 4) return true;
    }
    return false;
}

function c4CheckDraw() {
    return c4State.board.every(col => col[ROWS-1] !== 0);
}

function c4HandleWin() {
    c4State.gameActive = false;
    if(typeof playSound === 'function') playSound('victory');
    
    const winnerObj = c4State.currentPlayer === 1 ? c4State.p1 : c4State.p2;
    winnerObj.wins++;
    
    // Update dots
    renderBoard(); // Even snel refreshen voor de dots

    if (winnerObj.wins >= c4State.winsNeeded) {
        setTimeout(() => {
            if(typeof showWinnerModal === 'function') showWinnerModal(winnerObj.name);
            // Na winnaar modal reset alles naar setup
            // Maar showWinnerModal reload vaak de pagina of toont menu knoppen.
        }, 1000);
    } else {
        // Volgende ronde
        setTimeout(() => {
            alert(winnerObj.name + " wint deze ronde! Op naar de volgende!");
            c4InitGame();
        }, 1000);
    }
}
