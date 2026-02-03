// MEMORY.JS - VERVANG DEZE FUNCTIE VOOR COMPACTE SETUP

function startMemorySetup() {
    const board = document.getElementById('game-board');
    if (!board) return;

    // Thema's genereren (compact)
    let themeBtns = Object.keys(memThemes).map(key => {
        const t = memThemes[key];
        const selected = memoryState.theme === key ? 'selected' : '';
        let imgTag = t.isMix ? `<div style="font-size:2rem;">🔀</div>` : `<img src="${t.path}cover.png" onerror="this.src='assets/images/icon.png'">`;

        return `
            <div class="theme-card-btn ${t.locked ? 'locked' : ''} ${selected}" onclick="memSetTheme('${key}', this)">
                <div class="theme-img-container">${imgTag}</div>
                <div class="btn-label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
            </div>`;
    }).join('');

    board.innerHTML = `
        <div class="memory-setup">
            <div class="setup-group">
                <h3>1. Wie speelt er mee?</h3>
                
                <div class="name-row">
                    <button class="player-btn" onclick="memSelectPerson('Lou', this)">👦🏼 Lou</button>
                    <button class="player-btn" onclick="memSelectPerson('Noé', this)">👶🏼 Noé</button>
                    <button class="player-btn" onclick="memSelectPerson('Mama', this)">👩🏻 Mama</button>
                    <button class="player-btn" onclick="memSelectPerson('Papa', this)">👨🏻 Papa</button>
                </div>

                <div style="display:flex; gap:5px; margin-top:10px;">
                    <input type="text" id="mem-custom-name" placeholder="Naam..." style="width:80px; padding:5px; border-radius:10px; border:1px solid #ccc;">
                    <button class="add-btn" onclick="memAddCustomPerson()" style="padding:5px 10px; border-radius:10px; background:#4CAF50; color:white; border:none;">OK</button>
                </div>

                <div class="color-scroll-container" id="mem-color-palette">
                    </div>

                <div id="mem-active-players"></div>
            </div>

            <div class="setup-group">
                <h3>2. Kies een Thema</h3>
                <div class="theme-scroll-wrapper">
                    ${themeBtns}
                </div>
            </div>

            <div class="bottom-actions">
                <button id="mem-start-btn" class="start-btn" onclick="startMemoryGame()" disabled>Eerst spelers kiezen...</button>
                <button class="tool-btn" onclick="location.reload()">⬅ Menu</button>
            </div>
        </div>`;
    
    memRenderPalette(); memRenderActivePlayers(); memCheckStartButton();
}

// ... Zorg dat de rest van je JS (memSetTheme, memSelectPerson etc.) hieronder blijft staan ...
