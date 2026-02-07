// MAIN.JS - FIREBASE EDITIE (Zonder Cloud Stickers)

// -------------------------------------------------------------
// 1. FIREBASE CONFIGURATIE (Jouw Project: kidsgames-d250e)
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyA_P2tE0Xz4iPuCQ3YfRxp7zxLId-TaCPY",
  authDomain: "kidsgames-d250e.firebaseapp.com",
  projectId: "kidsgames-d250e",
  storageBucket: "kidsgames-d250e.firebasestorage.app",
  messagingSenderId: "242669911777",
  appId: "1:242669911777:web:8a648af368ec6e409f01a0"
};

// Initialiseren van Firebase (via de compat-scripts in index.html)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("🔥 Firebase is verbonden met project: kidsgames-d250e");

// -------------------------------------------------------------
// STANDAARD GAME CODE (Audio, Navigatie, Modal)
// -------------------------------------------------------------

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

// --- NAVIGATIE ---
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

    // Sticker check (Nog lokaal, zoals gevraagd)
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

// -------------------------------------------------------------
// 🔥 FIREBASE LEADERBOARD LOGICA
// -------------------------------------------------------------

// 1. Sla uitslag op in Firestore (Cloud)
function saveDuelResult(gameType, player1, player2, winner, score1, score2, extraStats = {}) {
    if (!player1 || !player2 || player1 === player2) return;

    db.collection("game_history").add({
        game: gameType,
        p1: player1,
        p2: player2,
        winner: winner, 
        s1: score1 || 0,
        s2: score2 || 0, 
        stats: extraStats, 
        date: new Date().toISOString(),
        // Belangrijk: Server tijdstempel voor eerlijke sortering
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => console.log("✅ Uitslag opgeslagen in cloud!"))
    .catch((error) => console.error("❌ Fout bij opslaan:", error));
}

// 2. Navigatie Tussenstand
let currentLbFilter = 'all';

function openLeaderboard() { 
    playSound('click'); 
    document.getElementById('leaderboard-modal').classList.remove('hidden'); 
    
    // Zet een ladertje aan zodat je ziet dat hij iets doet
    document.getElementById('lb-list').innerHTML = '<div style="text-align:center; padding:20px;">Laden uit de cloud... ☁️</div>';
    
    renderLeaderboard(); 
}

function closeLeaderboard() { playSound('click'); document.getElementById('leaderboard-modal').classList.add('hidden'); }
function switchLbTab(filter, btn) { playSound('click'); currentLbFilter = filter; document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderLeaderboard(); }

function resetLeaderboard() { 
    if(confirm("Wil je echt ALLE geschiedenis wissen voor IEDEREEN?")) { 
        // Dit wist de laatste 50 items (batch delete)
        db.collection("game_history").limit(50).get().then(snapshot => {
            snapshot.forEach(doc => doc.ref.delete());
            alert("Recente geschiedenis gewist.");
            renderLeaderboard();
        });
    } 
}

// 3. Renderen (Ophalen uit Firestore)
function renderLeaderboard() {
    const list = document.getElementById('lb-list');
    
    // Haal data op uit Firestore (Laatste 100 potjes)
    db.collection("game_history").orderBy("timestamp", "desc").limit(100).get().then((querySnapshot) => {
        
        const history = [];
        querySnapshot.forEach((doc) => {
            history.push(doc.data());
        });

        const filteredHistory = history.filter(h => currentLbFilter === 'all' || h.game === currentLbFilter);

        if (filteredHistory.length === 0) { list.innerHTML = '<div style="text-align:center; color:#aaa; padding:30px;">Nog geen wedstrijdjes gespeeld!</div>'; return; }

        const duels = {};
        // Avatar hulpje
        const avatars = { 'Lou':'👦🏻', 'Noé':'👶🏼', 'Oliver':'👦🏼', 'Manon':'👧🏼', 'Lore':'👩🏻', 'Jorden':'🧔🏻', 'Karen':'👱🏼‍♀️', 'Bert':'👨🏻' };
        const getAv = (n) => avatars[n] || '';

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
                    scoreCounts: {}, gameType: match.game 
                };
            }
            
            const d = duels[duelId];

            if (match.winner === d.p1Name) d.wins1++;
            else if (match.winner === d.p2Name) d.wins2++;

            if (match.winner !== 'draw') {
                if (d.currentStreakOwner === match.winner) d.currentStreakCount++;
                else { d.currentStreakOwner = match.winner; d.currentStreakCount = 1; }
                if (match.winner === d.p1Name && d.currentStreakCount > d.longestStreakP1) d.longestStreakP1 = d.currentStreakCount;
                if (match.winner === d.p2Name && d.currentStreakCount > d.longestStreakP2) d.longestStreakP2 = d.currentStreakCount;
            }

            let finalS1 = 0, finalS2 = 0;
            if (match.p1 === d.p1Name) { finalS1 = match.s1; finalS2 = match.s2; }
            else { finalS1 = match.s2; finalS2 = match.s1; }

            if (finalS1 > 0 || finalS2 > 0) {
                const scoreKey = `${finalS1}-${finalS2}`;
                if(!d.scoreCounts[scoreKey]) d.scoreCounts[scoreKey] = 0;
                d.scoreCounts[scoreKey]++;
            }

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
            const sortedScores = Object.entries(d.scoreCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
            
            let scorePillsHTML = '';
            if (sortedScores.length > 0) {
                scorePillsHTML = '<div class="score-history">';
                sortedScores.forEach(([score, count]) => { scorePillsHTML += `<div class="score-pill">${score} <span class="score-count">${count}</span></div>`; });
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
                    <div class="p-left">${getAv(d.p1Name)} ${d.p1Name}</div>
                    <div class="score-badge">${d.wins1} - ${d.wins2}</div>
                    <div class="p-right">${d.p2Name} ${getAv(d.p2Name)}</div>
                </div>
                <div class="vs-bar-bg"><div class="vs-bar-fill" style="width: ${pct1}%"></div></div>
                ${extraStatsHTML}
                ${scorePillsHTML}
            </div>`;
        });

        list.innerHTML = html;

    }).catch((error) => {
        console.error("Error getting documents: ", error);
        list.innerHTML = '<div style="text-align:center; color:red;">Fout bij laden. Check je internet!</div>';
    });
}
