// STICKERS.JS - Config & Stickerboek
console.log("Stickers.js geladen");

// Centrale configuratie (wordt ook door Puzzel gebruikt)
const assetConfig = {
    'mario':     { count: 15, ext: 'png', locked: false },
    'pokemon':   { count: 15, ext: 'png', locked: false },
    'studio100': { count: 15, ext: 'png', locked: false },
    'boerderij': { count: 15, ext: 'png', locked: false },
    'dino':      { count: 15, ext: 'jpg', locked: true },
    'marvel':    { count: 15, ext: 'png', locked: false },
    'natuur':    { count: 15, ext: 'jpg', locked: true },
    'beroepen':  { count: 15, ext: 'jpg', locked: true }
};

function generateAllStickers() {
    let all = [];
    for (const [theme, data] of Object.entries(assetConfig)) {
        for (let i=1; i<=data.count; i++) {
            all.push({id:`${theme}-${i}`, src:`assets/images/memory/${theme}/${i}.${data.ext}`});
        }
    }
    return all;
}

function getUnlockedStickers() { 
    return JSON.parse(localStorage.getItem('myStickers') || '[]'); 
}

function unlockRandomSticker() {
    const all = generateAllStickers(); 
    const unlocked = getUnlockedStickers();
    const locked = all.filter(s => !unlocked.includes(s.id));
    
    if (locked.length === 0) return null;
    
    // 30% kans op sticker bij winst
    if (Math.random() > 0.3) { 
        const newS = locked[Math.floor(Math.random() * locked.length)];
        unlocked.push(newS.id);
        localStorage.setItem('myStickers', JSON.stringify(unlocked));
        return newS;
    }
    return null;
}

function openStickerBook() {
    const board = document.getElementById('game-board');
    const unlocked = getUnlockedStickers(); 
    const all = generateAllStickers();
    
    let html = `<div class="sticker-header">Mijn Verzameling (${unlocked.length}/${all.length})</div><div class="sticker-container">`;
    if(unlocked.length === 0) html += '<div class="empty-msg">Win spelletjes om stickers te verdienen!</div>';
    
    all.forEach(s => {
        if(unlocked.includes(s.id)) html+=`<div class="sticker-slot unlocked"><img src="${s.src}" class="sticker-img"></div>`;
        else html+=`<div class="sticker-slot locked"><span class="sticker-lock-icon">🔒</span></div>`;
    });
    
    board.innerHTML = html + '</div>';
}
