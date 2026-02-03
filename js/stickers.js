// STICKERS.JS - SLIM STICKERBOEK (Gekoppeld aan Memory)
console.log("Stickers.js geladen (Smart Mode)...");

// Functie om ALLE mogelijke stickers te genereren op basis van Memory Thema's
function getAllStickersList() {
    let list = [];
    
    // Check of memThemes bestaat (uit memory.js)
    if(typeof memThemes !== 'undefined') {
        Object.keys(memThemes).forEach(key => {
            const t = memThemes[key];
            
            // We slaan 'mix' en gelockte thema's over (optioneel)
            // Wil je ook stickers van gelockte thema's zien (als vraagteken)? Haal dan '!t.locked' weg.
            if(!t.isMix) {
                // We gaan ervan uit dat elk thema 15 plaatjes heeft
                for(let i=1; i<=15; i++) {
                    list.push({
                        id: `${key}-${i}`, // Unieke ID: b.v. 'mario-1'
                        src: `${t.path}${i}.${t.extension}`,
                        theme: key
                    });
                }
            }
        });
    } else {
        console.warn("Memory.js is nog niet geladen! Kan geen stickers vinden.");
    }
    return list;
}

function getUnlockedStickers() { 
    return JSON.parse(localStorage.getItem('myStickers') || '[]'); 
}

// Wordt aangeroepen als je een spel wint
function unlockRandomSticker() {
    const all = getAllStickersList(); 
    const unlocked = getUnlockedStickers();
    
    // Zoek stickers die we nog NIET hebben
    const locked = all.filter(s => !unlocked.includes(s.id));
    
    if (locked.length === 0) return null; // Alles al verzameld!
    
    // 30% kans om een sticker te krijgen (of 100% als je dat leuker vindt voor Lou)
    // Zet dit op 1.0 voor ALTIJD prijs.
    if (Math.random() < 0.4) { 
        const newS = locked[Math.floor(Math.random() * locked.length)];
        unlocked.push(newS.id);
        localStorage.setItem('myStickers', JSON.stringify(unlocked));
        return newS; // Geef de nieuwe sticker terug om te laten zien
    }
    return null;
}

function openStickerBook() {
    const board = document.getElementById('game-board');
    const unlockedIds = getUnlockedStickers(); 
    const allStickers = getAllStickersList();
    
    let stickersHTML = '';
    
    if(allStickers.length === 0) {
        stickersHTML = '<div class="empty-msg">Laden... (Start eerst memory op)</div>';
    } else {
        // We tonen ALLES, maar wat je niet hebt is een vraagteken
        allStickers.forEach(s => {
            if(unlockedIds.includes(s.id)) {
                stickersHTML += `
                    <div class="sticker-slot" title="${s.theme}">
                        <img src="${s.src}" class="sticker-img">
                    </div>`;
            } else {
                stickersHTML += `
                    <div class="sticker-slot locked">
                        <span class="sticker-locked">❓</span>
                    </div>`;
            }
        });
    }

    board.innerHTML = `
        <div class="sticker-game-container">
            <div class="sticker-header">
                <button class="tool-btn" onclick="location.reload()">⬅ Terug</button>
                <div class="sticker-title">Mijn Stickers (${unlockedIds.length}/${allStickers.length})</div>
                <div style="width:60px"></div> </div>
            
            <div class="sticker-book-wrapper">
                <div class="sticker-book">
                    ${stickersHTML}
                </div>
            </div>
        </div>
    `;
}
