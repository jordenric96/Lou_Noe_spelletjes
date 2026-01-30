// DOOLHOF SPEL LOGICA - MET GELUID & SPELERS

let mazeState = {
    theme: 'mario',
    difficulty: 'medium',
    gridSize: 15,
    mazeGrid: [],
    playerPosition: { x: 1, y: 1 },
    goalPosition: { x: 0, y: 0 },
    isGameActive: false,
    playerNames: [], // Nu ook spelers voor doolhof
    currentPlayerIndex: 0,
    activeColor: '#F44336',
    pendingPlayer: null
};

// HERGEBRUIK DEZELFDE SPELERS & KLEUREN LOGICA ALS MEMORY
const doolhofPalette = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FFEB3B', '#FF9800'];
const doolhofPlayers = [ { name: "Lou", icon: "👦🏼" }, { name: "Noé", icon: "👶🏼" }, { name: "Mama", icon: "👩🏻" }, { name: "Papa", icon: "👨🏻" } ];

const mazeThemes = {
    'mario': { locked: false, icon: '🍄', path: 'assets/images/doolhof/mario/' },
    'pokemon': { locked: false, icon: '⚡', path: 'assets/images/doolhof/pokemon/' }, 
};

function startDoolhofSetup() {
    const board = document.getElementById('game-board');
    
    // Thema knoppen
    let themeButtons = Object.keys(mazeThemes).map(key => {
        const t = mazeThemes[key];
        const isLocked = t.locked ? 'locked' : '';
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return `<button class="option-btn ${isLocked}" onclick="setMazeTheme('${key}', this)">
            <span>${t.icon}</span><span class="btn-label">${label}</span></button>`;
    }).join('');

    // Speler knoppen
    let playerButtons = doolhofPlayers.map(p => 
        `<button class="option-btn player-btn" onclick="selectMazePerson('${p.name}', this)">
            <span>${p.icon}</span><span class="btn-label">${p.name}</span>
        </button>`
    ).join('');

    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-columns">
                <div class="setup-group group-players">
                    <h3>Wie speelt er?</h3>
                    <div class="option-grid" id="maze-player-selection">${playerButtons}</div>
                    <div class="divider-line"></div>
                    <h3>Kies een kleur</h3>
                    <div class="color-row" id="maze-color-palette"></div>
                    <div id="maze-active-players"></div>
                </div>

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
            <button id="start-maze-btn" class="start-btn" onclick="startDoolhofGame()" disabled>Kies een speler...</button>
        </div>
    `;

    mazeState.playerNames = [];
    mazeState.theme = 'mario';
    mazeState.difficulty = 'medium';
    mazeState.gridSize = 15;
    
    renderMazePalette();
    setTimeout(() => {
        const defaultTheme = document.querySelector(`.option-btn[onclick="setMazeTheme('mario', this)"]`);
        if(defaultTheme) defaultTheme.classList.add('selected');
    }, 10);
}

// SETUP LOGICA
function renderMazePalette() {
    const container = document.getElementById('maze-color-palette');
    const usedColors = mazeState.playerNames.map(p => p.color);
    container.innerHTML = doolhofPalette.map(color => {
        const isTaken = usedColors.includes(color);
        const style = isTaken ? 'opacity: 0.2; cursor: not-allowed;' : '';
        const action = isTaken ? '' : `selectMazeColor('${color}')`;
        return `<div class="color-dot" style="background-color: ${color}; ${style}" onclick="${action}"></div>`;
    }).join('');
}

function selectMazePerson(name, btn) {
    playSound('click');
    document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected-pending'));
    btn.classList.add('selected-pending');
    mazeState.pendingPlayer = name;
}

function selectMazeColor(color) {
    if(!mazeState.pendingPlayer) { alert("Kies eerst een naam!"); return; }
    playSound('pop');
    const name = mazeState.pendingPlayer;
    const existingIdx = mazeState.playerNames.findIndex(p => p.name === name);
    if(existingIdx > -1) mazeState.playerNames.splice(existingIdx, 1);
    
    // Bij doolhof spelen we meestal alleen of om de beurt, maar we ondersteunen de lijst
    mazeState.playerNames = [{ name: name, color: color }]; // Nu even beperkt tot 1 speler voor simpelheid, of push() voor meer
    
    renderMazePalette();
    renderMazeActivePlayers();
    checkMazeStart();
}

function renderMazeActivePlayers() {
    document.getElementById('maze-active-players').innerHTML = mazeState.playerNames.map(p => 
        `<div class="active-player-tag" style="background-color: ${p.color}"><span>${p.name}</span></div>`
    ).join('');
}

function checkMazeStart() {
    const btn = document.getElementById('start-maze-btn');
    if(mazeState.playerNames.length > 0) {
        btn.disabled = false;
        btn.innerText = `START DOOLHOF ▶️`;
    }
}

function setMazeTheme(name, btn) { 
    if(mazeThemes[name].locked) return; 
    playSound('click');
    mazeState.theme = name; 
    selectSingleBtn(btn); 
}
function setMazeDiff(diff, size, btn) { 
    playSound('click');
    mazeState.difficulty = diff; 
    mazeState.gridSize = size; 
    selectSingleBtn(btn); 
}
function selectSingleBtn(btn) { Array.from(btn.parentElement.children).forEach(c => c.classList.remove('selected')); btn.classList.add('selected'); }

// GAME LOGICA
function startDoolhofGame() {
    playSound('win');
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div id="maze-container" class="theme-${mazeState.theme}">
            <div id="maze-grid"></div>
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

function generateMaze(size) {
    mazeState.mazeGrid = Array(size).fill().map(() => Array(size).fill(1));
    const directions = [ [0, -2], [0, 2], [-2, 0], [2, 0] ]; 
    function shuffle(array) { array.sort(() => Math.random() - 0.5); }
    function isValid(x, y) { return x > 0 && x < size - 1 && y > 0 && y < size - 1; }

    function carve(x, y) {
        mazeState.mazeGrid[y][x] = 0; 
        shuffle(directions); 
        for (let [dx, dy] of directions) {
            let nextX = x + dx;
            let nextY = y + dy;
            if (isValid(nextX, nextY) && mazeState.mazeGrid[nextY][nextX] === 1) {
                mazeState.mazeGrid[y + dy/2][x + dx/2] = 0;
                carve(nextX, nextY);
            }
        }
    }
    carve(1, 1);
    mazeState.playerPosition = { x: 1, y: 1 };
    mazeState.goalPosition = { x: size - 2, y: size - 2 };
    mazeState.mazeGrid[mazeState.goalPosition.y][mazeState.goalPosition.x] = 0; 
}

function calculateCellSize() {
    const size = mazeState.gridSize;
    const maxW = window.innerWidth * 0.95; 
    const maxH = window.innerHeight - 240; 
    const cellW = Math.floor(maxW / size);
    const cellH = Math.floor(maxH / size);
    return Math.min(cellW, cellH, 40);
}

function drawMaze() {
    const gridEl = document.getElementById('maze-grid');
    const size = mazeState.gridSize;
    const cellSize = calculateCellSize();
    
    gridEl.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
    gridEl.style.width = 'fit-content';
    gridEl.innerHTML = ''; 

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('div');
            cell.classList.add('maze-cell');
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            
            if (mazeState.mazeGrid[y][x] === 1) cell.classList.add('wall');
            else cell.classList.add('path');

            if (x === mazeState.goalPosition.x && y === mazeState.goalPosition.y) cell.classList.add('goal');
            gridEl.appendChild(cell);
        }
    }
}

function placePlayer() {
    const gridEl = document.getElementById('maze-grid');
    const old = document.getElementById('player');
    if(old) old.remove();

    const player = document.createElement('div');
    player.id = 'player';
    
    const themeData = mazeThemes[mazeState.theme];
    player.style.backgroundImage = `url('${themeData.path}player.png')`;

    const cellSize = calculateCellSize();
    player.style.width = `${cellSize}px`;
    player.style.height = `${cellSize}px`;

    gridEl.appendChild(player);
    updatePlayerPositionVisually();
}

function updatePlayerPositionVisually() {
    const playerEl = document.getElementById('player');
    const cellSize = calculateCellSize();
    playerEl.style.left = `${mazeState.playerPosition.x * cellSize}px`;
    playerEl.style.top = `${mazeState.playerPosition.y * cellSize}px`;
}

function setupControls() {
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('btn-up').addEventListener('click', () => movePlayer(0, -1));
    document.getElementById('btn-down').addEventListener('click', () => movePlayer(0, 1));
    document.getElementById('btn-left').addEventListener('click', () => movePlayer(-1, 0));
    document.getElementById('btn-right').addEventListener('click', () => movePlayer(1, 0));
}

function handleKeyPress(e) {
    if (!mazeState.isGameActive) return;
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) e.preventDefault();
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

    if (dx < 0) playerEl.classList.add('facing-left');
    else if (dx > 0) playerEl.classList.remove('facing-left');

    if (newX >= 0 && newX < mazeState.gridSize && newY >= 0 && newY < mazeState.gridSize && mazeState.mazeGrid[newY][newX] === 0) {
        playSound('pop');
        mazeState.playerPosition.x = newX;
        mazeState.playerPosition.y = newY;
        updatePlayerPositionVisually();
        checkWin();
    }
}

function checkWin() {
    if (mazeState.playerPosition.x === mazeState.goalPosition.x && mazeState.playerPosition.y === mazeState.goalPosition.y) {
        mazeState.isGameActive = false;
        const winnerName = mazeState.playerNames.length > 0 ? mazeState.playerNames[0].name : "Jij";
        setTimeout(() => {
            showWinnerModal(winnerName, [{name: winnerName, score: "Gefinisht!", color: "#4CAF50"}]);
        }, 300);
    }
}

function cleanupDoolhof() {
    document.removeEventListener('keydown', handleKeyPress);
    mazeState.isGameActive = false;
}

window.addEventListener('resize', () => {
    if(document.getElementById('maze-grid') && mazeState.isGameActive) {
        drawMaze(); 
        updatePlayerPositionVisually();
    }
});
