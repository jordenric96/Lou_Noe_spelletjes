// JS/MAIN.JS - Navigatie Logica

const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const gameTitle = document.getElementById('game-title');
const gameBoard = document.getElementById('game-board');

let currentGame = null; 

function selectGame(gameName) {
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    gameContainer.classList.add('active');

    currentGame = gameName; 

    if (gameName === 'memory') {
        gameTitle.innerText = "Memory";
        if (typeof startMemorySetup === "function") {
            startMemorySetup(); 
        }
    } else if (gameName === 'doolhof') {
        gameTitle.innerText = "Doolhof";
        // HIER ZIT DE UPDATE:
        if (typeof startDoolhofSetup === "function") {
            startDoolhofSetup();
        } else {
            gameBoard.innerHTML = "<p>Fout: doolhof.js is niet geladen!</p>";
        }
    } else if (gameName === 'patroon') {
        gameTitle.innerText = "Patroon";
        gameBoard.innerHTML = "<p>Patroon komt binnenkort!</p>";
    }
}

function goHome() {
    if (currentGame === 'doolhof' && typeof cleanupDoolhof === "function") {
        cleanupDoolhof();
    }
    gameContainer.classList.remove('active');
    gameContainer.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
    gameBoard.innerHTML = "";
    currentGame = null;
}
/* --- WINNAAR MODAL LOGICA --- */

function showWinnerModal(winnerName, leaderboardData) {
    const modal = document.getElementById('winner-modal');
    const title = document.getElementById('winner-title');
    const list = document.getElementById('winner-leaderboard');
    
    // Titel instellen
    title.innerText = winnerName ? `${winnerName} wint!` : "Gewonnen!";
    
    // Ranglijst bouwen
    list.innerHTML = '';
    
    if (leaderboardData && leaderboardData.length > 0) {
        leaderboardData.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            if (index === 0) item.classList.add('winner'); // De winnaar krijgt extra stijl
            
            // Zet kleuren
            if (player.color) {
                item.style.color = player.color;
                if(index === 0) {
                    // Winnaar achtergrond wit, tekst in kleur
                    item.style.borderColor = player.color;
                } else {
                    // Andere spelers andersom
                    item.style.background = player.color;
                    item.style.color = 'white';
                }
            }

            item.innerHTML = `
                <span>${index + 1}. ${player.name}</span>
                <span>${player.score}</span>
            `;
            list.appendChild(item);
        });
    }

    // Toon modal
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('show'), 10);
    
    // START CONFETTI!
    startConfetti();
}

function closeWinnerModal() {
    const modal = document.getElementById('winner-modal');
    modal.classList.remove('show');
    setTimeout(() => modal.classList.add('hidden'), 300);
    
    // Herstart het spel (reset)
    if (currentGame === 'memory') startMemorySetup();
    if (currentGame === 'doolhof') startDoolhofSetup();
}

// Simpele confetti generator
function startConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = ''; // Reset
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#fff'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's'; // 2-4 sec
        confetti.style.opacity = Math.random();
        container.appendChild(confetti);
    }
}
