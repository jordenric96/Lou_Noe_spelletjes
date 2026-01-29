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
