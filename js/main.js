// MAIN.JS - ORIGINELE VERSIE

console.log("Main.js geladen");

const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const gameTitle = document.getElementById('game-title');
const gameBoard = document.getElementById('game-board');

let currentGame = null; 

// --- GELUID ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        osc.frequency.setValueAtTime(1000, now + 0.2);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
}

// --- NAVIGATIE ---
function selectGame(gameName) {
    playSound('click');
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    
    gameContainer.classList.remove('hidden');
    gameContainer.classList.add('active');
    
    currentGame = gameName; 
    gameBoard.innerHTML = ''; // Leegmaken

    if (gameName === 'memory') {
        gameTitle.innerText = "Memory";
        if (typeof startMemorySetup === "function") startMemorySetup();
    } 
    else if (gameName === 'doolhof') {
        gameTitle.innerText = "Doolhof";
        if (typeof startDoolhofSetup === "function") startDoolhofSetup();
    }
    else if (gameName === 'blokken') {
        gameTitle.innerText = "De File 🚗";
        if (typeof startBlokkenGame === "function") startBlokkenGame();
    }
    // Oude versies van Simon en Whack (indien aanwezig in newgames.js)
    else if (gameName === 'simon') {
        gameTitle.innerText = "Simon Zegt";
        if (typeof startSimonGame === "function") startSimonGame();
    }
    else if (gameName === 'vang') {
        gameTitle.innerText = "Vang ze!";
        if (typeof startWhackGame === "function") startWhackGame();
    }
    else if (gameName === 'tekenen') {
        gameTitle.innerText = "Tekenbord";
        if (typeof startDrawing === "function") startDrawing();
    }
}

function goHome() {
    playSound('click');
    // Stop eventuele timers
    if (currentGame === 'doolhof' && typeof cleanupDoolhof === "function") cleanupDoolhof();
    if (currentGame === 'simon' && typeof stopSimonGame === "function") stopSimonGame();
    if (currentGame === 'vang' && typeof stopWhackGame === "function") stopWhackGame();

    gameContainer.classList.remove('active');
    gameContainer.classList.add('hidden');
    
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
    
    gameBoard.innerHTML = "";
    currentGame = null;
}

// --- WINNAAR POP-UP ---
function showWinnerModal(winnerName, leaderboardData) {
    playSound('win');
    const modal = document.getElementById('winner-modal');
    const title = document.getElementById('winner-title');
    const list = document.getElementById('winner-leaderboard');
    
    title.innerText = winnerName ? `${winnerName} wint!` : "Gewonnen!";
    list.innerHTML = '';
    
    if (leaderboardData && leaderboardData.length > 0) {
        leaderboardData.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            if (index === 0) item.classList.add('winner');
            
            // Stijl
            if (player.color) {
                item.style.color = player.color;
            }
            
            item.innerHTML = `<span>${index + 1}. ${player.name}</span><span>${player.score}</span>`;
            list.appendChild(item);
        });
    }

    modal.classList.remove('hidden'); // Zorg dat hij zichtbaar is in CSS
    modal.style.display = 'flex';     // Forceer flexbox
    
    startConfetti();
}

function closeWinnerModal() {
    playSound('click');
    const modal = document.getElementById('winner-modal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
    
    // Herstart het huidige spel
    if (currentGame === 'memory') startMemorySetup();
    else if (currentGame === 'doolhof') startDoolhofSetup();
    else if (currentGame === 'blokken') startBlokkenGame(); 
    else if (currentGame === 'simon') startSimonGame();
    else if (currentGame === 'vang') startWhackGame();
}

function startConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = ''; 
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#fff'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's'; 
        confetti.style.opacity = Math.random();
        container.appendChild(confetti);
    }
}
