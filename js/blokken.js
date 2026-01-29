// BLOKKEN SPEL LOGICA (RUSH HOUR)

let blokkenState = {
    currentLevel: 0,
    gridSize: 6, // 6x6 grid
    cellSize: 0, 
    blocks: []
};

/* LEVEL DATA:
   Grid is 6x6 (x: 0-5, y: 0-5).
   Hero auto (rood) moet altijd op y=2 staan om naar de uitgang (rechts) te kunnen.
   dir: 'h' (horizontaal) of 'v' (verticaal).
*/
const levels = [
    // LEVEL 1: Opwarmertje
    [
        { id: 'hero', x: 1, y: 2, w: 2, h: 1, color: 'hero', dir: 'h' },
        { id: 'b1', x: 3, y: 1, w: 1, h: 3, color: 'color-1', dir: 'v' }, // Truck in de weg
        { id: 'b2', x: 0, y: 0, w: 1, h: 2, color: 'color-2', dir: 'v' },
        { id: 'b3', x: 1, y: 0, w: 2, h: 1, color: 'color-3', dir: 'h' },
        { id: 'b4', x: 4, y: 4, w: 2, h: 1, color: 'color-4', dir: 'h' },
    ],
    // LEVEL 2: Iets lastiger
    [
        { id: 'hero', x: 0, y: 2, w: 2, h: 1, color: 'hero', dir: 'h' },
        { id: 'b1', x: 2, y: 0, w: 1, h: 3, color: 'color-2', dir: 'v' }, // Blokkeert
        { id: 'b2', x: 2, y: 3, w: 2, h: 1, color: 'color-3', dir: 'h' },
        { id: 'b3', x: 4, y: 2, w: 1, h: 2, color: 'color-5', dir: 'v' },
        { id: 'b4', x: 0, y: 4, w: 3, h: 1, color: 'color-1', dir: 'h', type:'truck' },
    ],
    // LEVEL 3: Puzzelen
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

    loadLevel(blokkenState.currentLevel);
    
    // Zorg dat het herschaalt als je tablet draait
    window.addEventListener('resize', () => {
        if(document.getElementById('blokken-container')) loadLevel(blokkenState.currentLevel);
    });
}

function nextLevelBlokken() {
    blokkenState.currentLevel++;
    if(blokkenState.currentLevel >= levels.length) {
        blokkenState.currentLevel = 0; // Terug naar start of 'Klaar' scherm
    }
    startBlokkenGame();
}

function resetLevel() {
    loadLevel(blokkenState.currentLevel);
}

function loadLevel(levelIndex) {
    const gameArea = document.getElementById('game-area');
    // Verwijder oude blokken
    Array.from(gameArea.querySelectorAll('.block')).forEach(e => e.remove());

    // Deep copy van level data zodat we origineel niet aanpassen
    blokkenState.blocks = JSON.parse(JSON.stringify(levels[levelIndex]));
    
    // Bereken celgrootte op basis van huidige bordgrootte
    const rect = gameArea.getBoundingClientRect();
    blokkenState.cellSize = rect.width / 6;

    // Render blokken
    blokkenState.blocks.forEach((block, index) => {
        const el = document.createElement('div');
        el.className = `block ${block.color} ${block.type || ''}`;
        el.style.width = (block.w * blokkenState.cellSize) + 'px';
        el.style.height = (block.h * blokkenState.cellSize) + 'px';
        el.style.left = (block.x * blokkenState.cellSize) + 'px';
        el.style.top = (block.y * blokkenState.cellSize) + 'px';
        
        // Touch & Mouse Events
        el.addEventListener('mousedown', (e) => startDrag(e, index, el));
        el.addEventListener('touchstart', (e) => startDrag(e, index, el), {passive: false});
        
        gameArea.appendChild(el);
    });
    
    // Update header
    document.getElementById('level-header').innerText = `Level ${levelIndex + 1}`;
}

// --- SLEEP LOGICA ---
let activeBlock = null;
let startX, startY, initialBlockPos;
let minLimit, maxLimit;

function startDrag(e, index, el) {
    e.preventDefault(); // Stop scrollen
    activeBlock = { index, el, data: blokkenState.blocks[index] };
    
    // Coördinaten ophalen (muis of touch)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    startX = clientX;
    startY = clientY;
    
    // Huidige positie in pixels
    if(activeBlock.data.dir === 'h') initialBlockPos = activeBlock.data.x * blokkenState.cellSize;
    else initialBlockPos = activeBlock.data.y * blokkenState.cellSize;

    calculateLimits(activeBlock.data);

    // Luister naar beweging
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, {passive: false});
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function calculateLimits(block) {
    minLimit = 0;
    maxLimit = (6 * blokkenState.cellSize); // Bord grootte

    blokkenState.blocks.forEach(other => {
        if (other === block) return;

        if (block.dir === 'h') {
            // Horizontaal: Check blokken in zelfde rij(en)
            if (other.y < block.y + block.h && other.y + other.h > block.y) {
                // Zit links?
                if (other.x + other.w <= block.x) {
                    let limit = (other.x + other.w) * blokkenState.cellSize;
                    if (limit > minLimit) minLimit = limit;
                }
                // Zit rechts?
                if (other.x >= block.x + block.w) {
                    let limit = other.x * blokkenState.cellSize;
                    if (limit < maxLimit) maxLimit = limit;
                }
            }
        } else {
            // Verticaal: Check blokken in zelfde kolom(men)
            if (other.x < block.x + block.w && other.x + other.w > block.x) {
                // Zit boven?
                if (other.y + other.h <= block.y) {
                    let limit = (other.y + other.h) * blokkenState.cellSize;
                    if (limit > minLimit) minLimit = limit;
                }
                // Zit onder?
                if (other.y >= block.y + block.h) {
                    let limit = other.y * blokkenState.cellSize;
                    if (limit < maxLimit) maxLimit = limit;
                }
            }
        }
    });
    
    // Corrigeer maxLimit voor breedte/hoogte van blok zelf
    if(block.dir === 'h') maxLimit -= (block.w * blokkenState.cellSize);
    else maxLimit -= (block.h * blokkenState.cellSize);
}

function onDrag(e) {
    if (!activeBlock) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let delta = 0;
    if (activeBlock.data.dir === 'h') delta = clientX - startX;
    else delta = clientY - startY;

    let newPos = initialBlockPos + delta;
    
    // Beperk tot muren/andere blokken
    newPos = Math.max(minLimit, Math.min(newPos, maxLimit));
    
    if (activeBlock.data.dir === 'h') activeBlock.el.style.left = newPos + 'px';
    else activeBlock.el.style.top = newPos + 'px';
}

function endDrag() {
    if (!activeBlock) return;

    // Snap naar grid
    let currentPos = parseFloat(activeBlock.data.dir === 'h' ? activeBlock.el.style.left : activeBlock.el.style.top) || 0;
    let gridPos = Math.round(currentPos / blokkenState.cellSize);
    
    // Update data model
    if (activeBlock.data.dir === 'h') activeBlock.data.x = gridPos;
    else activeBlock.data.y = gridPos;

    // Visuele snap animatie
    activeBlock.el.style.transition = 'left 0.2s, top 0.2s';
    activeBlock.el.style.left = (activeBlock.data.x * blokkenState.cellSize) + 'px';
    activeBlock.el.style.top = (activeBlock.data.y * blokkenState.cellSize) + 'px';

    // Verwijder transition na animatie (anders vertraagt het slepen)
    setTimeout(() => {
        if(activeBlock && activeBlock.el) activeBlock.el.style.transition = '';
    }, 200);

    // Check Win (Rode auto op x=4 betekent hij is bij de uitgang, want w=2)
    if (activeBlock.data.id === 'hero' && activeBlock.data.x === 4) {
        setTimeout(() => {
            showWinnerModal("Vrijbaan!", [{name: "Goed gedaan!", score: "Level Gehaald!", color: "#F44336"}]);
        }, 300);
    }

    // Cleanup listeners
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    activeBlock = null;
}
