// MAIN.JS - FIREBASE EDITIE (Full Version)
// - Wachtwoord: 0204
// - Nieuw Design (Match Cards)
// - Gender Styles (Boys/Girls)

// -------------------------------------------------------------
// 1. FIREBASE CONFIGURATIE
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyA_P2tE0Xz4iPuCQ3YfRxp7zxLId-TaCPY",
  authDomain: "kidsgames-d250e.firebaseapp.com",
  projectId: "kidsgames-d250e",
  storageBucket: "kidsgames-d250e.firebasestorage.app",
  messagingSenderId: "242669911777",
  appId: "1:242669911777:web:8a648af368ec6e409f01a0"
};

// Initialiseren
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
window.db = db; 

console.log("🔥 Firebase Verbonden!");

// -------------------------------------------------------------
// 2. GESLACHT STIJLEN (Voor Tussenstand)
// -------------------------------------------------------------
const genderStyles = {
    boys: ['Jorden', 'Vince', 'Bert', 'Noé', 'Lou', 'Oliver'],
    girls: ['Manon', 'Karen', 'Lore', 'Fran']
};

// Geeft de juiste CSS class terug voor de badge achtergrond
function getPlayerStyleClass(name) {
    if (genderStyles.boys.includes(name)) return 'style-boy';
    if (genderStyles.girls.includes(name)) return 'style-girl';
    return ''; 
}

// Geeft de juiste CSS class terug voor gekleurde tekst
function getPlayerTextClass(name) {
    if (genderStyles.boys.includes(name)) return 'style-boy-text';
    if (genderStyles.girls.includes(name)) return 'style-girl-text';
    return ''; 
}

// -------------------------------------------------------------
// 3. STANDAARD GAME CODE (Audio, Navigatie, Modal)
// -------------------------------------------------------------

const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-board');
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
    else if(gameType === 'simon' && typeof startSimonGame === 'function') startSimonGame();
}

function showWinnerModal(title, details = null) {
    playSound('victory'); if(typeof memFireConfetti === 'function') memFireConfetti();
    let contentHTML = '';

    // A. Duel (Lijst)
    if (Array.isArray(details) && details.length > 1) {
        details.sort((a, b) => b.score - a.score);
        contentHTML = '<div class="leaderboard-list">';
        details.forEach((player, index) => {
            let medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : '🥉');
            contentHTML += `<div class="leaderboard-item"><span>${medal} ${player.name}</span><span>${player.score} pnt</span></div>`;
        });
        contentHTML += '</div>';
    } 
    // B. Solo (Enkel resultaat)
    else if (details && typeof details === 'object') {
        contentHTML = `<div class="leaderboard-list" style="text-align:center;">`;
        if(details.time) contentHTML += `<div style="font-size: 1.2rem; margin-bottom: 5px;">${details.time}</div>`;
        if(details.clicks) contentHTML += `<div style="font-size: 1.1rem; margin-bottom: 10px; color:#555;">${details.clicks}</div>`;
        if(details.rank) {
            contentHTML += `<div style="background:#FFEB3B; color:#333; padding:5px 10px; border-radius:10px; display:inline-block; font-weight:bold; box-shadow:0 2px 0 rgba(0,0,0,0.1);">🏆 ${details.rank}e Plaats!</div>`;
        }
        contentHTML += `</div>`;
    }

    const modalHTML = `
        <div class="winner-modal-overlay">
            <div class="winner-modal-content">
                <span class="trophy-icon">🏆</span>
                <h2 class="winner-title">Goed gedaan!</h2>
                <div class="winner-name">${title}</div>
                ${contentHTML}
                <div class="modal-actions"><button class="restart-btn" onclick="location.reload()">Nog een keer!</button><button class="menu-btn" onclick="location.reload()">Hoofdmenu</button></div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// -------------------------------------------------------------
// 4. OPSLAAN LOGICA (Duel & Solo)
// -------------------------------------------------------------

function saveDuelResult(gameType, player1, player2, winner, score1, score2, extraStats = {}) {
    if (!player1 || !player2 || player1 === player2) return;
    db.collection("game_history").add({
        game: gameType, type: 'duel', p1: player1, p2: player2, winner: winner, s1: score1 || 0, s2: score2 || 0, stats: extraStats, 
        date: new Date().toISOString(), timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch((error) => console.error("Fout:", error));
}

async function saveSoloScore(gameType, player, difficulty, time, clicks) {
    if (!player) return;
    try {
        await db.collection("game_history").add({
            game: gameType, type: 'solo', player: player, difficulty: difficulty, time: time, clicks: clicks,         
            date: new Date().toISOString(), timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Rank berekenen (alleen als er een tijd is, dus Vang Ze)
        if (time !== null) {
            const snapshot = await db.collection("game_history")
                .where("game", "==", gameType)
                .where("type", "==", "solo")
                .where("difficulty", "==", difficulty)
                .orderBy("time", "asc")
                .get();
            let rank = 0; const scores = [];
            snapshot.forEach(doc => scores.push(doc.data()));
            scores.sort((a,b) => a.time - b.time);
            for(let i=0; i<scores.length; i++) { if (scores[i].time === time && scores[i].player === player) { rank = i + 1; break; } }
            return rank;
        }
        return null; 
    } catch (error) { console.error("Fout:", error); return null; }
}

// -------------------------------------------------------------
// 5. LEADERBOARD NAVIGATIE
// -------------------------------------------------------------

let currentLbFilter = 'all';

function openLeaderboard() { 
    playSound('click'); 
    document.getElementById('leaderboard-modal').classList.remove('hidden'); 
    document.getElementById('lb-list').innerHTML = '<div style="text-align:center; padding:20px;">Laden... ☁️</div>';
    renderLeaderboard(); 
}

function closeLeaderboard() { playSound('click'); document.getElementById('leaderboard-modal').classList.add('hidden'); }
function switchLbTab(filter, btn) { playSound('click'); currentLbFilter = filter; document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderLeaderboard(); }

// RESET MET WACHTWOORD 0204
function resetLeaderboard() { 
    const password = prompt("🔒 Voer de pincode in om alles te wissen:");
    if (password === "0204") {
        if(confirm("⚠️ Weet je het 100% zeker? Dit wist ALLE historie.")) { 
            db.collection("game_history").limit(50).get().then(snapshot => {
                snapshot.forEach(doc => doc.ref.delete());
                alert("🗑️ Geschiedenis is gewist.");
                renderLeaderboard();
            });
        }
    } else if (password !== null) {
        alert("⛔ Fout wachtwoord!");
    }
}

// -------------------------------------------------------------
// 6. RENDER FUNCTIES (Het Uiterlijk)
// -------------------------------------------------------------

function renderLeaderboard() {
    const list = document.getElementById('lb-list');
    db.collection("game_history").orderBy("timestamp", "desc").limit(200).get().then((querySnapshot) => {
        const history = [];
        querySnapshot.forEach((doc) => { history.push(doc.data()); });

        // Speciale renders voor Solo games
        if (currentLbFilter === 'simon') { renderSimonLeaderboard(list, history); return; }
        if (currentLbFilter === 'vang') { renderVangLeaderboard(list, history); return; }

        // Filter voor Duels (Alles behalve solo)
        const filteredHistory = history.filter(h => {
            if (currentLbFilter === 'all') return h.type === 'duel'; 
            return h.game === currentLbFilter;
        });

        if (filteredHistory.length === 0) { list.innerHTML = '<div style="text-align:center; color:#aaa; padding:30px;">Nog geen duels gespeeld!</div>'; return; }

        const duels = {};
        const avatars = { 'Lou':'👦🏻', 'Noé':'👶🏼', 'Oliver':'👦🏼', 'Manon':'👧🏼', 'Lore':'👩🏻', 'Jorden':'🧔🏻', 'Karen':'👱🏼‍♀️', 'Bert':'👨🏻', 'Vince':'👩🏽‍🦱', 'Fran':'👩🏻' };
        
        filteredHistory.forEach(match => {
            if (!match.p1 || !match.p2) return;
            const players = [match.p1, match.p2].sort(); 
            const duelId = players.join('|'); 
            if (!duels[duelId]) { duels[duelId] = { p1Name: players[0], p2Name: players[1], wins1: 0, wins2: 0, longestStreakP1: 0, longestStreakP2: 0, currentStreakOwner: null, currentStreakCount: 0, maxMemPairsP1: 0, maxMemPairsP2: 0, scoreCounts: {}, gameType: match.game }; }
            const d = duels[duelId];
            if (match.winner === d.p1Name) d.wins1++; else if (match.winner === d.p2Name) d.wins2++;
            
            // Streak berekenen
            if (match.winner !== 'draw') {
                if (d.currentStreakOwner === match.winner) d.currentStreakCount++; else { d.currentStreakOwner = match.winner; d.currentStreakCount = 1; }
                if (match.winner === d.p1Name && d.currentStreakCount > d.longestStreakP1) d.longestStreakP1 = d.currentStreakCount;
                if (match.winner === d.p2Name && d.currentStreakCount > d.longestStreakP2) d.longestStreakP2 = d.currentStreakCount;
            }
            // Memory stats
            if (match.game === 'memory' && match.stats) {
                let sP1 = (match.p1 === d.p1Name) ? match.stats.p1MaxStreak : match.stats.p2MaxStreak; let sP2 = (match.p1 === d.p1Name) ? match.stats.p2MaxStreak : match.stats.p1MaxStreak;
                if (sP1 > d.maxMemPairsP1) d.maxMemPairsP1 = sP1 || 0; if (sP2 > d.maxMemPairsP2) d.maxMemPairsP2 = sP2 || 0;
            }
            // Score telling
            let finalS1 = (match.p1 === d.p1Name) ? match.s1 : match.s2; let finalS2 = (match.p1 === d.p1Name) ? match.s2 : match.s1;
            if (finalS1 > 0 || finalS2 > 0) { const scoreKey = `${finalS1}-${finalS2}`; if(!d.scoreCounts[scoreKey]) d.scoreCounts[scoreKey] = 0; d.scoreCounts[scoreKey]++; }
        });

        const sortedDuels = Object.values(duels).sort((a,b) => (b.wins1+b.wins2) - (a.wins1+a.wins2));
        let html = '';
        
        sortedDuels.forEach(d => {
            const totalGames = d.wins1 + d.wins2; 
            const pct1 = totalGames > 0 ? Math.round((d.wins1 / totalGames) * 100) : 50;
            const sortedScores = Object.entries(d.scoreCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
            
            // 1. BEPAAL STIJL (Boy/Girl)
            const classP1 = getPlayerStyleClass(d.p1Name);
            const classP2 = getPlayerStyleClass(d.p2Name);

            // 2. BEPAAL BALK KLEUR (Volgt P1 stijl)
            let barColor = 'linear-gradient(90deg, #651FFF, #7C4DFF)'; // Boy (Default)
            if (classP1 === 'style-girl') barColor = 'linear-gradient(90deg, #F50057, #FF4081)'; // Girl

            // 3. STATISTIEKEN BLOK
            let statsHTML = '';
            if (currentLbFilter === 'memory' || (currentLbFilter === 'all' && d.gameType === 'memory')) {
                statsHTML = `
                <div class="stats-grid">
                    <div class="stat-box">
                        <span class="stat-label">Beste Reeks</span>
                        <div class="stat-val">${d.p1Name}: ${d.longestStreakP1}x | ${d.p2Name}: ${d.longestStreakP2}x</div>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Slimste Beurt</span>
                        <div class="stat-val">${d.p1Name}: ${d.maxMemPairsP1} | ${d.p2Name}: ${d.maxMemPairsP2}</div>
                    </div>
                </div>`;
            } else {
                 statsHTML = `
                <div class="stats-grid">
                    <div class="stat-box" style="grid-column: span 2;">
                        <span class="stat-label">Langste Winstreeks</span>
                        <div class="stat-val">🔥 ${d.longestStreakP1}x (${d.p1Name}) vs ${d.longestStreakP2}x (${d.p2Name})</div>
                    </div>
                </div>`;
            }

            const gameIcon = currentLbFilter === 'all' ? (d.gameType==='memory' ? '🧠' : '🔴') : '';

            // 4. DUEL CARD HTML (Nieuw Design)
            html += `
            <div class="duel-card">
                <div style="text-align:center; font-size:0.8rem; margin-bottom:5px; opacity:0.5;">${gameIcon}</div>
                
                <div class="duel-header">
                    <div class="lb-badge ${classP1}">
                        ${avatars[d.p1Name]||''} ${d.p1Name}
                    </div>
                    <div class="score-big">${d.wins1} - ${d.wins2}</div>
                    <div class="lb-badge ${classP2}">
                        ${d.p2Name} ${avatars[d.p2Name]||''}
                    </div>
                </div>

                <div class="vs-bar-container">
                    <div class="vs-bar-fill" style="width: ${pct1}%; background: ${barColor};"></div>
                </div>

                ${statsHTML}

                <div class="history-row">
                    ${sortedScores.map(([s, c]) => `<div class="hist-pill">${s} (${c})</div>`).join('')}
                </div>
            </div>`;
        });
        list.innerHTML = html;
    }).catch((error) => { console.error("Error:", error); list.innerHTML = '<div style="text-align:center; color:red;">Fout bij laden.</div>'; });
}

function renderVangLeaderboard(listContainer, history) {
    const vangGames = history.filter(h => h.game === 'vang' && h.type === 'solo');
    if (vangGames.length === 0) { listContainer.innerHTML = '<div style="text-align:center; padding:20px;">Nog geen mollen gevangen!</div>'; return; }

    const avatars = { 'Lou':'👦🏻', 'Noé':'👶🏼', 'Oliver':'👦🏼', 'Manon':'👧🏼', 'Lore':'👩🏻', 'Jorden':'🧔🏻', 'Karen':'👱🏼‍♀️', 'Bert':'👨🏻', 'Vince':'👩🏽‍🦱', 'Fran':'👩🏻' };
    const difficulties = ['easy', 'medium', 'hard'];
    const diffLabels = { 'easy': 'Makkelijk', 'medium': 'Normaal', 'hard': 'Moeilijk' };

    let html = '<div class="vang-lb-container">';

    difficulties.forEach(diff => {
        const gamesInDiff = vangGames.filter(g => g.difficulty === diff);
        if(gamesInDiff.length === 0) return;

        const topTime = [...gamesInDiff].sort((a,b) => a.time - b.time).slice(0, 5);
        const topClicks = [...gamesInDiff].sort((a,b) => a.clicks - b.clicks).slice(0, 5);

        html += `<div class="vang-diff-block">
            <div class="vang-diff-header ${diff}">${diffLabels[diff]}</div>
            <div class="vang-stats-grid">
                <div class="vang-col">
                    <div class="vang-col-title">⚡ Snelste Tijd</div>
                    ${topTime.map((g, i) => `
                        <div class="vang-row top-${i+1}">
                            <div style="display:flex; align-items:center;">
                                <div class="rank-badge">${i+1}</div>
                                <span class="p-name ${getPlayerTextClass(g.player)}">${avatars[g.player]||''} ${g.player}</span>
                            </div>
                            <span class="p-score">${g.time}s</span>
                        </div>
                    `).join('')}
                </div>
                <div class="vang-col green">
                    <div class="vang-col-title">🎯 Minste Kliks</div>
                    ${topClicks.map((g, i) => `
                        <div class="vang-row top-${i+1}">
                            <div style="display:flex; align-items:center;">
                                <div class="rank-badge">${i+1}</div>
                                <span class="p-name ${getPlayerTextClass(g.player)}">${avatars[g.player]||''} ${g.player}</span>
                            </div>
                            <span class="p-score">${g.clicks}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;
    });
    html += '</div>';
    listContainer.innerHTML = html;
}

function renderSimonLeaderboard(listContainer, history) {
    const simonGames = history.filter(h => h.game === 'simon');
    if (simonGames.length === 0) { listContainer.innerHTML = '<div style="text-align:center; padding:20px;">Nog geen Simon gespeeld!</div>'; return; }
    
    const avatars = { 'Lou':'👦🏻', 'Noé':'👶🏼', 'Oliver':'👦🏼', 'Manon':'👧🏼', 'Lore':'👩🏻', 'Jorden':'🧔🏻', 'Karen':'👱🏼‍♀️', 'Bert':'👨🏻', 'Vince':'👩🏽‍🦱', 'Fran':'👩🏻' };
    const topScores = simonGames.sort((a,b) => b.clicks - a.clicks).slice(0, 10); 

    let html = `<div class="vang-lb-container">
        <div class="vang-diff-block">
            <div class="vang-diff-header simon">💡 Slimste Koppies</div>
            <div class="vang-stats-grid" style="display:block;">
                <div class="vang-col" style="border:none;">
                    <div class="vang-col-title">Hoogste Level</div>
                    ${topScores.map((g, i) => `
                        <div class="vang-row top-${i+1}">
                            <div style="display:flex; align-items:center;">
                                <div class="rank-badge">${i+1}</div>
                                <span class="p-name ${getPlayerTextClass(g.player)}">${avatars[g.player]||''} ${g.player}</span>
                            </div>
                            <span class="p-score">Level ${g.clicks}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>`;
    listContainer.innerHTML = html;
}
