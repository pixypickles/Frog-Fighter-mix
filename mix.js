const board=document.getElementById('board'), roads=document.getElementById('roads');
const mixScript=[...document.scripts].find(s=>/\/mix\.js(?:\?|$)/.test(s.src));
const MIX_BASE_URL=mixScript ? new URL('./',mixScript.src) : new URL('./',location.href);
function mixPageUrl(mode){
  const file=mode==='water'?'water-index.html':(mode==='shallow'?'shallow-index.html':'ground-index.html');
  return new URL(file+'?mix=1&battle=1',MIX_BASE_URL).href;
}

const msg=document.getElementById('message'), turnLabel=document.getElementById('turnLabel'), sideLabel=document.getElementById('sideLabel');
const kBases=document.getElementById('kBases'), bBases=document.getElementById('bBases');

const mixTitle=document.getElementById('mixTitle');
const mixMain=document.getElementById('mixMain');
const mixResultOverlay=document.getElementById('mixResultOverlay');
const hqTerrainOverlay=document.getElementById('hqTerrainOverlay');
const hqTerrainText=document.getElementById('hqTerrainText');
const hqLandChoice=document.getElementById('hqLandChoice');
const hqWaterChoice=document.getElementById('hqWaterChoice');

const mapSelectOverlay=document.getElementById('mapSelectOverlay');
const defenderSelectOverlay=document.getElementById('defenderSelectOverlay');
const defenderChoices=document.getElementById('defenderChoices');
const defenderSelectText=document.getElementById('defenderSelectText');
const defenderSelectCancel=document.getElementById('defenderSelectCancel');

const mixPracticeOverlay=document.getElementById('mixPracticeOverlay');
const mixPracticeTitle=document.getElementById('mixPracticeTitle');
const mixPracticeFighters=document.getElementById('mixPracticeFighters');
const mixPracticeFighterName=document.getElementById('mixPracticeFighterName');
const mixPracticeMoveList=document.getElementById('mixPracticeMoveList');
const mixPracticeGo=document.getElementById('mixPracticeGo');
const mixPracticeCancel=document.getElementById('mixPracticeCancel');
const kawazuBriefingOverlay=document.getElementById('kawazuBriefingOverlay');
const kawazuBriefingNext=document.getElementById('kawazuBriefingNext');

let practiceModeChoice='ground';
let practiceFighterChoice='green';
let kawazuBriefed=false;

const KAWAZU_TEAM_PRACTICE={
 green:{
  name:'ミカエルさん',
  ground:['↑ ＋ パンチ：バーニングアッパー','前 ＋ キック：バーニングキック','下 → 後ろ ＋ キック：バーニングサイクロン','下 → 後ろ ＋ ガード：レッドオーラ（少量回復＋次の攻撃強化）'],
  water:['↑ ＋ パンチ：バーニングアッパー','前 ＋ キック：バーニングキック','下 → 後ろ ＋ キック：バーニングサイクロン','下 → 後ろ ＋ ガード：レッドオーラ（少量回復＋次の攻撃強化）'],
  shallow:['↖ / ↑ / ↗：手動ジャンプ','↑ ＋ パンチ：バーニングアッパー','前 ＋ キック：バーニングキック','下 → 後ろ ＋ キック：バーニングサイクロン','下 → 後ろ ＋ ガード：レッドオーラ']
 },
 blue:{
  name:'ガブリエルさん',
  ground:['ガード → パンチ：アクアトルネード（約15°上）','ガード → キック：アクアストリーム（約8°下）','後ろ ＋ パンチ：アクアボルテックス（HP少量吸収）'],
  water:['ガード → パンチ：アクアトルネード（約15°上）','ガード → キック：アクアストリーム（約8°下）','後ろ ＋ パンチ：アクアボルテックス（HP少量吸収）'],
  shallow:['↖ / ↑ / ↗：手動ジャンプ','ガード → パンチ：アクアトルネード','ガード → キック：アクアストリーム','後ろ ＋ パンチ：アクアボルテックス（HP少量吸収）']
 },
 yellow:{
  name:'ラファエルさん',
  ground:['ガード → パンチ：エアカッター','ガード → キック：エアカッター','ガード ×2：ヒーリングバブル','↑ ＋ ガード：エアブースト','↑ ＋ パンチ：ウィンドライズ'],
  water:['ガード → パンチ：水圧カッター','ガード → キック：水圧カッター','ガード ×2：ヒーリングバブル','↑ ＋ ガード：高速バブル移動'],
  shallow:['↖ / ↑ / ↗：手動ジャンプ','ガード → パンチ：エアカッター','ガード → キック：エアカッター','ガード ×2：ヒーリングバブル','↑ ＋ ガード：エアブースト','↑ ＋ パンチ：ウィンドライズ']
 },
 orange:{
  name:'ウリエルさん',
  ground:['ガード ×2：ホワイトカウンター','後ろ → 前 ＋ ガード：ガーディアンタックル','ガード長押し → 離す：ホワイトオーラ','ホワイトオーラ中：HPが少しずつ回復＋白いリーチ攻撃'],
  water:['ガード ×2：ホワイトカウンター','後ろ → 前 ＋ ガード：ガーディアンタックル','ガード長押し → 離す：ホワイトオーラ','ホワイトオーラ中：HPが少しずつ回復＋白いリーチ攻撃'],
  shallow:['↖ / ↑ / ↗：手動ジャンプ','ガード ×2：ホワイトカウンター','後ろ → 前 ＋ ガード：ガーディアンタックル','ガード長押し → 離す：ホワイトオーラ','ホワイトオーラ中：HPが少しずつ回復＋白いリーチ攻撃']
 }
};

function renderMixPractice(){
  mixPracticeTitle.textContent=
    practiceModeChoice==='ground'?'🌱 地上バトル練習':
    practiceModeChoice==='shallow'?'🌊 浅瀬バトル練習':'💧 水中バトル練習';
  mixPracticeFighters.innerHTML='';
  Object.entries(KAWAZU_TEAM_PRACTICE).forEach(([type,data])=>{
    const b=document.createElement('button');
    b.className='mix-practice-fighter'+(practiceFighterChoice===type?' selected':'');
    b.textContent=data.name;
    b.onclick=()=>{practiceFighterChoice=type;renderMixPractice();};
    mixPracticeFighters.appendChild(b);
  });
  const d=KAWAZU_TEAM_PRACTICE[practiceFighterChoice];
  mixPracticeFighterName.textContent=d.name;
  mixPracticeMoveList.innerHTML=d[practiceModeChoice].map(v=>'<span>'+v+'</span>').join('');
}
function openMixPractice(mode){
  practiceModeChoice=mode;
  practiceFighterChoice='green';
  renderMixPractice();
  mixPracticeOverlay.hidden=false;
}
document.getElementById('groundPracticeButton').onclick=()=>openMixPractice('ground');
document.getElementById('shallowPracticeButton').onclick=()=>openMixPractice('shallow');
document.getElementById('waterPracticeButton').onclick=()=>openMixPractice('water');
mixPracticeCancel.onclick=()=>{mixPracticeOverlay.hidden=true;};
mixPracticeGo.onclick=()=>{
  const file=
    practiceModeChoice==='ground'?'ground-index.html':
    practiceModeChoice==='shallow'?'shallow-index.html':'water-index.html';
  location.href=new URL(file+'?mixpractice=1&fighter='+encodeURIComponent(practiceFighterChoice),MIX_BASE_URL).href;
};

function showKawazuBriefing(done){
  if(kawazuBriefed){done();return;}
  kawazuBriefed=true;
  saveStrategy();
  kawazuBriefingOverlay.hidden=false;
  kawazuBriefingNext.onclick=()=>{
    kawazuBriefingOverlay.hidden=true;
    kawazuBriefingNext.onclick=null;
    done();
  };
}

let selectedMap='map1';

const MAP_UNLOCK_KEY='kaeru_mix_map_unlock_v1';
function getUnlockedMapLevel(){
  try{
    const v=parseInt(localStorage.getItem(MAP_UNLOCK_KEY)||'1',10);
    return Math.max(1,Math.min(3,isFinite(v)?v:1));
  }catch(e){return 1;}
}
function setUnlockedMapLevel(level){
  try{
    localStorage.setItem(MAP_UNLOCK_KEY,String(Math.max(getUnlockedMapLevel(),level)));
  }catch(e){}
}
function mapLevelForKey(key){
  return key==='map3'?3:key==='map2'?2:1;
}
function refreshMapLocks(){
  const unlocked=getUnlockedMapLevel();
  document.querySelectorAll('[data-map]').forEach(btn=>{
    const lvl=mapLevelForKey(btn.dataset.map);
    const locked=lvl>unlocked;
    btn.classList.toggle('locked',locked);
    btn.disabled=locked;
    btn.classList.toggle('cleared',lvl<unlocked);
    const small=btn.querySelector('small');
    if(!small)return;
    if(locked)small.textContent='🔒 前のマップをクリアで開放';
    else if(lvl<unlocked)small.textContent='クリア済み';
    else if(btn.dataset.map==='map1')small.textContent='最初の戦場・短く単純なルート';
  });
}



let mixDifficulty='normal';

document.querySelectorAll('[data-difficulty]').forEach(btn=>{
  btn.onclick=()=>{
    mixDifficulty=btn.dataset.difficulty;
    document.querySelectorAll('[data-difficulty]').forEach(b=>b.classList.toggle('selected',b===btn));
  };
});
document.getElementById('mixStartButton').onclick=()=>{
  try{localStorage.setItem('kaeru_difficulty',mixDifficulty)}catch(e){}
  refreshMapLocks();
  mapSelectOverlay.hidden=false;
};
document.getElementById('mixResultRestart').onclick=()=>{
  sessionStorage.clear();
  location.href=location.pathname;
};


const MAP_DEFS={
 map1:{
  name:'小さな田んぼ道',
  nodes:{
   K:{x:9,y:72,name:'カワズ本拠地',terrain:'both',base:true,owner:'kawazu',links:['A','W1']},

   A:{x:28,y:69,name:'西あぜ道',terrain:'land',base:false,owner:null,links:['K','B']},
   B:{x:50,y:64,name:'中央広場',terrain:'land',base:true,owner:null,links:['A','C','P1']},
   C:{x:72,y:62,name:'東あぜ道',terrain:'land',base:false,owner:null,links:['B','W2']},

   W1:{x:28,y:36,name:'西の池',terrain:'water',base:false,owner:null,links:['K','P1']},
   P1:{x:51,y:34,name:'中央池',terrain:'water',base:true,owner:null,links:['W1','W2','B']},
   W2:{x:75,y:34,name:'東の水路',terrain:'water',base:false,owner:null,links:['P1','C','Z']},

   Z:{x:91,y:19,name:'ベルゼブブ本拠地',terrain:'both',base:true,owner:'beel',links:['W2']}
  }
 },
 map2:{
  name:'三つ池の攻防',
  nodes:{
   K:{x:8,y:68,name:'カワズ本拠地',terrain:'both',base:true,owner:'kawazu',links:['A','W1']},

   A:{x:22,y:65,name:'西草地',terrain:'land',base:false,owner:null,links:['K','B','P1']},
   B:{x:39,y:72,name:'畑の広場',terrain:'land',base:true,owner:null,links:['A','C','P2','S1']},
   S1:{x:35,y:90,name:'石の祠',terrain:'land',base:true,owner:null,links:['B']},
   C:{x:57,y:68,name:'土手道',terrain:'land',base:false,owner:null,links:['B','D','P2']},
   D:{x:73,y:65,name:'東草地',terrain:'land',base:true,owner:null,links:['C','W3','P3']},

   W1:{x:18,y:35,name:'西水路',terrain:'water',base:false,owner:null,links:['K','P1']},
   P1:{x:35,y:31,name:'蓮の池',terrain:'water',base:true,owner:null,links:['W1','P2','A']},
   P2:{x:54,y:34,name:'中央池',terrain:'water',base:true,owner:null,links:['P1','P3','B','C']},
   P3:{x:73,y:31,name:'葦の池',terrain:'water',base:true,owner:null,links:['P2','W2','D']},

   // 旧・敵本拠地側の下ルートも水に変更。
   W3:{x:87,y:68,name:'東の浅瀬',terrain:'shallow',base:false,owner:null,links:['D','Z']},
   W2:{x:86,y:38,name:'東水路',terrain:'water',base:false,owner:null,links:['P3','Z']},

   // ベルゼブブ本拠地を上側へ移動。
   // 陸地主ルートから攻めても、最後に必ず W3 の水マスを通る。
   Z:{x:92,y:17,name:'ベルゼブブ本拠地',terrain:'both',base:true,owner:'beel',links:['W2','W3']}
  }
 },
 map3:{
  name:'湿地の包囲網',
  nodes:{
   K:{x:8,y:70,name:'カワズ本拠地',terrain:'both',base:true,owner:'kawazu',links:['A','W1']},
   A:{x:22,y:70,name:'西土手',terrain:'land',base:false,owner:null,links:['K','B','S1']},
   S1:{x:19,y:45,name:'木陰の祠',terrain:'land',base:true,owner:null,links:['A','P1']},
   B:{x:39,y:62,name:'分岐広場',terrain:'land',base:true,owner:null,links:['A','C','P1','P2']},
   C:{x:58,y:70,name:'湿地道',terrain:'land',base:false,owner:null,links:['B','D','P2']},
   D:{x:76,y:69,name:'東土手',terrain:'land',base:true,owner:null,links:['C','Z','P3']},
   W1:{x:20,y:88,name:'低水路',terrain:'water',base:false,owner:null,links:['K','P1']},
   P1:{x:36,y:34,name:'西沼',terrain:'water',base:true,owner:null,links:['W1','P2','B','S1']},
   P2:{x:57,y:36,name:'中央浅瀬',terrain:'shallow',base:false,owner:null,links:['P1','P3','B','C']},
   P3:{x:76,y:35,name:'東沼',terrain:'water',base:true,owner:null,links:['P2','W2','D']},
   W2:{x:87,y:43,name:'東水路',terrain:'water',base:false,owner:null,links:['P3','Z']},
   Z:{x:92,y:70,name:'ベルゼブブ本拠地',terrain:'both',base:true,owner:'beel',links:['D','W2']}
  }
 }
};
function cloneNodes(key){
  return JSON.parse(JSON.stringify(MAP_DEFS[key].nodes));
}
let nodes=cloneNodes(selectedMap);

document.querySelectorAll('[data-map]').forEach(btn=>{
  btn.onclick=()=>{
    const targetLevel=mapLevelForKey(btn.dataset.map);
    if(targetLevel>getUnlockedMapLevel())return;
    selectedMap=btn.dataset.map;
    nodes=cloneNodes(selectedMap);
    sessionStorage.removeItem('mixStrategyState');
    sessionStorage.removeItem('mixBattleResult');
    turn=1;side='kawazu';selected=null;cpuBusy=false;kawazuBriefed=false;
    makeUnits();
    mapSelectOverlay.hidden=true;
    mixTitle.hidden=true;
    mixMain.hidden=false;
    refreshMapLocks();
renderRoads();
    saveStrategy();
    render();
    const def=MAP_DEFS[selectedMap];
    say(def.name,'ベルゼブブ軍の出撃メンバーは毎回ランダムです。');
  };
});


const roster={
 kawazu:[
  ['カワズ','🐸','both','kawazu'],['ミカエル','🐸','both','green'],['ガブリエル','🐸','both','blue'],
  ['ラファエル','🐸','both','yellow'],['ウリエル','🐸','both','orange'],['パスカル','🐸','both','pascal']
 ]
};
const beelLeader=['ベルゼブブ','🐸','both','beelzebub'];
const beelPool=[
 ['ルシファー','🐸','both','black'],
 ['リリス','🐸','both','purple'],
 ['リヴァイア','🐟','water','piranha'],
 ['アスモデウス','🦞','water','crayfish'],
 ['アザゼル','🪰','land','piranha'],
 ['ベリアル','🕷️','land','crayfish'],
 ['マルファス','🐸','both','malphas']
];

function randomBeelTeam(){
  const malphas=beelPool.find(r=>r[0]==='マルファス');
  const pool=beelPool.filter(r=>r[0]!=='マルファス');
  for(let i=pool.length-1;i>0;i--){
    const k=Math.floor(Math.random()*(i+1));
    [pool[i],pool[k]]=[pool[k],pool[i]];
  }
  return [beelLeader,malphas,...pool.slice(0,3)];
}

let turn=1, side='kawazu', selected=null, cpuBusy=false, units=[];
let traps={kawazu:{damage:null,stop:null},beel:{damage:null,stop:null}};

function deploymentNodes(side,team){
  const home=side==='kawazu'?'K':'Z';
  // 総大将以外は本拠地の外から開始。
  // 地形専門キャラは入れる地形を優先し、同じ初期地点に偏りすぎないよう分散。
  const candidates=Object.keys(nodes).filter(id=>id!==home && nodes[home].links.includes(id));
  const used={};
  return team.map((r,i)=>{
    if(i===0)return home;
    const mobility=r[2];
    let opts=candidates.filter(id=>mobility==='both'||nodes[id].terrain===mobility||nodes[id].terrain==='both');
    if(!opts.length)opts=candidates;
    opts.sort((a,b)=>(used[a]||0)-(used[b]||0));
    const pick=opts[0]||home;
    used[pick]=(used[pick]||0)+1;
    return pick;
  });
}

function freshUnits(){
 const enemyTeam=randomBeelTeam();
 return [
  ...roster.kawazu.map((r,i)=>({id:'k'+i,side:'kawazu',name:r[0],icon:r[1],mobility:r[2],type:r[3],node:'K',hp:100,wait:0,moved:false,leader:i===0,defeats:0,engineer:r[0]==='パスカル'})),
  ...enemyTeam.map((r,i)=>({
   id:'b'+i,side:'beel',name:r[0],icon:r[1],mobility:r[2],type:r[3],
   node:(selectedMap==='map2' && i>0 && r[2]==='land')?'D':'Z',
   hp:100,wait:0,moved:false,leader:i===0,defeats:0,engineer:r[0]==='マルファス'
  }))
 ];
}
function makeUnits(){ units=freshUnits(); }

function saveStrategy(){
 const owners={};Object.entries(nodes).forEach(([id,n])=>owners[id]=n.owner);
 sessionStorage.setItem('mixStrategyState',JSON.stringify({turn,side,units,owners,selectedMap,traps,kawazuBriefed}));
}
function restoreStrategy(){
 try{
  const s=JSON.parse(sessionStorage.getItem('mixStrategyState')||'null');
  if(!s||!Array.isArray(s.units))return false;
  selectedMap=s.selectedMap||'map1';
  nodes=cloneNodes(selectedMap);
  turn=s.turn||1;side=s.side||'kawazu';units=s.units;traps=s.traps||{kawazu:{damage:null,stop:null},beel:{damage:null,stop:null}};kawazuBriefed=!!s.kawazuBriefed;
  units.forEach(u=>{
    if(typeof u.defeats!=='number')u.defeats=0;
    if(typeof u.sieging!=='boolean')u.sieging=false;
    if(u.id==='k0'||u.id==='b0')u.leader=true;
    if(u.name==='パスカル'||u.name==='マルファス')u.engineer=true;
  });
  if(s.owners)Object.entries(s.owners).forEach(([id,o])=>{if(nodes[id])nodes[id].owner=o});
  return true;
 }catch(e){return false}
}
function showMixResult(winnerSide,loserLeader){
  const won=winnerSide==='kawazu';
  if(won){
    const clearedLevel=mapLevelForKey(selectedMap);
    if(clearedLevel<3)setUnlockedMapLevel(clearedLevel+1);
  }
  document.getElementById('mixResultIcon').textContent=won?'🐸':'👑';
  document.getElementById('mixResultTitle').textContent=won?'カワズ軍 勝利！':'ベルゼブブ軍 勝利…';
  document.getElementById('mixResultText').textContent=won
    ? ('ベルゼブブさんを撃破！\nカワズ軍が池と田んぼの縄張りを守り抜いた。'+
       (mapLevelForKey(selectedMap)<3?'\n\n🔓 次のマップが開放された！':''))
    : 'カワズさんが倒された！\nベルゼブブ軍がカワズ本拠地を制圧した。';
  mixResultOverlay.hidden=false;
  cpuBusy=true;
  try{sessionStorage.removeItem('mixStrategyState')}catch(e){}
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
  winner.moved=true;

  // 敵本拠地で護衛に勝った攻撃側は、その場に残って次の護衛/総大将戦へ備える。
  // 重なった駒の下に隠れて「消えた」ように見えないよう攻城中フラグも付ける。
  winner.sieging =
    (battleNode==='Z' && winner.side==='kawazu') ||
    (battleNode==='K' && winner.side==='beel');

  if(nodes[battleNode]&&!nodes[battleNode].base)nodes[battleNode].owner=winner.side;

  // 総大将を倒したらその時点で決着。
  if(loser.leader){
    loser.hp=0;
    render();
    setTimeout(()=>showMixResult(winner.side,loser),120);
    return true;
  }

  // 通常キャラ：倒されるたびに復活待ちが 2→3→4… と増える。
  loser.defeats=(loser.defeats||0)+1;
  const home=loser.side==='kawazu'?'K':'Z';
  loser.node=home;
  loser.sieging=false;
  loser.hp=0;
  // 工作兵は何度倒されても常に1ターン。通常キャラは従来どおり加算。
  loser.wait=loser.engineer?1:(1+loser.defeats);
  loser.moved=true;
  side=result.returnSide||'kawazu';
  saveStrategy();
  setTimeout(()=>{
    say('戦闘結果',winner.name+'の勝ち！　'+loser.name+'は本拠地で'+loser.wait+'ターン回復待ち。');
    updateTurnButton();
  },80);
  return true;
 }catch(e){return false}
}
function canEnter(u,nid){
 const n=nodes[nid]; if(!n)return false;
 if(n.terrain==='both'||n.terrain==='shallow') return true;
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
function updateTurnButton(){
 const btn=document.getElementById('endTurn');
 if(!btn)return;
 if(side==='beel'){
   btn.textContent='次へ';
   btn.disabled=false;
 }else{
   btn.textContent='ターン終了';
   btn.disabled=cpuBusy;
 }
}
function render(){
 board.querySelectorAll('.node,.unit').forEach(e=>e.remove());
 document.querySelectorAll('.road').forEach(e=>e.classList.remove('active'));
 Object.entries(traps).forEach(([trapSide,t])=>{
  [['damage','💥'],['stop','🕸️']].forEach(([kind,icon])=>{
   const nid=t[kind];if(!nid||!nodes[nid])return;
   const mark=document.createElement('span');mark.className='trap-mark '+trapSide;
   mark.textContent=icon;mark.style.left=nodes[nid].x+'%';mark.style.top=`calc(${nodes[nid].y}% + 28px)`;
   board.appendChild(mark);
  });
 });
 Object.entries(nodes).forEach(([id,n])=>{
  const b=document.createElement('button');b.className='node '+n.terrain+(n.base?' base':'')+(n.owner?' '+n.owner+'-owned':'');
  b.style.left=n.x+'%';b.style.top=n.y+'%';b.dataset.node=id;
  const terrainLabel=n.terrain==='water'?'💧 水中':(n.terrain==='shallow'?'🌊 浅瀬':(n.terrain==='both'?'🛡️ 地上/水中選択':'🌱 陸地'));
  const healLabel=n.base?' ❤️ 回復':'';
  b.innerHTML='<b>'+(n.base?'❤️ ':'')+n.name+'</b><small>'+terrainLabel+healLabel+'</small>';
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
  el.className='unit '+u.side+(selected===u?' selected':'')+(u.wait?' waiting':'')+(u.leader?' leader':'')+(u.sieging?' sieging':'');
  el.style.left=`calc(${n.x}% + ${ox}px)`;el.style.top=`calc(${n.y}% + ${oy}px)`;
  if(u.sieging)el.style.zIndex='60';
  else if(u.wait)el.style.zIndex='12';
  else el.style.zIndex='24';
  el.title=u.name+(u.wait?'（回復待ち '+u.wait+'）':'');
  if(u.icon==='🐸'){
    el.classList.add('frog-piece','frog-'+u.type);
    el.innerHTML='<span class="map-frog"><i class="eye e1"></i><i class="eye e2"></i><i class="mouth"></i></span><span class="hp-mini"><i style="width:'+u.hp+'%"></i></span>';
  }else{
    el.innerHTML=u.icon+'<span class="hp-mini"><i style="width:'+u.hp+'%"></i></span>';
  }
  el.onclick=()=>selectUnit(u);board.appendChild(el);
 });
 const bc={kawazu:0,beel:0};Object.values(nodes).forEach(n=>{if(n.owner)bc[n.owner]++});
 kBases.textContent=bc.kawazu;bBases.textContent=bc.beel;
 turnLabel.textContent='TURN '+turn;sideLabel.textContent=side==='kawazu'?'カワズ軍':'ベルゼブブ軍（CPU）';
 updateTurnButton();
}
function selectUnit(u){
 if(side!=='kawazu'){say('ベルゼブブ軍 行動中','CPUが駒を動かしています。');return}
 if(u.side!=='kawazu'){say(u.name,'ベルゼブブ軍はCPUが操作します。');return}
 if(u.leader){say(u.name,'総大将は本拠地を守るため移動できません。');return}
 if(u.wait){say(u.name,'本拠地で回復待ち：あと'+u.wait+'ターン');return}
 if(u.moved){say(u.name,'このターンは移動済みです。');return}
 selected=u;
 if(u.engineer){
   say(u.name,'移動先を選択。　<button class="trap-action" onclick="placeTrap(selected,\'damage\')">💥罠</button> <button class="trap-action" onclick="placeTrap(selected,\'stop\')">🕸️罠</button>');
 }else say(u.name,'移動先を選択。');
 render();
}
function cpuChooseHqTerrain(attacker,defender){
  // 防衛側ベルゼブブ軍の選択。
  // EASYは攻撃側が入りやすい地形、HARDは入りにくい地形を少し優先。
  const attackerMob=attacker.mobility||'both';
  if(mixDifficulty==='easy'){
    if(attackerMob==='water')return 'water';
    if(attackerMob==='land')return 'land';
    return Math.random()<.5?'land':'water';
  }
  if(mixDifficulty==='hard'){
    if(attackerMob==='water')return 'land';
    if(attackerMob==='land')return 'water';
    return Math.random()<.5?'water':'land';
  }
  return Math.random()<.5?'land':'water';
}

function chooseHqTerrain(attacker,defender,to,done){
  const n=nodes[to];
  const isHq=(to==='K'||to==='Z');
  const isLeaderFight=!!(defender&&defender.leader);
  if(!isHq || !isLeaderFight){
    done(n.terrain==='both'?'land':n.terrain);
    return;
  }

  // カワズさん自身の最初の本拠地防衛戦だけ、敗北条件とコマンドを先に説明。
  if(defender.side==='kawazu' && defender.leader && !kawazuBriefed){
    showKawazuBriefing(()=>chooseHqTerrain(attacker,defender,to,done));
    return;
  }

  // カワズ本拠地を守るのはプレイヤーなので自分で選ぶ。
  if(defender.side==='kawazu'){
    hqTerrainText.textContent='カワズさんが本拠地を防衛！　地上と水中、どちらで迎え撃ちますか？';
    hqTerrainOverlay.hidden=false;
    const finish=(terrain)=>{
      hqTerrainOverlay.hidden=true;
      hqLandChoice.onclick=null;
      hqWaterChoice.onclick=null;
      done(terrain);
    };
    hqLandChoice.onclick=()=>finish('land');
    hqWaterChoice.onclick=()=>finish('water');
    return;
  }

  // ベルゼブブ本拠地ではCPU防衛側が選択。
  const terrain=cpuChooseHqTerrain(attacker,defender);
  say('ベルゼブブさんの防衛地形',terrain==='water'?'水中戦を選択！':'地上戦を選択！');
  setTimeout(()=>done(terrain),650);
}

function protectLeaderAtHq(to,enemies){
  if(to!=='K'&&to!=='Z')return enemies;
  const guards=enemies.filter(e=>!e.leader);
  return guards.length?guards:enemies;
}
function chooseDefenderForHuman(attacker,to,enemies,done){
  enemies=protectLeaderAtHq(to,enemies);
  if(enemies.length<=1){done(enemies[0]);return;}
  defenderSelectText.textContent=attacker.name+'が攻撃！　対戦相手を選んでください。';
  defenderChoices.innerHTML='';
  enemies.forEach(enemy=>{
    const btn=document.createElement('button');
    btn.className='defender-choice';
    btn.innerHTML='<strong>'+(enemy.leader?'👑 ':'')+enemy.name+'</strong>'+
      '<small>HP '+Math.round(enemy.hp)+' / '+(enemy.mobility==='water'?'水専門':enemy.mobility==='land'?'陸専門':'水陸両用')+'</small>'+
      '<span class="mini-hp"><i style="width:'+enemy.hp+'%"></i></span>';
    btn.onclick=()=>{
      defenderSelectOverlay.hidden=true;
      done(enemy);
    };
    defenderChoices.appendChild(btn);
  });
  defenderSelectCancel.hidden=false;
  defenderSelectCancel.onclick=()=>{
    defenderSelectOverlay.hidden=true;
    // 移動自体を取り消して元の地点へ戻す。
    if(attacker._moveFrom){
      attacker.node=attacker._moveFrom;
      attacker.moved=false;
      delete attacker._moveFrom;
    }
    render();
    saveStrategy();
    say(attacker.name,'攻撃を取りやめました。');
  };
  defenderSelectOverlay.hidden=false;
}

function chooseDefenderForCpu(enemies,to){
  enemies=protectLeaderAtHq(to,enemies);
  if(!enemies.length)return null;
  // 総大将が同じ地点にいれば最優先、それ以外はHPの低い相手を狙う。
  const leader=enemies.find(e=>e.leader);
  if(leader)return leader;
  return [...enemies].sort((a,b)=>a.hp-b.hp)[0];
}

function encounter(attacker,defender,to){
 const n=nodes[to];
 chooseHqTerrain(attacker,defender,to,(terrain)=>{
   saveStrategy();
   const battle={attacker:attacker.id,defender:defender.id,node:to,turn,side,terrain,
    attackerType:attacker.type,defenderType:defender.type,attackerHp:attacker.hp,defenderHp:defender.hp,
    attackerName:attacker.name,defenderName:defender.name,
    attackerMobility:attacker.mobility,defenderMobility:defender.mobility};
   sessionStorage.setItem('mixBattle',JSON.stringify(battle));
   say('遭遇！',attacker.name+' VS '+defender.name+'　'+(terrain==='water'?'水中戦':terrain==='shallow'?'浅瀬戦':'地上戦'));
   showRotateThenBattle(terrain,attacker,defender,n);
 });
}
function showRotateThenBattle(terrain,a,b,n){
 let ov=document.getElementById('mixRotateOverlay');if(!ov){ov=document.createElement('div');ov.id='mixRotateOverlay';document.body.appendChild(ov)}
 const portrait=false;
 ov.innerHTML='<div class="rotate-card"><div class="rotate-icon">📱</div><b>スマホを横持ちしてください</b><span>'+n.name+'：'+a.name+' VS '+b.name+'</span><small>'+(terrain==='land'?'地上ジャンプバトル（横画面）':terrain==='shallow'?'浅瀬バトル（空中＋水中）':'水中バトル')+'</small><button id="mixBattleGo">この向きでバトル開始</button></div>';
 ov.classList.add('show');
 const ready=()=>innerWidth>=innerHeight;
 let gone=false;
 const go=()=>{if(gone)return;gone=true;ov.classList.remove('show');location.href=mixPageUrl(terrain)};
 document.getElementById('mixBattleGo').onclick=go;
 const timer=setInterval(()=>{if(ready()){clearInterval(timer);setTimeout(go,300)}},250);
 setTimeout(()=>clearInterval(timer),12000);
}
function triggerTrap(u,to){
 const enemySide=u.side==='kawazu'?'beel':'kawazu';
 const t=traps[enemySide];
 if(t.damage===to){
   u.hp=Math.max(1,u.hp-18);
   t.damage=null;
   say('ダメージ罠！',u.name+'のHPが18減少。');
 }
 if(t.stop===to){
   t.stop=null;
   u.moved=true;
   say('足止め罠！',u.name+'はこの地点で移動終了。');
 }
}
function placeTrap(u,kind){
 if(!u||!u.engineer||u.wait)return;
 traps[u.side][kind]=u.node;
 saveStrategy();render();
 say(u.name,kind==='damage'?'💥 ダメージ罠を設置しました。':'🕸️ 足止め罠を設置しました。');
}
function moveHuman(to){
 if(!selected)return;
 const u=selected;
 const from=u.node;
 u._moveFrom=from;
 u.node=to;
 u.sieging=false;
 u.moved=true;
 triggerTrap(u,to);
 const n=nodes[to];
 if(!n.base)n.owner='kawazu';
 const enemies=units.filter(x=>x.node===to&&x.side==='beel'&&!x.wait);
 selected=null;
 render();
 if(enemies.length){
   chooseDefenderForHuman(u,to,enemies,(enemy)=>{
     delete u._moveFrom;
     encounter(u,enemy,to);
   });
 }else{
   delete u._moveFrom;
   saveStrategy();
   say(u.name,n.name+'へ移動しました。');
 }
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
 const actors=units.filter(u=>u.side==='beel'&&!u.wait&&!u.moved&&!u.leader);
 for(const u of actors){
  if(side!=='beel')break;await new Promise(r=>setTimeout(r,380));
  if(u.engineer){
    if(!traps.beel.damage)traps.beel.damage=u.node;
    else if(!traps.beel.stop)traps.beel.stop=u.node;
    else if(Math.random()<.45)traps.beel[Math.random()<.5?'damage':'stop']=u.node;
    saveStrategy();render();
  }
  const to=chooseCpuMove(u);if(!to){u.moved=true;continue}
  u.node=to;u.sieging=false;u.moved=true;triggerTrap(u,to);const n=nodes[to];if(!n.base)n.owner='beel';render();
  const enemies=units.filter(x=>x.side==='kawazu'&&!x.wait&&x.node===to);
  const enemy=chooseDefenderForCpu(enemies,to);
  if(enemy){cpuBusy=false;saveStrategy();encounter(u,enemy,to);return}
  say(u.name,n.name+'へ進軍。');
 }
 await new Promise(r=>setTimeout(r,450));cpuBusy=false;beginHumanTurn();
}
function healSide(which){
 units.filter(u=>u.side===which).forEach(u=>{
  if(u.wait>0){u.wait--;if(u.wait===0)u.hp=100;return}
  // 総大将は拠点にいてもHP回復しない。長期戦での全回復ループを防ぐ。
  const n=nodes[u.node];if(!u.leader&&n.owner===which&&n.base)u.hp=Math.min(100,u.hp+18);
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
document.getElementById('endTurn').onclick=()=>{
 if(side==='beel'&&!cpuBusy){runCpuTurn();return;}
 endHumanTurn();
};
document.getElementById('resetGame').onclick=()=>{if(confirm('最初からやり直しますか？')){sessionStorage.removeItem('mixStrategyState');sessionStorage.removeItem('mixBattleResult');Object.values(nodes).forEach(n=>{n.owner=n.base?(n===nodes.K?'kawazu':n===nodes.Z?'beel':null):null});makeUnits();traps={kawazu:{damage:null,stop:null},beel:{damage:null,stop:null}};turn=1;side='kawazu';selected=null;cpuBusy=false;saveStrategy();render();say('カワズ軍のターン','駒をタップすると進める道が光ります。')}};

const resumedStrategy=restoreStrategy();
if(!resumedStrategy)makeUnits();
renderRoads();
const hadResult=applyBattleResult();

// 戦闘から戻った場合はタイトルを挟まず、そのまま戦略マップへ復帰。
if(resumedStrategy || hadResult){
  mixTitle.hidden=true;
  mixMain.hidden=false;
}
render();
if(!hadResult){
  say('カワズ軍のターン','総大将を守りながら敵本拠地を目指します。');
}
