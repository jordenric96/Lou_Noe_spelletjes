// VERVANG DE startMemorySetup FUNCTIE MET DEZE:

function startMemorySetup() {
    const board = document.getElementById('game-board');
    
    board.innerHTML = `
        <div class="memory-setup">
            
            <div class="setup-group">
                <h3>👥</h3>
                <button class="option-btn selected" onclick="setPlayers(1, this)">👤</button>
                <button class="option-btn" onclick="setPlayers(2, this)">👤👤</button>
                <button class="option-btn" onclick="setPlayers(3, this)">👤👤👤</button>
                <button class="option-btn" onclick="setPlayers(4, this)">👤👤👤👤</button>
            </div>

            <div class="setup-group">
                <h3>🎨</h3>
                <button class="option-btn selected" onclick="setTheme('boerderij', this)">🚜</button>
                <button class="option-btn" onclick="setTheme('dino', this)">🦖</button>
                <button class="option-btn" onclick="setTheme('studio100', this)">🤡</button>
                <button class="option-btn" onclick="setTheme('marvel', this)">🕷️</button>
                <button class="option-btn" onclick="setTheme('natuur', this)">🌳</button>
                <button class="option-btn" onclick="setTheme('beroepen', this)">👩‍🚒</button>
            </div>

            <div class="setup-group">
                <h3>🧠</h3>
                
                <button class="option-btn selected" onclick="setSize(12, this)">
                    <span class="star">★</span><span class="star dim">★</span><span class="star dim">★</span>
                </button>
                
                <button class="option-btn" onclick="setSize(16, this)">
                    <span class="star">★</span><span class="star">★</span><span class="star dim">★</span>
                </button>
                
                <button class="option-btn" onclick="setSize(24, this)">
                    <span class="star">★</span><span class="star">★</span><span class="star">★</span>
                </button>
            </div>

            <button class="start-btn" onclick="startMemoryGame()">▶️</button>
        </div>
    `;
    
    // Reset state naar standaarden
    memoryState.players = 1;
    memoryState.theme = 'boerderij';
    memoryState.gridSize = 12;
}
