// Navigatie Logica

// Schermen ophalen
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const gameTitle = document.getElementById('game-title');
const gameBoard = document.getElementById('game-board');

// Functie om een spel te starten
function selectGame(gameName) {
    // 1. Verberg hoofdmenu
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');

    // 2. Toon spel container
    gameContainer.classList.remove('hidden');
    gameContainer.classList.add('active');

    // 3. Zet de titel
    let titleText = "";
    
    // 4. Start de logica van het specifieke spel
    // (We roepen hier straks functies aan die in memory.js of doolhof.js staan)
    if (gameName === 'memory') {
        titleText = "Memory";
        // Controleer of de memory functie al bestaat (voor later)
        if (typeof startMemorySetup === "function") {
            startMemorySetup(); 
        } else {
            gameBoard.innerHTML = "<p>Memory wordt geladen...</p>";
        }
    } else if (gameName === 'doolhof') {
        titleText = "Doolhof";
        gameBoard.innerHTML = "<p>Doolhof komt binnenkort!</p>";
    } else {
        titleText = "Spel";
    }

    gameTitle.innerText = titleText;
}

// Functie om terug naar home te gaan
function goHome() {
    // 1. Verberg spel container
    gameContainer.classList.remove('active');
    gameContainer.classList.add('hidden');

    // 2. Toon hoofdmenu
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');

    // 3. Maak het spelbord leeg (zodat het reset)
    gameBoard.innerHTML = "";
}
