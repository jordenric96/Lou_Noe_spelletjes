// DOOLHOF SPEL LOGICA

let mazeState = {
    theme: 'mario',
    difficulty: 'medium',
    gridSize: 15,
    mazeGrid: [],
    playerPosition: { x: 1, y: 1 },
    goalPosition: { x: 0, y: 0 },
    isGameActive: false
};

const mazeThemes = {
    'mario': { locked: false, icon: '🍄', path: 'assets/images/doolhof/mario/' },
};

// 1. SETUP SCHERM
function startDoolhofSetup() {
    const board = document.getElementById('game-board');
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
function selectSingleBtn(btn) {
    Array.from(btn.parentElement.children).forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
}

// 2. GAME START
function startDoolhofGame() {
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

// BEREKEN CELGROOTTE (Responsive)
function calculateCellSize() {
    const size = mazeState.gridSize;
    const maxW = window.innerWidth * 0.95;
    const maxH = window.innerHeight * 0.70;
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

// CONTROLS
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
        mazeState.playerPosition.x = newX;
        mazeState.playerPosition.y = newY;
        updatePlayerPositionVisually();
        checkWin();
    }
}

function checkWin() {
    if (mazeState.playerPosition.x === mazeState.goalPosition.x && mazeState.playerPosition.y === mazeState.goalPosition.y) {
        mazeState.isGameActive = false;
        setTimeout(() => {
            showWinnerModal("Jij", [{name: "Speler", score: "Gefinisht!", color: "#4CAF50"}]);
        }, 300);
    }
}

function cleanupDoolhof() {
    document.removeEventListener('keydown', handleKeyPress);
    mazeState.isGameActive = false;
}

// Resize listener
window.addEventListener('resize', () => {
    if(document.getElementById('maze-grid') && mazeState.isGameActive) {
        drawMaze(); 
        updatePlayerPositionVisually();
    }
});
