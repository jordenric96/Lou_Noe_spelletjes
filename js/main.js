// MAIN.JS - VOLLEDIG (Met Scores Historie)

const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-board');

// --- AUDIO SYSTEEM ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    if (type === 'click') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'win' || type === 'victory') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.1); 
        gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'error') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.2); osc.start(now); osc.stop(now + 0.2);
    }
}

// --- GAME NAVIGATIE ---
function loadGame(gameType) {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-board').style.display = 'block';
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oldModal = document.querySelector('.winner-modal-overlay'); if(oldModal) oldModal.remove();
    
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
    playSound('victory'); if(typeof memFireConfetti === 'function') memFireConfetti();

    let leaderboardHTML = '';
    if (allScores.length > 1) {
        allScores.sort((a, b) => b.score - a.score);
        leaderboardHTML = '<div class="leaderboard-list">';
        allScores.forEach((player, index) => {
            let medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : '🥉');
            leaderboardHTML += `<div class="leaderboard-item"><span>${medal} ${player.name}</span><span>${player.score} pnt</span></div>`;
        });
        leaderboardHTML += '</div>';
    }

    // Sticker check (als stickers.js geladen is)
    let stickerHTML = '';
    if (typeof unlockRandomSticker === 'function') {
        const newSticker = unlockRandomSticker();
        if (newSticker) stickerHTML = `<div class="sticker-reward-box"><h4>✨ STICKER! ✨</h4><img src="${newSticker.src}" class="new-sticker-img"><p>Je hebt <b>#${newSticker.id.split('-')[1]}</b> verdiend!</p></div>`;
        else stickerHTML = `<div class="sticker-reward-box" style="background:rgba(255,255,255,0.3); border-color:white;"><h4>Geen nieuwe sticker...</h4><p>Probeer het nog eens!</p></div>`;
    }

    const modalHTML = `
        <div class="winner-modal-overlay">
            <div class="winner-modal-content">
                <span class="trophy-icon">🏆</span>
                <h2 class="winner-title">Goed gedaan!</h2>
                <div class="winner-name">${winnerName} wint!</div>
                ${leaderboardHTML}
                ${stickerHTML}
                <div class="modal-actions"><button class="restart-btn" onclick="location.reload()">Nog een keer!</button><button class="menu-btn" onclick="location.reload()">Hoofdmenu</button></div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// --- LEADERBOARD & STATISTIEKEN LOGICA ---

// 1. Sla uitslag op (AANGEPAST: Nu met scores s1 en s2)
function saveDuelResult(gameType, player1, player2, winner, score1, score2, extraStats = {}) {
    if (!player1 || !player2 || player1 === player2) return;

    const history = JSON.parse(localStorage.getItem('game_history') || '[]');
    const record = {
        game: gameType,
        p1: player1,
        p2: player2,
        winner: winner, 
        s1: score1 || 0, // Score van p1
        s2: score2 || 0, // Score van p2
        stats: extraStats, 
        date: new Date().toISOString()
    };
    
    history.push(record);
    localStorage.setItem('game_history', JSON.stringify(history));
}

// 2. Navigatie Tussenstand
let currentLbFilter = 'all';

function openLeaderboard() { playSound('click'); document.getElementById('leaderboard-modal').classList.remove('hidden'); renderLeaderboard(); }
function closeLeaderboard() { playSound('click'); document.getElementById('leaderboard-modal').classList.add('hidden'); }
function switchLbTab(filter, btn) { playSound('click'); currentLbFilter = filter; document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderLeaderboard(); }
function resetLeaderboard() { if(confirm("Geschiedenis wissen?")) { localStorage.removeItem('game_history'); renderLeaderboard(); } }

// 3. Renderen van de Tussenstand
function renderLeaderboard() {
    const list = document.getElementById('lb-list');
    const history = JSON.parse(localStorage.getItem('game_history') || '[]');
    const filteredHistory = history.filter(h => currentLbFilter === 'all' || h.game === currentLbFilter);

    if (filteredHistory.length === 0) { list.innerHTML = '<div style="text-align:center; color:#aaa; padding:30px;">Nog geen wedstrijdjes gespeeld!</div>'; return; }

    const duels = {};

    filteredHistory.forEach(match => {
        const players = [match.p1, match.p2].sort(); 
        const duelId = players.join('|'); 
        
        if (!duels[duelId]) {
            duels[duelId] = { 
                p1Name: players[0], p2Name: players[1], 
                wins1: 0, wins2: 0,
                longestStreakP1: 0, longestStreakP2: 0,
                currentStreakOwner: null, currentStreakCount: 0,
                maxMemPairsP1: 0, maxMemPairsP2: 0,
                scoreCounts: {}, // Voor de score-tellertjes
                gameType: match.game 
            };
        }
        
        const d = duels[duelId];

        // 1. Winnaar tellen
        if (match.winner === d.p1Name) d.wins1++;
        else if (match.winner === d.p2Name) d.wins2++;

        // 2. Streak berekenen
        if (match.winner !== 'draw') {
            if (d.currentStreakOwner === match.winner) d.currentStreakCount++;
            else { d.currentStreakOwner = match.winner; d.currentStreakCount = 1; }
            if (match.winner === d.p1Name && d.currentStreakCount > d.longestStreakP1) d.longestStreakP1 = d.currentStreakCount;
            if (match.winner === d.p2Name && d.currentStreakCount > d.longestStreakP2) d.longestStreakP2 = d.currentStreakCount;
        }

        // 3. Score Frequentie Bijhouden (NIEUW)
        // We moeten zorgen dat de scores 'matchen' met p1Name en p2Name van het kaartje
        // Als in de match p1 == d.p1Name, dan is s1 de score van links. Andersom wisselen.
        let finalS1 = 0, finalS2 = 0;
        if (match.p1 === d.p1Name) { finalS1 = match.s1; finalS2 = match.s2; }
        else { finalS1 = match.s2; finalS2 = match.s1; }

        if (finalS1 > 0 || finalS2 > 0) { // Alleen tellen als er punten zijn (Memory)
            const scoreKey = `${finalS1}-${finalS2}`;
            if(!d.scoreCounts[scoreKey]) d.scoreCounts[scoreKey] = 0;
            d.scoreCounts[scoreKey]++;
        }

        // 4. Memory Stats
        if (match.game === 'memory' && match.stats) {
            let sP1 = (match.p1 === d.p1Name) ? match.stats.p1MaxStreak : match.stats.p2MaxStreak;
            let sP2 = (match.p1 === d.p1Name) ? match.stats.p2MaxStreak : match.stats.p1MaxStreak;
            if (sP1 > d.maxMemPairsP1) d.maxMemPairsP1 = sP1 || 0;
            if (sP2 > d.maxMemPairsP2) d.maxMemPairsP2 = sP2 || 0;
        }
    });

    const sortedDuels = Object.values(duels).sort((a,b) => (b.wins1+b.wins2) - (a.wins1+a.wins2));

    let html = '';
    sortedDuels.forEach(d => {
        const totalGames = d.wins1 + d.wins2;
        const pct1 = totalGames > 0 ? Math.round((d.wins1 / totalGames) * 100) : 50;

        // Score lijst genereren (Top 3)
        const sortedScores = Object.entries(d.scoreCounts)
            .sort((a, b) => b[1] - a[1]) // Sorteer op hoe vaak voorgekomen
            .slice(0, 4); // Pak de top 4
        
        let scorePillsHTML = '';
        if (sortedScores.length > 0) {
            scorePillsHTML = '<div class="score-history">';
            sortedScores.forEach(([score, count]) => {
                scorePillsHTML += `<div class="score-pill">${score} <span class="score-count">${count}</span></div>`;
            });
            scorePillsHTML += '</div>';
        }

        let extraStatsHTML = `
            <div class="stats-row">
                <div class="stat-col left"><span class="stat-label">Beste Reeks</span><span class="stat-val">🔥 ${d.longestStreakP1}x</span></div>
                <div class="stat-col right"><span class="stat-label">Beste Reeks</span><span class="stat-val">${d.longestStreakP2}x 🔥</span></div>
            </div>`;

        if (currentLbFilter === 'memory' || (currentLbFilter === 'all' && d.gameType === 'memory')) {
            extraStatsHTML += `
            <div class="stats-row" style="margin-top:2px; border-top:0;">
                <div class="stat-col left"><span class="stat-label">Slimste Beurt</span><span class="stat-val">🧠 ${d.maxMemPairsP1} paren</span></div>
                <div class="stat-col right"><span class="stat-label">Slimste Beurt</span><span class="stat-val">${d.maxMemPairsP2} paren 🧠</span></div>
            </div>`;
        }

        const gameIcon = currentLbFilter === 'all' ? (d.gameType==='memory' ? '🧠' : '🔴') : '';

        html += `
        <div class="duel-card">
            <div style="font-size:0.8rem; text-align:center; color:#ccc; margin-bottom:-5px;">${gameIcon}</div>
            <div class="duel-header">
                <div class="p-left">${d.p1Name}</div>
                <div class="score-badge">${d.wins1} - ${d.wins2}</div>
                <div class="p-right">${d.p2Name}</div>
            </div>
            <div class="vs-bar-bg"><div class="vs-bar-fill" style="width: ${pct1}%"></div></div>
            ${extraStatsHTML}
            ${scorePillsHTML}
        </div>`;
    });

    list.innerHTML = html;
}
