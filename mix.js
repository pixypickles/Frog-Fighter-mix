const board=document.getElementById('board'), roads=document.getElementById('roads');
const mixScript=[...document.scripts].find(s=>/\/mix\.js(?:\?|$)/.test(s.src));
const MIX_BASE_URL=mixScript ? new URL('./',mixScript.src) : new URL('./',location.href);
function mixPageUrl(mode){
  return new URL((mode==='water'?'water/':'ground/')+'index.html?mix=1&battle=1',MIX_BASE_URL).href;
}

const msg=document.getElementById('message'), turnLabel=document.getElementById('turnLabel'), sideLabel=document.getElementById('sideLabel');
const kBases=document.getElementById('kBases'), bBases=document.getElementById('bBases');

const nodes={
 K:{x:8,y:72,name:'カワズ本拠地',terrain:'land',base:true,owner:'kawazu',links:['A']},
 A:{x:22,y:63,name:'あぜ道',terrain:'land',base:false,owner:null,links:['K','B','S1']},
 S1:{x:20,y:37,name:'森の祠',terrain:'land',base:true,owner:null,links:['A']}, // 1つズレた行き止まり拠点
 B:{x:37,y:63,name:'中央広場',terrain:'land',base:true,owner:null,links:['A','C','P1']},
 P1:{x:39,y:37,name:'西の池',terrain:'water',base:true,owner:null,links:['B','P2']},
 C:{x:52,y:63,name:'田んぼ道',terrain:'land',base:false,owner:null,links:['B','D','S2']},
 S2:{x:55,y:84,name:'古い井戸',terrain:'land',base:true,owner:null,links:['C']}, // もう一つの行き止まり
 D:{x:67,y:58,name:'東の広場',terrain:'land',base:true,owner:null,links:['C','E','P2']},
 P2:{x:59,y:34,name:'大きな池',terrain:'water',base:true,owner:null,links:['P1','D','P3']},
 P3:{x:78,y:31,name:'深み',terrain:'water',base:false,owner:null,links:['P2','E']},
 E:{x:80,y:57,name:'湿地道',terrain:'land',base:false,owner:null,links:['D','P3','Z']},
 Z:{x:92,y:67,name:'ベルゼブブ本拠地',terrain:'land',base:true,owner:'beel',links:['E']}
};

const roster={
 kawazu:[
  ['カワズ','🐸','both','kawazu'],['ミカエル','🐸','both','green'],['ガブリエル','🐸','both','blue'],
  ['ラファエル','🐸','both','yellow'],['ウリエル','🐸','both','orange']
 ],
 beel:[
  ['ベルゼブブ','🐸','both','beelzebub'],['ルシファー','🐸','both','black'],['リリス','🐸','both','purple'],
  ['リヴァイア','🐟','water','piranha'],['アスモデウス','🦞','water','crayfish']
 ]
};
const reserveBeel=[
 ['アザゼル','🪰','land','piranha'],
 ['ベリアル','🕷️','land','crayfish']
];

let turn=1, side='kawazu', selected=null, cpuBusy=false, units=[];

function freshUnits(){
 return [
  ...roster.kawazu.map((r,i)=>({id:'k'+i,side:'kawazu',name:r[0],icon:r[1],mobility:r[2],type:r[3],node:'K',hp:100,wait:0,moved:false})),
  ...roster.beel.map((r,i)=>({id:'b'+i,side:'beel',name:r[0],icon:r[1],mobility:r[2],type:r[3],node:i>=3?'P3':'Z',hp:100,wait:0,moved:false}))
 ];
}
function makeUnits(){ units=freshUnits(); }

function saveStrategy(){
 const owners={};Object.entries(nodes).forEach(([id,n])=>owners[id]=n.owner);
 sessionStorage.setItem('mixStrategyState',JSON.stringify({turn,side,units,owners}));
}
function restoreStrategy(){
 try{
  const s=JSON.parse(sessionStorage.getItem('mixStrategyState')||'null');
  if(!s||!Array.isArray(s.units))return false;
  turn=s.turn||1;side=s.side||'kawazu';units=s.units;
  if(s.owners)Object.entries(s.owners).forEach(([id,o])=>{if(nodes[id])nodes[id].owner=o});
  return true;
 }catch(e){return false}
}
function applyBattleResult(){
 try{
  const result=JSON.parse(sessionStorage.getItem('mixBattleResult')||'null');
  if(!result)return false;
  sessionStorage.removeItem('mixBattleResult');
  const a=units.find(u=>u.id===result.attacker), d=units.find(u=>u.id===result.defender);
  if(!a||!d)return false;
  a.hp=Math.max(0,Math.min(100,result.attackerHp));
  d.hp=Math.max(0,Math.min(100,result.defenderHp));
  const winner=result.winner==='attacker'?a:d, loser=result.winner==='attacker'?d:a;
  const battleNode=result.node||winner.node;
  winner.node=battleNode;
  winner.hp=Math.max(1,winner.hp);
  if(nodes[battleNode]&&!nodes[battleNode].base)nodes[battleNode].owner=winner.side;
  // 敗者は本拠地へ戻り2回の自軍ターンを待機。HPは0から回復待ち。
  loser.node=loser.side==='kawazu'?'K':'Z';
  loser.hp=0;loser.wait=2;loser.moved=true;
  side=result.returnSide||'kawazu';
  saveStrategy();
  setTimeout(()=>say('戦闘結果',winner.name+'の勝ち！　'+loser.name+'は本拠地で2ターン回復待ち。'),80);
  return true;
 }catch(e){return false}
}
function canEnter(u,nid){
 const n=nodes[nid]; if(!n)return false;
 if(u.mobility==='water'&&n.terrain!=='water')return false;
 if(u.mobility==='land'&&n.terrain!=='land')return false;
 return true;
}
function roadKey(a,b){return [a,b].sort().join('-')}
function renderRoads(){
 roads.innerHTML='';const done=new Set();
 Object.entries(nodes).forEach(([id,n])=>n.links.forEach(to=>{
  const key=roadKey(id,to);if(done.has(key))return;done.add(key);
  const m=nodes[to],line=document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('x1',n.x*10);line.setAttribute('y1',n.y*6.8);line.setAttribute('x2',m.x*10);line.setAttribute('y2',m.y*6.8);
  line.dataset.road=key;line.setAttribute('class','road '+((n.terrain==='water'&&m.terrain==='water')?'water':''));
  roads.appendChild(line);
 }));
}
function stackOffset(idx){
 if(idx===0)return[0,-7];
 const ring=Math.floor((idx-1)/6)+1,pos=(idx-1)%6,a=pos*Math.PI/3;
 return[Math.cos(a)*23*ring,Math.sin(a)*20*ring-7];
}
function render(){
 board.querySelectorAll('.node,.unit').forEach(e=>e.remove());
 document.querySelectorAll('.road').forEach(e=>e.classList.remove('active'));
 Object.entries(nodes).forEach(([id,n])=>{
  const b=document.createElement('button');b.className='node '+n.terrain+(n.base?' base':'')+(n.owner?' '+n.owner+'-owned':'');
  b.style.left=n.x+'%';b.style.top=n.y+'%';b.dataset.node=id;
  b.innerHTML='<b>'+n.name+'</b><small>'+(n.terrain==='water'?'💧 水中':'🌱 陸地')+(n.base?'・拠点':'')+'</small>';
  if(side==='kawazu'&&selected&&nodes[selected.node].links.includes(id)&&canEnter(selected,id)&&!selected.moved&&!selected.wait){
   b.classList.add('reachable');b.onclick=()=>moveHuman(id);
   const line=document.querySelector('[data-road="'+roadKey(selected.node,id)+'"]');if(line)line.classList.add('active');
  }
  board.appendChild(b);
 });
 const counts={};
 units.forEach(u=>{
  const n=nodes[u.node],idx=counts[u.node]||0;counts[u.node]=idx+1;
  const [ox,oy]=stackOffset(idx),el=document.createElement('button');
  el.className='unit '+u.side+(selected===u?' selected':'')+(u.wait?' waiting':'');
  el.style.left=`calc(${n.x}% + ${ox}px)`;el.style.top=`calc(${n.y}% + ${oy}px)`;
  el.title=u.name+(u.wait?'（回復待ち '+u.wait+'）':'');
  el.innerHTML=u.icon+'<span class="hp-mini"><i style="width:'+u.hp+'%"></i></span>';
  el.onclick=()=>selectUnit(u);board.appendChild(el);
 });
 const bc={kawazu:0,beel:0};Object.values(nodes).forEach(n=>{if(n.owner)bc[n.owner]++});
 kBases.textContent=bc.kawazu;bBases.textContent=bc.beel;
 turnLabel.textContent='TURN '+turn;sideLabel.textContent=side==='kawazu'?'カワズ軍':'ベルゼブブ軍（CPU）';
 document.getElementById('endTurn').disabled=side!=='kawazu'||cpuBusy;
}
function selectUnit(u){
 if(side!=='kawazu'){say('ベルゼブブ軍 行動中','CPUが駒を動かしています。');return}
 if(u.side!=='kawazu'){say(u.name,'ベルゼブブ軍はCPUが操作します。');return}
 if(u.wait){say(u.name,'本拠地で回復待ち：あと'+u.wait+'ターン');return}
 if(u.moved){say(u.name,'このターンは移動済みです。');return}
 selected=u;say(u.name,'移動先を選択。');render();
}
function encounter(attacker,defender,to){
 const n=nodes[to],terrain=n.terrain;
 saveStrategy();
 const battle={attacker:attacker.id,defender:defender.id,node:to,turn,side,terrain,
  attackerType:attacker.type,defenderType:defender.type,attackerHp:attacker.hp,defenderHp:defender.hp,
  attackerName:attacker.name,defenderName:defender.name};
 sessionStorage.setItem('mixBattle',JSON.stringify(battle));
 say('遭遇！',attacker.name+' VS '+defender.name+'　'+(terrain==='water'?'水中戦':'地上戦'));
 showRotateThenBattle(terrain,attacker,defender,n);
}
function showRotateThenBattle(terrain,a,b,n){
 let ov=document.getElementById('mixRotateOverlay');if(!ov){ov=document.createElement('div');ov.id='mixRotateOverlay';document.body.appendChild(ov)}
 const portrait=terrain==='land';
 ov.innerHTML='<div class="rotate-card"><div class="rotate-icon">📱</div><b>'+(portrait?'スマホを縦持ちしてください':'スマホを横持ちしてください')+'</b><span>'+n.name+'：'+a.name+' VS '+b.name+'</span><small>'+(portrait?'地上ジャンプバトル':'水中バトル')+'</small><button id="mixBattleGo">この向きでバトル開始</button></div>';
 ov.classList.add('show');
 const ready=()=>portrait?(innerHeight>=innerWidth):(innerWidth>=innerHeight);
 let gone=false;
 const go=()=>{if(gone)return;gone=true;ov.classList.remove('show');location.href=mixPageUrl(terrain)};
 document.getElementById('mixBattleGo').onclick=go;
 const timer=setInterval(()=>{if(ready()){clearInterval(timer);setTimeout(go,300)}},250);
 setTimeout(()=>clearInterval(timer),12000);
}
function moveHuman(to){
 if(!selected)return;const u=selected;u.node=to;u.moved=true;const n=nodes[to];if(!n.base)n.owner='kawazu';
 const enemy=units.find(x=>x.node===to&&x.side==='beel'&&!x.wait);selected=null;render();
 if(enemy)encounter(u,enemy,to);else{saveStrategy();say(u.name,n.name+'へ移動しました。')}
}
function distanceToTarget(start,target){
 const q=[[start,0]],seen=new Set([start]);while(q.length){const[id,d]=q.shift();if(id===target)return d;for(const n of nodes[id].links)if(!seen.has(n)){seen.add(n);q.push([n,d+1])}}return 99;
}
function chooseCpuMove(u){
 const opts=nodes[u.node].links.filter(id=>canEnter(u,id));if(!opts.length)return null;
 const attack=opts.find(id=>units.some(x=>x.side==='kawazu'&&!x.wait&&x.node===id));if(attack)return attack;
 // まず未占領の拠点を少し優先、その後カワズ本拠地へ。
 opts.sort((a,b)=>{
  const ba=(nodes[a].base&&nodes[a].owner!=='beel')?-3:0,bb=(nodes[b].base&&nodes[b].owner!=='beel')?-3:0;
  return (ba+distanceToTarget(a,'K'))-(bb+distanceToTarget(b,'K'));
 });
 return opts[0];
}
async function runCpuTurn(){
 cpuBusy=true;side='beel';selected=null;render();say('ベルゼブブ軍のターン','CPUが行動します。');
 const actors=units.filter(u=>u.side==='beel'&&!u.wait);
 for(const u of actors){
  if(side!=='beel')break;await new Promise(r=>setTimeout(r,380));
  const to=chooseCpuMove(u);if(!to){u.moved=true;continue}
  u.node=to;u.moved=true;const n=nodes[to];if(!n.base)n.owner='beel';render();
  const enemy=units.find(x=>x.side==='kawazu'&&!x.wait&&x.node===to);
  if(enemy){cpuBusy=false;saveStrategy();encounter(u,enemy,to);return}
  say(u.name,n.name+'へ進軍。');
 }
 await new Promise(r=>setTimeout(r,450));cpuBusy=false;beginHumanTurn();
}
function healSide(which){
 units.filter(u=>u.side===which).forEach(u=>{
  if(u.wait>0){u.wait--;if(u.wait===0)u.hp=55;return}
  const n=nodes[u.node];if(n.owner===which&&n.base)u.hp=Math.min(100,u.hp+18);
 });
}
function beginHumanTurn(){
 side='kawazu';turn++;selected=null;healSide('kawazu');
 units.forEach(u=>{u.moved=false});saveStrategy();
 say('カワズ軍のターン','キャラクターを選んで移動。');render();
}
function endHumanTurn(){
 if(side!=='kawazu'||cpuBusy)return;selected=null;healSide('beel');saveStrategy();runCpuTurn();
}
function say(a,b){msg.innerHTML='<b>'+a+'</b><span>'+b+'</span>'}
document.getElementById('endTurn').onclick=endHumanTurn;
document.getElementById('resetGame').onclick=()=>{if(confirm('最初からやり直しますか？')){sessionStorage.removeItem('mixStrategyState');sessionStorage.removeItem('mixBattleResult');Object.values(nodes).forEach(n=>{n.owner=n.base?(n===nodes.K?'kawazu':n===nodes.Z?'beel':null):null});makeUnits();turn=1;side='kawazu';selected=null;cpuBusy=false;saveStrategy();render();say('カワズ軍のターン','駒をタップすると進める道が光ります。')}};

renderRoads();
if(!restoreStrategy())makeUnits();
const hadResult=applyBattleResult();
render();
if(!hadResult)say('カワズ軍のターン','陸地中心の戦場。池や寄り道の拠点をどう使うかがポイントです。');
