function generateCards() {
    const grid = document.getElementById('memory-grid');
    const themeData = themes[memoryState.theme];
    const pairsNeeded = memoryState.gridSize / 2;
    const ext = themeData.extension || 'jpg';
    
    let items = [];
    if (memoryState.useImages) {
        for (let i = 1; i <= pairsNeeded; i++) items.push(i);
    } else {
        items = themeData.emoji.slice(0, pairsNeeded);
    }

    let deck = [...items, ...items];
    deck.sort(() => 0.5 - Math.random());
    grid.innerHTML = '';

    deck.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.value = item;
        
        // Plaatje of Emoji
        let content = memoryState.useImages 
            ? `<img src="${themeData.path}${item}.${ext}" class="card-img" draggable="false">` 
            : `<span class="card-emoji">${item}</span>`;

        // Cover (Achterkant)
        let coverContent = memoryState.useImages 
            ? `<img src="${themeData.path}cover.${ext}" class="card-cover-img" draggable="false" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="fallback-icon" style="display:none; font-size:3rem; color:white;">${themeData.coverIcon}</span>`
            : `<span class="card-cover-emoji">${themeData.coverIcon}</span>`;

        // HIER IS DE WIJZIGING: We voegen de 'match-overlay' toe in de HTML
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="card-front">${coverContent}</div>
                <div class="card-back">
                    ${content}
                    <div class="match-overlay"><span class="checkmark">✅</span></div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}
