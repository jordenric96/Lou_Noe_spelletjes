// BLOKKEN SPEL LOGICA

let blokkenState = { currentLevel: 0, gridSize: 6, cellSize: 0, blocks: [] };

const levels = [
    [
        { id: 'hero', x: 1, y: 2, w: 2, h: 1, color: 'hero', dir: 'h' },
        { id: 'b1', x: 3, y: 1, w: 1, h: 3, color: 'color-1', dir: 'v' },
        { id: 'b2', x: 0, y: 0, w: 1, h: 2, color: 'color-2', dir: 'v' },
        { id: 'b3', x: 1, y: 0, w: 2, h: 1, color: 'color-3', dir: 'h' },
        { id: 'b4', x: 4, y: 4, w: 2, h: 1, color: 'color-4', dir: 'h' },
    ],
    [
        { id: 'hero', x: 0, y: 2, w: 2, h: 1, color: 'hero', dir: 'h' },
        { id: 'b1', x: 2, y: 0, w: 1, h: 3, color: 'color-2', dir: 'v' },
        { id: 'b2', x: 2, y: 3, w: 2, h: 1, color: 'color-3', dir: 'h' },
        { id: 'b3', x: 4, y: 2, w: 1, h: 2, color: 'color-5', dir: 'v' },
        { id: 'b4', x: 0, y: 4, w: 3, h: 1, color: 'color-1', dir: 'h', type:'truck' },
    ],
    [
        { id: 'hero', x: 1, y: 2, w: 2, h: 1, color: 'hero', dir: 'h' },
        { id: 'b1', x: 3, y: 1, w: 1, h: 2, color: 'color-2', dir: 'v' },
        { id: 'b2', x: 3, y: 3, w: 2, h: 1, color: 'color-3', dir: 'h' },
        { id: 'b3', x: 0, y: 0, w: 1, h: 3, color: 'color-1', dir: 'v', type:'truck' },
        { id: 'b4', x: 1, y: 0, w: 2, h: 1, color: 'color-4', dir: 'h' },
        { id: 'b5', x: 5, y: 0, w: 1, h: 3, color: 'color-6', dir: 'v', type:'truck' },
    ]
];

function startBlokkenGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div id="blokken-container">
            <div id="level-header">Level ${blokkenState.currentLevel + 1}</div>
            <div id="game-area">
                <div id="exit-marker"></div>
            </div>
            <button class="reset-btn" onclick="resetLevel()">Opnieuw ↺</button>
        </div>
    `;
    // setTimeout is belangrijk om te wachten tot de CSS geladen is voor de grootte-berekening
    setTimeout(() => loadLevel(blokkenState.currentLevel), 10);
    window.addEventListener('resize', () => { if(document.getElementById('blokken-container')) loadLevel(blokkenState.currentLevel); });
}

function nextLevelBlokken() {
    blokkenState.currentLevel++;
    if(blokkenState.currentLevel >= levels.length) blokkenState.currentLevel = 0;
    startBlokkenGame();
}

function resetLevel() { loadLevel(blokkenState.currentLevel); }

function loadLevel(levelIndex) {
    const gameArea = document.getElementById('game-area');
    Array.from(gameArea.querySelectorAll('.block')).forEach(e => e.remove());
    blokkenState.blocks = JSON.parse(JSON.stringify(levels[levelIndex]));
    const rect = gameArea.getBoundingClientRect();
    blokkenState.cellSize = rect.width / 6;

    blokkenState.blocks.forEach((block, index) => {
        const el = document.createElement('div');
        el.className = `block ${block.color} ${block.type || ''}`;
        el.style.width = (block.w * blokkenState.cellSize) + 'px';
        el.style.height = (block.h * blokkenState.cellSize) + 'px';
        el.style.left = (block.x * blokkenState.cellSize) + 'px';
        el.style.top = (block.y * blokkenState.cellSize) + 'px';
        el.addEventListener('mousedown', (e) => startDrag(e, index, el));
        el.addEventListener('touchstart', (e) => startDrag(e, index, el), {passive: false});
        gameArea.appendChild(el);
    });
    document.getElementById('level-header').innerText = `Level ${levelIndex + 1}`;
}

let activeBlock = null; let startX, startY, initialBlockPos; let minLimit, maxLimit;
function startDrag(e, index, el) {
    e.preventDefault(); activeBlock = { index, el, data: blokkenState.blocks[index] };
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX; startY = clientY;
    if(activeBlock.data.dir === 'h') initialBlockPos = activeBlock.data.x * blokkenState.cellSize;
    else initialBlockPos = activeBlock.data.y * blokkenState.cellSize;
    calculateLimits(activeBlock.data);
    document.addEventListener('mousemove', onDrag); document.addEventListener('touchmove', onDrag, {passive: false});
    document.addEventListener('mouseup', endDrag); document.addEventListener('touchend', endDrag);
}

function calculateLimits(block) {
    minLimit = 0; maxLimit = (6 * blokkenState.cellSize);
    blokkenState.blocks.forEach(other => {
        if (other === block) return;
        if (block.dir === 'h') {
            if (other.y < block.y + block.h && other.y + other.h > block.y) {
                if (other.x + other.w <= block.x) { let limit = (other.x + other.w) * blokkenState.cellSize; if (limit > minLimit) minLimit = limit; }
                if (other.x >= block.x + block.w) { let limit = other.x * blokkenState.cellSize; if (limit < maxLimit) maxLimit = limit; }
            }
        } else {
            if (other.x < block.x + block.w && other.x + other.w > block.x) {
                if (other.y + other.h <= block.y) { let limit = (other.y + other.h) * blokkenState.cellSize; if (limit > minLimit) minLimit = limit; }
                if (other.y >= block.y + block.h) { let limit = other.y * blokkenState.cellSize; if (limit < maxLimit) maxLimit = limit; }
            }
        }
    });
    if(block.dir === 'h') maxLimit -= (block.w * blokkenState.cellSize); else maxLimit -= (block.h * blokkenState.cellSize);
}

function onDrag(e) {
    if (!activeBlock) return; e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let delta = 0; if (activeBlock.data.dir === 'h') delta = clientX - startX; else delta = clientY - startY;
    let newPos = initialBlockPos + delta;
    newPos = Math.max(minLimit, Math.min(newPos, maxLimit));
    if (activeBlock.data.dir === 'h') activeBlock.el.style.left = newPos + 'px'; else activeBlock.el.style.top = newPos + 'px';
}

function endDrag() {
    if (!activeBlock) return;
    let currentPos = parseFloat(activeBlock.data.dir === 'h' ? activeBlock.el.style.left : activeBlock.el.style.top) || 0;
    let gridPos = Math.round(currentPos / blokkenState.cellSize);
    if (activeBlock.data.dir === 'h') activeBlock.data.x = gridPos; else activeBlock.data.y = gridPos;
    activeBlock.el.style.transition = 'left 0.2s, top 0.2s';
    activeBlock.el.style.left = (activeBlock.data.x * blokkenState.cellSize) + 'px';
    activeBlock.el.style.top = (activeBlock.data.y * blokkenState.cellSize) + 'px';
    setTimeout(() => { if(activeBlock && activeBlock.el) activeBlock.el.style.transition = ''; }, 200);
    if (activeBlock.data.id === 'hero' && activeBlock.data.x === 4) { setTimeout(() => { showWinnerModal("Vrijbaan!", [{name: "Goed gedaan!", score: "Level Gehaald!", color: "#F44336"}]); }, 300); }
    document.removeEventListener('mousemove', onDrag); document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', endDrag); document.removeEventListener('touchend', endDrag);
    activeBlock = null;
}
