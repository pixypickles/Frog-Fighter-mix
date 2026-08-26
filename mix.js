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
// 地上専門は控え候補として明示。将来ドラフト/編成画面で10人から5人を選ぶ。
const reserveGround=[['アザゼル','🪰','land'],['ベリアル','🕷️','land']];

let turn=1, side='kawazu', selected=null;
let units=[];
function makeUnits(){
 units=[];
 roster.kawazu.forEach((r,i)=>units.push({id:'k'+i,side:'kawazu',name:r[0],icon:r[1],mobility:r[2],node:'K',hp:100,wait:0,moved:false}));
 roster.beel.forEach((r,i)=>units.push({id:'b'+i,side:'beel',name:r[0],icon:r[1],mobility:r[2],node:'Z',hp:100,wait:0,moved:false}));
}
function canEnter(u,nid){
 const n=nodes[nid];
 if(!n)return false;
 if(u.mobility==='water'&&n.terrain!=='water')return false;
 if(u.mobility==='land'&&n.terrain!=='land')return false;
 return true;
}
function roadKey(a,b){return [a,b].sort().join('-')}
function renderRoads(){
 roads.innerHTML='';
 const done=new Set();
 Object.entries(nodes).forEach(([id,n])=>n.links.forEach(to=>{
  const key=roadKey(id,to); if(done.has(key))return; done.add(key);
  const m=nodes[to], line=document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('x1',n.x*10);line.setAttribute('y1',n.y*6.8);line.setAttribute('x2',m.x*10);line.setAttribute('y2',m.y*6.8);
  line.dataset.road=key;
  line.setAttribute('class','road '+((n.terrain==='water'||m.terrain==='water')?'water':''));
  roads.appendChild(line);
 }));
}
function render(){
 board.querySelectorAll('.node,.unit').forEach(e=>e.remove());
 document.querySelectorAll('.road').forEach(e=>e.classList.remove('active'));
 Object.entries(nodes).forEach(([id,n])=>{
  const b=document.createElement('button'); b.className='node '+n.terrain+(n.base?' base':'')+(n.owner?' '+n.owner+'-owned':'');
  b.style.left=n.x+'%';b.style.top=n.y+'%';b.dataset.node=id;
  b.innerHTML='<b>'+n.name+'</b><small>'+(n.terrain==='water'?'💧 水中':'🌱 地上')+'</small>';
  if(selected&&nodes[selected.node].links.includes(id)&&canEnter(selected,id)&&!selected.moved&&selected.wait===0){
    b.classList.add('reachable'); b.onclick=()=>moveSelected(id);
    const line=document.querySelector('[data-road="'+roadKey(selected.node,id)+'"]'); if(line)line.classList.add('active');
  }
  board.appendChild(b);
 });
 const offsets={};
 units.forEach(u=>{
  const n=nodes[u.node], k=u.node; offsets[k]=(offsets[k]||0)+1;
  const idx=offsets[k]-1, el=document.createElement('button');
  el.className='unit '+u.side+(selected===u?' selected':'')+(u.wait?' waiting':'');
  el.style.left=`calc(${n.x}% + ${(idx%3-1)*28}px)`;
  el.style.top=`calc(${n.y}% + ${Math.floor(idx/3)*27-4}px)`;
  el.title=u.name; el.innerHTML=u.icon+'<span class="hp-mini"><i style="width:'+u.hp+'%"></i></span>';
  el.onclick=()=>selectUnit(u); board.appendChild(el);
 });
 const counts={kawazu:0,beel:0};Object.values(nodes).forEach(n=>{if(n.owner)counts[n.owner]++});
 kBases.textContent=counts.kawazu;bBases.textContent=counts.beel;
 turnLabel.textContent='TURN '+turn;sideLabel.textContent=side==='kawazu'?'カワズ軍':'ベルゼブブ軍';
}
function selectUnit(u){
 if(u.side!==side){say(u.name,'相手軍の駒です。');return}
 if(u.wait){say(u.name,'本拠地で回復待ち：あと'+u.wait+'ターン');return}
 if(u.moved){say(u.name,'このターンは移動済みです。');return}
 selected=u;say(u.name,'移動先を選択。'+(u.mobility==='water'?'水中専用':'水陸両用'));render();
}
function moveSelected(to){
 if(!selected)return;
 const from=selected.node;
 selected.node=to;selected.moved=true;
 const n=nodes[to];
 if(!n.base)n.owner=selected.side;
 const enemy=units.find(u=>u.node===to&&u.side!==selected.side&&u.wait===0);
 if(enemy){
   const terrain=n.terrain;
   const url=(terrain==='water'?'water/':'ground/')+'index.html?mix=1&battle=1&place='+encodeURIComponent(n.name)+'&p1='+encodeURIComponent(selected.name)+'&p2='+encodeURIComponent(enemy.name);
   say('遭遇！',selected.name+' VS '+enemy.name+'　'+(terrain==='water'?'水中戦':'地上戦')+'へ');
   sessionStorage.setItem('mixBattle',JSON.stringify({attacker:selected.id,defender:enemy.id,node:to,turn,side}));
   setTimeout(()=>location.href=url,420);
 }else say(selected.name,n.name+'へ移動しました。');
 selected=null;render();
}
function say(a,b){msg.innerHTML='<b>'+a+'</b><span>'+b+'</span>'}
function endTurn(){
 selected=null;
 side=side==='kawazu'?'beel':'kawazu';
 if(side==='kawazu')turn++;
 units.forEach(u=>{
  if(u.side===side){
   u.moved=false;
   if(u.wait>0){u.wait--; if(u.wait===0)u.hp=Math.max(u.hp,55)}
   const n=nodes[u.node];
   if(!u.wait&&n.owner===u.side&&!n.base)u.hp=Math.min(100,u.hp+12);
   if(!u.wait&&n.base&&n.owner===u.side)u.hp=Math.min(100,u.hp+22);
  }
 });
 say(side==='kawazu'?'カワズ軍のターン':'ベルゼブブ軍のターン','キャラクターを選んで移動。');
 render();
}
document.getElementById('endTurn').onclick=endTurn;
document.getElementById('resetGame').onclick=()=>{if(confirm('最初からやり直しますか？')){Object.values(nodes).forEach(n=>{if(!n.base)n.owner=null});makeUnits();turn=1;side='kawazu';selected=null;render()}};
renderRoads();makeUnits();render();
say('カワズ軍のターン','駒をタップすると、進める道の先が光ります。');