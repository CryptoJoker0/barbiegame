const fighters=[
{name:"BARBIE K",a:"#ff39aa",b:"#731cff",hp:82,power:74,speed:82,special:"Heart Burst"},
{name:"BARBIE BEAST",a:"#ff6b8b",b:"#8b174f",hp:96,power:88,speed:58,special:"Beast Roar"},
{name:"PINK FURY",a:"#ff1d55",b:"#ff9c36",hp:76,power:98,speed:70,special:"Fury Flash"},
{name:"NEON QUEEN",a:"#b92cff",b:"#19d5ff",hp:74,power:78,speed:94,special:"Neon Crown"},
{name:"CYBER KITTY",a:"#16d9ff",b:"#6d27e8",hp:70,power:80,speed:96,special:"Laser Pounce"},
{name:"ROSE TITAN",a:"#a52c59",b:"#ffd34d",hp:100,power:90,speed:45,special:"Rose Crush"}];

const $=s=>document.querySelector(s), canvas=$("#game"),ctx=canvas.getContext("2d");
let selectedFighter=1,mode="cpu",game=null,keys={},lastTime=0,audioContext=null;

function showScreen(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(`#${id}`).classList.add("active")}
function sound(type){try{audioContext??=new AudioContext();const o=audioContext.createOscillator(),g=audioContext.createGain();const f={hit:120,heavy:80,special:520,jump:300,menu:260,block:180};o.frequency.value=f[type]||260;o.connect(g);g.connect(audioContext.destination);g.gain.setValueAtTime(.06,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.12);o.start();o.stop(audioContext.currentTime+.13)}catch(e){}}

function renderCards(){$("#cards").innerHTML=fighters.map((f,i)=>`<article class="card ${i===selectedFighter?"selected":""}" data-fighter="${i}"><div class="portrait" style="--a:${f.a};--b:${f.b}"></div><h3>${f.name}</h3><div class="stats">HP ${f.hp} · POWER ${f.power} · SPEED ${f.speed}<br>${f.special}</div></article>`).join("");document.querySelectorAll("[data-fighter]").forEach(c=>c.onclick=()=>{selectedFighter=+c.dataset.fighter;renderCards()})}

function makeFighter(f,x,dir){return{fighter:f,x,y:390,velocityY:0,direction:dir,hp:100,energy:0,attackFrames:0,cooldown:0,hitFrames:0,blocking:false,crouching:false,combo:0,comboTimer:0}}

function startGame(){showScreen("arena");canvas.width=1000;canvas.height=520;game={player:makeFighter(fighters[selectedFighter],230,1),opponent:makeFighter(fighters[(selectedFighter+1)%fighters.length],770,-1),timer:60,round:1,finished:false};$("#result").classList.remove("show");$("#status").textContent="FIGHT!";lastTime=performance.now();requestAnimationFrame(loop)}

function attack(attacker,base,range,special=false){if(attacker.cooldown>0||attacker.attackFrames>0)return;if(special&&attacker.energy<50)return;attacker.attackFrames=special?24:14;attacker.cooldown=special?35:18;attacker.energy=special?attacker.energy-50:Math.min(100,attacker.energy+8);sound(special?"special":base>10?"heavy":"hit");const target=attacker===game.player?game.opponent:game.player;const d=Math.abs(attacker.x-target.x);if(d<range+42&&!target.blocking&&!target.crouching){const dmg=base*(attacker.fighter.power/80);target.hp=Math.max(0,target.hp-dmg);target.energy=Math.min(100,target.energy+Math.min(12,dmg*.35));target.hitFrames=10;attacker.combo++;attacker.comboTimer=45}else if(d<range+42&&target.blocking){target.energy=Math.min(100,target.energy+5);sound("block");attacker.combo=0}else attacker.combo=0}

function input(f,c){f.blocking=!!keys[c.block];f.crouching=!!keys[c.crouch]&&!f.blocking;if(f.blocking||f.crouching)return;if(keys[c.left])f.x-=f.fighter.speed*.075;if(keys[c.right])f.x+=f.fighter.speed*.075;if(keys[c.jump]&&f.y>=390){f.velocityY=-12;sound("jump")}if(keys[c.light])attack(f,8,22);if(keys[c.heavy])attack(f,14,34);if(keys[c.special])attack(f,25,62,true)}

function ai(){const a=game.opponent,p=game.player,d=p.x-a.x; a.blocking=false;if(Math.abs(d)>125)a.x+=Math.sign(d)*a.fighter.speed*.052;else{if(p.attackFrames>0&&Math.random()<.12)a.blocking=true;else if(Math.random()<.055)attack(a,10,26);else if(Math.random()<.018)attack(a,15,38);if(a.energy>=50&&Math.random()<.018)attack(a,25,62,true)}if(Math.random()<.012&&a.y>=390)a.velocityY=-12}

function updateFighter(f){f.velocityY+=.5;f.y+=f.velocityY;if(f.y>390){f.y=390;f.velocityY=0}f.attackFrames=Math.max(0,f.attackFrames-1);f.cooldown=Math.max(0,f.cooldown-1);f.hitFrames=Math.max(0,f.hitFrames-1);f.comboTimer=Math.max(0,f.comboTimer-1);if(!f.comboTimer)f.combo=0;f.x=Math.max(55,Math.min(945,f.x))}

function arena(){const g=ctx.createLinearGradient(0,0,0,520);g.addColorStop(0,"#241047");g.addColorStop(.55,"#130827");g.addColorStop(1,"#090514");ctx.fillStyle=g;ctx.fillRect(0,0,1000,520);
for(let i=0;i<22;i++){ctx.fillStyle=i%2?"#ff2caa55":"#19d5ff44";ctx.fillRect(i*50,165+(i%5)*20,25,265)}ctx.fillStyle="#ff319d22";ctx.fillRect(0,410,1000,110);ctx.strokeStyle="#ff4eaf";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,430);ctx.lineTo(1000,430);ctx.stroke();
ctx.fillStyle="#ffd34d";ctx.font="900 18px Arial";ctx.textAlign="center";ctx.fillText("BARBIEFUN • BARBIEGAME ARENA",500,45);drawFighter(game.player);drawFighter(game.opponent)}

function drawFighter(e){ctx.save();ctx.translate(e.x,e.y);ctx.scale(e.direction,1);if(e.hitFrames%2)ctx.globalAlpha=.45;const c=e.fighter.a,d=e.fighter.b;ctx.shadowBlur=22;ctx.shadowColor=c;
ctx.fillStyle="#ffe0d2";ctx.beginPath();ctx.arc(0,-76,29,0,Math.PI*2);ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,-83,31,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle=d;ctx.fillRect(-26,-45,52,70);ctx.fillStyle=c;ctx.fillRect(-32,25,21,55);ctx.fillRect(11,25,21,55);
ctx.fillStyle="#ffe0d2";ctx.fillRect(-50,-38,24,14);ctx.fillRect(26,-38,24,14);ctx.fillStyle="#fff";ctx.fillRect(-13,-81,7,5);ctx.fillRect(8,-81,7,5);
if(e.crouching){ctx.globalAlpha=.85;ctx.fillRect(-32,8,64,18)}if(e.blocking){ctx.strokeStyle="#19d7ff";ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,-28,58,-1.5,1.5);ctx.stroke()}if(e.attackFrames>0){ctx.fillStyle="#ffd34d";ctx.shadowColor="#ffd34d";ctx.fillRect(30,-30,70,14);ctx.beginPath();ctx.arc(102,-23,11,0,Math.PI*2);ctx.fill()}if(e.combo>1){ctx.fillStyle="#fff";ctx.font="900 16px Arial";ctx.fillText(`${e.combo} HIT`,0,-130)}ctx.restore()}

function hud(){if(!game)return;$("#p1name").textContent=game.player.fighter.name;$("#p2name").textContent=game.opponent.fighter.name;$("#p1hp").style.width=`${game.player.hp}%`;$("#p2hp").style.width=`${game.opponent.hp}%`;$("#p1energy").textContent=`${Math.round(game.player.energy)}%`;$("#p2energy").textContent=`${Math.round(game.opponent.energy)}%`;$("#timer").textContent=Math.max(0,Math.ceil(game.timer));$("#round").textContent=game.round}

function finish(){game.finished=true;const p=game.player.hp>=game.opponent.hp;$("#winner").textContent=p?"PLAYER 1 WINS ✦":"PLAYER 2 WINS ✦";$("#status").textContent="KO";$("#result").classList.add("show");sound("special")}

function loop(t){if(!game||game.finished)return;const dt=Math.min(50,t-lastTime);lastTime=t;game.timer-=dt/1000;if(game.timer<=0||game.player.hp<=0||game.opponent.hp<=0){finish();return}input(game.player,{left:"a",right:"d",jump:"w",crouch:"s",light:"j",heavy:"k",special:"l",block:"u"});if(mode==="pvp")input(game.opponent,{left:"ArrowLeft",right:"ArrowRight",jump:"ArrowUp",crouch:"ArrowDown",light:"Numpad1",heavy:"Numpad2",special:"Numpad3",block:"Numpad4"});else ai();updateFighter(game.player);updateFighter(game.opponent);arena();hud();requestAnimationFrame(loop)}

document.addEventListener("keydown",e=>{keys[e.code]=true;keys[e.key]=true;if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space"].includes(e.code))e.preventDefault()});
document.addEventListener("keyup",e=>{keys[e.code]=false;keys[e.key]=false});

document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==="cpu"||a==="play"){mode="cpu";renderCards();showScreen("select")}if(a==="pvp"){mode="pvp";renderCards();showScreen("select")}if(a==="start")startGame();if(a==="back"||a==="menu")showScreen("menu");if(a==="restart")startGame();if(a==="how")alert("PLAYER 1: A/D move, W jump, S crouch, J light, K heavy, L special, U block.\\n\\nPLAYER 2: Arrow keys move, Arrow Up jump, Arrow Down crouch, Numpad 1 light, Numpad 2 heavy, Numpad 3 special, Numpad 4 block.\\n\\nMobile controls are shown during battle.")});

document.querySelectorAll("[data-key]").forEach(b=>{const m={left:"a",right:"d",jump:"w",block:"u",light:"j",heavy:"k",special:"l"};const k=m[b.dataset.key];["pointerdown","touchstart"].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();keys[k]=true},{passive:false}));["pointerup","pointercancel","pointerleave","touchend"].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();keys[k]=false},{passive:false}))});
renderCards();
