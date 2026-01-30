// NEWGAMES.JS - MET ALLE FUNCTIES (SIMON THEMA, VANG ZE NIVEAUS, TEKENEN OPSLAAN)

// Asset Config voor Stickers
const assetConfig = {
    'mario': { count: 15, ext: 'png' }, 'pokemon': { count: 15, ext: 'png' },
    'studio100': { count: 15, ext: 'png' }, 'boerderij': { count: 15, ext: 'png' },
    'dino': { count: 15, ext: 'jpg' }, 'marvel': { count: 15, ext: 'jpg' }
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
    let html = `<div style="text-align:center; margin-bottom:10px; font-family:'Fredoka One'; color:#0277BD;">Mijn Verzameling (${unlocked.length}/${all.length})</div><div class="sticker-container">`;
    if(unlocked.length===0) html+='<div style="text-align:center; width:100%; color:#888;">Win spelletjes voor stickers!</div>';
    all.forEach(s => {
        if(unlocked.includes(s.id)) html+=`<div class="sticker-slot unlocked" onclick="zoomImage('${s.src}',false)"><img src="${s.src}" class="sticker-img"></div>`;
        else html+=`<div class="sticker-slot locked">🔒</div>`;
    });
    board.innerHTML = html + '</div>';
}

// --- TEKENBORD (Met Opslaan & Diktes) ---
let isDrawing=false, ctx, drawColor='#000', drawSize=5;

function startDrawing() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="drawing-container">
            <div class="drawing-controls">
               <button class="tool-btn" onclick="openAlbum()">📁 Album</button>
               <button class="tool-btn" style="background:#4CAF50; color:white;" onclick="saveDraw()">💾 Opslaan</button>
            </div>
            <div class="drawing-controls">
                <div class="color-swatch active" style="background:black" onclick="setCol('black',this)"></div>
                <div class="color-swatch" style="background:#F44336" onclick="setCol('#F44336',this)"></div>
                <div class="color-swatch" style="background:#2196F3" onclick="setCol('#2196F3',this)"></div>
                <div class="color-swatch" style="background:#FFEB3B" onclick="setCol('#FFEB3B',this)"></div>
                <div style="width:1px; height:20px; background:#CCC; margin:0 5px;"></div>
                <div class="size-btn active" onclick="setSize(5,this)"><div class="dot" style="width:5px;height:5px;"></div></div>
                <div class="size-btn" onclick="setSize(15,this)"><div class="dot" style="width:12px;height:12px;"></div></div>
                <div class="size-btn" onclick="setSize(30,this)"><div class="dot" style="width:20px;height:20px;"></div></div>
                <button class="tool-btn" onclick="clearCan()">🗑️</button>
            </div>
            <canvas id="drawCanvas"></canvas>
        </div>
    `;
    setTimeout(initCan, 100);
}

function initCan() {
    const c = document.getElementById('drawCanvas'); 
    const con = document.querySelector('.drawing-container');
    if(!c || !con) return;
    c.width = con.clientWidth * 0.95; c.height = con.clientHeight * 0.70;
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
    let a = JSON.parse(localStorage.getItem('myDrawings')||'[]'); 
    a.unshift(img); if(a.length>20)a.pop();
    localStorage.setItem('myDrawings', JSON.stringify(a)); 
    playSound('win'); alert("Tekening opgeslagen!");
}
function openAlbum(){
    const board = document.getElementById('game-board'); const a = JSON.parse(localStorage.getItem('myDrawings')||'[]');
    let h = `<div style="text-align:center; font-family:'Fredoka One'; color:#0277BD; margin-bottom:10px;">Mijn Album 🎨</div>
             <button class="tool-btn" onclick="startDrawing()" style="margin-bottom:10px;">⬅ Terug</button>
             <div class="sticker-container">`;
    if(a.length===0) h+='<div style="text-align:center; width:100%; color:#888;">Nog geen tekeningen.</div>';
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


// --- VANG ZE (Met Niveaus) ---
let wS = {p:null,s:0,t:30,act:false,sz:9,sp:900,mt:null,gt:null};

function startWhackGame(){
    const b=document.getElementById('game-board'); 
    b.innerHTML=`<div class="memory-setup-container" style="text-align:center; padding:20px;">
        <h3>Wie speelt?</h3>
        <div style="display:flex; justify-content:center; gap:10px; margin-bottom:20px;">
             <button class="icon-btn" onclick="setWPl('Lou',this)">👦🏼 Lou</button>
             <button class="icon-btn" onclick="setWPl('Noé',this)">👶🏼 Noé</button>
        </div>
        <h3>Niveau</h3>
        <div style="display:flex; justify-content:center; gap:10px; margin-bottom:20px;">
            <button class="size-btn" onclick="setWD('easy',this)">Makkelijk</button>
            <button class="size-btn selected" onclick="setWD('medium',this)">Normaal</button>
            <button class="size-btn" onclick="setWD('hard',this)">Snel!</button>
        </div>
        <button id="swb" class="game-btn btn-purple" onclick="runWhack()" disabled style="width:100%">START</button>
    </div>`; 
    wS.p=null; wS.sz=9; wS.sp=900;
}
function setWPl(n,b){playSound('click'); wS.p=n; document.querySelectorAll('.icon-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); document.getElementById('swb').disabled=false;}
function setWD(d,b){playSound('click'); document.querySelectorAll('.size-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); wS.sz=d==='easy'?4:(d==='hard'?16:9); wS.sp=d==='easy'?1500:(d==='hard'?550:900);}
function runWhack(){
    playSound('win'); const b=document.getElementById('game-board'); wS.s=0; wS.t=30; wS.act=true;
    let gc=wS.sz===4?'grid-2':(wS.sz===16?'grid-4':'grid-3'); 
    let h=''; for(let i=0;i<wS.sz;i++) h+=`<div class="whack-hole" id="hole-${i}" onmousedown="whack(this)" ontouchstart="whack(this)"><div class="whack-character"></div></div>`;
    b.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;height:100%;"><div style="font-family:'Fredoka One'; font-size:1.5rem; margin-bottom:10px;">${wS.p} - Tijd: <span id="wt">30</span> - Score: <span id="ws">0</span></div><div class="whack-grid ${gc}" style="display:grid; gap:10px; width:100%; max-width:500px; aspect-ratio:1/1;">${h}</div></div>`;
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


// --- SIMON (Met Thema's) ---
let sSeq=[], pSeq=[], sLvl=0, sAct=false, sThm='mario';
const sThms={'mario':{p:'assets/images/memory/mario/',e:'png'},'pokemon':{p:'assets/images/memory/pokemon/',e:'png'}};

function startSimonGame(){
    const b=document.getElementById('game-board'); 
    b.innerHTML=`<div class="memory-setup-container" style="text-align:center;">
        <h3>Kies je vriendjes</h3>
        <div style="display:flex; justify-content:center; gap:15px; margin-bottom:20px;">
            <button class="theme-btn" onclick="setST('mario',this)"><img src="assets/images/memory/mario/cover.png" style="width:60px;height:40px;object-fit:cover;"><span>Mario</span></button>
            <button class="theme-btn" onclick="setST('pokemon',this)"><img src="assets/images/memory/pokemon/cover.png" style="width:60px;height:40px;object-fit:cover;"><span>Pokémon</span></button>
        </div>
        <button id="ssb" class="game-btn btn-yellow" onclick="initSim()" disabled style="width:100%">START</button>
    </div>`;
}
function setST(t,b){playSound('click');sThm=t; document.querySelectorAll('.theme-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); document.getElementById('ssb').disabled=false;}
function initSim(){
    const b=document.getElementById('game-board'); const t=sThms[sThm]||sThms['mario'];
    let h=''; for(let i=0;i<4;i++) h+=`<button class="simon-btn" id="sb-${i}" style="background-image:url('${t.p}${i+1}.${t.e}');background-size:cover; border:3px solid white; border-radius:50%; box-shadow:0 5px 10px rgba(0,0,0,0.2);" onclick="hSim(${i})"></button>`;
    b.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;height:100%;"><div style="background:white;padding:10px 20px;border-radius:20px;margin-bottom:10px;font-family:'Fredoka One';color:#FBC02D;"><span id="smsg">Let op...</span></div><div class="simon-board" style="display:grid; grid-template-columns:1fr 1fr; gap:15px; width:300px; height:300px;">${h}</div><button class="modal-btn" onclick="nxtSim()" style="margin-top:10px;">Start</button></div>`; sSeq=[]; sLvl=0;
}
function nxtSim(){sLvl++; pSeq=[]; sSeq.push(Math.floor(Math.random()*4)); runSim();}
function runSim(){sAct=false; let i=0; const int=setInterval(()=>{actSim(sSeq[i]); i++; if(i>=sSeq.length){clearInterval(int); sAct=true; document.getElementById('smsg').innerText="Jij!";}},800);}
function actSim(i){const b=document.getElementById(`sb-${i}`); b.style.transform='scale(1.15)'; b.style.borderColor='#FFEB3B'; playSound('pop'); setTimeout(()=>{b.style.transform='scale(1)'; b.style.borderColor='white';},400);}
function hSim(i){
    if(!sAct)return; actSim(i); pSeq.push(i);
    if(pSeq[pSeq.length-1]!==sSeq[pSeq.length-1]){playSound('lose'); document.getElementById('smsg').innerText="Fout!"; sAct=false; setTimeout(()=>showWinnerModal("Simon",[{name:"Jij",score:sLvl-1}]),1000); return;}
    if(pSeq.length===sSeq.length){sAct=false; document.getElementById('smsg').innerText="Goed!"; setTimeout(nxtSim,1000);}
}
function stopSimonGame(){sAct=false;}
