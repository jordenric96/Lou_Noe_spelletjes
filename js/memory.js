/* --- SETUP SCHERM STIJL --- */

.memory-setup {
    text-align: center;
    width: 100%;
    max-width: 900px;
    padding: 20px;
}

/* De containers (de "balken") */
.setup-group {
    background: #FFF; /* Schone witte achtergrond */
    border-radius: 30px; /* Lekker rond */
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.08); /* Zachte schaduw */
    position: relative;
    border: 3px solid #E0F7FA; /* Heel licht blauw randje */
}

/* Specifieke kleuraccenten per groep */
.group-players { border-color: #B3E5FC; } /* Lichtblauw accent */
.group-theme { border-color: #C8E6C9; } /* Lichtgroen accent */
.group-size { border-color: #FFF9C4; } /* Lichtgeel accent */


.setup-group h3 {
    color: #0277BD;
    margin-bottom: 20px;
    font-size: 1.6rem;
    font-family: 'Fredoka One', cursive;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* DE NIEUWE KNOPPEN (Bubbels) */
.option-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
}

.option-btn {
    /* Standaard staat (niet geselecteerd) */
    background: #E1F5FE; /* Heel licht blauw */
    color: #0288D1;
    border: none;
    padding: 15px 25px;
    border-radius: 25px;
    font-size: 2.5rem; /* Grote emoji's */
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* "Bounce" effect */
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 110px;
    box-shadow: 0 4px 0 #B3E5FC; /* 3D randje onderaan */
}

.option-btn .btn-label {
    font-size: 1.1rem;
    margin-top: 8px;
    font-family: 'Fredoka One', cursive;
    color: #555;
    font-weight: bold;
}

/* GESELECTEERDE STAAT (Pop!) */
.option-btn.selected {
    background: #00BCD4; /* Fel Cyaan/Blauw */
    color: white;
    transform: translateY(-6px) scale(1.05); /* Komt omhoog en wordt iets groter */
    box-shadow: 0 10px 20px rgba(0, 188, 212, 0.4); /* Grote gloed */
}

.option-btn.selected .btn-label {
    color: white;
}

/* Thema specifieke kleuren als ze geselecteerd zijn (optioneel, maar leuk) */
.group-theme .option-btn.selected { background: #4CAF50; box-shadow: 0 10px 20px rgba(76, 175, 80, 0.4); } /* Groen */
.group-size .option-btn.selected { background: #FFC107; box-shadow: 0 10px 20px rgba(255, 193, 7, 0.4); } /* Geel/Goud */

/* STERREN - Veel leuker nu */
.star { 
    color: #FFD700; /* Goud */ 
    text-shadow: 2px 2px 0 #FFA000; /* Oranje randje voor diepte */
}
.star.dim { 
    color: #CFD8DC; /* Zacht blauw-grijs ipv vies grijs */
    text-shadow: none; 
    opacity: 0.6;
}

/* Input veld voor extra speler */
.player-input-container {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 25px;
    padding-top: 20px;
    border-top: 2px dashed #EEE;
}

#custom-player-name {
    padding: 12px 20px;
    border-radius: 30px;
    border: 2px solid #B3E5FC;
    font-family: 'Nunito', sans-serif;
    font-size: 1.1rem;
    outline: none;
}

.add-btn {
    background: #FFC107;
    border: none;
    border-radius: 50%; /* Rond */
    width: 50px; height: 50px;
    font-size: 2rem;
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 0 #FFA000;
}
.add-btn:active { transform: translateY(4px); box-shadow: none; }


/* START KNOP - Gigantisch en groen */
.start-btn {
    background: linear-gradient(to bottom, #66BB6A, #43A047); /* Gradiënt groen */
    color: white;
    border: none;
    padding: 20px 80px;
    font-size: 2.2rem;
    border-radius: 60px;
    margin-top: 20px;
    cursor: pointer;
    box-shadow: 0 8px 0 #2E7D32, 0 15px 30px rgba(76, 175, 80, 0.4);
    font-family: 'Fredoka One', cursive;
    transition: transform 0.1s;
    width: 90%;
    max-width: 500px;
}

.start-btn:active {
    transform: translateY(8px);
    box-shadow: 0 0 0 #2E7D32, 0 5px 15px rgba(76, 175, 80, 0.4);
}

.start-btn:disabled {
    background: #CFD8DC;
    color: #90A4AE;
    box-shadow: none;
    cursor: not-allowed;
}

/* --- HET SPELBORD FIX --- */
.memory-game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    padding-bottom: 20px;
}

.memory-grid {
    display: grid;
    gap: 15px;
    width: 95%;
    max-width: 700px; /* Zorgt dat het niet te breed wordt op PC */
    margin: 20px auto;
    /* De kolommen worden in JS gezet */
}

.memory-card {
    background-color: transparent;
    cursor: pointer;
    perspective: 1000px;
    aspect-ratio: 1 / 1; /* Altijd vierkant */
    width: 100%; /* Vul de grid cel */
}

.memory-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1); /* Snellere flip */
    transform-style: preserve-3d;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.memory-card.flipped .memory-card-inner {
    transform: rotateY(180deg);
}

.card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden; /* Belangrijk voor foto's */
}

/* Achterkant (Vraagteken) */
.card-front {
    background: linear-gradient(135deg, #4DD0E1, #00BCD4);
    color: white;
    font-family: 'Fredoka One', cursive;
    font-size: 4rem;
    border: 4px solid white;
}

/* Voorkant (Plaatje/Emoji) */
.card-back {
    background-color: white;
    transform: rotateY(180deg);
    border: 4px solid #FFC107; /* Geel randje bij het plaatje */
    font-size: 5rem; /* Grote emoji's! */
}
