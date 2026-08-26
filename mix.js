const board=document.getElementById('board'), roads=document.getElementById('roads');
const msg=document.getElementById('message'), turnLabel=document.getElementById('turnLabel'), sideLabel=document.getElementById('sideLabel');
const kBases=document.getElementById('kBases'), bBases=document.getElementById('bBases');

const nodes={
 K:{x:10,y:76,name:'カワズ本拠地',terrain:'land',base:true,owner:'kawazu',links:['A']},
 A:{x:25,y:61,name:'草地拠点',terrain:'land',base:false,owner:null,links:['K','B','C']},
 B:{x:43,y:76,name:'岩場拠点',terrain:'land',base:false,owner:null,links:['A','D']},
 C:{x:43,y:42,name:'岸辺',terrain:'land',base:false,owner:null,links:['A','D','E']},
 D:{x:61,y:62,name:'浅瀬拠点',terrain:'water',base:false,owner:null,links:['B','C','F']},
 E:{x:61,y:27,name:'水路拠点',terrain:'water',base:false,owner:null,links:['C','F']},
 F:{x:78,y:44,name:'深池拠点',terrain:'water',base:false,owner:null,links:['D','E','Z']},
 Z:{x:91,y:25,name:'ベルゼブブ本拠地',terrain:'water',base:true,owner:'beel',links:['F']}
};

const roster={
 kawazu:[
  ['カワズ','🐸','both'],['ミカエル','🐸','both'],['ガブリエル','🐸','both'],['ラファエル','🐸','both'],['ウリエル','🐸','both']
 ],
 beel:[
  ['ベルゼブブ','🐸','both'],['ルシファー','🐸','both'],['リリス','🐸','both'],['リヴァイア','🐟','water'],['アスモデウス','🦞','water']
 ]
};
const reserveBeel=[['アザゼル','🪰','land'],['ベリアル','🕷️','land']];

let turn=1, side='kawazu', selected=null, cpuBusy=false, units=[];

function makeUnits(){
 units=[];
 roster.kawazu.forEach((r,i)=>units.push({id:'k'+i,side:'kawazu',name:r[0],icon:r[1],mobility:r[2],node:'K',hp:100,wait:0,moved:false}));
 roster.beel.forEach((r,i)=>units.push({id:'b'+i,side:'beel',name:r[0],icon:r[1],mobility:r[2],node:'Z',hp:100,wait:0,moved:false}));
}
function canEnter(u,nid){
 const n=nodes[nid]; if(!n)return false;
 if(u.mobility==='water'&&n.terrain!=='water')return false;
 if(u.mobility==='land'&&n.terrain!=='land')return false;
 return true;
}
function roadKey(a,b){return [a,b].sort().join('-')}
function renderRoads(){
 roads.innerHTML=''; const done=new Set();
 Object.entries(nodes).forEach(([id,n])=>n.links.forEach(to=>{
  const key=roadKey(id,to); if(done.has(key))return; done.add(key);
  const m=nodes[to], line=document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('x1',n.x*10); line.setAttribute('y1',n.y*6.8); line.setAttribute('x2',m.x*10); line.setAttribute('y2',m.y*6.8);
  line.dataset.road=key; line.setAttribute('class','road '+((n.terrain==='water'||m.terrain==='water')?'water':''));
  roads.appendChild(line);
 }));
}
function stackOffset(idx){
 // 3体で打ち止めにせず、同じ地点の全員を小さく円状にずらして表示。
 if(idx===0)return [0,-7];
 const ring=Math.floor((idx-1)/6)+1, pos=(idx-1)%6, a=pos*Math.PI/3;
 return [Math.cos(a)*24*ring, Math.sin(a)*21*ring-7];
}
function render(){
 board.querySelectorAll('.node,.unit').forEach(e=>e.remove());
 document.querySelectorAll('.road').forEach(e=>e.classList.remove('active'));
 Object.entries(nodes).forEach(([id,n])=>{
  const b=document.createElement('button');
  b.className='node '+n.terrain+(n.base?' base':'')+(n.owner?' '+n.owner+'-owned':'');
  b.style.left=n.x+'%'; b.style.top=n.y+'%'; b.dataset.node=id;
  b.innerHTML='<b>'+n.name+'</b><small>'+(n.terrain==='water'?'💧 水中':'🌱 地上')+'</small>';
  if(side==='kawazu'&&selected&&nodes[selected.node].links.includes(id)&&canEnter(selected,id)&&!selected.moved&&!selected.wait){
   b.classList.add('reachable'); b.onclick=()=>moveHuman(id);
   const line=document.querySelector('[data-road="'+roadKey(selected.node,id)+'"]'); if(line)line.classList.add('active');
  }
  board.appendChild(b);
 });
 const counts={};
 units.forEach(u=>{
  const n=nodes[u.node], idx=counts[u.node]||0; counts[u.node]=idx+1;
  const [ox,oy]=stackOffset(idx), el=document.createElement('button');
  el.className='unit '+u.side+(selected===u?' selected':'')+(u.wait?' waiting':'');
  el.style.left=`calc(${n.x}% + ${ox}px)`; el.style.top=`calc(${n.y}% + ${oy}px)`;
  el.title=u.name; el.innerHTML=u.icon+'<span class="hp-mini"><i style="width:'+u.hp+'%"></i></span>';
  el.onclick=()=>selectUnit(u); board.appendChild(el);
 });
 const bc={kawazu:0,beel:0}; Object.values(nodes).forEach(n=>{if(n.owner)bc[n.owner]++});
 kBases.textContent=bc.kawazu; bBases.textContent=bc.beel;
 turnLabel.textContent='TURN '+turn; sideLabel.textContent=side==='kawazu'?'カワズ軍':'ベルゼブブ軍（CPU）';
 document.getElementById('endTurn').disabled=side!=='kawazu'||cpuBusy;
}
function selectUnit(u){
 if(side!=='kawazu'){say('ベルゼブブ軍 行動中','CPUが駒を動かしています。');return}
 if(u.side!=='kawazu'){say(u.name,'ベルゼブブ軍はCPUが操作します。');return}
 if(u.wait){say(u.name,'本拠地で回復待ち：あと'+u.wait+'ターン');return}
 if(u.moved){say(u.name,'このターンは移動済みです。');return}
 selected=u; say(u.name,'移動先を選択。'+(u.mobility==='water'?'水中専用':'水陸両用')); render();
}
function encounter(attacker,enemy,to){
 const n=nodes[to], terrain=n.terrain;
 sessionStorage.setItem('mixBattle',JSON.stringify({attacker:attacker.id,defender:enemy.id,node:to,turn,side,terrain}));
 sessionStorage.setItem('mixStrategyState',JSON.stringify({turn,side,units,nodes:Object.fromEntries(Object.entries(nodes).map(([k,v])=>[k,{owner:v.owner}]))}));
 say('遭遇！',attacker.name+' VS '+enemy.name+'　'+(terrain==='water'?'水中戦':'地上戦'));
 showRotateThenBattle(terrain,attacker,enemy,n);
}
function showRotateThenBattle(terrain,a,b,n){
 let ov=document.getElementById('mixRotateOverlay');
 if(!ov){ov=document.createElement('div');ov.id='mixRotateOverlay';document.body.appendChild(ov)}
 const portrait=terrain==='land';
 ov.innerHTML='<div class="rotate-card"><div class="rotate-icon">'+(portrait?'📱':'📱')+'</div><b>'+(portrait?'スマホを縦持ちしてください':'スマホを横持ちしてください')+'</b><span>'+n.name+'：'+a.name+' VS '+b.name+'</span><small>'+(portrait?'地上ジャンプバトル':'水中バトル')+'</small><button id="mixBattleGo">この向きでバトル開始</button></div>';
 ov.classList.add('show');
 const ready=()=>portrait?(innerHeight>=innerWidth):(innerWidth>=innerHeight);
 const go=()=>{
   ov.classList.remove('show');
   location.href=(terrain==='water'?'water/':'ground/')+'index.html?mix=1&battle=1&place='+encodeURIComponent(n.name)+'&p1='+encodeURIComponent(a.name)+'&p2='+encodeURIComponent(b.name);
 };
 document.getElementById('mixBattleGo').onclick=go;
 const timer=setInterval(()=>{if(ready()){clearInterval(timer);setTimeout(go,300)}},250);
 setTimeout(()=>clearInterval(timer),12000);
}
function moveHuman(to){
 if(!selected)return;
 const u=selected; u.node=to; u.moved=true; const n=nodes[to];
 if(!n.base)n.owner='kawazu';
 const enemy=units.find(x=>x.node===to&&x.side==='beel'&&!x.wait);
 selected=null; render();
 if(enemy)encounter(u,enemy,to); else say(u.name,n.name+'へ移動しました。');
}
function distanceToTarget(start,target){
 const q=[[start,0]], seen=new Set([start]);
 while(q.length){const [id,d]=q.shift();if(id===target)return d;for(const n of nodes[id].links)if(!seen.has(n)){seen.add(n);q.push([n,d+1])}}
 return 99;
}
function chooseCpuMove(u){
 const opts=nodes[u.node].links.filter(id=>canEnter(u,id));
 if(!opts.length)return null;
 // 人間の駒がいる隣接地点を最優先。
 const attack=opts.find(id=>units.some(x=>x.side==='kawazu'&&!x.wait&&x.node===id));
 if(attack)return attack;
 // 水専門は進める範囲でカワズ本拠地方向へ。共通キャラも同様。
 opts.sort((a,b)=>distanceToTarget(a,'K')-distanceToTarget(b,'K'));
 return opts[0];
}
async function runCpuTurn(){
 cpuBusy=true; side='beel'; selected=null; render();
 say('ベルゼブブ軍のターン','CPUが行動します。');
 const actors=units.filter(u=>u.side==='beel'&&!u.wait);
 for(const u of actors){
   if(side!=='beel')break;
   await new Promise(r=>setTimeout(r,420));
   const to=chooseCpuMove(u); if(!to){u.moved=true;continue}
   u.node=to;u.moved=true;const n=nodes[to];if(!n.base)n.owner='beel';render();
   const enemy=units.find(x=>x.side==='kawazu'&&!x.wait&&x.node===to);
   if(enemy){cpuBusy=false;encounter(u,enemy,to);return}
   say(u.name,n.name+'へ進軍。');
 }
 await new Promise(r=>setTimeout(r,500));
 cpuBusy=false; beginHumanTurn();
}
function beginHumanTurn(){
 side='kawazu';turn++;selected=null;
 units.forEach(u=>{
   if(u.side==='kawazu'){u.moved=false;if(u.wait>0){u.wait--;if(!u.wait)u.hp=Math.max(u.hp,55)}
   const n=nodes[u.node];if(!u.wait&&n.owner==='kawazu')u.hp=Math.min(100,u.hp+(n.base?22:12));}
 });
 units.filter(u=>u.side==='beel').forEach(u=>u.moved=false);
 say('カワズ軍のターン','キャラクターを選んで移動。');render();
}
function endHumanTurn(){
 if(side!=='kawazu'||cpuBusy)return;
 selected=null;
 units.forEach(u=>{if(u.side==='beel'){if(u.wait>0){u.wait--;if(!u.wait)u.hp=Math.max(u.hp,55)}
   const n=nodes[u.node];if(!u.wait&&n.owner==='beel')u.hp=Math.min(100,u.hp+(n.base?22:12));}});
 runCpuTurn();
}
function say(a,b){msg.innerHTML='<b>'+a+'</b><span>'+b+'</span>'}
document.getElementById('endTurn').onclick=endHumanTurn;
document.getElementById('resetGame').onclick=()=>{if(confirm('最初からやり直しますか？')){Object.values(nodes).forEach(n=>{if(!n.base)n.owner=null});makeUnits();turn=1;side='kawazu';selected=null;cpuBusy=false;render();say('カワズ軍のターン','駒をタップすると進める道が光ります。')}};
renderRoads();makeUnits();render();say('カワズ軍のターン','ベルゼブブ軍はCPU。こちらの5人を動かしてください。');