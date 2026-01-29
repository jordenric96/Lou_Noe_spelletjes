// DOOLHOF SPEL LOGICA

let mazeState = {
    theme: 'mario',
    difficulty: 'medium', // easy, medium, hard
    gridSize: 15, // Wordt gezet door difficulty (11, 15, of 21)
    mazeGrid: [], // Het 2D model van het doolhof (0=pad, 1=muur)
    playerPosition: { x: 1, y: 1 }, // Startpositie
    goalPosition: { x: 0, y: 0 }, // Eindpositie
    isGameActive: false
};

const mazeThemes = {
    'mario': { locked: false, icon: '🍄', path: 'assets/images/doolhof/mario/' },
    // Later meer thema's toevoegen:
    // 'minecraft': { locked: true, icon: '🧱', path: 'assets/images/doolhof/minecraft/' }
};

// ==========================================
// 1. SETUP SCHERM (Lijkt op Memory)
// ==========================================
function startDoolhofSetup() {
    const board = document.getElementById('game-board');
    // We hergebruiken CSS classes uit memory.css omdat ze dezelfde stijl hebben!
    
    let themeButtons = Object.keys(mazeThemes).map(key => {
        const t = mazeThemes[key];
        const isLocked = t.locked ? 'locked' : '';
        return `<button class="option-btn ${isLocked}" onclick="setMazeTheme('${key}', this)">
            <span>${t.icon}</span><span class="btn-label">${key}</span></button>`;
    }).join('');

    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-columns">
                <div class="setup-group group-theme">
                    <h3>Thema</h3>
                    <div class="option-grid">${themeButtons}</div>
                </div>
                <div class="setup-group group-size">
                    <h3>Moeilijkheid</h3>
                    <div class="option-grid">
                        <button class="option-btn" onclick="setMazeDiff('easy', 11, this)"><span>⭐</span><span class="btn-label">Makkelijk</span></button>
                        <button class="option-btn selected" onclick="setMazeDiff('medium', 15, this)"><span>⭐⭐</span><span class="btn-label">Gemiddeld</span></button>
                        <button class="option-btn" onclick="setMazeDiff('hard', 21, this)"><span>⭐⭐⭐</span><span class="btn-label">Moeilijk</span></button>
                    </div>
                </div>
            </div>
            <button class="start-btn" onclick="startDoolhofGame()">Start Doolhof ▶️</button>
        </div>
    `;

    // Defaults selecteren
    setTimeout(() => {
        const defaultTheme = document.querySelector(`.option-btn[onclick="setMazeTheme('mario', this)"]`);
        if(defaultTheme) defaultTheme.classList.add('selected');
    }, 10);
    mazeState.theme = 'mario';
    mazeState.difficulty = 'medium';
    mazeState.gridSize = 15;
}

function setMazeTheme(name, btn) {
    if(mazeThemes[name].locked) return;
    mazeState.theme = name;
    selectSingleBtn(btn);
}
function setMazeDiff(diff, size, btn) {
    mazeState.difficulty = diff;
    mazeState.gridSize = size;
    selectSingleBtn(btn);
}
// Hergebruik deze hulpfunctie uit memory.js als je wilt, of laat hem hier staan
function selectSingleBtn(btn) {
    Array.from(btn.parentElement.children).forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
}

// ==========================================
// 2. HET SPEL STARTEN & GENEREREN
// ==========================================
function startDoolhofGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div id="maze-container" class="theme-${mazeState.theme}">
            <div id="maze-grid">
                </div>
        </div>
        <div id="mobile-controls">
            <div class="ctrl-btn" id="btn-up">⬆️</div>
            <div class="ctrl-btn" id="btn-left">⬅️</div>
            <div class="ctrl-btn" id="btn-down">⬇️</div>
            <div class="ctrl-btn" id="btn-right">➡️</div>
        </div>
    `;

    generateMaze(mazeState.gridSize);
    drawMaze();
    placePlayer();
    setupControls();
    mazeState.isGameActive = true;
}

// --- MAZE GENERATOR ALGORITME (Recursive Backtracker) ---
// Dit is een standaard algoritme om perfecte doolhoven te maken.
function generateMaze(size) {
    // 1. Vul alles met muren (1)
    mazeState.mazeGrid = Array(size).fill().map(() => Array(size).fill(1));

    // Hulpfuncties voor het algoritme
    const directions = [ [0, -2], [0, 2], [-2, 0], [2, 0] ]; // Spring 2 vakjes (over een muur heen)
    function shuffle(array) { array.sort(() => Math.random() - 0.5); }
    function isValid(x, y) { return x > 0 && x < size - 1 && y > 0 && y < size - 1; }

    function carve(x, y) {
        mazeState.mazeGrid[y][x] = 0; // Maak een pad

        shuffle(directions); // Willekeurige volgorde van richtingen

        for (let [dx, dy] of directions) {
            let nextX = x + dx;
            let nextY = y + dy;

            // Als het volgende punt binnen het bord is EN het is nog een muur
            if (isValid(nextX, nextY) && mazeState.mazeGrid[nextY][nextX] === 1) {
                // Sla de muur ertussenin weg
                mazeState.mazeGrid[y + dy/2][x + dx/2] = 0;
                // Ga verder vanaf het nieuwe punt (recursie)
                carve(nextX, nextY);
            }
        }
    }

    // Start bovenaan links (altijd op een oneven coördinaat beginnen: 1,1)
    carve(1, 1);
    mazeState.playerPosition = { x: 1, y: 1 };

    // Doel bepalen (rechtsonder, ook op oneven coördinaten)
    mazeState.goalPosition = { x: size - 2, y: size - 2 };
    // Zeker weten dat het doel een pad is (zou moeten kloppen door algoritme)
    mazeState.mazeGrid[mazeState.goalPosition.y][mazeState.goalPosition.x] = 0; 
}

// --- HET DOOLHOF TEKENEN ---
function drawMaze() {
    const gridEl = document.getElementById('maze-grid');
    const size = mazeState.gridSize;
    
    // CSS Grid instellen
    gridEl.style.gridTemplateColumns = `repeat(${size}, auto)`;

    // Cell size bepalen (responsive)
    let cellSize = window.innerWidth < 768 ? 20 : 30;

    // HTML bouwen
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('div');
            cell.classList.add('maze-cell');
            
            // Is het een muur of pad?
            if (mazeState.mazeGrid[y][x] === 1) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('path');
            }

            // Is het het doel?
            if (x === mazeState.goalPosition.x && y === mazeState.goalPosition.y) {
                cell.classList.add('goal');
            }
            
            // Zet de afmetingen hardcoded op de cell voor correcte berekening player positie
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;

            gridEl.appendChild(cell);
        }
    }
}

function placePlayer() {
    const gridEl = document.getElementById('maze-grid');
    const player = document.createElement('div');
    player.id = 'player';
    
    // Plaatje instellen op basis van thema
    const themeData = mazeThemes[mazeState.theme];
    player.style.backgroundImage = `url('${themeData.path}player.png')`;

    // Cell size ophalen
    let cellSize = window.innerWidth < 768 ? 20 : 30;
    player.style.width = `${cellSize}px`;
    player.style.height = `${cellSize}px`;

    gridEl.appendChild(player);
    updatePlayerPositionVisually();
}


// ==========================================
// 3. BESTURING & BEWEGING
// ==========================================
function setupControls() {
    // Toetsenbord
    document.addEventListener('keydown', handleKeyPress);

    // Mobiele knoppen
    document.getElementById('btn-up').addEventListener('click', () => movePlayer(0, -1));
    document.getElementById('btn-down').addEventListener('click', () => movePlayer(0, 1));
    document.getElementById('btn-left').addEventListener('click', () => movePlayer(-1, 0));
    document.getElementById('btn-right').addEventListener('click', () => movePlayer(1, 0));
}

function handleKeyPress(e) {
    if (!mazeState.isGameActive) return;

    // Voorkom scrollen met pijltjestoetsen
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    switch(e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
    }
}

function movePlayer(dx, dy) {
    if (!mazeState.isGameActive) return;

    const newX = mazeState.playerPosition.x + dx;
    const newY = mazeState.playerPosition.y + dy;
    const playerEl = document.getElementById('player');

    // 1. Richting bepalen (voor spiegelen)
    if (dx < 0) {
        // Naar links: voeg class toe
        playerEl.classList.add('facing-left');
    } else if (dx > 0) {
        // Naar rechts: verwijder class
        playerEl.classList.remove('facing-left');
    }
    // Bij omhoog/omlaag verandert de kijkrichting niet, dus doen we niets.

    // 2. Check of de nieuwe plek geldig is (geen muur)
    // We checken eerst of we binnen het rooster blijven, en dan of het grid op die plek 0 is.
    if (newX >= 0 && newX < mazeState.gridSize && 
        newY >= 0 && newY < mazeState.gridSize &&
        mazeState.mazeGrid[newY][newX] === 0) {
        
        // Update positie in state
        mazeState.playerPosition.x = newX;
        mazeState.playerPosition.y = newY;

        // Update visueel
        updatePlayerPositionVisually();

        // Check winst
        checkWin();
    } else {
        // Optioneel: speel een 'bonk' geluidje af als je tegen een muur loopt
        console.log("Bonk! Muur.");
    }
}

function updatePlayerPositionVisually() {
    const playerEl = document.getElementById('player');
    // Cell size ophalen om positie te berekenen
    let cellSize = window.innerWidth < 768 ? 20 : 30;
    
    playerEl.style.left = `${mazeState.playerPosition.x * cellSize}px`;
    playerEl.style.top = `${mazeState.playerPosition.y * cellSize}px`;
}

function checkWin() {
    if (mazeState.playerPosition.x === mazeState.goalPosition.x && 
        mazeState.playerPosition.y === mazeState.goalPosition.y) {
        
        mazeState.isGameActive = false;
        setTimeout(() => {
            alert("Gefeliciteerd! Je hebt de uitgang gevonden! 🎉");
            // Terug naar setup of nieuw doolhof genereren?
            // Voor nu, ga terug naar setup na ok klikken
            startDoolhofSetup();
        }, 300);
    }
}

// Schoonmaken bij verlaten spel (belangrijk voor event listeners)
function cleanupDoolhof() {
    document.removeEventListener('keydown', handleKeyPress);
    mazeState.isGameActive = false;
}

// We moeten in main.js zorgen dat cleanupDoolhof wordt aangeroepen als we op 'Terug' klikken.
// Dat doen we in de volgende stap.
