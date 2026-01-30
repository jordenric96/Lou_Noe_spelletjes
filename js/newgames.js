// NIEUWE SPELLEN & STICKERS

// ASSET CONFIG
const assetConfig = {
    'mario': { count: 15, ext: 'png' }, 'pokemon': { count: 15, ext: 'png' },
    'studio100': { count: 15, ext: 'png' }, 'boerderij': { count: 15, ext: 'png' },
    'dino': { count: 15, ext: 'jpg' }, 'marvel': { count: 15, ext: 'jpg' },
    'natuur': { count: 15, ext: 'jpg' }, 'beroepen': { count: 15, ext: 'jpg' }
};

// --- STICKERS ---
function generateAllStickers() {
    let all = [];
    for (const [theme, data] of Object.entries(assetConfig)) {
        for (let i=1; i<=data.count; i++) all.push({id:`${theme}-${i}`, src:`assets/images/memory/${theme}/${i}.${data.ext}`});
    }
    return all;
}
function getUnlocked() { return JSON.parse(localStorage.getItem('myStickers') || '[]'); }
function unlockRandomSticker() {
    const all = generateAllStickers(); const unlocked = getUnlocked();
    const locked = all.filter(s => !unlocked.includes(s.id));
    if (locked.length === 0) return null;
    const newS = locked[Math.floor(Math.random() * locked.length)];
    unlocked.push(newS.id);
    localStorage.setItem('myStickers', JSON.stringify(unlocked));
    return newS;
}
function openStickerBook() {
    const board = document.getElementById('game-board');
    const unlocked = getUnlocked(); const all = generateAllStickers();
    let html = `<div class="sticker-header">Mijn Verzameling (${unlocked.length}/${all.length})</div><div class="sticker-container">`;
    if(unlocked.length===0) html+='<div class="empty-msg">Win spelletjes voor stickers!</div>';
    all.forEach(s => {
        if(unlocked.includes(s.id)) html+=`<div class="sticker-slot unlocked" onclick="zoomImage('${s.src}',false)"><img src="${s.src}" class="sticker-img" loading="lazy"></div>`;
        else html+=`<div class="sticker-slot locked"><span class="sticker-lock-icon">🔒</span></div>`;
    });
    board.innerHTML = html + '</div>';
}

// --- TEKENBORD ---
let isDrawing=false, ctx, drawColor='#fff', drawSize=5;
function startDrawing() {
    const board = document.getElementById('game-board');
    board.innerHTML = `<div class="drawing-container"><div class="drawing-controls top-controls"><button class="album-btn" onclick="openAlbum()">📁 Album</button><button class="save-btn" onclick="saveDraw()">💾 Opslaan</button></div><div class="drawing-controls"><div class="color-swatch active" style="background:white" onclick="setCol('white',this)"></div><div class="color-swatch" style="background:#FF00FF" onclick="setCol('#FF00FF',this)"></div><div class="color-swatch" style="background:#00FFFF" onclick="setCol('#00FFFF',this)"></div><div class="color-swatch" style="background:#00FF00" onclick="setCol('#00FF00',this)"></div><div class="color-swatch" style="background:#FFFF00" onclick="setCol('#FFFF00',this)"></div><div class="control-divider"></div><div class="size-btn active" onclick="setSize(5,this)"><div class="dot dot-s"></div></div><div class="size-btn" onclick="setSize(15,this)"><div class="dot dot-m"></div></div><div class="size-btn" onclick="setSize(30,this)"><div class="dot dot-l"></div></div><div class="control-divider"></div><button class="tool-btn" onclick="clearCan()">🗑️</button></div><canvas id="drawCanvas"></canvas></div>`;
    initCan();
}
function initCan() {
    const c = document.getElementById('drawCanvas'); const con = document.querySelector('.drawing-container');
    if(!c)return; c.width=con.clientWidth*0.95; c.height=con.clientHeight*0.75;
    ctx=c.getContext('2d'); ctx.lineCap='round'; ctx.lineJoin='round';
    c.addEventListener('mousedown', sD); c.addEventListener('touchstart', sD, {passive:false});
    c.addEventListener('mousemove', d); c.addEventListener('touchmove', d, {passive:false});
    c.addEventListener('mouseup', eD); c.addEventListener('touchend', eD);
}
function sD(e){isDrawing=true; d(e);} function eD(){isDrawing=false; ctx.beginPath();}
function d(e){if(!isDrawing)return; e.preventDefault(); const c=document.getElementById('drawCanvas'); const r=c.getBoundingClientRect(); const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left; const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top; ctx.lineWidth=drawSize; ctx.strokeStyle=drawColor; ctx.lineTo(x,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y);}
function setCol(c,b){playSound('click'); drawColor=c; document.querySelectorAll('.color-swatch').forEach(x=>x.classList.remove('active')); b.classList.add('active');}
function setSize(s,b){playSound('click'); drawSize=s; document.querySelectorAll('.size-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active');}
function clearCan(){playSound('pop'); const c=document.getElementById('drawCanvas'); ctx.clearRect(0,0,c.width,c.height);}
function saveDraw(){
    const img = document.getElementById('drawCanvas').toDataURL("image/png");
    let a = JSON.parse(localStorage.getItem('myDrawings')||'[]'); a.unshift(img); if(a.length>20)a.pop();
    localStorage.setItem('myDrawings', JSON.stringify(a)); playSound('win'); alert("Opgeslagen!");
}
function openAlbum(){
    const board = document.getElementById('game-board'); const a = JSON.parse(localStorage.getItem('myDrawings')||'[]');
    let h = `<div class="sticker-header">Mijn Album 🎨</div><button class="modal-btn neon-btn" onclick="startDrawing()" style="width:auto;margin-bottom:10px;">TERUG</button><div class="sticker-container">`;
    if(a.length===0) h+='<div class="empty-msg">Nog geen tekeningen.</div>';
    a.forEach((src,i)=> h+=`<div class="sticker-slot unlocked" style="background:white" onclick="zoomImage('${src}',true,${i})"><img src="${src}" class="sticker-img"></div>`);
    board.innerHTML=h+'</div>';
}
function delDraw(i){
    let a=JSON.parse(localStorage.getItem('myDrawings')||'[]'); a.splice(i,1);
    localStorage.setItem('myDrawings', JSON.stringify(a)); closeZoom(); openAlbum(); playSound('pop');
}
function zoomImage(src,isDraw,idx){
    const o=document.getElementById('zoom-overlay'); const i=document.getElementById('zoomed-image'); const d=document.getElementById('delete-drawing-btn');
    i.src=src; o.classList.remove('hidden');
    if(isDraw){ d.classList.remove('hidden'); d.onclick=(e)=>{e.stopPropagation(); if(confirm("Weggooien?"))delDraw(idx);};} else d.classList.add('hidden');
}
function closeZoom(){document.getElementById('zoom-overlay').classList.add('hidden');}

// --- VANG ZE ---
let wS = {p:null,s:0,t:30,act:false,sz:9,sp:900,mt:null,gt:null};
function startWhackGame(){const b=document.getElementById('game-board'); b.innerHTML=`<div class="memory-setup"><div class="setup-group"><h3>Speler</h3><div class="option-grid"><button class="option-btn player-btn" onclick="setWPl('Lou',this)"><span>👦🏼</span></button><button class="option-btn player-btn" onclick="setWPl('Noé',this)"><span>👶🏼</span></button></div></div><div class="setup-group"><h3>Niveau</h3><div class="option-grid"><button class="option-btn" onclick="setWD('easy',this)"><span>🟢</span></button><button class="option-btn selected" onclick="setWD('medium',this)"><span>🟠</span></button><button class="option-btn" onclick="setWD('hard',this)"><span>🔴</span></button></div></div></div><button id="swb" class="game-btn neon-purple" onclick="runWhack()" disabled style="width:100%">START</button>`; wS.p=null;}
function setWPl(n,b){playSound('click'); wS.p=n; document.querySelectorAll('.player-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); document.getElementById('swb').disabled=false;}
function setWD(d,b){playSound('click'); document.querySelectorAll('.option-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); wS.sz=d==='easy'?4:(d==='hard'?16:9); wS.sp=d==='easy'?1500:(d==='hard'?550:900);}
function runWhack(){
    playSound('win'); const b=document.getElementById('game-board'); wS.s=0; wS.t=30; wS.act=true;
    let gc=wS.sz===4?'grid-2':(wS.sz===16?'grid-4':'grid-3'); let h='';
    for(let i=0;i<wS.sz;i++) h+=`<div class="whack-hole" id="hole-${i}" onmousedown="whack(this)" ontouchstart="whack(this)"><div class="whack-character"></div></div>`;
    b.innerHTML=`<div class="whack-container"><div class="whack-score-board"><span>${wS.p}</span><span><span id="wt">30</span>s</span><span><span id="ws">0</span></span></div><div class="whack-grid ${gc}">${h}</div></div>`;
    wS.gt=setInterval(()=>{if(!wS.act)return; wS.t--; document.getElementById('wt').innerText=wS.t; if(wS.t<=0)endWhack();},1000); popMole();
}
function popMole(){
    if(!wS.act)return; const holes=document.querySelectorAll('.whack-hole'); const hole=holes[Math.floor(Math.random()*holes.length)];
    hole.querySelector('.whack-character').style.backgroundImage=`url('assets/images/memory/mario/${Math.floor(Math.random()*10)+1}.png')`;
    hole.classList.add('up'); wS.mt=setTimeout(()=>{hole.classList.remove('up'); if(wS.act)setTimeout(popMole,Math.random()*300);},wS.sp);
}
function whack(h){if(!wS.act||!h.classList.contains('up')||h.classList.contains('whacked'))return; playSound('pop'); h.classList.remove('up'); h.classList.add('whacked'); setTimeout(()=>h.classList.remove('whacked'),200); wS.s++; document.getElementById('ws').innerText=wS.s;}
function endWhack(){wS.act=false; clearInterval(wS.gt); clearTimeout(wS.mt); showWinnerModal(wS.p,[{name:wS.p,score:wS.s}]);}
function stopWhackGame(){wS.act=false; clearInterval(wS.gt); clearTimeout(wS.mt);}

// --- SIMON ---
let sSeq=[], pSeq=[], sLvl=0, sAct=false, sThm='mario';
const sThms={'mario':{p:'assets/images/memory/mario/',e:'png'},'pokemon':{p:'assets/images/memory/pokemon/',e:'png'},'kleuren':{c:['#0f0','#f00','#ff0','#00f']}};
function startSimonGame(){const b=document.getElementById('game-board'); b.innerHTML=`<div class="memory-setup"><div class="setup-group"><h3>Thema</h3><div class="option-grid"><button class="option-btn" onclick="setST('mario',this)"><span>🍄</span></button><button class="option-btn" onclick="setSTpokemon('pokemon',this)"><span>⚡</span></button></div></div><button id="ssb" class="game-btn neon-yellow" onclick="initSim()" disabled style="width:100%">START</button></div>`;}
function setST(t,b){playSound('click');sThm=t; document.querySelectorAll('.option-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); document.getElementById('ssb').disabled=false;}
function setSTpokemon(t,b){setST(t,b);} // Helper
function initSim(){
    const b=document.getElementById('game-board'); let h=''; const t=sThms[sThm]||sThms['mario'];
    for(let i=0;i<4;i++) h+=`<button class="simon-btn" id="sb-${i}" style="${t.c?`background:${t.c[i]}`:`background-image:url('${t.p}${i+1}.${t.e}');background-size:cover`}" onclick="hSim(${i})"></button>`;
    b.innerHTML=`<div class="simon-container"><div class="simon-info"><span id="smsg">Kijk goed...</span></div><div class="simon-board">${h}</div><button class="modal-btn neon-btn" onclick="nxtSim()">Start</button></div>`; sSeq=[]; sLvl=0;
}
function nxtSim(){sLvl++; pSeq=[]; sSeq.push(Math.floor(Math.random()*4)); runSim();}
function runSim(){sAct=false; let i=0; const int=setInterval(()=>{actSim(sSeq[i]); i++; if(i>=sSeq.length){clearInterval(int); sAct=true; document.getElementById('smsg').innerText="Jij!";}},800);}
function actSim(i){const b=document.getElementById(`sb-${i}`); b.classList.add('lit'); playSound('pop'); setTimeout(()=>b.classList.remove('lit'),400);}
function hSim(i){
    if(!sAct)return; actSim(i); pSeq.push(i);
    if(pSeq[pSeq.length-1]!==sSeq[pSeq.length-1]){playSound('lose'); document.getElementById('smsg').innerText="Fout!"; sAct=false; setTimeout(()=>showWinnerModal("Simon",[{name:"Jij",score:sLvl-1}]),1000); return;}
    if(pSeq.length===sSeq.length){sAct=false; document.getElementById('smsg').innerText="Goed!"; setTimeout(nxtSim,1000);}
}
function stopSimonGame(){sAct=false;}
