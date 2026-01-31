// TEKENEN.JS - Tekenbord
console.log("Tekenen.js geladen");

let isDrawing = false, ctx, dColor='black', dSize=5;

function startDrawing() {
    const board = document.getElementById('game-board');
    board.innerHTML = `
        <div class="drawing-container">
            <div class="drawing-controls">
                <button class="tool-btn" onclick="openAlbum()">📂</button>
                <button class="tool-btn" style="background:#4CAF50; color:white;" onclick="saveDraw()">💾</button>
                <div class="control-divider"></div>
                <div class="color-swatch active" style="background:black" onclick="setCol('black',this)"></div>
                <div class="color-swatch" style="background:red" onclick="setCol('red',this)"></div>
                <div class="color-swatch" style="background:blue" onclick="setCol('blue',this)"></div>
                <div class="color-swatch" style="background:yellow" onclick="setCol('yellow',this)"></div>
                <div class="control-divider"></div>
                <div class="size-btn active" onclick="setSize(5,this)"><div class="dot dot-s"></div></div>
                <div class="size-btn" onclick="setSize(15,this)"><div class="dot dot-m"></div></div>
                <button class="tool-btn" onclick="clearCan()">🗑️</button>
            </div>
            <canvas id="drawCanvas"></canvas>
        </div>
    `;
    setTimeout(initCan, 50);
}

function initCan() {
    const c = document.getElementById('drawCanvas');
    const con = document.querySelector('.drawing-container');
    if(!c) return;
    c.width = con.clientWidth * 0.95; c.height = con.clientHeight * 0.8;
    ctx=c.getContext('2d'); ctx.lineCap='round'; ctx.lineJoin='round';
    c.addEventListener('mousedown', sD); c.addEventListener('touchstart', sD, {passive:false});
    c.addEventListener('mousemove', d); c.addEventListener('touchmove', d, {passive:false});
    c.addEventListener('mouseup', eD); c.addEventListener('touchend', eD);
}
function sD(e){isDrawing=true; d(e);} function eD(){isDrawing=false; ctx.beginPath();}
function d(e){
    if(!isDrawing)return; e.preventDefault(); 
    const c=document.getElementById('drawCanvas'); const r=c.getBoundingClientRect(); 
    const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left; 
    const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top; 
    ctx.lineWidth=dSize; ctx.strokeStyle=dColor; 
    ctx.lineTo(x,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y);
}
function setCol(c,b){if(typeof playSound==='function')playSound('click'); dColor=c; document.querySelectorAll('.color-swatch').forEach(x=>x.classList.remove('active')); b.classList.add('active');}
function setSize(s,b){if(typeof playSound==='function')playSound('click'); dSize=s; document.querySelectorAll('.size-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active');}
function clearCan(){if(typeof playSound==='function')playSound('pop'); ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);}

function saveDraw() {
    const img = document.getElementById('drawCanvas').toDataURL("image/png");
    let a = JSON.parse(localStorage.getItem('myDrawings')||'[]');
    a.unshift(img); if(a.length>10) a.pop();
    localStorage.setItem('myDrawings', JSON.stringify(a));
    if(typeof playSound === 'function') playSound('win');
    alert("Opgeslagen!");
}

function openAlbum() {
    const board = document.getElementById('game-board');
    const a = JSON.parse(localStorage.getItem('myDrawings')||'[]');
    let html = `<div class="sticker-header">Mijn Tekeningen 🎨</div><button class="tool-btn" onclick="startDrawing()" style="margin-bottom:10px;">⬅ Terug</button><div class="sticker-container">`;
    if(a.length===0) html += '<p style="text-align:center;">Nog geen tekeningen.</p>';
    a.forEach(src => { html += `<div class="sticker-slot unlocked"><img src="${src}" class="sticker-img"></div>`; });
    board.innerHTML = html + '</div>';
}
