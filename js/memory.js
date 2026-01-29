/* CONTAINER & TITELS */
.memory-setup {
    text-align: center;
    width: 100%;
    max-width: 800px;
}

.setup-group {
    background: white;
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05); /* Zachte schaduw ipv rand */
}

.setup-group h3 {
    color: #00BCD4;
    margin-bottom: 15px;
    font-size: 1.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* DE KNOPPEN (TEGELS) */
.option-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
}

.option-btn {
    background: #F5F5F5;
    border: none; /* Geen randen meer! */
    color: #555;
    padding: 15px 20px;
    border-radius: 15px;
    font-size: 2rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 100px;
}

/* Label tekst onder icoon */
.btn-label {
    font-size: 1rem;
    margin-top: 5px;
    font-family: 'Fredoka One', cursive;
    color: #888;
}

/* GESELECTEERDE STAAT (Mooi blauw/groen) */
.option-btn.selected {
    background: #00BCD4; /* Fris blauw */
    color: white;
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 188, 212, 0.4); /* Gloed */
}

.option-btn.selected .btn-label {
    color: white;
}

/* STERREN */
.star { color: #FFD700; text-shadow: 0 2px 0 #D4AF37; }
.star.dim { color: #DDD; text-shadow: none; }

/* SPELER NAMEN SPECIFIEK */
.player-input-container {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 15px;
}

#custom-player-name {
    padding: 10px;
    border-radius: 10px;
    border: 2px solid #EEE;
    font-family: 'Nunito', sans-serif;
    font-size: 1rem;
    width: 150px;
}

.add-btn {
    background: #FFCA28;
    border: none;
    border-radius: 10px;
    width: 40px;
    font-size: 1.5rem;
    color: white;
    cursor: pointer;
}

/* START KNOP */
.start-btn {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 15px 60px;
    font-size: 2rem;
    border-radius: 50px;
    margin-top: 10px;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(76, 175, 80, 0.3);
    transition: transform 0.2s;
}

.start-btn:active {
    transform: scale(0.95);
}

.start-btn:disabled {
    background: #ccc;
    box-shadow: none;
    cursor: not-allowed;
}
