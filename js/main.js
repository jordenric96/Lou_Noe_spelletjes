// MAIN.JS - VOLLEDIG (Met Puzzel, Leaderboard & Sound)

const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-board');

// --- AUDIO SYSTEEM ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'pop' || type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);

    } else if (type === 'win' || type === 'success' || type === 'victory') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); 
        osc.frequency.setValueAtTime(659.25, now + 0.1); 
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
        
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2); gain2.connect(audioCtx.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1046.5, now);
        gain2.gain.setValueAtTime(0.1, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc2.start(now); osc2.stop(now + 0.5);

    } else if (type === 'error' || type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    }
}

// --- GAME NAVIGATIE ---
function loadGame(gameType) {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-board').style.display = 'block';
    
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oldModal = document.querySelector('.winner-modal-overlay');
    if(oldModal) oldModal.remove();
    
    // Start de juiste setup functie
    if(gameType === 'memory' && typeof startMemorySetup === 'function') startMemorySetup();
    else if(gameType === 'puzzel' && typeof startPuzzleGame === 'function') startPuzzleGame();
    else if(gameType === 'stickers' && typeof openStickerBook === 'function') openStickerBook();
    else if(gameType === 'tekenen' && typeof startDrawingGame === 'function') startDrawingGame();
    else if(gameType === 'rekenen' && typeof startMathGame === 'function') startMathGame();
    else if(gameType === 'schaduw' && typeof startShadowGame === 'function') startShadowGame();
    else if(gameType === 'vang' && typeof startWhackGame === 'function') startWhackGame();
    else if(gameType === 'vieropeenrij' && typeof startConnect4 === 'function') startConnect4();
}

// --- WINNAAR MODAL ---
function showWinnerModal(winnerName, allScores = []) {
    playSound('victory'); 
    if(typeof memFireConfetti === 'function') memFireConfetti();

    let leaderboardHTML = '';
    if (allScores.length > 1) {
        allScores.sort((a, b) => b.score - a.score);
        leaderboardHTML = '<div class="leaderboard-list">';
        allScores.forEach((player, index) => {
            let posClass = index === 0 ? 'pos-1' : (index === 1 ? 'pos-2' : (index === 2 ? 'pos-3' : ''));
            let medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `${index + 1}.`));
            leaderboardHTML += `
                <div class="leaderboard-item">
                    <span class="${posClass}">${medal} ${player.name}</span>
                    <span>${player.score} pnt</span>
                </div>`;
        });
        leaderboardHTML += '</div>';
    }

    let stickerHTML = '';
    if (typeof unlockRandomSticker === 'function') {
        const newSticker = unlockRandomSticker();
        if (newSticker) {
            stickerHTML = `
                <div class="sticker-reward-box">
                    <h4>✨ NIEUWE STICKER! ✨</h4>
                    <img src="${newSticker.src}" class="new-sticker-img">
                    <p>Je hebt de <b>${newSticker.id.split('-')[0]}</b> sticker verdiend!</p>
                </div>`;
        } else {
            stickerHTML = `
                <div class="sticker-reward-box" style="background:rgba(255,255,255,0.3); border-color:white;">
                    <h4>Geen nieuwe sticker...</h4>
                    <p>Probeer het nog eens!</p>
                </div>`;
        }
    }

    const modalHTML = `
        <div class="winner-modal-overlay">
            <div class="winner-modal-content">
                <span class="trophy-icon">🏆</span>
                <h2 class="winner-title">Goed gedaan!</h2>
                <div class="winner-name">${winnerName} wint!</div>
                
                ${leaderboardHTML}
                ${stickerHTML}
                
                <div class="modal-actions">
                    <button class="restart-btn" onclick="location.reload()">Nog een keer!</button>
                    <button class="menu-btn" onclick="location.reload()">Hoofdmenu</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// --- LEADERBOARD & STATISTIEKEN LOGICA (NIEUW) ---

// 1. Sla uitslag op (wordt aangeroepen door vieropeenrij.js en memory.js)
function saveDuelResult(gameType, player1, player2, winner) {
    if (!player1 || !player2) return; // Alleen opslaan bij 2 spelers
    if (player1 === player2) return;  // Niet opslaan als je tegen jezelf speelt

    console.log(`Saving duel: ${gameType} - ${player1} vs ${player2} (Winner: ${winner})`);

    const history = JSON.parse(localStorage.getItem('game_history') || '[]');
    const record = {
        game: gameType,
        p1: player1,
        p2: player2,
        winner: winner, 
        date: new Date().toISOString()
    };
    history.push(record);
    localStorage.setItem('game_history', JSON.stringify(history));
}

// 2. Openen/Sluiten en Tabs
let currentLbFilter = 'all';

function openLeaderboard() {
    playSound('click');
    document.getElementById('leaderboard-modal').classList.remove('hidden');
    renderLeaderboard();
}

function closeLeaderboard() {
    playSound('click');
    document.getElementById('leaderboard-modal').classList.add('hidden');
}

function switchLbTab(filter, btn) {
    playSound('click');
    currentLbFilter = filter;
    document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); 
    renderLeaderboard();
}

function resetLeaderboard() {
    if(confirm("Weet je zeker dat je alle scores wilt wissen?")) {
        localStorage.removeItem('game_history');
        renderLeaderboard();
    }
}

// 3. Het berekenen en tonen van de lijst
function renderLeaderboard() {
    const list = document.getElementById('lb-list');
    const history = JSON.parse(localStorage.getItem('game_history') || '[]');
    
    // Filteren
    const filteredHistory = history.filter(h => currentLbFilter === 'all' || h.game === currentLbFilter);

    if (filteredHistory.length === 0) {
        list.innerHTML = '<div style="text-align:center; color:#aaa; padding:30px; font-style:italic;">Nog geen wedstrijdjes gespeeld!<br>Ga snel spelen!</div>';
        return;
    }

    // Statistieken verzamelen per "Matchup" (bijv. Lou vs Noé)
    const duels = {};

    filteredHistory.forEach(match => {
        // We sorteren de namen alfabetisch, zodat "Lou vs Noé" en "Noé vs Lou" hetzelfde duel is.
        const players = [match.p1, match.p2].sort(); 
        const duelId = players.join('|'); // unieke key

        if (!duels[duelId]) {
            duels[duelId] = { 
                p1Name: players[0], 
                p2Name: players[1], 
                score1: 0, 
                score2: 0,
                gameType: match.game // Onthouden welk spel (als filter niet 'all' is)
            };
        }

        if (match.winner === duels[duelId].p1Name) duels[duelId].score1++;
        else if (match.winner === duels[duelId].p2Name) duels[duelId].score2++;
    });

    // Omzetten naar array en sorteren op totaal gespeeld
    const sortedDuels = Object.values(duels).sort((a,b) => (b.score1+b.score2) - (a.score1+a.score2));

    // HTML Genereren
    let html = '';
    sortedDuels.forEach(d => {
        // Kleurtje voor wie voor staat
        const p1Win = d.score1 > d.score2;
        const p2Win = d.score2 > d.score1;
        
        const p1Style = p1Win ? 'color:#2E7D32; font-weight:bold;' : '';
        const p2Style = p2Win ? 'color:#2E7D32; font-weight:bold;' : '';
        const trophy1 = p1Win ? '👑' : '';
        const trophy2 = p2Win ? '👑' : '';

        // Labeltje welk spel het was (alleen als we op 'all' staan)
        const gameLabel = currentLbFilter === 'all' ? 
            `<div style="font-size:0.7rem; color:#999; margin-bottom:4px;">${d.gameType === 'memory' ? '🧠 Memory' : '🔴 4-op-rij'}</div>` : '';

        html += `
        <div class="duel-card">
            <div class="duel-players">
                ${gameLabel}
                <div style="${p1Style}">${trophy1} ${d.p1Name}</div>
                <div class="duel-vs">vs</div>
                <div style="${p2Style}">${trophy2} ${d.p2Name}</div>
            </div>
            <div class="duel-score-box">
                ${d.score1} - ${d.score2}
            </div>
        </div>
        `;
    });

    list.innerHTML = html;
}
