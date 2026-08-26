(() => {
  const screens = {
    title: document.getElementById('titleScreen'),
    select: document.getElementById('selectScreen'),
    game: document.getElementById('gameScreen')
  };
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const playerHpEl = document.getElementById('playerHp');
  const enemyHpEl = document.getElementById('enemyHp');
  const comboEl = document.getElementById('comboText');
  const restartButton = document.getElementById('restartButton');
  const titleReturnButton=document.getElementById('titleReturnButton');
  const beelzebubCard=document.getElementById('beelzebubCard');
  const beelzebubOpponent=document.getElementById('beelzebubOpponent');
  const bossTeaser=document.getElementById('bossTeaser');
  let kawazuCard=document.getElementById('kawazuCard');
  let kawazuOpponent=document.getElementById('kawazuOpponent');
  const storyNarrative=document.getElementById('storyNarrative');
  const storyNarrativeText=document.getElementById('storyNarrativeText');
  const storyNarrativeNext=document.getElementById('storyNarrativeNext');
  const practiceHelp=document.getElementById('practiceHelp');
  const practiceSpecialTitle=document.getElementById('practiceSpecialTitle');
  const practiceSpecialMoves=document.getElementById('practiceSpecialMoves');
  const practiceExitButton = document.getElementById('practiceExitButton');
  const leafMiniHud=document.getElementById('leafMiniHud');
  const leafMiniTimeEl=document.getElementById('leafMiniTime');
  const leafMiniScoreEl=document.getElementById('leafMiniScore');
  const guardMiniHud=document.getElementById('guardMiniHud');
  const guardMiniTimeEl=document.getElementById('guardMiniTime');
  const guardMiniScoreEl=document.getElementById('guardMiniScore');
  const guardMiniMissEl=document.getElementById('guardMiniMiss');
  const raceMiniHud=document.getElementById('raceMiniHud');
  const raceMiniTimeEl=document.getElementById('raceMiniTime');
  const raceMiniBestEl=document.getElementById('raceMiniBest');
  const basketMiniHud=document.getElementById('basketMiniHud');
  const basketPlayerScoreEl=document.getElementById('basketPlayerScore');
  const basketEnemyScoreEl=document.getElementById('basketEnemyScore');
  const basketTimeEl=document.getElementById('basketTime');
  const opponentSelect=document.getElementById('opponentSelect');
  const storyHud=document.getElementById('storyHud');
  const difficultyButtons=[...document.querySelectorAll('.difficulty-btn')];

  let selectedFighter = 'green';
  let selectedOpponent = 'blue';
  // MIX戦闘連携
  const mixBattleMode=new URLSearchParams(location.search).get('mix')==='1' && new URLSearchParams(location.search).get('battle')==='1';
  const mixPracticeParams=new URLSearchParams(location.search);
  const mixPracticeMode=mixPracticeParams.get('mixpractice')==='1';
  const mixPracticeFighter=mixPracticeParams.get('fighter')||'green';
  let mixBattleContext=null;
  try{ if(mixBattleMode) mixBattleContext=JSON.parse(sessionStorage.getItem('mixBattle')||'null'); }catch(e){}

  let difficulty='normal';
  try{
    const savedDifficulty=localStorage.getItem('kaeru_difficulty');
    if(['easy','normal','hard'].includes(savedDifficulty)) difficulty=savedDifficulty;
  }catch(e){}
  let stageTheme=0;
  let storyQueue=[];
  let storyFightIndex=0;
  let storyLosses=0;
  let storyWins=0;
  let storyFinished=false;
  let running = false;
  let last = performance.now();
  let bubbles = [];
  let particles = [];
  let hitRings = [];
  let guardWaves = [];
  let aquaTornadoes = [];
  let aquaVortices = [];
  let michaelAuraShots = [];
  let toxicWaters=[];
  let bossFish=[];
  let abyssShocks=[];
  let kawazuShots=[];
  let kawazuGhosts=[];
  let siltClouds = [];
  let webTraps = [];
  let ceilingWebs = [];
  let belialPoisonShots = [];
  let catfishCharges = [];
  let pressureBlades = [];
  let burstWaves = [];
  let leafTargets=[];
  let leafMiniActive=false;
  let leafMiniTime=60;
  let leafMiniScore=0;
  let leafSpawnTimer=0;
  let guardTargets=[];
  let guardMiniActive=false;
  let guardMiniTime=60, guardMiniScore=0, guardMiniMiss=0, guardSpawnTimer=0;
  let guardMiniGuardTapTime=-9999;
  let raceMiniActive=false, raceMiniStart=0, raceMiniElapsed=0, raceMiniBest=0;
  let raceCheckpoints=[], raceCheckpointIndex=0, raceEnemyCheckpointIndex=0, raceObstacles=[];
  let basketMiniActive=false, basketMiniTime=60, basketPlayerScore=0, basketEnemyScore=0;
  let basketBall=null, basketHoops=[], basketShotCooldown=0;
  let gameOver = false;
  let comboTimer = 0;
  let comboHits = 0;

  // Ground prototype physics. Up/down input remains available for command recognition,
  // but movement itself is horizontal + gravity. Landing immediately triggers a frog jump.
  const LAND_GRAVITY = 650;
  const LAND_AUTO_JUMP_SPEED = 355;
  const LAND_HORIZONTAL_DRAG = .22;

  // Ground prototype 0.4: lower the soil again so the tall sky stays dominant.
  // The guard button may protrude slightly above the soil; drawing and collision
  // still share the exact same ground line.
  function landGroundDepth(){
    // MIX横画面では土を画面最下部へ寄せる。
    // 以前より空中スペースを広くしつつ、ジャンプも低く抑える。
    if(innerWidth>innerHeight) return Math.min(34,Math.max(24,innerHeight*.052));
    return Math.min(235, Math.max(145, innerHeight * .155));
  }
  function landGroundTop(){
    return innerHeight - landGroundDepth();
  }
  function landFloorY(){
    return landGroundTop() - 55;
  }

  const stats = {
    green:  { speed: 160, tongue: 210, damage: 1.00, defense:1.00, sink:7, hue:0, scale:1.00 },
    blue:   { speed: 182, tongue: 260, damage: 0.88, defense:1.00, sink:5, hue:95, scale:1.00 },
    black:  { speed: 148, tongue: 225, damage: 1.22, defense:1.00, sink:9, hue:0, scale:1.00 },
    purple: { speed: 174, tongue: 245, damage: 0.92, defense:1.00, sink:5, hue:0, scale:1.00 },
    yellow:  { speed: 190, tongue: 225, damage: 0.92, defense:0.96, sink:4, hue:0, scale:1.00 },
    orange:  { speed: 142, tongue: 215, damage: 1.05, defense:1.28, sink:9, hue:0, scale:1.10 },
    piranha: { speed: 198, tongue: 0,   damage: 1.08, defense:0.90, sink:3, hue:0, scale:0.95 },
    crayfish:{ speed: 138, tongue: 0,   damage: 1.18, defense:1.20, sink:10,hue:0, scale:1.08 },
    beelzebub:{speed: 158, tongue: 415, damage: 1.28, defense:1.22, sink:8, hue:0, scale:1.13},
    kawazu: {speed: 220, tongue: 225, damage: 0.94, defense:0.94, sink:4, hue:0, scale:0.86}
  };

  function show(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function canUseLandscape() {
    return window.innerWidth > window.innerHeight;
  }

  // Ground prototype standalone stays portrait, but MIX battle uses landscape.
  // v0.31: MIXの地上練習も横画面レイアウトを使う。
  // これまで mixPracticeMode が portrait 扱いになり、ボタン分離CSSが効いていなかった。
  let portraitPlayMode=!(mixBattleMode || mixPracticeMode);
  if(portraitPlayMode) document.body.classList.add('portrait-play');
  else{
    document.body.classList.remove('portrait-play');
    document.body.classList.add('mix-ground-landscape');
  }

  function enterPortraitPlay(){
    portraitPlayMode=true;
    document.body.classList.add('portrait-play');
    show('select');
    setTimeout(()=>resize(),40);
  }

  window.addEventListener('orientationchange', () => {
    setTimeout(()=>resize(),40);
  });
  window.addEventListener('resize', resize);

  const portraitStart=document.getElementById('portraitStart');
  const portraitOverlayStart=document.getElementById('portraitOverlayStart');
  if(portraitStart){
    portraitStart.addEventListener('pointerup',e=>{
      e.preventDefault();e.stopPropagation();
      enterPortraitPlay();
    });
    portraitStart.addEventListener('click',e=>{
      if(window.PointerEvent)return;
      enterPortraitPlay();
    });
  }

  if(portraitOverlayStart){
    portraitOverlayStart.addEventListener('pointerup',e=>{
      e.preventDefault();e.stopPropagation();
      enterPortraitPlay();
    });
    portraitOverlayStart.addEventListener('click',e=>{
      if(window.PointerEvent)return;
      enterPortraitPlay();
    });
  }

  const desktopStart=document.getElementById('desktopStart');
  if(desktopStart) desktopStart.onclick = enterPortraitPlay;

  // v6.43 軽量SE:
  // 外部音源なし。短いOscillatorのみ。同時発音4、種類ごとのクールタイム付き。
  let sfxEnabled=true;
  try{
    const savedSfx=localStorage.getItem('kaeru_sfx');
    if(savedSfx==='0') sfxEnabled=false;
  }catch(e){}

  let sfxCtx=null;
  const sfxVoices=new Set();
  const sfxLast={};
  const SFX_MAX_VOICES=4;
  const sfxCooldown={
    hit:90,
    guard:120,
    tongue:130,
    special:180,
    ko:900,
    menu:120
  };

  function ensureSfxContext(){
    if(!sfxEnabled) return null;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC) return null;
      if(!sfxCtx) sfxCtx=new AC();
      if(sfxCtx.state==='suspended') sfxCtx.resume().catch(()=>{});
      return sfxCtx;
    }catch(e){
      return null;
    }
  }

  function playSfx(name,power=1){
    if(!sfxEnabled) return;
    const nowMs=performance.now();
    const cd=sfxCooldown[name]||100;
    if(nowMs-(sfxLast[name]||0)<cd) return;
    if(sfxVoices.size>=SFX_MAX_VOICES) return;

    const ac=ensureSfxContext();
    if(!ac) return;
    sfxLast[name]=nowMs;

    const presets={
      hit:    {f1:150,f2:82,d:.075,type:'square',vol:.040},
      guard:  {f1:520,f2:310,d:.11,type:'sine',vol:.035},
      tongue: {f1:290,f2:155,d:.09,type:'triangle',vol:.030},
      special:{f1:220,f2:610,d:.16,type:'sawtooth',vol:.028},
      ko:     {f1:125,f2:48,d:.28,type:'triangle',vol:.050},
      menu:   {f1:420,f2:620,d:.065,type:'sine',vol:.025}
    };
    const p=presets[name]||presets.menu;
    const t=ac.currentTime;
    try{
      const osc=ac.createOscillator();
      const gain=ac.createGain();
      osc.type=p.type;
      osc.frequency.setValueAtTime(p.f1,t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30,p.f2),t+p.d);
      gain.gain.setValueAtTime(.0001,t);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0002,p.vol*Math.min(1.25,power)),t+.008);
      gain.gain.exponentialRampToValueAtTime(.0001,t+p.d);
      osc.connect(gain);
      gain.connect(ac.destination);
      sfxVoices.add(osc);
      osc.onended=()=>{
        sfxVoices.delete(osc);
        try{osc.disconnect();gain.disconnect();}catch(e){}
      };
      osc.start(t);
      osc.stop(t+p.d+.015);
    }catch(e){}
  }

  const soundToggle=document.getElementById('soundToggle');
  function refreshSoundToggle(){
    if(!soundToggle)return;
    soundToggle.textContent=sfxEnabled?'SE ON':'SE OFF';
    soundToggle.classList.toggle('off',!sfxEnabled);
  }
  if(soundToggle){
    const toggleSound=(e)=>{
      if(e){e.preventDefault();e.stopPropagation();}
      sfxEnabled=!sfxEnabled;
      try{localStorage.setItem('kaeru_sfx',sfxEnabled?'1':'0');}catch(err){}
      refreshSoundToggle();
      if(sfxEnabled) playSfx('menu');
    };
    soundToggle.addEventListener('pointerup',toggleSound);
    soundToggle.addEventListener('click',e=>{if(window.PointerEvent)return;toggleSound(e);});
  }
  refreshSoundToggle();

  function refreshDifficultyButtons(){
    difficultyButtons.forEach(btn=>{
      btn.classList.toggle('selected',btn.dataset.difficulty===difficulty);
    });
  }

  difficultyButtons.forEach(btn=>{
    const choose=(e)=>{
      if(e){e.preventDefault();e.stopPropagation();}
      difficulty=btn.dataset.difficulty||'normal';
      try{localStorage.setItem('kaeru_difficulty',difficulty);}catch(err){}
      refreshDifficultyButtons();
    };
    btn.addEventListener('pointerup',choose);
    btn.addEventListener('click',e=>{if(window.PointerEvent)return;choose(e);});
  });
  refreshDifficultyButtons();

  function difficultyProfile(){
    if(difficulty==='easy') return {move:.82,attack:.58,tongue:.55,guard:.55,special:.55,damage:.80};
    if(difficulty==='hard') return {move:1.14,attack:1.42,tongue:1.35,guard:1.45,special:1.5,damage:1.14};
    return {move:1,attack:1,tongue:1,guard:1,special:1,damage:1};
  }

  const selectCardCommands={
    green:[
      'バーニングアッパー：↑ ＋ パンチ',
      'バーニングキック：前 ＋ キック',
      'バーニングサイクロン：↓ → 後ろ ＋ キック<br>レッドオーラ：↓ → 後ろ ＋ ガード'
    ],
    blue:[
      'アクアトルネード：ガード → パンチ',
      'アクアストリーム：ガード → キック',
      'アクアボルテックス：後ろ ＋ パンチ'
    ],
    black:[
      'ヘルクラッシュ：→ → ＋ パンチ',
      'アビスチャージ：後ろ＋パンチ長押し → 離す'
    ],
    purple:[
      'リボンラッシュ：舌 ×3',
      'カマキリ突進：後ろ ＋ ガード ×2',
      'バックスピンキック：後ろ ＋ キック（追加入力で追加回転）'
    ],
    yellow:[
      'エアカッター：ガード → パンチ',
      'エアカッター：ガード → キック',
      'ウィンドライズ：↑ ＋ パンチ',
      'エアブースト：↑ ＋ ガード',
    ],
    orange:[
      'ホワイトカウンター：ガード ×2',
      'ガーディアンタックル：後ろ → 前 ＋ ガード',
      'ホワイトオーラ：ガード長押し → 離す',
      '白い長リーチ攻撃：オーラ中 パンチ / キック'
    ],
    piranha:[
      '追尾連続噛みつき：舌 ×3',
      '急降下①：↓ ↑ ＋ パンチ',
      '急降下②：↓ ↑ ＋ キック'
    ],
    crayfish:[
      '多脚ラッシュ：パンチ ×3',
      'ウェブトラップ：↑ ↓ ＋ キック',
      'セイリング・ウェブ：↓ ↑ ＋ パンチ'
    ],
    beelzebub:[
      'ヴェノム・ウォーター：方向キー1回転 ＋ ガード',
      'フィッシュ・レイド：↓ → ＋ パンチ',
      'アビスショック：↓ → ＋ キック'
    ],
    kawazu:[
      '水圧ラッシュ：パンチ ×2',
      'ミラージュキック：前 ＋ キック',
      'ハイスピードサイクロン：↓ → 後ろ ＋ キック'
    ]
  };
  function applySelectCardCommands(card){
    if(!card)return;
    const moves=card.querySelector('.move-names'), list=selectCardCommands[card.dataset.fighter];
    if(!moves||!list)return;
    moves.innerHTML='<span class="command-list">'+list.map(x=>{
      const p=x.split('：'); return '<b>'+p.shift()+'</b>：'+p.join('：');
    }).join('<br>')+'</span>';
  }
  document.querySelectorAll('#selectScreen .fighter-card').forEach(applySelectCardCommands);

  function isBeelzebubUnlocked(){
    try{return localStorage.getItem('kaeru_beelzebub_unlocked')==='1';}
    catch(e){return false;}
  }

  function refreshBossUnlock(){
    const unlocked=isBeelzebubUnlocked();

    // hiddenだけでは後段CSSに負ける端末があるため、displayも明示的に制御。
    if(beelzebubCard){
      beelzebubCard.hidden=!unlocked;
      beelzebubCard.style.display=unlocked?'':'none';
      beelzebubCard.setAttribute('aria-hidden',unlocked?'false':'true');
    }

    if(beelzebubOpponent){
      beelzebubOpponent.hidden=!unlocked;
      beelzebubOpponent.disabled=!unlocked;
      beelzebubOpponent.style.display=unlocked?'':'none';
    }

    if(bossTeaser){
      bossTeaser.hidden=!unlocked;
      bossTeaser.style.display=unlocked?'':'none';
    }
  }

  function unlockBeelzebub(){
    try{localStorage.setItem('kaeru_beelzebub_unlocked','1');}catch(e){}
    refreshBossUnlock();
  }

  function isKawazuUnlocked(){
    try{return localStorage.getItem('kaeru_kawazu_unlocked')==='1';}
    catch(e){return false;}
  }
  function refreshKawazuUnlock(){
    // 未クリア時はDOM自体を作らない。名前・見た目・技名を完全に伏せる。
    if(!isKawazuUnlocked()) return;

    if(!kawazuCard){
      const grid=document.querySelector('#selectScreen .fighter-grid');
      if(grid){
        const btn=document.createElement('button');
        btn.id='kawazuCard';
        btn.className='fighter-card kawazu-card';
        btn.dataset.fighter='kawazu';
        btn.innerHTML=`<span class="fighter-emoji kawazu-frog">🐸</span>
          <strong>カワズさん</strong>
          <span class="special-hint move-names">水圧ラッシュ / ミラージュキック / ハイスピードサイクロン</span>
          `;
        grid.appendChild(btn);
        applySelectCardCommands(btn);
        kawazuCard=btn;
        btn.addEventListener('click',()=>{
          document.querySelectorAll('.fighter-card').forEach(c=>c.classList.remove('selected'));
          btn.classList.add('selected');
          selectedFighter='kawazu';
        });
      }
    }

    if(!kawazuOpponent && opponentSelect){
      const opt=document.createElement('option');
      opt.id='kawazuOpponent'; opt.value='kawazu'; opt.textContent='カワズさん';
      opponentSelect.appendChild(opt);
      kawazuOpponent=opt;
    }
  }
  function unlockKawazu(){
    try{localStorage.setItem('kaeru_kawazu_unlocked','1');}catch(e){}
    refreshKawazuUnlock();
  }
  refreshKawazuUnlock();

  function showStoryNarrative(pages,onDone){
    if(!storyNarrative || !storyNarrativeText || !storyNarrativeNext){
      if(onDone)onDone(); return;
    }
    let i=0;
    const render=()=>{
      storyNarrativeText.textContent=pages[i];
      storyNarrativeNext.textContent=i===pages.length-1?'進む':'次へ';
    };
    storyNarrative.hidden=false;
    render();
    storyNarrativeNext.onclick=()=>{
      i++;
      if(i>=pages.length){
        storyNarrative.hidden=true;
        storyNarrativeNext.onclick=null;
        if(onDone)onDone();
      }else render();
    };
  }

  refreshBossUnlock();

  document.querySelectorAll('.fighter-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.fighter-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedFighter = card.dataset.fighter;
    });
  });

  if(opponentSelect){
    opponentSelect.value=selectedOpponent;
    opponentSelect.addEventListener('change',()=>{selectedOpponent=opponentSelect.value;});
  }

  document.getElementById('fightButton').onclick = () => {
    playSfx('menu');
    selectedOpponent=opponentSelect ? opponentSelect.value : selectedOpponent;
    show('game');
    resize();
    startGame('free');
  };

  const storyButton=document.getElementById('storyButton');
  if(storyButton){
    const openStory=(e)=>{
      if(e){
        e.preventDefault();
        e.stopPropagation();
      }
      playSfx('menu');
      startStoryMode();
    };
    storyButton.addEventListener('pointerup',openStory);
    storyButton.addEventListener('click',(e)=>{
      if(window.PointerEvent) return;
      openStory(e);
    });
  }

  const minigameBtn=document.getElementById('minigameBtn');
  if(minigameBtn){
    const openLeafMini=(e)=>{
      if(e){e.preventDefault();e.stopPropagation();}
      startLeafMiniGame();
    };
    minigameBtn.addEventListener('pointerup',openLeafMini);
    minigameBtn.addEventListener('click',(e)=>{
      if(window.PointerEvent)return;
      openLeafMini(e);
    });
  }

  const justGuardMiniBtn=document.getElementById('justGuardMiniBtn');
  if(justGuardMiniBtn){
    const openGuardMini=e=>{if(e){e.preventDefault();e.stopPropagation();}startGuardMiniGame();};
    justGuardMiniBtn.addEventListener('pointerup',openGuardMini);
    justGuardMiniBtn.addEventListener('click',e=>{if(window.PointerEvent)return;openGuardMini(e);});
  }

  const raceMiniBtn=document.getElementById('raceMiniBtn');
  if(raceMiniBtn){
    const openRace=e=>{if(e){e.preventDefault();e.stopPropagation();}startRaceMiniGame();};
    raceMiniBtn.addEventListener('pointerup',openRace);
    raceMiniBtn.addEventListener('click',e=>{if(window.PointerEvent)return;openRace(e);});
  }

  const basketMiniBtn=document.getElementById('basketMiniBtn');
  if(basketMiniBtn){
    const openBasket=e=>{if(e){e.preventDefault();e.stopPropagation();}startBasketMiniGame();};
    basketMiniBtn.addEventListener('pointerup',openBasket);
    basketMiniBtn.addEventListener('click',e=>{if(window.PointerEvent)return;openBasket(e);});
  }

  const practiceBtn=document.getElementById('practiceBtn');
  if(practiceBtn){
    const openPractice=(e)=>{
      if(e){
        e.preventDefault();
        e.stopPropagation();
      }
      playSfx('menu');
      startPractice();
    };

    // スマホ・PC共通。touch/clickの二重発火を避ける。
    practiceBtn.addEventListener('pointerup',openPractice);
    practiceBtn.addEventListener('click',(e)=>{
      // pointerイベント非対応環境の保険
      if(window.PointerEvent) return;
      openPractice(e);
    });
  }

  if(practiceExitButton){
    if(mixPracticeMode) practiceExitButton.textContent='MIXタイトルへ戻る';
    practiceExitButton.addEventListener('pointerup',(e)=>{
      e.preventDefault();
      e.stopPropagation();
      if(mixPracticeMode){
        location.href=new URL('index.html',location.href).href;
        return;
      }

      gameMode='battle';
      if(practiceHelp){practiceHelp.hidden=true;practiceHelp.style.display='none';}
      if(storyHud) storyHud.hidden=true;
      leafMiniActive=false;
      guardMiniActive=false;
      raceMiniActive=false;
      basketMiniActive=false;
      if(raceMiniHud){raceMiniHud.hidden=true;raceMiniHud.style.display='none';}
      if(basketMiniHud){basketMiniHud.hidden=true;basketMiniHud.style.display='none';}
      if(leafMiniHud){leafMiniHud.hidden=true;leafMiniHud.style.display='none';}
      if(guardMiniHud){guardMiniHud.hidden=true;guardMiniHud.style.display='none';}
      if(practiceLabel) practiceLabel.style.display='none';
      practiceExitButton.hidden=true;
      practiceExitButton.textContent='練習終了';
      comboEl.textContent='';
      show('select');
    });
  }

  if(titleReturnButton){
    titleReturnButton.onclick=()=>{
      gameOver=true;
      running=false;
      leafMiniActive=false;
      guardMiniActive=false;
      if(storyHud) storyHud.hidden=true;
      if(leafMiniHud){leafMiniHud.hidden=true;leafMiniHud.style.display='none';}
      if(guardMiniHud){guardMiniHud.hidden=true;guardMiniHud.style.display='none';}
      restartButton.hidden=true;
      titleReturnButton.hidden=true;
      comboEl.textContent='';
      if(practiceHelp){practiceHelp.hidden=true;practiceHelp.style.display='none';}
      show('select');
    };
  }

  restartButton.onclick = () => {
    if(gameMode==='practice') startPractice();
    else if(gameMode==='leafMini') startLeafMiniGame();
    else if(gameMode==='guardMini') startGuardMiniGame();
    else if(gameMode==='raceMini') startRaceMiniGame();
    else if(gameMode==='basketMini') startBasketMiniGame();
    else if(gameMode==='story'){
      if(storyFinished){
        if(storyHud) storyHud.hidden=true;
        gameMode='battle';
        restartButton.hidden=true;
        restartButton.textContent='もう一度';
        show('select');
      }else{
        continueStory();
      }
    }else startGame('free');
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function drawWhiteAura(x,y,rx,ry,intensity=1){
    ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='lighter';
    for(let i=0;i<4;i++){
      ctx.globalAlpha=(.12+i*.07)*intensity;
      ctx.fillStyle=i%2?'#ffffff':'#dffcff';
      ctx.beginPath();ctx.ellipse(0,0,rx+i*4,ry+i*3,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawRedAura(x,y,rx,ry,intensity=1){
    ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='lighter';
    const pulse=.93+Math.sin(performance.now()/48)*.07;ctx.scale(pulse,pulse);
    for(let i=0;i<4;i++){
      ctx.globalAlpha=(.13+i*.055)*intensity;ctx.fillStyle=i%2===0?'#ff2738':'#ff7138';
      ctx.beginPath();ctx.ellipse(Math.sin(performance.now()/80+i)*4,Math.cos(performance.now()/96+i)*3,rx+i*4,ry+i*3,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawBurningAura(x,y,rx,ry,rotation=0){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rotation);
    ctx.globalCompositeOperation='lighter';

    const pulse=.92+Math.sin(performance.now()/55)*.08;
    ctx.scale(pulse,pulse);

    for(let i=0;i<4;i++){
      const t=performance.now()/120+i*1.7;
      ctx.globalAlpha=.12+i*.06;
      ctx.fillStyle=i%2===0?'#ff2d20':'#ff8a28';
      ctx.beginPath();
      ctx.ellipse(
        Math.sin(t*1.8+i)*4,
        Math.cos(t*1.3+i)*3,
        rx+i*3,ry+i*2,0,0,Math.PI*2
      );
      ctx.fill();
    }

    for(let i=0;i<5;i++){
      const a=performance.now()/300+i*1.25;
      ctx.globalAlpha=.5;
      ctx.fillStyle=i%2?'#ff3b25':'#ffad3d';
      ctx.beginPath();
      ctx.arc(Math.cos(a)*rx*.75,Math.sin(a*1.4)*ry*.7,2.2+(i%2),0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  function fighterPalette(type){
    if(type==='kawazu'){
      return {
        body:'#4fbd55',
        limb:'#4aaf50',
        light:'#82d96d',
        belly:'#f4f1e8',
        eyeBump:'#5bc45b'
      };
    }

    if(type==='black'){
      return {
        body:'#3b4048',
        limb:'#3b4048',
        light:'#59616d',
        belly:'#707984',
        eyeBump:'#4b525c'
      };
    }
    if(type==='purple'){
      return {
        body:'#f05a9d',
        limb:'#f05a9d',
        light:'#ff8fc1',
        belly:'#ffc1dc',
        eyeBump:'#f777b0'
      };
    }
    if(type==='beelzebub'){
      return {
        body:'#111714',
        limb:'#141b16',
        light:'#7dff28',
        belly:'#b5ff48',
        eyeBump:'#6eff20'
      };
    }
    if(type==='yellow'){
      return {
        body:'#e7cf3f', limb:'#e7cf3f', light:'#f5e56b',
        belly:'#fff08a', eyeBump:'#f1dc55'
      };
    }
    if(type==='orange'){
      return {
        body:'#ef8b32', limb:'#ef8b32', light:'#ffad55',
        belly:'#ffc477', eyeBump:'#f9a04a'
      };
    }
    if(type==='blue'){
      return {
        body:'#31aee8',
        limb:'#31aee8',
        light:'#75d8ff',
        belly:'#8ee3ff',
        eyeBump:'#63c8ef'
      };
    }
    return {
      body:'#39cb4d',
      limb:'#39cb4d',
      light:'#78e36d',
      belly:'#86e77b',
      eyeBump:'#63df6e'
    };
  }

  class Fighter {
    constructor(x, y, isPlayer, type='green') {
      const s = stats[type] || stats.green;
      this.x=x; this.y=y; this.vx=0; this.vy=0; this.isPlayer=isPlayer;
      // 地上版ボス生物は常時空中型。
      // アザゼル（トンボ）は浮遊、ベリアル（クモ）は天井の糸からぶら下がる。
      if(type==='piranha') this.y=Math.min(this.y,innerHeight*.40);
      if(type==='crayfish') this.y=Math.min(this.y,innerHeight*.36);
      this.type=type; this.speed=s.speed; this.tongueRange=s.tongue; this.damageMul=s.damage;
      this.defense=s.defense||1; this.bodyScale=s.scale||1;
      this.sink=s.sink; this.hue=s.hue;
      this.radius=35*this.bodyScale; this.hp=100; this.face = isPlayer ? 1 : -1;
      this.attack=null; this.attackT=0; this.attackVariant='mid'; this.stun=0; this.guard=false; this.tongueT=0;
      this.flash=0;
      this.hurtFaceT=0;
      this.hurtFace='wink';

      // ガード / 波
      this.guardStartT=0;
      this.guardTapTimes=[];
      this.waveCooldown=0;
      this.guardBreakT=0;

      // 壁受け身
      this.wallTechT=0;

      // 水中ダッシュ
      this.dashT=0;
      this.dashCooldown=0;

      // 必殺技
      this.specialT=0;
      this.specialType=null;
      this.specialHitDone=false;
      this.chargeStartTime=0;
      this.chargePower=0;
      this.healT=0;
      this.counterT=0;
      this.counterReady=false;
      this.tackleArmedT=0;
      this.tackleHit=false;
      this.urielGuardHoldStart=0;
      this.urielAuraT=0;
      this.michaelRedAuraT=0;
      this.michaelPowerReady=false;
      this.michaelBoostAttackT=0;
      this.lilithSpinStartTime=0;
      this.lilithSpinLastHitA=-9999;
      this.lilithSpinLastHitB=-9999;
      this.piranhaRushHit=false;
      this.piranhaBiteHits=0;
      this.webbedT=0;
      this.webMash=0;
      this.suspendedT=0;
      this.suspendedX=0;
      this.suspendedY=0;
      this.belialThreadGrow=1;
      this.belialThreadReconnectT=0;
      this.kawazuPileTarget=null;
      this.piranhaDivePhase=0;
      this.piranhaDiveTargetX=0;
      this.crayfishRushStep=0;
      this.crayfishRushLastHit=0;
      this.crayfishSmashDone=false;
      this.crayfishSmashQueued=false;
      this.crayfishSmashQueueT=0;
      this.crayfishCounterReady=false;
      this.crayfishCounterT=0;
      this.bossTongueAimY=0;
      this.bossSpecialCooldown=0;
      this.luciferGrabTarget=null;
      this.luciferGrabT=0;
      this.luciferRushHits=0;
      this.luciferPunchSide=0;
      this.ribbonWhipIndex=0;
      this.luciferDiveHits=0;

      // 舌システム
      this.tonguePullTarget=null;   // 今、舌で引き寄せている相手
      this.tonguePullTimer=0;       // 2回目の舌入力を受け付ける時間
      this.tongueClashTarget=null;  // 投げ抜け時：お互い舌が伸びた相手
      this.tongueClashTimer=0;      // 舌の綱引き状態の残り時間
      this.throwState=null;         // 舌投げ中の状態
      this.spinAngle=0;
    }
    update(dt) {
      if (this.stun>0) this.stun-=dt;
      if(this.webbedT>0){
        this.webbedT=Math.max(0,this.webbedT-dt);
        this.stun=Math.max(this.stun,.10);
        this.vx*=Math.pow(.08,dt); this.vy*=Math.pow(.08,dt);
        if(this.webbedT<=0)this.webMash=0;
      }
      if(this.suspendedT>0){
        this.suspendedT=Math.max(0,this.suspendedT-dt);
        this.vx=0; this.vy=0;
        this.x=this.suspendedX; this.y=this.suspendedY;
      }
      if(this.healT>0){
        this.healT=Math.max(0,this.healT-dt);
        this.hp=Math.min(100,this.hp+3.2*dt);
        if(this.isPlayer) updateHud();
      }
      if(this.counterT>0){
        this.counterT-=dt;
        if(this.counterT<=0) this.counterReady=false;
      }
      if(this.tackleArmedT>0) this.tackleArmedT-=dt;
      if(this.bossSpecialCooldown>0) this.bossSpecialCooldown=Math.max(0,this.bossSpecialCooldown-dt);
      if(this.urielAuraT>0) this.urielAuraT=Math.max(0,this.urielAuraT-dt);
      if(this.type==='orange' && this.urielAuraT>0){
        this.hp=Math.min(100,this.hp+1.15*dt);
        if(this.isPlayer)updateHud();
      }
      if(this.michaelRedAuraT>0){
        this.michaelRedAuraT=Math.max(0,this.michaelRedAuraT-dt);
        this.hp=Math.min(100,this.hp+1.7*dt);
        if(this.isPlayer)updateHud();
      }
      if(this.michaelBoostAttackT>0)this.michaelBoostAttackT=Math.max(0,this.michaelBoostAttackT-dt);
      if (this.flash>0) this.flash-=dt;
      if (this.hurtFaceT>0) this.hurtFaceT-=dt;
      if (this.guardStartT>0) this.guardStartT-=dt;
      if (this.waveCooldown>0) this.waveCooldown-=dt;
      if (this.guardBreakT>0) this.guardBreakT-=dt;
      if (this.wallTechT>0) this.wallTechT-=dt;
      if (this.dashT>0) this.dashT-=dt;
      if (this.dashCooldown>0) this.dashCooldown-=dt;
      if (this.specialT>0){
        this.specialT-=dt;
        if(this.specialT<=0){
          this.specialT=0;
          this.specialType=null;
          this.specialHitDone=false;
        }
      }
      if (this.attackT>0) {
        this.attackT-=dt;
        if (this.attackT<=0) this.attack=null;
      }
      if (this.tongueT>0) this.tongueT-=dt;

      // 自分が相手を舌で引っ張っている間
      if(this.tonguePullTimer>0){
        this.tonguePullTimer-=dt;
        if(this.tonguePullTimer<=0){
          this.tonguePullTimer=0;
          this.tonguePullTarget=null;
        }
      }

      // 投げ抜け成功後の「舌の綱引き」
      if(this.tongueClashTimer>0){
        this.tongueClashTimer-=dt;
        if(this.tongueClashTimer<=0){
          this.tongueClashTimer=0;
          this.tongueClashTarget=null;
        }
      }

      // ベリアル：投げ・叩きつけ中は天井糸が切れる。
      // 復帰後は少し間を置いて、クモから画面上へ糸が伸び直す。
      if(this.type==='crayfish'){
        if(this.throwState){
          this.belialThreadGrow=0;
          this.belialThreadReconnectT=.28;
        }else if(this.belialThreadGrow<1){
          if(this.belialThreadReconnectT>0){
            this.belialThreadReconnectT=Math.max(0,this.belialThreadReconnectT-dt);
          }else{
            this.belialThreadGrow=Math.min(1,this.belialThreadGrow+dt*2.15);
          }
        }
      }

      // Ground physics. Frogs obey strong gravity.
      // アザゼル（トンボ）とベリアル（クモ）は空中常駐型なので通常時は重力を相殺する。
      const aerialBoss = this.type==='piranha' || this.type==='crayfish';
      const forcedFall =
        this.throwState ||
        this.specialType==='piranhaDivePunch' ||
        this.specialType==='piranhaDiveKick' ||
        false;
      if(!aerialBoss || forcedFall){
        this.vy += LAND_GRAVITY * dt;
      }else{
        // 浮遊感を残しつつ入力・ノックバックには反応する。
        this.vy *= Math.pow(.19,dt);
        this.vy += Math.sin(performance.now()/430 + (this.type==='crayfish'?1.7:0))*18*dt;
      }
      if(this.specialType==='urielTackle'){
        this.vx *= Math.pow(.72, dt);
      }else if(this.dashT>0){
        this.vx *= Math.pow(.48, dt);
      }else{
        this.vx *= Math.pow(LAND_HORIZONTAL_DRAG, dt);
      }

      // 舌で引かれている側は、舌の持ち主へゆっくり吸い寄せられる
      const puller = this.isPlayer ? enemy : player;
      if(puller && puller.tonguePullTarget===this && puller.tonguePullTimer>0 && !this.throwState){
        const dx = puller.x - this.x;
        const dy = puller.y - this.y;
        this.vx += dx * 6.0 * dt;
        this.vy += dy * 6.0 * dt;
        this.stun = Math.max(this.stun, .08);
      }

      // 投げ抜け成功中：両者が中間へ寄っていく。
      if(this.tongueClashTarget && this.tongueClashTimer>0 && !this.throwState){
        const dx = this.tongueClashTarget.x - this.x;
        const dy = this.tongueClashTarget.y - this.y;
        this.vx += dx * 2.8 * dt;
        this.vy += dy * 2.8 * dt;
        this.stun = Math.max(this.stun, .06);
      }

      if(this.throwState){
        if(typeof this.throwState.endT==='number'){
          this.throwState.endT-=dt;
          if(this.throwState.endT<=0){
            this.throwState=null;
            this.spinAngle=0;
          }
        }
        if(this.throwState){
          this.spinAngle += this.throwState.spinSpeed * dt;
        }
      } else {
        this.spinAngle *= Math.pow(.03, dt);
      }

      // ルシファーさん：斜め下降キック連打。
      if(this.specialType==='darknessRush' && this.luciferDiveHits<4){
        const other=this.isPlayer?enemy:player;
        const active=this.specialT<=.82 && this.specialT>=.12 && this.vy>30;
        if(other && active){
          const fx=this.x+this.face*42;
          const fy=this.y+36;
          const d=Math.hypot(other.x-fx,other.y-fy);
          const now=performance.now();
          if(d<other.radius+38 && (!this._lastDarkHit || now-this._lastDarkHit>125)){
            this._lastDarkHit=now;
            this.luciferDiveHits++;
            const last=this.luciferDiveHits===4;
            damageHit(this,other,(last?4.0:2.2)*this.damageMul,
                      (last?145:45)*this.face,last?105:35);
          }
        }
      }



      // ベリアルさん：多脚ラッシュ
      // 土煙の中でも上下だけ少し相手へ自動追尾する。
      if(this.specialType==='crayfishRush'){
        const other=this.isPlayer?enemy:player;
        const now=performance.now();

        if(other){
          const dy=other.y-this.y;
          this.vy += Math.max(-90,Math.min(90,dy*2.2))*dt;

          // 前方向の勢いを少し維持
          if(Math.abs(this.vx)<300){
            this.vx += this.face*160*dt;
          }

          if(Math.hypot(other.x-this.x,other.y-this.y)<other.radius+this.radius+30){
            if(now-(this.crayfishRushLastHit||0)>125){
              this.crayfishRushLastHit=now;
              this.crayfishRushStep++;
              const fin=this.crayfishRushStep>=5;
              damageHit(
                this,other,
                (fin?3.8:1.8)*this.damageMul,
                (fin?155:34)*this.face,
                fin?-40:0
              );
            }
          }
        }
      }

      // アザゼル：相手を追う連続大顎噛みつき
      if(this.specialType==='piranhaRush'){
        const other=this.isPlayer?enemy:player;
        if(other){
          const dx=other.x-this.x,dy=other.y-this.y,len=Math.hypot(dx,dy)||1;
          this.vx+=(dx/len*470-this.vx)*Math.min(1,dt*7.5);
          this.vy+=(dy/len*470-this.vy)*Math.min(1,dt*7.5);
          const now=performance.now();
          if(Math.hypot(dx,dy)<other.radius+this.radius+30 && now-(this._lastPiranhaBite||0)>145){
            this._lastPiranhaBite=now; this.piranhaBiteHits=(this.piranhaBiteHits||0)+1;
            const fin=this.piranhaBiteHits>=5;
            damageHit(this,other,(fin?3.6:1.65)*this.damageMul,(fin?120:24)*this.face,fin?-35:0);
            if(fin)this.specialT=Math.min(this.specialT,.12);
          }
        }
      }
      // アザゼルさん：上空から急降下
      if((this.specialType==='piranhaDivePunch'||this.specialType==='piranhaDiveKick') && this.piranhaDivePhase===2){
        const other=this.isPlayer?enemy:player;
        if(other && Math.hypot(other.x-this.x,other.y-this.y)<other.radius+this.radius+15){
          this.piranhaDivePhase=3;
          const side=this.specialType==='piranhaDivePunch'?1:-1;
          damageHit(this,other,8.4*this.damageMul,120*this.face*side,245);
          other.hurtFace='both'; other.hurtFaceT=.7;
        }
      }

      // ウリエルさん：前傾タックル。接触した相手を回転させて吹き飛ばす。
      if(this.specialType==='urielTackle' && !this.tackleHit){
        const other=this.isPlayer?enemy:player;
        if(other){
          const fx=this.x+this.face*34;
          const d=Math.hypot(other.x-fx,other.y-this.y);
          if(d<other.radius+this.radius*.78){
            this.tackleHit=true;
            damageHit(this,other,9.0*this.damageMul,285*this.face,-70);
            other.throwState={owner:this,spinSpeed:this.face*12,endT:.62,noWallDamage:true};
            other.spinAngle=0;
            other.hurtFace='both'; other.hurtFaceT=.7;
            setTimeout(()=>{
              if(other && other.throwState && other.throwState.owner===this){
                other.throwState=null;
              }
            },620);
          }
        }
      }

      // 必殺技の赤いオーラが出ている間は、手足そのものに当たり判定を持たせる。
      // 1回の必殺技につき1ヒット。見た目と判定の時間を一致させる。
      if(this.specialType && !this.specialHitDone){
        const other = this.isPlayer ? enemy : player;

        if(other){
          if(this.specialType==='uppercut'){
            // 溜めが終わって上昇し始めてから赤い拳が有効。
            const active = this.specialT<=.54 && this.specialT>=.08;
            if(active){
              const hx=this.x + this.face*48;
              const hy=this.y - 22;
              const hitDist=Math.hypot(other.x-hx, other.y-hy);

              if(hitDist < other.radius + 28){
                this.specialHitDone=true;
                damageHit(this,other,10.5*this.damageMul,245*this.face,-190);
              }
            }
          }else if(this.specialType==='dropkick'){
            // 突進開始後、赤い足が消える直前まで有効。
            const active = this.specialT<=.475 && this.specialT>=.06;
            if(active){
              const fx=this.x + this.face*63;
              const fy=this.y + 25;
              const hitDist=Math.hypot(other.x-fx, other.y-fy);

              // 足先を上げた分、上方向にも少し広い判定。
              if(hitDist < other.radius + 37){
                this.specialHitDone=true;
                damageHit(this,other,10.0*this.damageMul,240*this.face,-35);
              }
            }
          }else if(this.specialType==='raphaelWindRise'){
            const active=this.specialT<=.56 && this.specialT>=.10;
            if(active){
              const hx=this.x+this.face*24;
              const hy=this.y-18;
              if(Math.hypot(other.x-hx,other.y-hy)<other.radius+42){
                this.specialHitDone=true;
                damageHit(this,other,7.4*this.damageMul,95*this.face,-185);
              }
            }
          }
        }
      }

      this.x += this.vx * dt;
      this.y += this.vy * dt;
      const minY=78, maxY=landFloorY();

      // 舌投げで壁・床に当たった瞬間に追加ダメージ
      if(this.throwState){
        const hitWall = this.x<=45 || this.x>=innerWidth-45;
        const hitFloor = this.y>=maxY;
        if(hitWall || hitFloor){
          const owner = this.throwState.owner;
          this.x=Math.max(45,Math.min(innerWidth-45,this.x));
          this.y=Math.max(minY,Math.min(maxY,this.y));

          // 壁に当たる直前にガードを押していれば受け身成功。
          // 床は今まで通りダメージ。壁だけ受け身可能。
          if(hitWall && this.wallTechT>0){
            this.throwState=null;
            this.spinAngle=0;
            this.wallTechT=0;
            this.stun=.12;
            this.hurtFaceT=.08;

            // 壁を蹴るように軽く跳ね返る
            this.vx *= -.28;
            this.vy *= .18;

            spawnImpact(this.x,this.y,'guard');

            comboEl.textContent='UKEMI!';
            setTimeout(()=>{
              if(comboEl.textContent==='UKEMI!') comboEl.textContent='';
            },520);
          }else{
            // 舌の下投げは、高い位置から床へ落としたほど激突ダメージが増える。
            let impactDamage=7.0;
            if(hitFloor && this.throwState && this.throwState.tongueSlam){
              const drop=Math.max(0,this.throwState.dropHeight||0);
              impactDamage += Math.min(9.0,drop/72);
            }
            this.hp=Math.max(0,this.hp-impactDamage);
            this.vx *= -.18;
            this.vy = hitFloor ? -95 : this.vy*.25;
            this.stun=.42;
            spawnImpact(this.x,this.y,'hit');

            if(owner && owner.isPlayer){
              comboHits++;
              comboTimer=1.15;
              comboEl.textContent=`${comboHits} HIT!`;
            }

            this.throwState=null;
            updateHud();
            if(this.hp<=0) endGame(owner ? owner.isPlayer : false);
          }
        }
      }

      this.x=Math.max(45,Math.min(innerWidth-45,this.x));
      this.y=Math.max(minY,Math.min(maxY,this.y));

      // Frog-style automatic jumping: no extra jump button and no conflict with
      // command inputs that contain UP. A normal landing immediately launches again.
      if(this.y>=maxY && !this.throwState && this.vy>=0 && this.type!=='piranha' && this.type!=='crayfish'){
        this.y=maxY;
        this.vy=-LAND_AUTO_JUMP_SPEED;
      }

      const other = this.isPlayer ? enemy : player;
      if (other) this.face = other.x >= this.x ? 1 : -1;
    }
    hit(dmg,kx,ky) {
      if(this.guard){
        dmg*=.22; kx*=.2; ky*=.2;
        spawnImpact(this.x,this.y,'guard');
        playSfx('guard');
      } else {
        this.stun=.18;
        this.flash=.15;
        this.hurtFaceT=.32;
        this.hurtFace=Math.random()<.5?'wink':'both';
        spawnImpact(this.x,this.y,'hit');
        playSfx('hit',Math.min(1.25,.72+dmg*.035));
      }
      this.hp=Math.max(0,this.hp-dmg);
      this.vx += kx; this.vy += ky;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x,this.y);
      const pal=fighterPalette(this.type);

      if(this.specialType==='burningCyclone'){
        ctx.rotate(burningCycloneAngle(this));
      }
      if(this.specialType==='lilithBackSpin'){
        const elapsed=(performance.now()-(this.lilithSpinStartTime||performance.now()))/1000;
        ctx.rotate(elapsed*18*(this.face>0?-1:1));
      }


      // トンボ：アザゼルさん。オニヤンマを意識した黒＋黄の大型トンボ。
      if(this.type==='piranha'){
        if(this.face<0) ctx.scale(-1,1);
        if((this.specialType==='piranhaDivePunch'||this.specialType==='piranhaDiveKick') && this.piranhaDivePhase>=2){
          ctx.rotate(Math.PI/2);
        }else if(this.attack==='punch' && this.specialType!=='piranhaDivePunch'){
          const t=Math.max(0,Math.min(1,this.attackT/.34)); ctx.rotate((1-t)*Math.PI*2);
        }else if(this.attack==='kick' && this.specialType!=='piranhaDiveKick'){
          const t=Math.max(0,Math.min(1,this.attackT/.40)); ctx.rotate(-(1-t)*Math.PI*2);
        }
        if(this.flash>0) ctx.globalAlpha=.55;

        const flap=Math.sin(performance.now()/42)*.14;
        ctx.fillStyle='rgba(180,225,238,.62)';
        ctx.beginPath();ctx.ellipse(-3,-8,45,10,-.50+flap,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(-5,7,45,10,.48-flap,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(8,-7,39,9,.42-flap,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(8,8,39,9,-.42+flap,0,Math.PI*2);ctx.fill();

        ctx.fillStyle='#171717';
        ctx.beginPath();ctx.ellipse(7,5,21,18,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#f2d928';
        ctx.fillRect(-5,-9,6,27);
        ctx.fillRect(8,-11,7,30);

        ctx.strokeStyle='#171717';
        ctx.lineWidth=14;
        ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(-8,7);ctx.lineTo(-102,8);ctx.stroke();
        ctx.strokeStyle='#f2d928';
        ctx.lineWidth=5;
        for(let x=-22;x>=-92;x-=18){
          ctx.beginPath();ctx.moveTo(x,2);ctx.lineTo(x,14);ctx.stroke();
        }
        ctx.strokeStyle='#171717';ctx.lineWidth=7;
        ctx.beginPath();ctx.moveTo(-99,8);ctx.lineTo(-122,8);ctx.stroke();

        ctx.fillStyle='#242424';ctx.beginPath();ctx.arc(31,3,16,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=(this.hurtFaceT>0||this.throwState)?'#7e5b4c':'#38b7a4';
        ctx.beginPath();ctx.ellipse(37,1,11,14,.15,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.62)';
        ctx.beginPath();ctx.arc(40,-4,3,0,Math.PI*2);ctx.fill();

        ctx.strokeStyle='#111';ctx.lineWidth=4;ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(13,15);ctx.lineTo(30,34);ctx.lineTo(35,44);
        ctx.moveTo(4,16);ctx.lineTo(13,40);ctx.lineTo(8,52);
        ctx.moveTo(-5,14);ctx.lineTo(-19,35);ctx.lineTo(-23,47);
        ctx.stroke();

        if(this.attack==='punch'){
          ctx.strokeStyle='rgba(220,248,255,.95)';
          ctx.lineWidth=7;
          ctx.beginPath();ctx.arc(32,3,34,-1.0,.75);ctx.stroke();
        }
        if(this.attack==='kick'){
          ctx.strokeStyle='rgba(245,225,80,.9)';
          ctx.lineWidth=8;
          ctx.beginPath();ctx.arc(-82,8,38,2.2,4.1);ctx.stroke();
        }

        if(this.specialType==='piranhaRush'){
          const bite=(Math.sin(performance.now()/48)+1)*.5;
          // v2.5: 以前の約1/4の見た目。実物寄りに黒い大顎＋視認用の黄色い縁。
          const reach=4.5+3.5*(1-bite);
          ctx.lineCap='round';

          // 黄色い縁取りを先に太く描く。
          ctx.strokeStyle='#f3d72d';
          ctx.lineWidth=8;
          ctx.beginPath();
          ctx.moveTo(43,-3);ctx.quadraticCurveTo(49+reach,-6,56+reach,-2);
          ctx.moveTo(43,4);ctx.quadraticCurveTo(49+reach,7,56+reach,3);
          ctx.stroke();

          // 本体の顎は黒。
          ctx.strokeStyle='#111';
          ctx.lineWidth=5;
          ctx.beginPath();
          ctx.moveTo(43,-3);ctx.quadraticCurveTo(49+reach,-6,56+reach,-2);
          ctx.moveTo(43,4);ctx.quadraticCurveTo(49+reach,7,56+reach,3);
          ctx.stroke();
        }

        ctx.restore();
        return;
      }


      // クモ：ベリアルさん。天井から伸びる糸に繋がり、空中を自在に移動。
      if(this.type==='crayfish'){
        if(this.face<0) ctx.scale(-1,1);
        if(this.flash>0) ctx.globalAlpha=.55;

        // 天井へ続く蜘蛛の糸。投げられている間は切れ、復帰後に上へ伸び直す。
        if((this.belialThreadGrow||0)>0 && !this.throwState){
          const grow=Math.max(0,Math.min(1,this.belialThreadGrow||0));
          ctx.save();
          if(this.face<0) ctx.scale(-1,1);
          ctx.strokeStyle='rgba(238,244,238,.88)';
          ctx.lineWidth=2.3;
          ctx.beginPath();
          ctx.moveTo(0,-17);
          ctx.quadraticCurveTo(10,-this.y*.55*grow,0,-this.y*grow);
          ctx.stroke();
          ctx.restore();
        }

        // 腹部と頭
        ctx.fillStyle='#44354f';
        ctx.beginPath();ctx.ellipse(-3,17,31,36,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#5a4568';
        ctx.beginPath();ctx.ellipse(8,-11,23,21,0,0,Math.PI*2);ctx.fill();

        // 8本脚。ラッシュ中は先端を高速に振る。
        const rush=this.specialType==='crayfishRush';
        const wig=rush?Math.sin(performance.now()/34)*16:0;
        ctx.strokeStyle='#392b43';ctx.lineWidth=8;ctx.lineCap='round';
        ctx.beginPath();
        const legYs=[-5,7,19,30];
        legYs.forEach((yy,i)=>{
          const ext=38+i*4+(rush?10:0);
          ctx.moveTo(-18,yy);ctx.lineTo(-45,yy-18-i*3);ctx.lineTo(-ext-18,yy-8+wig*(i%2?1:-1));
          ctx.moveTo(18,yy);ctx.lineTo(45,yy-18-i*3);ctx.lineTo(ext+18,yy-8-wig*(i%2?1:-1));
        });
        ctx.stroke();

        // 顔。カウンター待機中は複眼が赤く光る。
        const counter=this.specialType==='crayfishCounter';
        ctx.fillStyle=counter?'#ff382e':'#d9e6dc';
        for(const [ex,ey] of [[0,-18],[10,-20],[19,-15],[5,-9],[15,-7],[25,-5]]){
          ctx.beginPath();ctx.arc(ex,ey,3.6,0,Math.PI*2);ctx.fill();
        }
        if(counter){
          ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,50,35,.35)';
          ctx.beginPath();ctx.arc(11,-14,24,0,Math.PI*2);ctx.fill();ctx.restore();
        }

        // 糸を使う攻撃の簡易表現
        if(this.attack==='crayfishStab' || this.specialType==='crayfishBottomSmash'){
          ctx.strokeStyle='rgba(245,250,245,.92)';ctx.lineWidth=5;
          ctx.beginPath();ctx.moveTo(18,-2);ctx.lineTo(70,this.specialType==='crayfishBottomSmash'?54:4);ctx.stroke();
        }
        if(this.specialType==='crayfishCounterHit'){
          ctx.strokeStyle='#392b43';ctx.lineWidth=11;ctx.beginPath();
          ctx.moveTo(18,0);ctx.lineTo(58,45);ctx.moveTo(-18,0);ctx.lineTo(-58,45);ctx.stroke();
        }

        if(this.attack==='crayfishHammer'){
          const jab=16+Math.sin(performance.now()/42)*5;
          ctx.strokeStyle='#2f2338';ctx.lineWidth=10;ctx.lineCap='round';
          ctx.beginPath();
          ctx.moveTo(19,-5);ctx.lineTo(52+jab,-18);ctx.lineTo(78+jab,-8);
          ctx.moveTo(18,6);ctx.lineTo(49+jab,4);ctx.lineTo(76+jab,14);
          ctx.stroke();
          ctx.strokeStyle='rgba(238,244,238,.72)';ctx.lineWidth=3;
          ctx.beginPath();ctx.moveTo(70+jab,-5);ctx.lineTo(88+jab,-7);ctx.stroke();
        }

        if(this.attack==='crayfishUpper'){
          const kick=18+Math.sin(performance.now()/48)*4;
          ctx.strokeStyle='#2f2338';ctx.lineWidth=11;ctx.lineCap='round';
          ctx.beginPath();
          ctx.moveTo(17,22);ctx.lineTo(52+kick,38);ctx.lineTo(81+kick,31);
          ctx.moveTo(10,31);ctx.lineTo(44+kick,55);ctx.lineTo(74+kick,52);
          ctx.stroke();
        }

        // ベリアルの舌ボタン＝カエルの舌と同じ性能。ただし見た目は白い蜘蛛糸。
        if(this.tongueT>0 || (this.tonguePullTarget && this.tonguePullTimer>0) || (this.tongueClashTarget && this.tongueClashTimer>0)){
          const target=this.tongueClashTarget || this.tonguePullTarget || (this.isPlayer?enemy:player);
          if(target){
            const dx=(target.x-this.x)*this.face;
            const dy=target.y-this.y;
            const len=Math.min(this.tongueRange,Math.max(0,dx));
            const ty=Math.max(-70,Math.min(70,dy));
            ctx.strokeStyle='rgba(250,253,250,.96)';
            ctx.lineWidth=4;
            ctx.lineCap='round';
            ctx.beginPath();
            ctx.moveTo(24,-7);
            ctx.lineTo(len,-7+ty);
            ctx.stroke();

            // 糸先の小さな粘着輪。
            ctx.lineWidth=2;
            ctx.beginPath();
            ctx.arc(len,-7+ty,7,0,Math.PI*2);
            ctx.stroke();
          }
        }

        ctx.restore();
        return;
      }


      // ウリエルさんは少し大柄
      if(this.bodyScale && this.bodyScale!==1) ctx.scale(this.bodyScale,this.bodyScale);

      // クローラッシュ中は追尾角度に合わせてほんの少し傾く
      if(this.specialType==='crayfishRush'){
        ctx.rotate(Math.max(-.16,Math.min(.16,this.vy/520)));
      }

      // ガーディアンタックル中は少し前傾
      if(this.specialType==='urielTackle') ctx.rotate(this.face*.22);

      // ヘルラッシュ中は少し低い姿勢
      if(this.specialType==='hellRush' && this.specialT>.55){
        ctx.translate(0,8); ctx.scale(1.04,.90);
      }

      // かえる跳びアッパーの溜め：少ししゃがむ
      if(this.specialType==='uppercut' && this.specialT>.48){
        ctx.translate(0,10);
        ctx.scale(1.08,.82);
      }

      if(this.throwState || Math.abs(this.spinAngle)>.02) ctx.rotate(this.spinAngle);
      if(this.face<0) ctx.scale(-1,1);
      if(this.flash>0) ctx.globalAlpha=.55;

      ctx.save();
      ctx.filter='none';

      // 2頭身くらいの丸い胴体
      ctx.fillStyle=pal.limb;
      ctx.beginPath();
      ctx.ellipse(0,31,30,34,0,0,Math.PI*2);
      ctx.fill();

      // お腹
      ctx.fillStyle=pal.belly;
      ctx.beginPath();
      ctx.ellipse(2,36,19,23,0,0,Math.PI*2);
      ctx.fill();

      if(this.type==='kawazu'){
        // 参考のアカメアマガエル風：胴体の左右に青い差し色
        ctx.save();
        ctx.fillStyle='#2e76b8';
        ctx.globalAlpha=.88;

        ctx.beginPath();
        ctx.ellipse(-23,31,8,25,-.18,0,Math.PI*2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(23,31,8,25,.18,0,Math.PI*2);
        ctx.fill();

        // 青と緑の境目に少し暗い青
        ctx.fillStyle='#24558d';
        ctx.globalAlpha=.72;
        ctx.beginPath();
        ctx.ellipse(-26,34,4,19,-.18,0,Math.PI*2);
        ctx.ellipse(26,34,4,19,.18,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      // ニュートラル脚：
      // キック中は蹴り足側だけ消し、反対側の軸足は残す。
      ctx.strokeStyle=pal.limb;
      ctx.lineWidth=12;
      ctx.lineCap='round';
      ctx.lineJoin='round';
      ctx.beginPath();

      // 左側の脚は軸足として常に残す
      ctx.moveTo(-15,48); ctx.lineTo(-19,62); ctx.lineTo(-28,67);

      // 右側の脚はキック中だけ攻撃ポーズ側へ差し替える
      if(this.attack!=='kick'){
        ctx.moveTo(15,48); ctx.lineTo(19,62); ctx.lineTo(28,67);
      }
      ctx.stroke();

      // ニュートラル腕。
      // パンチ中・ガード中は通常腕を描かず、それぞれ専用ポーズに差し替える。
      if(!this.guard && this.attack!=='wave'){
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=10;
        ctx.beginPath();
        ctx.moveTo(-23,22); ctx.lineTo(-32,35);
        if(this.attack!=='punch'){
          ctx.moveTo(23,22); ctx.lineTo(32,35);
        }
        ctx.stroke();
      }

      if(this.type==='kawazu'){
        // 腕脚そのものは緑。先端だけオレンジにする。
        ctx.save();
        ctx.fillStyle='#ff7a2f';

        // 足先：
        // キック中も軸足側（左）は残し、蹴り足側（右）だけ攻撃用へ差し替える。
        ctx.beginPath();
        ctx.ellipse(-29,67,10,7,-.18,0,Math.PI*2);
        if(this.attack!=='kick'){
          ctx.ellipse(29,67,10,7,.18,0,Math.PI*2);
        }
        ctx.fill();

        // 手先
        if(!this.guard && this.attack!=='wave'){
          ctx.beginPath();
          ctx.ellipse(-33,36,8,6,-.25,0,Math.PI*2);
          if(this.attack!=='punch'){
            ctx.ellipse(33,36,8,6,.25,0,Math.PI*2);
          }
          ctx.fill();
        }
        ctx.restore();
      }

      // v6.35 リリスさん：リボンは廃止。代わりにピンク配色＋口紅。
      if(this.type==='purple'){
        ctx.save();
        // 上唇・下唇を小さく描き、戦闘中でも顔を邪魔しない。
        ctx.fillStyle='#d91f6f';
        ctx.beginPath();
        ctx.ellipse(-5,17,7,2.8,-.10,0,Math.PI*2);
        ctx.ellipse( 5,17,7,2.8, .10,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle='#ff7fb4';
        ctx.beginPath();
        ctx.ellipse(0,20,10,3.2,0,0,Math.PI);
        ctx.fill();
        ctx.restore();
      }

      // 頭
      ctx.fillStyle=pal.body;
      ctx.beginPath();
      ctx.ellipse(0,-6,35,30,0,0,Math.PI*2);
      ctx.fill();

      // 目のふくらみ
      ctx.fillStyle=pal.eyeBump;
      ctx.beginPath();
      ctx.arc(-19,-29,16,0,Math.PI*2);
      ctx.arc(19,-29,16,0,Math.PI*2);
      ctx.fill();

      // 目：通常時と被弾時で表情を変える
      if(this.hurtFaceT>0 || this.throwState){
        ctx.strokeStyle='#182a2a';
        ctx.lineWidth=4;
        ctx.lineCap='round';

        if(this.hurtFace==='both'){
          // 両目をぎゅっと閉じる
          ctx.beginPath();
          ctx.moveTo(-28,-30); ctx.lineTo(-19,-26); ctx.lineTo(-10,-30);
          ctx.moveTo(10,-30); ctx.lineTo(19,-26); ctx.lineTo(28,-30);
          ctx.stroke();
        }else{
          // 片目を閉じ、もう片方は開く
          ctx.fillStyle='#fff';
          ctx.beginPath();
          ctx.arc(19,-30,10,0,Math.PI*2);
          ctx.fill();

          ctx.fillStyle='#182a2a';
          ctx.beginPath();
          ctx.arc(22,-29,4,0,Math.PI*2);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-28,-30); ctx.lineTo(-19,-26); ctx.lineTo(-10,-30);
          ctx.stroke();
        }
      }else{
        ctx.fillStyle='#fff';
        ctx.beginPath();
        ctx.arc(-19,-30,10,0,Math.PI*2);
        ctx.arc(19,-30,10,0,Math.PI*2);
        ctx.fill();

        ctx.fillStyle='#182a2a';
        ctx.beginPath();
        ctx.arc(-16,-29,4,0,Math.PI*2);
        ctx.arc(22,-29,4,0,Math.PI*2);
        ctx.fill();

        if(this.type==='kawazu'){
          // 白目は白のまま。赤い部分は虹彩だけ。
          ctx.fillStyle='#e62d24';
          ctx.beginPath();
          ctx.arc(-19,-30,7.2,0,Math.PI*2);
          ctx.arc(19,-30,7.2,0,Math.PI*2);
          ctx.fill();

          // 赤い虹彩の内側に黒い縦長の瞳孔
          ctx.fillStyle='#151515';
          ctx.beginPath();
          ctx.ellipse(-19,-30,2.8,5.3,0,0,Math.PI*2);
          ctx.ellipse(19,-30,2.8,5.3,0,0,Math.PI*2);
          ctx.fill();

          // 小さな光
          ctx.fillStyle='rgba(255,255,255,.88)';
          ctx.beginPath();
          ctx.arc(-21,-33,1.6,0,Math.PI*2);
          ctx.arc(17,-33,1.6,0,Math.PI*2);
          ctx.fill();
        }
      }

      // ほっぺ
      ctx.fillStyle='rgba(255,130,150,.42)';
      ctx.beginPath();
      ctx.arc(-24,2,5,0,Math.PI*2);
      ctx.arc(24,2,5,0,Math.PI*2);
      ctx.fill();

      // 口：被弾時は口角を下げる
      ctx.strokeStyle='#255c31';
      ctx.lineWidth=3;
      ctx.lineCap='round';
      ctx.beginPath();
      if(this.hurtFaceT>0 || this.throwState){
        ctx.arc(0,9,12,1.15*Math.PI,1.85*Math.PI);
      }else{
        ctx.arc(0,-3,14,.15*Math.PI,.85*Math.PI);
      }
      ctx.stroke();

      ctx.restore();

      // パンチは腕だけ前へ
      if(this.attack==='punch'){
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=12;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(22,22);
        if(this.specialType==='abyssCharge'){
          // アビスチャージ中：肘を曲げ、拳を身体の横へ引いて溜める。
          ctx.lineTo(37,31);
          ctx.lineTo(26,8);
        }else if(this.specialType==='abyssBurst'){
          // ボタンを離した瞬間：溜めた腕を前へ伸ばしてパンチ。
          ctx.lineTo(70,7);
        }else if(this.specialType==='hellCrashFinish'){
          ctx.lineTo(48,-38);
        }else if(this.specialType==='aquaTornado'){
          ctx.lineTo(48,-34);
        }else if(this.attackVariant==='up'){
          ctx.lineTo(48,-22);
        }else{
          ctx.lineTo(59,8);
        }
        ctx.stroke();
        ctx.restore();

        if(this.type==='kawazu'){
          ctx.save();
          ctx.fillStyle='#ff7a2f';
          let kx=59, ky=8;
          if(this.specialType==='kawazuPressureRush'){kx=58;ky=8;}
          else if(this.attackVariant==='up'){kx=48;ky=-22;}
          ctx.beginPath();
          ctx.ellipse(kx,ky,9,6,0,0,Math.PI*2);
          ctx.fill();
          ctx.restore();
        }

        if(this.specialType==='uppercut' && this.specialT<=.54 && this.specialT>=.08){
          drawBurningAura(48,-22,13,18,-.35);
        }
      }

      // キックは脚だけ前へ
      if(this.attack==='kick' && this.specialType!=='dropkick' && this.specialType!=='aquaStream' && this.specialType!=='lilithBackSpin'){
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=13;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(15,48);
        if(this.attackVariant==='down'){
          ctx.lineTo(64,58);
        }else{
          ctx.lineTo(60,48);
        }
        ctx.stroke();
        ctx.restore();

        if(this.type==='kawazu'){
          ctx.save();
          ctx.fillStyle='#ff7a2f';
          const ky=this.attackVariant==='down'?58:48;
          const kx=this.attackVariant==='down'?64:60;
          ctx.beginPath();
          ctx.ellipse(kx,ky,10,7,0,0,Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
      }

      if(this.specialType==='lilithBackSpin'){
        ctx.save(); ctx.filter='none'; ctx.strokeStyle=pal.limb; ctx.lineWidth=13; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(-13,45); ctx.lineTo(-58,46); ctx.moveTo(13,45); ctx.lineTo(58,46); ctx.stroke();
        ctx.restore();
      }

      if(this.specialType==='dropkick'){
        // 攻撃する脚は1本だけ。反対側の脚は軸足として身体側に残す。
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=13;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(14,46);
        // v0.30: 蹴り足を少し斜め上へ伸ばす。
        ctx.lineTo(67,25);
        ctx.stroke();
        ctx.restore();

        if(this.specialT<=.475 && this.specialT>=.06){
          drawBurningAura(62,25,27,14,-.28);
        }
      }

      if(this.specialType==='aquaStream'){
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=13;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(15,47);
        ctx.lineTo(48,68);
        ctx.stroke();
        ctx.restore();
      }

      if(this.type==='black' && (this.specialType==='hellCrashFinish' || this.specialType==='abyssCharge' || this.specialType==='abyssBurst')){
        let intensity=1;
        if(this.specialType==='abyssCharge'){
          const held=Math.max(0,performance.now()-(this.chargeStartTime||performance.now()));
          intensity=.4+.6*Math.min(1,held/1150);
        }
        if(this.specialType==='hellCrashFinish'){
          drawRedAura(48,-38,22,19,intensity);
        }else if(this.specialType==='abyssCharge'){
          // 曲げた腕の拳に赤い力を溜める。
          drawRedAura(26,8,16,14,intensity);
        }else{
          // パンチが伸びた先で炸裂。
          drawRedAura(64,7,23,19,intensity);
        }
      }

      if(this.type==='green' && this.specialType==='burningCyclone'){
        // 高速回転中は両足それぞれに赤いオーラ
        drawBurningAura(-17,52,18,13,-.15);
        drawBurningAura(17,52,18,13,.15);
      }

      if(this.type==='yellow' && this.specialType==='raphaelBubbleMove'){
        // 地上版エアブースト。泡の殻ではなく、身体の周囲に風の輪と流線を出す。
        // 高速移動中の飛び道具無効というゲーム上の性質は維持する。
        ctx.save();
        ctx.globalCompositeOperation='lighter';
        ctx.strokeStyle='rgba(235,252,255,.82)';
        ctx.lineWidth=3;
        ctx.globalAlpha=.72;
        ctx.beginPath();
        ctx.ellipse(0,22,54,66,-.16,0,Math.PI*2);
        ctx.stroke();
        ctx.globalAlpha=.52;
        for(let i=-1;i<=1;i++){
          ctx.beginPath();
          ctx.moveTo(-62,5+i*24);
          ctx.quadraticCurveTo(-22,-5+i*24,30,4+i*24);
          ctx.stroke();
        }
        ctx.restore();
      }

      if(this.type==='yellow' && this.specialType==='raphaelWindRise'){
        ctx.save();
        ctx.globalCompositeOperation='lighter';
        ctx.strokeStyle='rgba(238,253,255,.88)';
        ctx.lineWidth=4;
        ctx.globalAlpha=.72;
        for(let i=0;i<3;i++){
          ctx.beginPath();
          ctx.arc(0,22,34+i*11,-2.75,.55);
          ctx.stroke();
        }
        ctx.globalAlpha=.48;
        ctx.beginPath();
        ctx.moveTo(-34,58); ctx.quadraticCurveTo(-12,32,18,5);
        ctx.moveTo(2,66); ctx.quadraticCurveTo(18,36,38,16);
        ctx.stroke();
        ctx.restore();
      }

      if(this.type==='green' && this.michaelRedAuraT>0){
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ff3025';ctx.lineWidth=5;
        ctx.globalAlpha=.42+.14*Math.sin(performance.now()/75);ctx.shadowColor='#ff2718';ctx.shadowBlur=18;
        ctx.beginPath();ctx.ellipse(0,18,49,64,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }

      if(this.type==='beelzebub'){
        // 黒い身体に蛍光グリーンの目・輪郭が浮くラスボス演出
        ctx.save();
        ctx.globalCompositeOperation='lighter';
        ctx.fillStyle='#9aff32';
        ctx.shadowColor='#78ff18';
        ctx.shadowBlur=12;
        ctx.beginPath();
        ctx.arc(-15,-27,5.5,0,Math.PI*2);
        ctx.arc(15,-27,5.5,0,Math.PI*2);
        ctx.fill();
        ctx.globalAlpha=.22;
        ctx.strokeStyle='#84ff25';
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.ellipse(0,18,43,56,0,0,Math.PI*2);
        ctx.stroke();
        ctx.restore();
      }

      // ウリエルさん：ガード長押しで蓄えた薄い全身ホワイトオーラ
      if(this.type==='orange' && this.urielAuraT>0){
        ctx.save(); ctx.globalCompositeOperation='lighter';
        ctx.strokeStyle='#ffffff'; ctx.lineWidth=4; ctx.globalAlpha=.22+.08*Math.sin(performance.now()/90);
        ctx.beginPath(); ctx.ellipse(0,18,50,66,0,0,Math.PI*2); ctx.stroke();
        ctx.restore();
      }
      if(this.type==='orange' && this.urielAuraT>0 && this.whiteReachAttack){
        ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
        ctx.strokeStyle='#ffffff'; ctx.globalAlpha=.62;
        ctx.lineWidth=this.whiteReachAttack==='punch'?18:22;
        ctx.beginPath();
        if(this.whiteReachAttack==='punch'){ctx.moveTo(22,22);ctx.lineTo(205,8);}else{ctx.moveTo(15,48);ctx.lineTo(245,48);}
        ctx.stroke(); ctx.restore();
      }

      // ウリエルさん：カウンター構え/反撃の白いオーラ
      if(this.type==='orange' && (this.counterReady || this.specialType==='whiteCounterHit')){
        ctx.save();ctx.globalCompositeOperation='lighter';
        ctx.strokeStyle='#ffffff';ctx.lineWidth=5;ctx.globalAlpha=.62;
        ctx.beginPath();ctx.arc(0,18,48,0,Math.PI*2);ctx.stroke();
        if(this.specialType==='whiteCounterHit') drawWhiteAura(58,7,20,16,1);
        ctx.restore();
      }

      if(this.specialType==='ribbonWhip'){
        ctx.save();
        ctx.strokeStyle='#f08b9a';
        ctx.lineWidth=6;
        ctx.lineCap='round';

        const phase=(performance.now()/55);
        const offsets=[-24,16,-8,26,-18,10,0];

        // 舌の根元は常に口中央。
        // 先端側だけが何本も高速で飛び出して見えるようにする。
        for(let i=0;i<5;i++){
          const idx=(Math.floor(phase)+i)%offsets.length;
          const y=offsets[idx];
          const reach=92+i*18;
          const alpha=.28+i*.14;

          ctx.globalAlpha=alpha;
          ctx.beginPath();
          ctx.moveTo(0,8);
          ctx.lineTo(reach,y);
          ctx.stroke();

          // 舌先だけ少し太くして「突き」の連打感を出す
          ctx.beginPath();
          ctx.arc(reach,y,5.2,0,Math.PI*2);
          ctx.fillStyle='#ff9dad';
          ctx.fill();
        }

        ctx.restore();
      }

      // ヘルラッシュ：左右の拳を交互に大きく突き出す。
      if(this.specialType==='hellRush'){
        const hammer=this.luciferRushHits>=4;
        const side=this.luciferPunchSide||0;
        ctx.save();
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=14;
        ctx.lineCap='round';

        if(hammer){
          // 最後は頭上から振り下ろす
          ctx.beginPath();
          ctx.moveTo(18,-2);
          ctx.lineTo(28,-42);
          ctx.lineTo(45,28);
          ctx.stroke();
        }else{
          // 左右で高さを変え、連打感を出す
          const yy=side===0?-8:17;
          ctx.beginPath();
          ctx.moveTo(15,yy*.25);
          ctx.lineTo(67,yy);
          ctx.stroke();

          // 引いている反対の拳
          ctx.globalAlpha=.65;
          ctx.beginPath();
          ctx.moveTo(-13,-yy*.15);
          ctx.lineTo(8,-yy*.45);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ダークネスラッシュ：片足を斜め前下へ伸ばす
      if(this.specialType==='darknessRush'){
        ctx.save();
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=13;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(15,47);
        ctx.lineTo(58,67);
        ctx.stroke();
        ctx.restore();
      }

      if(this.tongueT>0 || (this.tonguePullTarget && this.tonguePullTimer>0) || (this.tongueClashTarget && this.tongueClashTimer>0)){
        const target=this.tongueClashTarget || this.tonguePullTarget || (this.isPlayer ? enemy : player);
        const aim=tongueAutoAim(this,target);
        if(aim){
          // ctxはfaceに合わせて左右反転済みなので、world X差分へfaceを掛けてローカル化。
          const localX=(aim.endWorldX-this.x)*this.face;
          const localY=aim.endWorldY-this.y;
          ctx.strokeStyle='#ff718e';
          ctx.lineWidth=8;
          ctx.lineCap='round';
          ctx.beginPath();
          ctx.moveTo(0,8);
          ctx.lineTo(localX,localY);
          ctx.stroke();

          // 舌先を少し太くして、高い位置へ伸びた時も先端を見失いにくくする。
          ctx.fillStyle='#ff91a8';
          ctx.beginPath();
          ctx.arc(localX,localY,5,0,Math.PI*2);
          ctx.fill();
        }
      }

      if(this.attack==='wave'){
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=11;
        ctx.lineCap='round';
        ctx.beginPath();
        // 両手を胸から前へ押し出す
        ctx.moveTo(-17,21); ctx.lineTo(13,17); ctx.lineTo(42,15);
        ctx.moveTo(-15,31); ctx.lineTo(14,29); ctx.lineTo(42,28);
        ctx.stroke();
        ctx.fillStyle=pal.light;
        ctx.beginPath();
        ctx.arc(43,15,6,0,Math.PI*2);
        ctx.arc(43,28,6,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      if(this.guard){
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=11;
        ctx.lineCap='round';
        ctx.lineJoin='round';

        // ガードは胸の前で腕を交差。
        // 描画上は常に右側が「敵に近い側」になる（face反転前提）。
        // 近い側の腕は少し上へ、遠い側は真っ直ぐ内側へ。
        ctx.beginPath();

        // 遠い側の手：胸へ真っ直ぐ内側に差し込む
        ctx.moveTo(-23,22);
        ctx.lineTo(-8,19);
        ctx.lineTo(10,18);

        // 敵に近い側の手：上から斜めに胸を守る
        ctx.moveTo(23,22);
        ctx.lineTo(12,10);
        ctx.lineTo(-5,16);

        ctx.stroke();

        // 手先を少し丸く見せる
        ctx.fillStyle=pal.light;
        ctx.beginPath();
        ctx.arc(10,18,6,0,Math.PI*2);
        ctx.arc(-5,16,6,0,Math.PI*2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
    }
  }


  class PracticeDummy {
    constructor(){
      this.x=innerWidth*.72;
      this.y=innerHeight*.48;
      this.vx=0; this.vy=0;
      this.radius=34;
      this.hp=999999;
      this.guard=false;
      this.stun=0;
      this.throwState=null;
      this.flash=0;
      this.face=-1;
      this.isPlayer=false;
      this.tonguePullTarget=null;
      this.tonguePullTimer=0;
      this.tongueClashTarget=null;
      this.tongueClashTimer=0;
      this.spinAngle=0;
    }
    hit(dmg,kx,ky){
      this.vx+=kx*.72;
      this.vy+=ky*.72;
      this.flash=.13;
      this.stun=.08;
      spawnImpact(this.x,this.y,'hit');
    }
    update(dt){
      if(this.flash>0)this.flash-=dt;
      if(this.stun>0)this.stun-=dt;
      // 葉っぱなのでゆっくり元の高さへ漂う
      this.vy += Math.sin(performance.now()/650)*5*dt;
      this.vx *= Math.pow(.28,dt);
      this.vy *= Math.pow(.42,dt);
      this.x += this.vx*dt;
      this.y += this.vy*dt;
      this.x=Math.max(innerWidth*.48,Math.min(innerWidth-55,this.x));
      this.y=Math.max(95,Math.min(innerHeight-80,this.y));
    }
    draw(){
      ctx.save();
      ctx.translate(this.x,this.y);
      ctx.rotate(-.18 + Math.sin(performance.now()/700)*.08);
      if(this.flash>0)ctx.globalAlpha=.55;

      // 水中を漂う丸い葉っぱ
      ctx.fillStyle='#72c95d';
      ctx.beginPath();
      ctx.ellipse(0,0,38,25,-.18,0,Math.PI*2);
      ctx.fill();

      ctx.strokeStyle='#397e3d';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(-27,8);
      ctx.quadraticCurveTo(0,0,29,-8);
      ctx.stroke();

      ctx.strokeStyle='#4b9950';
      ctx.lineWidth=2;
      for(let i=-15;i<=15;i+=10){
        ctx.beginPath();
        ctx.moveTo(i,1);
        ctx.lineTo(i-9,-10);
        ctx.stroke();
      }

      // 練習相手だと分かる小さな的
      ctx.strokeStyle='rgba(255,255,255,.72)';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.arc(0,0,11,0,Math.PI*2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0,0,4,0,Math.PI*2);
      ctx.stroke();

      ctx.restore();
    }
  }

  let player, enemy;
  let gameMode='battle'; // battle | practice | leafMini | guardMini | raceMini | basketMini
  let practiceLabel=null;
  const input={
    x:0,y:0,
    currentDir:null,
    lastReleasedDir:null,
    lastReleasedTime:0,
    dashUsedThisTouch:false,
    commandHistory:[],
    luciferTongueReadyUntil:0,
    punchTapTimes:[],
    tongueTapTimes:[],
    crayfishComboStep:0,
    crayfishComboTime:0,
    guardTapTimes:[],
    simpleGuardTapTimes:[],
    lastSimpleGuardTapTime:0,
    lastBackInputTime:0,
    purpleGuardCount:0,
    purpleGuardLastTime:0,
    forwardTapTimes:[]
  };

  function pushCommandDir(dir){
    if(!dir) return;
    const now=performance.now();
    const hist=input.commandHistory;
    const last=hist[hist.length-1];

    if(!last || last.dir!==dir){
      hist.push({dir,time:now});
    }else{
      last.time=now;
    }

    // 古い入力は削除
    input.commandHistory=hist.filter(v=>now-v.time<=900).slice(-8);
  }

  function hasCommand(sequence, maxMs=700){
    const now=performance.now();
    const hist=input.commandHistory.filter(v=>now-v.time<=maxMs);

    let i=hist.length-1;
    for(let s=sequence.length-1;s>=0;s--){
      while(i>=0 && hist[i].dir!==sequence[s]) i--;
      if(i<0) return false;
      i--;
    }
    return true;
  }

  function clearCommand(){
    input.commandHistory=[];
  }

  function getStickDirection(x,y){
    const mag=Math.hypot(x,y);
    if(mag<.40) return null;

    const angle=Math.atan2(y,x);
    const oct=Math.round(angle/(Math.PI/4));
    const dirs=['right','downRight','down','downLeft','left','upLeft','up','upRight'];
    return dirs[(oct+8)%8];
  }

  function dashVector(dir){
    const s=Math.SQRT1_2;
    const map={
      right:[1,0],
      downRight:[s,s],
      down:[0,1],
      downLeft:[-s,s],
      left:[-1,0],
      upLeft:[-s,-s],
      up:[0,-1],
      upRight:[s,-s]
    };
    return map[dir] || [0,0];
  }

  function doDash(dir){
    if(!player || gameOver || player.stun>0 || player.guard || player.throwState || player.dashCooldown>0) return false;

    const [dx,dy]=dashVector(dir);
    player.vx += dx*340;
    player.vy += dy*275;
    player.dashT=.25;
    player.dashCooldown=.44;

    comboEl.textContent='DASH!';
    setTimeout(()=>{
      if(comboEl.textContent==='DASH!') comboEl.textContent='';
    },380);

    for(let i=0;i<12;i++){
      particles.push({
        x:player.x-dx*(12+Math.random()*30),
        y:player.y-dy*(12+Math.random()*30)+(Math.random()-.5)*30,
        vx:-dx*(55+Math.random()*90)+(Math.random()-.5)*35,
        vy:-dy*(55+Math.random()*90)+(Math.random()-.5)*35,
        t:.34+Math.random()*.14,
        r:2+Math.random()*4,
        type:'guard'
      });
    }
    return true;
  }

  function checkTouchDash(){
    const dir=getStickDirection(input.x,input.y);
    input.currentDir=dir;

    // リリスさん用：後ろ方向を入れた時刻を記録
    if(player && player.type==='purple' && dir){
      const back=player.face>0?'left':'right';
      const backUp=player.face>0?'upLeft':'upRight';
      const backDown=player.face>0?'downLeft':'downRight';
      if(dir===back || dir===backUp || dir===backDown){
        input.lastBackInputTime=performance.now();
      }
    }
    if(dir) pushCommandDir(dir);
    if(!dir || input.dashUsedThisTouch) return;

    const now=performance.now();
    if(
      input.lastReleasedDir===dir &&
      now-input.lastReleasedTime<=450
    ){
      if(doDash(dir)){
        input.dashUsedThisTouch=true;
        input.lastReleasedDir=null;
        input.lastReleasedTime=0;
      }
    }
  }


  function spawnLeafTarget(slot=0, initial=false){
    const laneCount=5;
    const lane=slot%laneCount;
    const top=innerHeight*.25;
    const bottom=innerHeight*.72;
    const y=top+(bottom-top)*(lane/(laneCount-1));

    // initial=true のときは画面内～右端へ時間差配置。
    // 通常生成は右端から入ってくる。
    const x=initial
      ? innerWidth*.42 + (slot%7)*innerWidth*.12
      : innerWidth+35;

    leafTargets.push({
      x, y:y+(Math.random()-.5)*18,
      vx:-(145+Math.random()*40),
      r:20+Math.random()*4,
      rot:Math.random()*Math.PI*2,
      spin:(Math.random()-.5)*1.1,
      hp:1,
      hit:false
    });
  }

  function startLeafMiniGame(){
    gameMode='leafMini';
    if(practiceHelp){practiceHelp.hidden=true;practiceHelp.style.display='none';}
    gameOver=false;
    restartButton.hidden=true;
    comboHits=0; comboTimer=0; comboEl.textContent='';

    show('game');
    resize();

    player=new Fighter(innerWidth*.25,innerHeight*.5,true,selectedFighter);
    enemy=new PracticeDummy();
    enemy.x=-5000; enemy.y=-5000;

    leafTargets=[];
    leafMiniActive=true;
    leafMiniTime=60;
    leafMiniScore=0;
    leafSpawnTimer=0;

    if(leafMiniHud){ leafMiniHud.hidden=false; leafMiniHud.style.display='flex'; }
    if(guardMiniHud){ guardMiniHud.hidden=true; guardMiniHud.style.display='none'; }
    guardMiniActive=false;
    if(leafMiniTimeEl) leafMiniTimeEl.textContent='60.0';
    if(leafMiniScoreEl) leafMiniScoreEl.textContent='0';

    if(practiceExitButton){
      practiceExitButton.hidden=false;
      practiceExitButton.textContent='ミニゲーム終了';
    }
    if(practiceLabel) practiceLabel.style.display='none';

    bubbles=Array.from({length:28},()=>({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:2+Math.random()*6,s:10+Math.random()*26
    }));

    particles=[]; hitRings=[]; guardWaves=[]; aquaTornadoes=[]; aquaVortices=[];
    siltClouds=[]; webTraps=[]; ceilingWebs=[]; belialPoisonShots=[]; catfishCharges=[]; pressureBlades=[]; burstWaves=[];

    for(let i=0;i<12;i++){
      spawnLeafTarget(i,true);
      if(leafTargets[i]) leafTargets[i].x=innerWidth*(.38+(i%6)*.11);
    }

    running=true;
    last=performance.now();
    updateHud();
  }

  function endLeafMiniGame(){
    if(!leafMiniActive) return;
    leafMiniActive=false;
    comboEl.textContent=`RESULT ${leafMiniScore} 枚!`;
    restartButton.hidden=false;
  }

  function checkLeafHits(){
    if(!leafMiniActive || !player) return;

    const normalAttack=player.attackT>0;
    const tongueAttack=player.tongueT>0;
    const specialAttack=player.specialT>0;
    if(!normalAttack && !tongueAttack && !specialAttack) return;

    let reach=112;
    let height=82;
    if(tongueAttack){reach=190;height=58;}
    if(player.type==='piranha'){reach=Math.max(reach,130);height=90;}
    if(player.type==='crayfish'){reach=Math.max(reach,135);height=95;}
    if(specialAttack){reach+=45;height+=24;}

    leafTargets.forEach(leaf=>{
      if(leaf.hit) return;
      const dx=leaf.x-player.x;
      const dy=Math.abs(leaf.y-player.y);

      // 基本は向いている側。キャラ中心に重なった葉っぱも確実に壊す。
      const inFront=(dx*player.face)>=-28 && (dx*player.face)<=reach;
      const overlapping=Math.abs(dx)<=player.radius+leaf.r;
      if((inFront || overlapping) && dy<=height){
        leaf.hp=0;
        leaf.hit=true;
        leafMiniScore++;
        if(leafMiniScoreEl)leafMiniScoreEl.textContent=String(leafMiniScore);
        spawnImpact(leaf.x,leaf.y,'guard');
      }
    });
  }

  function spawnGuardTarget(){
    const targetY=player ? player.y : innerHeight*.5;
    guardTargets.push({
      x:innerWidth+60,
      y:targetY,
      targetY:targetY,
      vx:-(150+Math.random()*35),
      r:14+Math.random()*3,
      phase:Math.random()*Math.PI*2,
      kind:Math.random()<.75?'fish':'bug',
      resolved:false
    });
  }

  function startGuardMiniGame(){
    gameMode='guardMini';
    if(practiceHelp){practiceHelp.hidden=true;practiceHelp.style.display='none';} gameOver=false; restartButton.hidden=true;
    comboHits=0; comboTimer=0; comboEl.textContent='';
    show('game'); resize();
    player=new Fighter(innerWidth*.25,innerHeight*.5,true,selectedFighter);
    enemy=new PracticeDummy(); enemy.x=-5000; enemy.y=-5000;
    guardTargets=[]; guardMiniActive=true; leafMiniActive=false;
    guardMiniTime=60; guardMiniScore=0; guardMiniMiss=0; guardSpawnTimer=2.2;
    guardMiniGuardTapTime=-9999;
    if(leafMiniHud){ leafMiniHud.hidden=true; leafMiniHud.style.display='none'; }
    if(guardMiniHud){ guardMiniHud.hidden=false; guardMiniHud.style.display='flex'; }
    if(guardMiniTimeEl) guardMiniTimeEl.textContent='60.0';
    if(guardMiniScoreEl) guardMiniScoreEl.textContent='0';
    if(guardMiniMissEl) guardMiniMissEl.textContent='0';
    if(practiceExitButton){practiceExitButton.hidden=false;practiceExitButton.textContent='ミニゲーム終了';}
    if(practiceLabel) practiceLabel.style.display='none';
    particles=[]; hitRings=[]; guardWaves=[]; aquaTornadoes=[]; aquaVortices=[]; siltClouds=[];
    catfishCharges=[]; pressureBlades=[]; burstWaves=[];

    // 最初は1体だけ。いきなり複数が同時に来ないようにする。
    spawnGuardTarget();

    running=true; last=performance.now(); updateHud();
  }

  function endGuardMiniGame(){
    if(!guardMiniActive)return;
    guardMiniActive=false;
    comboEl.textContent=`JUST GUARD ${guardMiniScore} 回!`;
    restartButton.hidden=false;
  }

  function hideAllMiniHuds(){
    if(leafMiniHud){leafMiniHud.hidden=true;leafMiniHud.style.display='none';}
    if(guardMiniHud){guardMiniHud.hidden=true;guardMiniHud.style.display='none';}
    if(raceMiniHud){raceMiniHud.hidden=true;raceMiniHud.style.display='none';}
    if(basketMiniHud){basketMiniHud.hidden=true;basketMiniHud.style.display='none';}
  }

  function buildRaceCourse(){
    // v6.38: ジグザグ障害物コースを廃止。見てすぐ分かる楕円1周コース。
    const cx=innerWidth*.5, cy=innerHeight*.52;
    const rx=Math.max(230,innerWidth*.37), ry=Math.max(115,innerHeight*.27);
    raceObstacles=[];
    raceCheckpoints=[];
    // 左下寄りをスタートにして時計回り。細かいCPでショートカットを防ぐ。
    const startAng=Math.PI*.82;
    const count=20;
    for(let i=0;i<=count;i++){
      const ang=startAng-(Math.PI*2*i/count);
      raceCheckpoints.push({x:cx+Math.cos(ang)*rx,y:cy+Math.sin(ang)*ry,r:62});
    }
    raceCheckpointIndex=1;
    raceEnemyCheckpointIndex=1;
  }

  function startRaceMiniGame(){
    gameMode='raceMini'; gameOver=false; restartButton.hidden=true;
    comboEl.textContent=''; show('game'); resize();
    buildRaceCourse();
    const start=raceCheckpoints[0];
    player=new Fighter(start.x,start.y+22,true,selectedFighter);
    enemy=new Fighter(start.x,start.y-22,false,'blue');
    enemy.face=1;
    leafMiniActive=false;guardMiniActive=false;basketMiniActive=false;raceMiniActive=true;
    hideAllMiniHuds();
    raceMiniStart=performance.now();raceMiniElapsed=0;
    try{raceMiniBest=parseFloat(localStorage.getItem('kaeru_race_best')||'0')||0;}catch(e){raceMiniBest=0;}
    if(raceMiniHud){raceMiniHud.hidden=false;raceMiniHud.style.display='flex';}
    if(raceMiniTimeEl)raceMiniTimeEl.textContent='0.00';
    if(raceMiniBestEl)raceMiniBestEl.textContent=raceMiniBest?raceMiniBest.toFixed(2):'--';
    if(practiceExitButton){practiceExitButton.hidden=false;practiceExitButton.textContent='ミニゲーム終了';}
    running=true;last=performance.now();updateHud();
  }

  function endRaceMiniGame(){
    if(!raceMiniActive)return;
    raceMiniActive=false;
    const time=raceMiniElapsed;
    let best=false;
    if(!raceMiniBest || time<raceMiniBest){
      raceMiniBest=time;best=true;
      try{localStorage.setItem('kaeru_race_best',String(time));}catch(e){}
    }
    if(raceMiniBestEl)raceMiniBestEl.textContent=raceMiniBest.toFixed(2);
    comboEl.textContent=(best?'NEW BEST! ':'FINISH! ')+time.toFixed(2)+' sec';
    restartButton.hidden=false;
  }

  function resetBasketBall(){
    // マリモ型パック。最初から速めに動かす。
    const dir=Math.random()<.5?-1:1;
    basketBall={x:innerWidth*.5,y:innerHeight*.52,vx:dir*390,vy:(Math.random()-.5)*240,r:17,owner:null,lastTouch:null};
    player.x=innerWidth*.24;player.y=innerHeight*.52;player.vx=player.vy=0;
    enemy.x=innerWidth*.76;enemy.y=innerHeight*.52;enemy.vx=enemy.vy=0;
  }

  function startBasketMiniGame(){
    gameMode='basketMini'; gameOver=false; restartButton.hidden=true;
    comboEl.textContent=''; show('game'); resize();
    player=new Fighter(innerWidth*.24,innerHeight*.52,true,selectedFighter);
    enemy=new Fighter(innerWidth*.76,innerHeight*.52,false,'blue');
    leafMiniActive=false;guardMiniActive=false;raceMiniActive=false;basketMiniActive=true;
    basketMiniTime=60;basketPlayerScore=0;basketEnemyScore=0;basketShotCooldown=0;
    // 左右のゴール。playerは左陣、CPUは右陣から出られない。
    basketHoops=[
      {x:12,y:innerHeight*.52,side:'cpu'},
      {x:innerWidth-12,y:innerHeight*.52,side:'player'}
    ];
    resetBasketBall();
    hideAllMiniHuds();
    if(basketMiniHud){basketMiniHud.hidden=false;basketMiniHud.style.display='flex';}
    if(basketPlayerScoreEl)basketPlayerScoreEl.textContent='0';
    if(basketEnemyScoreEl)basketEnemyScoreEl.textContent='0';
    if(basketTimeEl)basketTimeEl.textContent='60.0';
    if(practiceExitButton){practiceExitButton.hidden=false;practiceExitButton.textContent='ミニゲーム終了';}
    running=true;last=performance.now();updateHud();
  }

  function hockeyStrike(f,kind){
    if(!basketMiniActive || !basketBall || !f)return false;
    const dx=basketBall.x-f.x,dy=basketBall.y-f.y;
    const reach=kind==='tongue'?(f.tongueRange||220)*.72:(f.radius+82);
    if(Math.hypot(dx,dy)>reach)return false;
    // 舌は遠くから弾けるが少し弱め。パンチ/キックは強打。
    const speed=kind==='tongue'?520:(kind==='kick'?720:650);
    const d=Math.hypot(dx,dy)||1;
    basketBall.owner=null;
    basketBall.lastTouch=f;
    basketBall.vx=dx/d*speed + f.face*110;
    basketBall.vy=dy/d*speed + (Math.random()-.5)*80;
    return true;
  }

  function endBasketMiniGame(){
    if(!basketMiniActive)return;
    basketMiniActive=false;
    const result=basketPlayerScore===basketEnemyScore?'DRAW':
      (basketPlayerScore>basketEnemyScore?'YOU WIN!':'YOU LOSE');
    comboEl.textContent=`${result} ${basketPlayerScore}-${basketEnemyScore}`;
    restartButton.hidden=false;
  }

  function basketTongueUse(f){
    if(!basketMiniActive || !basketBall || !f)return false;
    const other=f.isPlayer?enemy:player;
    const range=(f.tongueRange||220)*1.05;
    if(basketBall.owner===other &&
       Math.abs(other.x-f.x)<range &&
       Math.abs(other.y-f.y)<115){
      basketBall.owner=f;basketBall.lastTouch=f;
      comboEl.textContent='TONGUE STEAL!';
      setTimeout(()=>{if(comboEl.textContent==='TONGUE STEAL!')comboEl.textContent='';},400);
      return true;
    }
    const dx=basketBall.x-f.x,dy=basketBall.y-f.y;
    if(!basketBall.owner && Math.sign(dx)===f.face && Math.abs(dx)<range && Math.abs(dy)<115){
      basketBall.owner=f;basketBall.lastTouch=f;basketBall.vx=basketBall.vy=0;
      comboEl.textContent='BALL CATCH!';
      setTimeout(()=>{if(comboEl.textContent==='BALL CATCH!')comboEl.textContent='';},340);
      return true;
    }
    return false;
  }

  function basketShoot(f){
    if(!basketMiniActive || !basketBall || basketBall.owner!==f || basketShotCooldown>0)return false;
    const hoop=f.isPlayer?basketHoops[1]:basketHoops[0];
    const dx=hoop.x-basketBall.x,dy=hoop.y-basketBall.y;
    const d=Math.hypot(dx,dy)||1;
    basketBall.owner=null;
    basketBall.lastTouch=f;
    basketBall.vx=dx/d*360;
    basketBall.vy=dy/d*360;
    basketShotCooldown=.38;
    return true;
  }

  function startPractice(){
    gameMode='practice';
    updatePracticeHelp();
    gameOver=false;
    restartButton.hidden=true;
    comboHits=0;
    comboTimer=0;
    comboEl.textContent='';

    show('game');
    resize();

    player=new Fighter(innerWidth*.28,innerHeight-66,true,selectedFighter);
    enemy=new PracticeDummy();

    bubbles=Array.from({length:28},()=>({
      x:Math.random()*innerWidth,
      y:Math.random()*innerHeight,
      r:2+Math.random()*6,
      s:10+Math.random()*26
    }));
    particles=[];
    hitRings=[];
    guardWaves=[];
    aquaTornadoes=[]; aquaVortices=[];
    siltClouds=[];
    catfishCharges=[];
    pressureBlades=[];
    burstWaves=[];
    aquaTornadoes=[]; aquaVortices=[];
    siltClouds=[];
    catfishCharges=[];
    burstWaves=[];

    if(practiceExitButton) practiceExitButton.hidden=false;

    if(!practiceLabel){
      practiceLabel=document.createElement('div');
      practiceLabel.className='practice-label';
      practiceLabel.textContent='操作練習　∞';
      document.body.appendChild(practiceLabel);
    }
    practiceLabel.style.display='block';

    running=true;
    last=performance.now();
    updateHud();
  }


  const playableTypes=['green','blue','black','purple','yellow','orange','piranha','crayfish'].concat(isKawazuUnlocked()?['kawazu']:[]);

  function practiceSpecialText(type){
    const map={
      green:['↑ ＋ パンチ：バーニングアッパー','前 ＋ キック：バーニングキック','下 → 後ろ ＋ キック：バーニングサイクロン','下 → 後ろ ＋ ガード：レッドオーラ（少量回復＋次の攻撃強化）'],
      blue:['ガード → パンチ：アクアトルネード（約15°上）','ガード → キック：アクアストリーム（約8°下）','後ろ ＋ パンチ：アクアボルテックス（HP少量吸収）'],
      yellow:['ガード → パンチ：エアカッター','ガード → キック：エアカッター','ガード ×2：ヒーリングバブル','↑ ＋ ガード：エアブースト','↑ ＋ パンチ：ウィンドライズ'],
      orange:['ガード ×2：ホワイトカウンター','後ろ → 前 ＋ ガード：ガーディアンタックル','ガード長押し → 離す：ホワイトオーラ','ホワイトオーラ中：HPが少しずつ回復＋白いリーチ攻撃']
    };
    return map[type] || ['専用必殺技：練習対象外'];
  }

  function updatePracticeHelp(){
    if(!practiceHelp) return;
    if(gameMode!=='practice'){
      practiceHelp.hidden=true;
      practiceHelp.style.display='none';
      return;
    }

    const moves=practiceSpecialText(selectedFighter);
    if(practiceSpecialTitle){
      practiceSpecialTitle.textContent=`${fighterDisplayName(selectedFighter)} の必殺技`;
    }
    if(practiceSpecialMoves){
      practiceSpecialMoves.innerHTML=moves.map(v=>`<div>${v}</div>`).join('');
    }
    practiceHelp.hidden=false;
    practiceHelp.style.display='block';
  }

  function mixTypeFor(nameOrType){
    if(!nameOrType)return null;
    const map={
      'カワズ':'kawazu','カワズさん':'kawazu',
      'ミカエル':'green','ミカエルさん':'green','ガブリエル':'blue','ガブリエルさん':'blue',
      'ルシファー':'black','ルシファーさん':'black','リリス':'purple','リリスさん':'purple',
      'ラファエル':'yellow','ラファエルさん':'yellow','ウリエル':'orange','ウリエルさん':'orange',
      'ベルゼブブ':'beelzebub','ベルゼブブさん':'beelzebub',
      'リヴァイア':'piranha','リヴァイアさん':'piranha','アスモデウス':'crayfish','アスモデウスさん':'crayfish',
      'アザゼル':'piranha','アザゼルさん':'piranha','ベリアル':'crayfish','ベリアルさん':'crayfish'
    };
    return map[nameOrType]||nameOrType;
  }

  function finishMixBattle(playerWon){
    if(!mixBattleMode||!mixBattleContext)return false;
    const playerWasAttacker=mixBattleContext.playerRole!=='defender';
    const attackerWon=playerWasAttacker?playerWon:!playerWon;
    const result={
      attacker:mixBattleContext.attacker,defender:mixBattleContext.defender,node:mixBattleContext.node,
      attackerHp:playerWasAttacker?player.hp:enemy.hp,
      defenderHp:playerWasAttacker?enemy.hp:player.hp,
      winner:attackerWon?'attacker':'defender',
      returnSide:String(mixBattleContext.attacker||'').startsWith('b')?'beel':'kawazu'
    };
    sessionStorage.setItem('mixBattleResult',JSON.stringify(result));
    sessionStorage.removeItem('mixBattle');
    restartButton.textContent='戦略マップへ戻る';
    restartButton.hidden=false;
    restartButton.onclick=()=>{ location.href=new URL('index.html',location.href).href; };
    if(titleReturnButton)titleReturnButton.hidden=true;
    return true;
  }

  function fighterDisplayName(type){
    return {
      green:'ミカエルさん', blue:'ガブリエルさん', black:'ルシファーさん',
      purple:'リリスさん', yellow:'ラファエルさん', orange:'ウリエルさん',
      piranha:'アザゼルさん', crayfish:'ベリアルさん',
      beelzebub:'ベルゼブブさん', kawazu:'カワズさん'
    }[type]||type;
  }

  function resetBattleEffects(){
    particles=[]; hitRings=[]; guardWaves=[]; aquaTornadoes=[]; aquaVortices=[];
    siltClouds=[]; webTraps=[]; ceilingWebs=[]; belialPoisonShots=[]; catfishCharges=[]; pressureBlades=[]; burstWaves=[];
    leafTargets=[]; guardTargets=[]; toxicWaters=[]; bossFish=[]; abyssShocks=[]; kawazuShots=[]; kawazuGhosts=[];
  }

  function startGame(mode='free', enemyType=null) {
    gameMode=mode==='story'?'story':'battle';
    if(practiceHelp){practiceHelp.hidden=true;practiceHelp.style.display='none';}
    if(practiceLabel) practiceLabel.style.display='none';
    if(practiceExitButton) practiceExitButton.hidden=true;
    if(leafMiniHud){
      leafMiniHud.hidden=true;
      leafMiniHud.style.display='none';
    }
    if(guardMiniHud){
      guardMiniHud.hidden=true;
      guardMiniHud.style.display='none';
    }
    if(raceMiniHud){raceMiniHud.hidden=true;raceMiniHud.style.display='none';}
    if(basketMiniHud){basketMiniHud.hidden=true;basketMiniHud.style.display='none';}
    leafMiniActive=false;
    guardMiniActive=false;
    leafTargets=[];
    guardTargets=[];

    gameOver=false;
    restartButton.hidden=true;
    restartButton.textContent='もう一度';
    if(titleReturnButton) titleReturnButton.hidden=true;
    comboHits=0; comboTimer=0; comboEl.textContent='';

    const rivalType=enemyType || selectedOpponent || 'blue';
    player=new Fighter(innerWidth*.28,innerHeight-66,true,selectedFighter);
    enemy=new Fighter(innerWidth*.72,innerHeight-66,false,rivalType);
    enemy.hp=100;
    enemy.sameCharacter=(rivalType===selectedFighter);

    bubbles=Array.from({length:28},()=>({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:2+Math.random()*6,s:10+Math.random()*26
    }));
    resetBattleEffects();

    if(gameMode==='story'){
      if(storyHud){
        storyHud.hidden=false;
        const total=storyQueue.length;
        storyHud.textContent=`STORY ${storyFightIndex+1}/${total}　勝${storyWins} 敗${storyLosses}/3　VS ${fighterDisplayName(rivalType)}`;
      }
    }else{
      if(storyHud) storyHud.hidden=true;
      stageTheme=0;
    }

    running=true; last=performance.now();
    updateHud();
  }

  function startStoryMode(){
    // ストーリー開始前にミニゲームHUD/状態を完全クリア
    if(leafMiniHud){leafMiniHud.hidden=true;leafMiniHud.style.display='none';}
    if(guardMiniHud){guardMiniHud.hidden=true;guardMiniHud.style.display='none';}
    leafMiniActive=false;
    guardMiniActive=false;
    leafTargets=[];
    guardTargets=[];

    storyQueue=playableTypes.filter(t=>t!==selectedFighter && t!=='kawazu');
    if(selectedFighter!=='beelzebub') storyQueue.push('beelzebub');
    storyFightIndex=0;
    storyLosses=0;
    storyWins=0;
    storyFinished=false;
    stageTheme=0;

    show('game');
    resize();

    showStoryNarrative([
      '仕事に疲れた河津一郎は、帰り道、ぼんやりと田んぼを眺めていた。\n\n田んぼのあぜを高く跳ぶ一匹のカエル。\n\n「……あいつらは呑気でいいよな」',
      'しばらく眺めているうちに、ふと思う。\n\n「いや、待てよ……」\n\n「あいつらはあいつらで、厳しい世界を生き抜いているのかもしれない」',
      '河津一郎は妄想し始めた――。'
    ],()=>startGame('story',storyQueue[0]));
  }

  function continueStory(){
    if(storyFinished) return;

    storyFightIndex++;
    if(storyFightIndex>=storyQueue.length){
      storyFinished=true;
      gameOver=true;
      comboEl.textContent=`STORY CLEAR!　${storyWins}勝 ${storyLosses}敗`;
      restartButton.hidden=false;
      restartButton.textContent='キャラ選択へ';
      return;
    }

    // 3戦ごとに背景を変更。ラスボスは専用の暗い水域。
    const nextType=storyQueue[storyFightIndex];
    stageTheme=nextType==='beelzebub' ? 3 : Math.min(2,Math.floor(storyFightIndex/3));
    startGame('story',nextType);
  }


  function chooseAttackVariant(f, other, kind){
    const dy=other.y-f.y;

    // 初心者向けの自動補正だけに絞る。
    // パンチは上方向だけ、キックは下方向だけ。
    if(kind==='punch' && dy<-30) return 'up';
    if(kind==='kick' && dy>30) return 'down';

    return 'mid';
  }

  function auraCancelZones(f){
    if(!f) return [];
    const z=[];
    const fx=x=>f.x+f.face*x;

    if(f.type==='green' && f.specialType==='uppercut' && f.specialT<=.54 && f.specialT>=.08)
      z.push({owner:f,x:fx(48),y:f.y-22,r:30});
    if(f.type==='green' && f.specialType==='dropkick' && f.specialT<=.475 && f.specialT>=.06)
      z.push({owner:f,x:fx(63),y:f.y+25,r:39});
    if(f.type==='green' && f.specialType==='burningCyclone'){
      const ang=burningCycloneAngle(f);
      const a=rotatePoint(-17,52,ang);
      const b=rotatePoint(17,52,ang);
      z.push({owner:f,x:f.x+a.x,y:f.y+a.y,r:28});
      z.push({owner:f,x:f.x+b.x,y:f.y+b.y,r:28});
    }

    if(f.type==='black' && f.specialType==='hellCrashFinish')
      z.push({owner:f,x:fx(48),y:f.y-38,r:34});
    if(f.type==='black' && f.specialType==='abyssCharge')
      z.push({owner:f,x:fx(26),y:f.y+8,r:27});
    if(f.type==='black' && f.specialType==='abyssBurst')
      z.push({owner:f,x:fx(64),y:f.y+7,r:36});

    if(f.type==='orange' && f.specialType==='whiteCounterHit')
      z.push({owner:f,x:fx(58),y:f.y+7,r:32});

    return z;
  }

  function cancelSoftProjectilesAtZone(z){
    if(!z || !z.owner) return;

    pressureBlades.forEach(p=>{
      if(p.hit || !p.owner || p.owner===z.owner) return;
      if(Math.hypot(p.x-z.x,p.y-z.y)<z.r+30){
        p.hit=true; p.t=0;
        spawnImpact(p.x,p.y,'guard');
      }
    });

    catfishCharges.forEach(n=>{
      if(n.hit || !n.owner || n.owner===z.owner) return;
      const headX=n.x;
      if(Math.hypot(headX-z.x,n.y-z.y)<z.r+52){
        n.hit=true; n.t=0;
        spawnImpact(headX,n.y,'guard');
      }
    });
  }

  function cancelSoftProjectilesByAura(){
    [player,enemy].filter(Boolean).forEach(f=>{
      auraCancelZones(f).forEach(cancelSoftProjectilesAtZone);
    });
  }

  function pointToSegmentDistance(px,py,x1,y1,x2,y2){
    const vx=x2-x1, vy=y2-y1;
    const wx=px-x1, wy=py-y1;
    const vv=vx*vx+vy*vy || 1;
    let t=(wx*vx+wy*vy)/vv;
    t=Math.max(0,Math.min(1,t));
    const cx=x1+vx*t, cy=y1+vy*t;
    return Math.hypot(px-cx,py-cy);
  }

  function specialAquaVortex(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    const dir=f.face;
    f.specialType='aquaVortex';
    f.specialT=.48;
    f.attack='punch';
    f.attackVariant='mid';
    f.attackT=.48;

    aquaVortices.push({
      owner:f,
      x:f.x+dir*52,
      y:f.y+7,
      r:34,
      t:3.0,
      life:3.0,
      spin:0,
      lastHitAt:-9999
    });

    comboEl.textContent='アクアボルテックス!';
    setTimeout(()=>{
      if(comboEl.textContent==='アクアボルテックス!') comboEl.textContent='';
    },700);
    return true;
  }

  function specialAquaTornado(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    const dir=f.face;
    f.specialType='aquaTornado';
    f.specialT=.78;
    f.specialHitDone=false;
    f.attack='punch';
    f.attackVariant='up';
    f.attackT=.78;

    // 手元から斜め前上へ。画面上端を越える長さにしておく。
    const startX=f.x+dir*35;
    const startY=f.y-6;
    const length=Math.max(innerWidth,innerHeight)*1.05;
    const dx=dir*.966;
    const dy=-.259;

    aquaTornadoes.push({
      owner:f,
      startX,startY,
      endX:startX+dx*length,
      endY:startY+dy*length,
      dir,
      t:.72,
      life:.72,
      width:28,
      hit:false,
      direction:'up',
      source:'hand'
    });

    comboEl.textContent='アクアトルネード!';
    setTimeout(()=>{
      if(comboEl.textContent==='アクアトルネード!') comboEl.textContent='';
    },650);

    return true;
  }


  function specialRibbonWhip(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0) return false;
    const other=f.isPlayer?enemy:player;
    const dir=f.face;

    f.specialType='ribbonWhip';
    f.specialT=.82;
    f.attack='tongue';
    f.attackT=.82;
    f.ribbonWhipIndex=0;

    comboEl.textContent='リボンラッシュ!';
    setTimeout(()=>{
      if(comboEl.textContent==='リボンラッシュ!') comboEl.textContent='';
    },720);

    // 百裂キック風：舌先を高速で7回突き出す。
    const offsets=[-24,16,-8,26,-18,10,0];
    offsets.forEach((oy,i)=>{
      setTimeout(()=>{
        if(gameOver || !other) return;
        f.ribbonWhipIndex=i+1;

        const dx=(other.x-f.x)*dir;
        const dy=other.y-(f.y+oy);

        if(dx>0 && dx<f.tongueRange*1.42 && Math.abs(dy)<44){
          damageHit(
            f,other,
            (i===6?1.8:1.0)*f.damageMul,
            (i===6?85:18)*dir,
            (i===6?-30:0)
          );
        }
      },i*82);
    });

    return true;
  }

  function specialCatfishCharge(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    const other=f.isPlayer?enemy:player;
    if(!other) return false;
    f.specialType='catfishCall'; f.specialT=.65; f.attackT=.30;
    // 地上版：リリスさんの背後側・画面最上部から出現し、
    // カマと羽根を大きく広げた縦長姿勢のまま対角線へ急降下する。
    const attackDir=f.face;
    const behindX=f.x-attackDir*78;
    const spawnX=Math.max(54,Math.min(innerWidth-54,behindX));
    const targetX=Math.max(50,Math.min(innerWidth-50,other.x));
    const targetY=Math.max(innerHeight*.48,Math.min(groundY()-42,other.y+32));
    const dx=(targetX-spawnX)+attackDir*180, dy=Math.max(120,targetY-44);
    const len=Math.hypot(dx,dy)||1;
    const speed=540;

    catfishCharges.push({
      owner:f,
      target:other,
      x:spawnX,
      y:44,
      vx:dx/len*speed,
      vy:dy/len*speed,
      t:1.65,
      hit:false
    });
    comboEl.textContent='カマキリ突進!';
    setTimeout(()=>{if(comboEl.textContent==='カマキリ突進!')comboEl.textContent='';},800);
    return true;
  }

  function specialHellCrash(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0) return false;

    const other=f.isPlayer?enemy:player;
    if(!other) return false;

    const dir=f.face;
    f.specialType='hellCrash';
    f.specialT=.95;
    f.attack='punch';
    f.attackT=.95;
    f.specialHitDone=false;

    comboEl.textContent='ヘルクラッシュ!';
    setTimeout(()=>{
      if(comboEl.textContent==='ヘルクラッシュ!') comboEl.textContent='';
    },800);

    // 短く鋭い体当たり
    f.vx += dir*355;

    const started=performance.now();
    const timer=setInterval(()=>{
      if(gameOver || !f || !other || f.specialType!=='hellCrash'){
        clearInterval(timer);
        return;
      }

      const dx=(other.x-f.x)*dir;
      const dy=Math.abs(other.y-f.y);

      if(dx>-16 && dx<84 && dy<72 && !f.specialHitDone){
        f.specialHitDone=true;
        clearInterval(timer);

        f.vx*=.08;
        other.vx*=.08;
        other.vy*=.12;
        other.stun=Math.max(other.stun,.38);

        // 接触後、赤オーラのアッパーへ
        f.specialType='hellCrashFinish';
        f.specialT=.5;
        f.attack='punch';
        f.attackVariant='up';
        f.attackT=.5;

        setTimeout(()=>{
          if(gameOver) return;

          other.hurtFace='both';
          other.hurtFaceT=.72;

          // 斜め上へ強く飛ばし、やられ顔で回転させる
          damageHit(f,other,12.0*f.damageMul,245*dir,-315);

          // Fighterの既存回転処理を使う。文字列ではなく安全なthrowStateオブジェクト。
          other.throwState=null;
          other.spinAngle=0;
          other.throwState={
            owner:f,
            spinSpeed:dir*13.5,
            endT:.82,
            noWallDamage:true
          };

          burstWaves.push({
            x:other.x,
            y:other.y+4,
            t:.30,life:.30,
            radius:12,max:70,
            power:1
          });
        },125);
      }

      if(performance.now()-started>650){
        clearInterval(timer);
      }
    },20);

    return true;
  }

  function startAbyssCharge(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0) return false;
    f.specialType='abyssCharge'; f.specialT=20; f.attack='punch'; f.attackT=20;
    f.chargeStartTime=performance.now(); f.chargePower=.2; f.vx*=.25; f.vy*=.25;
    comboEl.textContent='CHARGE...'; return true;
  }

  function releaseAbyssCharge(f){
    if(!f || f.specialType!=='abyssCharge') return false;
    const held=Math.max(0,performance.now()-(f.chargeStartTime||performance.now()));
    const power=Math.max(.25,Math.min(1,held/1150));
    f.specialType='abyssBurst'; f.specialT=.5; f.attack='punch'; f.attackVariant='mid'; f.attackT=.5; f.chargePower=power;
    // 溜め姿勢から拳を出す瞬間に、身体もわずかに前へ乗せる。
    f.vx+=f.face*(38+42*power);
    comboEl.textContent='アビスチャージ!';setTimeout(()=>{if(comboEl.textContent==='アビスチャージ!')comboEl.textContent='';},720);
    setTimeout(()=>{
      if(gameOver)return; const other=f.isPlayer?enemy:player; if(!other)return;
      const hx=f.x+f.face*67, hy=f.y+7, dist=Math.hypot(other.x-hx,other.y-hy);
      if(dist<other.radius+34){
        // 直撃は相手をルシファーさんから遠ざける方向へ大きく吹き飛ばす
        const directKnockback=300+150*power;
        damageHit(
          f,other,
          (7.5+7.5*power)*f.damageMul,
          directKnockback*f.face,
          -55
        );
      }else if(dist<155){
        // 衝撃波だけなら従来どおり小さめ
        damageHit(f,other,(1.1+1.9*power)*f.damageMul,85*f.face,-16);
      }
      burstWaves.push({x:hx,y:hy,t:.44,life:.44,radius:18,max:150,power});
    },110);
    return true;
  }

  function specialAquaStream(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    const dir=f.face;
    f.specialType='aquaStream';
    f.specialT=.72;
    f.specialHitDone=false;
    f.attack='kick';
    f.attackVariant='down';
    f.attackT=.72;

    const startX=f.x+dir*28;
    const startY=f.y+42;
    const length=Math.max(innerWidth,innerHeight)*1.05;
    const dx=dir*.990;
    const dy=.139;

    aquaTornadoes.push({
      owner:f,
      startX,startY,
      endX:startX+dx*length,
      endY:startY+dy*length,
      dir,
      t:.68,
      life:.68,
      width:30,
      hit:false,
      direction:'down',
      source:'foot',
      siltSpawned:false
    });

    comboEl.textContent='アクアストリーム!';
    setTimeout(()=>{
      if(comboEl.textContent==='アクアストリーム!') comboEl.textContent='';
    },650);

    return true;
  }

  function specialBurningCyclone(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    f.specialType='burningCyclone';
    f.specialT=1.12;
    f.attack='kick';
    f.attackT=1.12;
    f.cycloneLastHitA=-9999;
    f.cycloneLastHitB=-9999;
    f.cycloneStartTime=performance.now();

    // 高速回転しながら相手方向へ突進
    f.vx+=f.face*555;
    f.vy*=.18;

    comboEl.textContent='バーニングサイクロン!';
    setTimeout(()=>{
      if(comboEl.textContent==='バーニングサイクロン!') comboEl.textContent='';
    },820);
    clearCommand();
    return true;
  }

  function specialLilithBackSpin(f,additional=false){
    if(gameOver || !f || f.type!=='purple' || f.stun>0 || f.throwState) return false;
    if(additional && f.specialType==='lilithBackSpin'){
      f.specialT=Math.min(1.55,f.specialT+.34);
      f.attackT=Math.min(1.55,f.attackT+.34);
      f.vx-=f.face*115;
      return true;
    }
    if(f.specialT>0 || f.attackT>0) return false;
    f.specialType='lilithBackSpin'; f.specialT=.58;
    f.attack='kick'; f.attackT=.58;
    f.lilithSpinStartTime=performance.now();
    f.lilithSpinLastHitA=-9999; f.lilithSpinLastHitB=-9999;
    f.vx-=f.face*285; f.vy*=.25;
    comboEl.textContent='バックスピンキック!';
    setTimeout(()=>{if(comboEl.textContent==='バックスピンキック!')comboEl.textContent='';},600);
    return true;
  }

  function specialUppercut(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    const other=f.isPlayer?enemy:player;
    f.specialType='uppercut';
    f.specialT=.72;
    f.specialHitDone=false;
    f.attack='punch';
    f.attackVariant='up';
    f.attackT=.72;

    // 一瞬しゃがんだ後に、画面上方向へ強く跳ぶ
    setTimeout(()=>{
      if(!f || gameOver) return;
      f.vy=-510;
      f.vx+=f.face*330;

      comboEl.textContent='バーニングアッパー!';
      setTimeout(()=>{
        if(comboEl.textContent==='バーニングアッパー!') comboEl.textContent='';
      },600);
    },180);

    return true;
  }

  function specialDropKick(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    const other=f.isPlayer?enemy:player;
    f.specialType='dropkick';
    f.specialT=.62;
    f.specialHitDone=false;
    f.attack='kick';
    f.attackVariant='mid';
    f.attackT=.62;

    // 水中なので超高速ではなく、少し溜めてから強く前進
    setTimeout(()=>{
      if(!f || gameOver) return;
      f.vx += f.face*470;
      // v0.30: 少しだけ上へ浮く初速。地上の重力で緩い放物線になる。
      f.vy=Math.min(f.vy,-145);

      comboEl.textContent='バーニングキック!';
      setTimeout(()=>{
        if(comboEl.textContent==='バーニングキック!') comboEl.textContent='';
      },600);
    },145);

    return true;
  }

  function hasBackBackCommand(f, windowMs=820){
    const back=f.face>0?'left':'right';
    const diagUp=f.face>0?'upLeft':'upRight';
    const diagDown=f.face>0?'downLeft':'downRight';
    const valid=new Set([back,diagUp,diagDown]);
    const now=performance.now();
    const recent=input.commandHistory.filter(e=>now-e.t<=windowMs);
    let count=0;
    for(let i=recent.length-1;i>=0;i--){
      if(valid.has(recent[i].dir)){
        count++;
        if(count>=2) return true;
      }else if(count>0){
        break;
      }
    }
    return false;
  }


  function applyPoisonDot(owner,target,durationTicks=3,damagePerTick=.55){
    if(!owner || !target || target.guard) return;
    let ticks=durationTicks;
    const timer=setInterval(()=>{
      // Stop if the battle/target has changed.
      const stillCurrent = target===player || target===enemy;
      if(gameOver || !stillCurrent || target.hp<=0 || ticks--<=0){
        clearInterval(timer);
        return;
      }
      owner._projectileHit=true;
      damageHit(owner,target,damagePerTick*owner.damageMul,0,0,true);
      owner._projectileHit=false;
    },260);
  }

  function specialVenomWater(f){
    if(gameOver || !f || f.stun>0 || f.specialT>0 || f.bossSpecialCooldown>0) return false;
    f.guard=false; f.specialType='venomWater'; f.specialT=.68; f.bossSpecialCooldown=2.4;

    // 地上版：真上＋左右の3方向へ噴水のようにいったん打ち上げてから落下。
    [
      {vx:-330,vy:-520},
      {vx:0,   vy:-610},
      {vx:330, vy:-520}
    ].forEach((v,i)=>{
      toxicWaters.push({
        owner:f,t:5.4,life:5.4,tick:0,
        x:f.x+(i-1)*10,y:f.y-24,
        vx:v.vx,vy:v.vy,r:19,
        landed:false,seed:Math.random()*1000,
        airHitAt:0
      });
    });

    comboEl.textContent='ヴェノム・ファウンテン!';
    setTimeout(()=>{if(comboEl.textContent==='ヴェノム・ファウンテン!')comboEl.textContent='';},800);
    clearCommand(); return true;
  }

  function specialFishRaid(f){
    if(gameOver || !f || f.stun>0 || f.specialT>0 || f.bossSpecialCooldown>0) return false;
    const target=f.isPlayer?enemy:player;
    if(!target) return false;

    f.specialType='fishRaid';
    f.specialT=.55;
    f.attack='punch';
    f.attackT=.55;
    f.bossSpecialCooldown=2.0;

    const count=10+Math.floor(Math.random()*11);
    for(let i=0;i<count;i++){
      const side=(i%2===0)?1:-1;
      bossFish.push({
        owner:f,
        target,
        x:side>0?innerWidth+30+Math.random()*130:-30-Math.random()*130,
        y:70+Math.random()*Math.max(120,innerHeight-150),
        vx:0,vy:0,
        r:10+Math.random()*4,
        hp:1,
        t:4.4,
        phase:Math.random()*Math.PI*2
      });
    }

    comboEl.textContent='ビー・レイド!';
    setTimeout(()=>{if(comboEl.textContent==='ビー・レイド!')comboEl.textContent='';},800);
    clearCommand();
    return true;
  }

  function specialAbyssShock(f){
    if(gameOver || !f || f.stun>0 || f.specialT>0 || f.bossSpecialCooldown>0) return false;

    f.specialType='abyssShock';
    f.specialT=.68;
    f.attack='kick';
    f.attackVariant='up';
    f.attackT=.68;
    f.bossSpecialCooldown=1.7;

    setTimeout(()=>{
      if(gameOver || !f) return;
      abyssShocks.push({
        owner:f,
        x:f.x+f.face*48,
        y:f.y+42,
        vx:f.face*430,
        vy:-120,
        t:1.5,
        life:1.5,
        r:58,
        hit:false
      });
    },130);

    comboEl.textContent='アビスショック!';
    setTimeout(()=>{if(comboEl.textContent==='アビスショック!')comboEl.textContent='';},760);
    clearCommand();
    return true;
  }

  function specialCrayfishCounter(f){
    if(gameOver || f.stun>0 || f.throwState || f.specialT>0) return false;
    f.guard=false;
    f.attack=null;
    f.attackT=0;
    f.specialType='crayfishCounter';
    f.specialT=1.15;
    f.crayfishCounterReady=true;
    f.crayfishCounterT=1.15;
    comboEl.textContent='クロー・カウンター!';
    setTimeout(()=>{
      if(comboEl.textContent==='クロー・カウンター!') comboEl.textContent='';
    },720);
    clearCommand();
    return true;
  }

  function triggerCrayfishCounter(f,attacker){
    if(!f || !f.crayfishCounterReady || !attacker) return false;

    f.crayfishCounterReady=false;
    f.crayfishCounterT=0;
    f.specialType='crayfishCounterHit';
    f.specialT=.52;
    f.attack='punch';
    f.attackT=.52;

    attacker.stun=Math.max(attacker.stun,.44);
    attacker.attackT=Math.max(attacker.attackT,.30);

    setTimeout(()=>{
      if(gameOver || !f || !attacker) return;
      // 両腕を広げた構えから、一気に振り下ろす
      damageHit(f,attacker,9.0*f.damageMul,150*f.face,115);
      attacker.hurtFace='both';
      attacker.hurtFaceT=.55;
    },110);

    comboEl.textContent='COUNTER!';
    setTimeout(()=>{
      if(comboEl.textContent==='COUNTER!') comboEl.textContent='';
    },520);

    return true;
  }

  function specialCrayfishRush(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    f.specialType='crayfishRush';
    f.specialT=1.05;
    f.attack='punch';
    f.attackT=1.05;
    f.crayfishRushStep=0;
    f.crayfishRushLastHit=0;
    f.vx += f.face*390;
    f.vy *= .35;

    comboEl.textContent='クローラッシュ!';
    setTimeout(()=>{if(comboEl.textContent==='クローラッシュ!')comboEl.textContent='';},750);
    return true;
  }

  function specialBelialCeilingWeb(f){
    if(gameOver || !f || f.stun>0 || f.specialT>0) return false;
    const other=f.isPlayer?enemy:player;
    if(!other) return false;
    f.specialType='belialCeilingWeb';
    f.specialT=.72; f.attack='punch'; f.attackT=.72;
    ceilingWebs.push({owner:f,target:other,phase:'up',x:f.x,y:f.y-20,targetX:other.x,t:1.35,life:1.35,hit:false});
    comboEl.textContent='セイリング・ウェブ!';
    setTimeout(()=>{if(comboEl.textContent==='セイリング・ウェブ!')comboEl.textContent='';},800);
    return true;
  }

  function executeCrayfishBottomSmash(f){
    if(gameOver || !f) return false;
    const other=f.isPlayer?enemy:player;
    f.crayfishSmashQueued=false; f.crayfishSmashQueueT=0;
    f.specialType='crayfishBottomSmash'; f.specialT=.62;
    f.attack='kick'; f.attackT=.62;
    const dx=(other?other.x:f.x+f.face*180)-f.x, dy=(other?other.y:f.y)-f.y;
    const len=Math.hypot(dx,dy)||1;
    webTraps.push({owner:f,x:f.x+f.face*28,y:f.y,vx:dx/len*430,vy:dy/len*430,t:1.15,life:1.15,r:25,hit:false});
    comboEl.textContent='ウェブトラップ!';
    setTimeout(()=>{if(comboEl.textContent==='ウェブトラップ!')comboEl.textContent='';},720);
    return true;
  }

  function specialCrayfishBottomSmash(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    return executeCrayfishBottomSmash(f);
  }

  function specialPiranhaRush(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    f.specialType='piranhaRush'; f.specialT=1.18; f.attack='tongue'; f.attackT=1.18;
    f.piranhaRushHit=false; f.piranhaBiteHits=0;
    comboEl.textContent='マンディブル・ラッシュ!';
    setTimeout(()=>{if(comboEl.textContent==='マンディブル・ラッシュ!')comboEl.textContent='';},950);
    return true;
  }

  function specialPiranhaDive(f,variant){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    const other=f.isPlayer?enemy:player;
    f.specialType=variant==='punch'?'piranhaDivePunch':'piranhaDiveKick';
    f.specialT=1.15; f.attack=variant; f.attackT=1.15; f.piranhaDivePhase=1;
    const offset=(variant==='punch'?42:-42)*f.face;
    f.piranhaDiveTargetX=Math.max(45,Math.min(innerWidth-45,(other?other.x:f.x)+offset));
    f.vy=-620; f.vx*=.15;
    comboEl.textContent=variant==='punch'?'急降下アタック!':'急降下テール!';
    setTimeout(()=>{
      if(gameOver || !f || !f.specialType || !f.specialType.startsWith('piranhaDive')) return;
      f.x=f.piranhaDiveTargetX; f.y=-42; f.vx=0; f.vy=690; f.piranhaDivePhase=2;
    },330);
    return true;
  }

  function specialPressureBlade(f,angleDeg=0,source='punch'){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0) return false;

    f.specialType='pressureBlade';
    f.specialT=.42;
    f.attack=source==='kick' ? 'kick' : (source==='punch' ? 'punch' : null);
    f.attackT=.42;

    const speed=355;
    // v0.31: キック版は前方水平と約15°下へ飛ぶ2枚。
    const angles = source==='punch' ? [0,-24] : [0,15];
    const yOffset=source==='punch' ? -10 : 24;

    angles.forEach((deg,i)=>{
      const rad=deg*Math.PI/180;
      pressureBlades.push({
        owner:f,
        x:f.x+f.face*(66+i*5),
        y:f.y+yOffset,
        vx:f.face*Math.cos(rad)*speed,
        vy:Math.sin(rad)*speed,
        t:1.25,
        life:1.25,
        hit:false,
        size:.92,
        angle:rad
      });
    });

    comboEl.textContent='エアカッター!';
    setTimeout(()=>{if(comboEl.textContent==='エアカッター!')comboEl.textContent='';},900);
    return true;
  }

  function specialRaphaelWindRise(f){
    if(gameOver || f.stun>0 || f.guard || f.throwState || f.specialT>0) return false;
    const other=f.isPlayer?enemy:player;
    const toward=other ? Math.sign(other.x-f.x)||f.face : f.face;
    f.guard=false;
    f.specialType='raphaelWindRise';
    f.specialT=.62;
    f.attack='punch';
    f.attackT=.62;
    f.specialHitDone=false;
    f.vx=toward*235;
    f.vy=-760;
    comboEl.textContent='ウィンドライズ!';
    setTimeout(()=>{if(comboEl.textContent==='ウィンドライズ!')comboEl.textContent='';},760);
    clearCommand();
    return true;
  }

  function specialRaphaelBubbleMove(f){
    if(gameOver || f.stun>0 || f.throwState || f.specialT>0) return false;

    f.guard=false;
    f.specialType='raphaelBubbleMove';
    f.specialT=.92;
    f.attack=null;
    f.attackT=0;
    f.raphaelMoveElapsed=0;
    f.raphaelMoveDuration=.82;
    f.raphaelMoveStartX=f.x;
    f.raphaelMoveStartY=f.y;

    // 地上版エアブースト：最初は斜め後ろ上へ風を受け、
    // そこから前方の画面上端へ大きく回り込む。
    const dir=f.face;
    f.raphaelMoveControlX=f.x-dir*Math.min(180,innerWidth*.18);
    f.raphaelMoveControlY=Math.max(92,f.y-Math.min(220,innerHeight*.30));
    f.raphaelMoveEndX=dir>0 ? innerWidth-90 : 90;
    f.raphaelMoveEndY=102;
    f.vx=0;
    f.vy=0;

    comboEl.textContent='エアブースト!';
    setTimeout(()=>{
      if(comboEl.textContent==='エアブースト!') comboEl.textContent='';
    },720);
    clearCommand();
    return true;
  }

  function specialHealingBubble(f){
    if(gameOver || f.stun>0 || f.specialT>0 || f.healT>0) return false;
    f.guard=false; f.specialType='healingBubble'; f.specialT=.55; f.healT=4.8;
    comboEl.textContent='ヒーリングバブル!';
    setTimeout(()=>{if(comboEl.textContent==='ヒーリングバブル!')comboEl.textContent='';},720);
    return true;
  }

  function hasFacingCircle(f, clockwiseWhenFacingRight=true, maxMs=1100){
    if(!f) return false;
    const now=performance.now();
    const hist=input.commandHistory
      .filter(v=>now-v.time<=maxMs)
      .map(v=>v.dir);

    // 画面座標では下が正なので、この並びが時計回り。
    const cw=['right','downRight','down','downLeft','left','upLeft','up','upRight'];
    const ccw=['right','upRight','up','upLeft','left','downLeft','down','downRight'];

    // 左向き時はコマンドを鏡映しにする。
    const wantCw = f.face>0 ? clockwiseWhenFacingRight : !clockwiseWhenFacingRight;
    const seq=wantCw ? cw : ccw;

    for(let start=0;start<8;start++){
      let p=0;
      for(const d of hist){
        if(d===seq[(start+p)%8]) p++;
        if(p>=7) return true;
      }
    }
    return false;
  }

  function hasFullCircle(maxMs=900){
    const now=performance.now();
    const hist=input.commandHistory.filter(v=>now-v.time<=maxMs).map(v=>v.dir);
    const cw=['right','downRight','down','downLeft','left','upLeft','up','upRight'];
    const ccw=['right','upRight','up','upLeft','left','downLeft','down','downRight'];
    const match=seq=>{
      for(let start=0;start<seq.length;start++){
        let p=0;
        for(const d of hist){
          if(d===seq[(start+p)%8]) p++;
          if(p>=7) return true;
        }
      }
      return false;
    };
    return match(cw)||match(ccw);
  }

  function specialWhiteCounter(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    f.guard=false; f.attack=null; f.attackT=0;
    f.specialType='whiteCounter'; f.specialT=1.15;
    f.counterT=1.15; f.counterReady=true;
    comboEl.textContent='ホワイトカウンター!';
    setTimeout(()=>{if(comboEl.textContent==='ホワイトカウンター!')comboEl.textContent='';},720);
    clearCommand();
    return true;
  }

  function triggerWhiteCounter(f,attacker){
    if(!f || !f.counterReady) return false;
    f.counterReady=false; f.counterT=0;
    f.specialType='whiteCounterHit'; f.specialT=.46;
    f.attack='punch'; f.attackVariant='mid'; f.attackT=.46;
    f.face=attacker && attacker.x<f.x ? -1 : 1;
    if(attacker){
      attacker.stun=Math.max(attacker.stun,.48);
      attacker.attackT=Math.max(attacker.attackT,.48);
      setTimeout(()=>{
        if(gameOver)return;
        damageHit(f,attacker,8.5*f.damageMul,210*f.face,-65,true);
      },105);
    }
    comboEl.textContent='COUNTER!';
    setTimeout(()=>{if(comboEl.textContent==='COUNTER!')comboEl.textContent='';},520);
    return true;
  }

  function armUrielTackle(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    f.tackleArmedT=.8;
    comboEl.textContent='TACKLE READY';
    setTimeout(()=>{if(comboEl.textContent==='TACKLE READY')comboEl.textContent='';},420);
    return true;
  }

  function specialUrielTackle(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    f.guard=false; f.tackleArmedT=0;
    f.specialType='urielTackle'; f.specialT=.96;
    f.attack='punch'; f.attackT=.96; f.tackleHit=false;
    // v4.3: より速く、より長く突進
    f.vx += f.face*560;
    comboEl.textContent='ガーディアンタックル!';
    setTimeout(()=>{if(comboEl.textContent==='ガーディアンタックル!')comboEl.textContent='';},720);
    return true;
  }

  function hasForwardForwardTap(f, windowMs=780){
    const now=performance.now();
    const taps=(input.forwardTapTimes||[]).filter(t=>now-t<=windowMs);
    input.forwardTapTimes=taps;
    return taps.length>=2;
  }

  function specialKawazuTonguePiledriver(f){
    if(gameOver || !f || f.type!=='kawazu' || f.stun>0 || f.specialT>0) return false;
    const other=f.isPlayer?enemy:player;
    if(!other) return false;

    // 一回転＋舌は、まず通常の自動照準舌を伸ばす。ヒット時だけ大技へ。
    if(Math.abs(other.x-f.x)>18) f.face=Math.sign(other.x-f.x)||f.face;
    const aim=tongueAutoAim(f,other);

    f.attack='tongue';
    f.attackT=.34;
    f.tongueT=.34;
    clearCommand();

    if(!aim || !aim.hit){
      return true; // 空振り時は特殊演出へ移らない。
    }

    setTimeout(()=>{
      if(gameOver || !f || !other || other.guard) return;

      f.specialType='kawazuTonguePiledriver';
      f.specialT=1.28;
      f.kawazuPileTarget=other;
      f.stun=Math.max(f.stun,1.0);
      other.stun=Math.max(other.stun,1.25);
      other.attack=null; other.attackT=0;
      other.specialType=null; other.specialT=0;

      const startX=(f.x+other.x)/2;
      const startY=Math.max(90,Math.min(f.y,other.y)-20);
      const floor=landFloorY();
      const started=performance.now();

      comboEl.textContent='SECRET!';
      setTimeout(()=>{if(comboEl.textContent==='SECRET!')comboEl.textContent='';},700);

      const timer=setInterval(()=>{
        if(gameOver || !f || !other){
          clearInterval(timer);
          return;
        }

        const ms=performance.now()-started;

        // 最初に相手を引き寄せ、舌で巻き付ける。
        if(ms<180){
          const q=ms/180;
          other.x=other.x+(startX-other.x)*Math.min(1,.18+q*.20);
          other.y=other.y+(startY-other.y)*Math.min(1,.18+q*.20);
          f.x=f.x+(startX-f.x)*Math.min(1,.15+q*.18);
          f.y=f.y+(startY-f.y)*Math.min(1,.15+q*.18);
          f.vx=f.vy=other.vx=other.vy=0;
          return;
        }

        // 二人とも逆さまになり、相手の頭が少し下になる配置で落下。
        if(ms<760){
          const q=(ms-180)/580;
          const eased=q*q*(3-2*q);
          const cy=startY+(floor-75-startY)*eased;
          f.x=startX-10*f.face;
          other.x=startX+7*f.face;
          f.y=cy-20;       // 小さいカワズさんは少し上。
          other.y=cy+18;   // 相手の頭側が先に床へ到達する。
          f.vx=f.vy=other.vx=other.vy=0;
          f.spinAngle=Math.PI+.10*Math.sin(q*Math.PI*4);
          other.spinAngle=Math.PI-.08*Math.sin(q*Math.PI*4);
          return;
        }

        clearInterval(timer);

        // 相手の頭だけ先に激突。大ダメージ。
        other.x=startX+7*f.face;
        other.y=floor;
        spawnImpact(other.x,other.y,'hit');
        burstWaves.push({x:other.x,y:floor-8,t:.36,life:.36,radius:14,max:88,power:1});
        damageHit(f,other,24.0*f.damageMul,75*f.face,-95);
        other.spinAngle=0;
        other.stun=Math.max(other.stun,.72);

        // カワズさんは小さいので直前に舌をほどき、回転しながら逃げる。
        f.kawazuPileTarget=null;
        f.specialType='kawazuPileEscape';
        f.specialT=.48;
        f.x=startX-32*f.face;
        f.y=Math.max(100,floor-92);
        f.vx=-f.face*170;
        f.vy=-430;
        f.spinAngle=f.face*.8;

        const escapeStart=performance.now();
        const escapeTimer=setInterval(()=>{
          if(!f || gameOver){clearInterval(escapeTimer);return;}
          const e=(performance.now()-escapeStart)/360;
          if(e>=1){
            clearInterval(escapeTimer);
            f.spinAngle=0;
            return;
          }
          f.spinAngle+=f.face*.42;
        },32);
      },16);
    },70);

    return true;
  }

  function specialKawazuPressureRush(f){
    if(gameOver || f.stun>0 || f.specialT>0)return false;
    f.specialType='kawazuPressureRush';f.specialT=.62;f.attack='punch';f.attackT=.62;
    const count=14;
    for(let i=0;i<count;i++){
      const spread=(-.48+Math.random()*.96);
      const speed=390+Math.random()*170;
      kawazuShots.push({
        owner:f,x:f.x+f.face*45,y:f.y+5+(Math.random()-.5)*20,
        vx:f.face*Math.cos(spread)*speed,vy:Math.sin(spread)*speed,
        r:8+Math.random()*4,t:.9,life:.9,hit:false
      });
    }
    comboEl.textContent='水圧ラッシュ!';
    clearCommand();return true;
  }

  function specialKawazuMirageKick(f){
    if(gameOver || f.stun>0 || f.specialT>0)return false;
    const other=f.isPlayer?enemy:player;
    f.specialType='kawazuMirageKick';f.specialT=1.0;f.attack='kick';f.attackT=1.0;
    f.vx=f.face*760;
    const startFace=f.face;
    setTimeout(()=>{
      if(gameOver||!other||f.specialType!=='kawazuMirageKick')return;
      if(Math.hypot(other.x-f.x,other.y-f.y)<other.radius+f.radius+72){
        f.vx=0;other.stun=Math.max(other.stun,.95);
        for(let i=0;i<9;i++){
          setTimeout(()=>{
            if(gameOver||!other)return;
            const a=i*Math.PI*2/9;
            const gx=other.x+Math.cos(a)*72,gy=other.y+Math.sin(a)*54;
            kawazuGhosts.push({x:gx,y:gy,t:.22,life:.22,angle:a});
            spawnImpact(other.x+Math.cos(a)*20,other.y+Math.sin(a)*15,'hit');
            damageHit(f,other,(i===8?2.8:1.05)*f.damageMul,(i===8?190:12)*startFace,(i===8?-55:0));
          },i*62);
        }
      }
    },105);
    comboEl.textContent='ミラージュキック!';
    clearCommand();return true;
  }

  function specialKawazuCyclone(f){
    if(gameOver || f.stun>0 || f.specialT>0)return false;
    const other=f.isPlayer?enemy:player;
    if(!other)return false;
    f.specialType='kawazuCyclone';f.specialT=1.15;f.attack='kick';f.attackT=1.15;
    const dir=f.face;
    other.stun=Math.max(other.stun,1.0);
    for(let i=0;i<14;i++){
      setTimeout(()=>{
        if(gameOver||!other)return;
        const a=i*Math.PI*2/7;
        f.x=Math.max(45,Math.min(innerWidth-45,other.x+Math.cos(a)*64));
        f.y=Math.max(55,Math.min(innerHeight-55,other.y+Math.sin(a)*48));
        kawazuGhosts.push({x:f.x,y:f.y,t:.18,life:.18,angle:a});
        if(Math.hypot(f.x-other.x,f.y-other.y)<100){
          damageHit(f,other,(i===13?3.2:.72)*f.damageMul,(i===13?225:8)*dir,(i===13?-65:0));
        }
      },i*55);
    }
    comboEl.textContent='ハイスピードサイクロン!';
    clearCommand();return true;
  }

  function specialMichaelRedAura(f){
    if(gameOver || !f || f.type!=='green' || f.stun>0 || f.specialT>0) return false;
    f.guard=false; f.specialType='michaelRedAura'; f.specialT=.42;
    f.michaelRedAuraT=3.0; f.michaelPowerReady=true;
    f.hp=Math.min(100,f.hp+3.0);
    if(f.isPlayer)updateHud();
    comboEl.textContent='レッドオーラ!';
    setTimeout(()=>{if(comboEl.textContent==='レッドオーラ!')comboEl.textContent='';},720);
    clearCommand(); return true;
  }

  function consumeMichaelPower(f,kind){
    if(!f || f.type!=='green' || !f.michaelPowerReady)return false;
    f.michaelPowerReady=false; f.michaelBoostAttackT=1.45;
    if(kind==='punch'||kind==='kick'){
      michaelAuraShots.push({
        owner:f,x:f.x+f.face*42,y:f.y+(kind==='punch'?-4:28),
        vx:f.face*(kind==='punch'?520:470),vy:0,
        r:kind==='punch'?11:13,t:.9,life:.9,hit:false
      });
    }
    return true;
  }

  function trySpecial(f,kind){
    if(!f) return false;
    const forward=f.face>0?'right':'left';
    const back=f.face>0?'left':'right';

    // カワズさん：4キャラ運用を前提に入力を短く。
    if(f.type==='kawazu'){
      if(kind==='tongue' && hasCommand(['down',forward],720)){
        clearCommand();
        return specialKawazuTonguePiledriver(f);
      }
      if(kind==='kick' && hasCommand(['down',back],720)){
        clearCommand();
        return specialKawazuCyclone(f);
      }
      if(kind==='kick' && hasCommand([forward],520)){
        clearCommand();
        return specialKawazuMirageKick(f);
      }
      if(kind==='punch' && (input.punchTapTimes||[]).length>=2){
        input.punchTapTimes=[];
        clearCommand();
        return specialKawazuPressureRush(f);
      }
    }

    // ミカエル：上＋パンチ / 前＋キック / 下→後ろ＋キック。
    if(f.type==='green'){
      if(kind==='kick' && hasCommand(['down',back],720)){
        clearCommand();
        return specialBurningCyclone(f);
      }
      if(kind==='punch' && hasCommand(['up'],520)){
        clearCommand();
        return specialUppercut(f);
      }
      if(kind==='kick' && hasCommand([forward],520)){
        clearCommand();
        return specialDropKick(f);
      }
    }

    // ガブリエル：ガード→パンチ＝上水流、ガード→キック＝下水流、後ろ＋パンチ＝ボルテックス。
    if(f.type==='blue'){
      const justGuarded=performance.now()-(input.lastSimpleGuardTapTime||0)<=650;
      if(kind==='punch' && justGuarded){
        input.lastSimpleGuardTapTime=0; clearCommand(); return specialAquaTornado(f);
      }
      if(kind==='kick' && justGuarded){
        input.lastSimpleGuardTapTime=0; clearCommand(); return specialAquaStream(f);
      }
      if(kind==='punch' && hasCommand([back],520)){
        clearCommand(); return specialAquaVortex(f);
      }
    }

    if(f.type==='black'){
      if(kind==='punch' && hasForwardForwardTap(f,780)){
        input.forwardTapTimes=[]; clearCommand(); f.attackT=0; f.attack=null;
        return specialHellCrash(f);
      }
    }

    if(f.type==='piranha'){
      if(!true && kind==='tongue' && hasCommand([back,forward],850)){
        clearCommand(); return specialPiranhaRush(f);
      }
      if(kind==='punch' && hasCommand(['down','up'],900)){ clearCommand(); return specialPiranhaDive(f,'punch'); }
      if(kind==='kick' && hasCommand(['down','up'],900)){ clearCommand(); return specialPiranhaDive(f,'kick'); }
    }

    if(f.type==='crayfish'){
      if(kind==='kick' && hasCommand(['up','down'],850)){ clearCommand(); return specialCrayfishBottomSmash(f); } if(kind==='punch' && hasCommand(['down','up'],850)){ clearCommand(); return specialBelialCeilingWeb(f); }
    }

    // ラファエル：ガード→パンチ / ガード→キック。
    if(f.type==='yellow'){
      // 地上専用：上＋パンチでウィンドライズ。
      if(kind==='punch' && hasCommand(['up'],620)){
        clearCommand();
        return specialRaphaelWindRise(f);
      }
      const justGuarded=performance.now()-(input.lastSimpleGuardTapTime||0)<=650;
      if(justGuarded && (kind==='punch'||kind==='kick')){
        input.lastSimpleGuardTapTime=0;
        clearCommand();
        return specialPressureBlade(f,0,kind);
      }
    }

    if(f.type==='beelzebub'){
      const downForward=f.face>0?'downRight':'downLeft';
      const bossQuarterCommand=
        hasCommand(['down',forward],850)||hasCommand(['down',downForward],850)||hasCommand([downForward,forward],850);
      if(kind==='punch' && bossQuarterCommand) return specialFishRaid(f);
      if(kind==='kick' && bossQuarterCommand) return specialAbyssShock(f);
    }

    return false;
  }

  function registerRapidTap(kind){
    const now=performance.now();
    const key=kind==='punch'?'punchTapTimes':'tongueTapTimes';
    input[key]=(input[key]||[]).filter(t=>now-t<=620);
    input[key].push(now);
    if(input[key].length>=3){
      input[key]=[];
      return true;
    }
    return false;
  }

  function tongueAutoAim(f,target){
    if(!f || !target || !f.tongueRange) return null;

    const mouthX=f.x;
    const mouthY=f.y+8;
    const dx=target.x-mouthX;
    const dy=target.y-mouthY;
    const dist=Math.hypot(dx,dy)||1;

    const horizontalReach=f.tongueRange;
    // 縦方向は横より長め。空中のトンボ／クモにも届きやすくする。
    // ベルゼブブは元の長い基準値415をそのまま使う。
    const verticalReach=f.tongueRange*(f.type==='beelzebub'?1.32:1.45);

    const ux=dx/dist, uy=dy/dist;
    const denom=Math.sqrt(
      (ux*ux)/(horizontalReach*horizontalReach) +
      (uy*uy)/(verticalReach*verticalReach)
    ) || 1/horizontalReach;
    const maxDist=1/denom;
    const drawDist=Math.min(dist,maxDist);

    return {
      dx,dy,dist,maxDist,
      hit:dist<=maxDist+(target.radius||0)*.35,
      endWorldX:mouthX+ux*drawDist,
      endWorldY:mouthY+uy*drawDist,
      verticalReach
    };
  }

  function attack(f, kind) {
    if(basketMiniActive){
      hockeyStrike(f,kind);
    }

    if(gameOver || f.guard) return;
    if(f.type==='green' && f.michaelPowerReady && (kind==='punch'||kind==='kick')){
      consumeMichaelPower(f,kind);
    }
    if(f.webbedT>0){
      f.webMash=(f.webMash||0)+1;
      f.webbedT=Math.max(0,f.webbedT-.13);
      spawnImpact(f.x+(Math.random()-.5)*25,f.y+(Math.random()-.5)*25,'guard');
      return;
    }

    const rapidTriple=(kind==='punch' || kind==='tongue') ? registerRapidTap(kind) : false;
    if(f.type==='piranha' && kind==='tongue' && rapidTriple){
      f.attackT=0; f.attack=null; f.tongueT=0;
      if(specialPiranhaRush(f)){ playSfx('special'); return; }
    }
    // アスモデウスさん：パンチ×3でクローラッシュ
    if(f.type==='crayfish' && kind==='punch' && rapidTriple){
      f.attackT=0;
      f.attack=null;
      if(specialCrayfishRush(f)){ playSfx('special'); return; }
    }


    if(f.type==='purple' && kind==='tongue' && rapidTriple){
      // 1・2回目の通常舌硬直を3回目でキャンセル。
      f.attackT=0;
      f.attack=null;
      f.tongueT=0;
      if(specialRibbonWhip(f)){ playSfx('special'); return; }
    }

    // リリスさん：後ろ＋キック。技中のキック追加入力で回転を追加。
    if(f.type==='purple' && kind==='kick'){
      if(f.specialType==='lilithBackSpin'){
        if(specialLilithBackSpin(f,true)){ playSfx('special'); return; }
      }
      const backHeld=(f.face>0 && input.x<-.35)||(f.face<0 && input.x>.35);
      if(backHeld && specialLilithBackSpin(f,false)){ playSfx('special'); return; }
    }

    // 通常攻撃より先に必殺技コマンドを判定
    if(trySpecial(f,kind)){ playSfx('special'); return; }

    // 舌で引かれている最中だけは、stun中でも舌による投げ抜けを受け付ける。
    const pullerForEscape = f.isPlayer ? enemy : player;
    const canTongueEscape = kind==='tongue' && pullerForEscape &&
      pullerForEscape.tonguePullTarget===f && pullerForEscape.tonguePullTimer>0;

    if(!canTongueEscape && (f.stun>0 || f.attackT>0)) return;

    // アザゼルの通常パンチ／キックは、押している方向へ少し移動しながら攻撃。
    // 上入力なら通常浮遊より速く上昇、斜め入力ならその方向へ滑る。
    if(f.type==='piranha' && (kind==='punch' || kind==='kick')){
      let mx=0,my=0;
      if(f.isPlayer){
        mx=input.x+(keys['d']?1:0)-(keys['a']?1:0);
        my=input.y+(keys['s']?1:0)-(keys['w']?1:0);
      }else{
        const tgt=f.isPlayer?enemy:player;
        if(tgt){
          mx=Math.max(-1,Math.min(1,(tgt.x-f.x)/120));
          my=Math.max(-1,Math.min(1,(tgt.y-f.y)/120));
        }
      }
      const mag=Math.hypot(mx,my);
      if(mag>.20){
        mx/=Math.max(1,mag); my/=Math.max(1,mag);
        const boost=kind==='punch'?235:205;
        f.vx+=mx*boost;
        f.vy+=my*boost;
      }
    }

    // 非カエル種の舌ボタンは、それぞれ固有の近接攻撃に置換
    if(kind==='tongue' && f.type==='piranha'){
      playSfx('tongue');
      f.attack='tongue'; f.attackT=.34; f.vx += f.face*115;
      const other=f.isPlayer?enemy:player;
      setTimeout(()=>{ if(other && Math.hypot(other.x-f.x,other.y-f.y)<88) damageHit(f,other,4.4*f.damageMul,92*f.face,-5); },105);
      return;
    }

    const other = f.isPlayer ? enemy : player;
    const dir=f.face;
    const dist=Math.hypot(other.x-f.x, other.y-f.y);

    // ウリエルさん：ガード長押しで得た白いオーラ中はパンチ/キックのリーチ約3倍。
    if(f.type==='orange' && f.urielAuraT>0 && (kind==='punch'||kind==='kick')){
      f.attack=kind; f.attackVariant='mid'; f.attackT=kind==='punch'?.40:.54;
      f.whiteReachAttack=kind;
      const reach=kind==='punch'?235:285;
      const dmg=kind==='punch'?3.5:6.4;
      const delay=kind==='punch'?120:170;
      if(other && (other.x-f.x)*dir>0 && (other.x-f.x)*dir<reach && Math.abs(other.y-f.y)<82){
        setTimeout(()=>{
          if(!other)return;
          damageHit(f,other,dmg*f.damageMul,(kind==='punch'?85:170)*dir,kind==='punch'?-8:-28);
        },delay);
      }
      setTimeout(()=>{ if(f.whiteReachAttack===kind) f.whiteReachAttack=null; },Math.round((kind==='punch'?.40:.54)*1000));
      return;
    }

    if(f.type==='crayfish' && kind==='punch'){
      f.attack='crayfishHammer'; f.attackT=.42;
      if(dist<100 && Math.abs(other.y-f.y)<72){
        setTimeout(()=>damageHit(f,other,2.6*f.damageMul,85*dir,110),150);
      }
      return;
    }

    if(f.type==='crayfish' && kind==='kick'){
      f.attack='crayfishUpper'; f.attackT=.44;
      if(dist<100 && Math.abs(other.y-f.y)<78){
        setTimeout(()=>damageHit(f,other,4.0*f.damageMul,80*dir,-145),155);
      }
      return;
    }

    if(kind==='punch' || kind==='kick'){
      f.attackVariant=chooseAttackVariant(f,other,kind);
    }

    if(kind==='punch'){
      f.attack='punch';f.attackT=.34;
      const v=f.attackVariant;
      const yAim=v==='up'?-34:0;
      if(dist<88 && Math.abs((other.y-f.y)-yAim)<58){
        const ky=v==='up'?-72:-5;
        setTimeout(()=>damageHit(f,other,2.6*f.damageMul,52*dir,ky),125);
      }
    } else if(kind==='kick'){
      f.attack='kick';f.attackT=.50;
      const v=f.attackVariant;
      const yAim=v==='down'?42:0;
      if(dist<106 && Math.abs((other.y-f.y)-yAim)<72){
        const ky=v==='down'?125:-21;
        setTimeout(()=>damageHit(f,other,5.2*f.damageMul,142*dir,ky),175);
      }
    } else if(kind==='tongue'){
      // ベリアル：舌ボタンは蜘蛛糸ではなく毒液を飛ばす通常攻撃。
      if(f.type==='crayfish'){
        playSfx('tongue');
        f.attack='belialPoisonSpit';
        f.attackT=.34;

        // v2.5: 上空から使うことを前提に、横撃ちより斜め下へ落とす性格を強める。
        // 相手位置へ自動補正するが、最低でもしっかり下向き成分を持たせる。
        const dx=other.x-f.x;
        const dy=other.y-f.y;
        const dist=Math.hypot(dx,dy)||1;

        // 相手方向ベクトル。ただし横成分は少し抑え、下方向を優先。
        let ax=dx/dist;
        let ay=dy/dist;

        // 相手が自分より下なら追尾を強める。ほぼ同高度でも少し下向きにする。
        const downwardBias = dy>35 ? .72 : .48;
        ay = Math.max(downwardBias, ay);

        // 横幅の狭い縦画面なので、横へ流れすぎないよう圧縮。
        ax *= .72;

        const norm=Math.hypot(ax,ay)||1;
        ax/=norm; ay/=norm;

        const speed=445;
        belialPoisonShots.push({
          owner:f,
          x:f.x+f.face*28,
          y:f.y+8,
          vx:ax*speed,
          vy:ay*speed,
          r:12,
          t:1.45,
          life:1.45,
          hit:false
        });
        return;
      }

      // 自分が舌で引き寄せられている最中に舌を押すと「投げ抜け」。
      // お互いの舌が伸びたままになり、投げには移行せず中央へ接近する。
      const puller = f.isPlayer ? enemy : player;
      if(puller && puller.tonguePullTarget===f && puller.tonguePullTimer>0){
        puller.tonguePullTarget=null;
        puller.tonguePullTimer=0;

        f.tongueClashTarget=puller;
        f.tongueClashTimer=.72;
        puller.tongueClashTarget=f;
        puller.tongueClashTimer=.72;

        f.tongueT=.72;
        puller.tongueT=.72;
        f.attack='tongue';
        f.attackT=.24;

        // 互いの速度を一度落とし、中央へじわっと寄る。
        f.vx*=.3; f.vy*=.3;
        puller.vx*=.3; puller.vy*=.3;

        spawnImpact((f.x+puller.x)/2,(f.y+puller.y)/2,'guard');
        return;
      }

      // 引き寄せ中にもう一度舌を押したら「舌投げ」
      if(!f.tongueClashTarget && f.tonguePullTarget && f.tonguePullTimer>0){
        const target=f.tonguePullTarget;
        f.tongueT=.18;
        f.attack='tongue';
        f.attackT=.28;

        // MIX横地上戦：2回目の舌は水中版と同じく前方へ投げる。
        const throwDir = f.face;

        target.throwState=null;
        target.spinAngle=0;

        target.throwState={
          owner:f,
          spinSpeed:f.face*13,
          endT:.78,
          noWallDamage:false,
          tongueSlam:false,
          dropHeight:0
        };
        if(target.type==='crayfish'){
          target.belialThreadGrow=0;
          target.belialThreadReconnectT=.28;
        }
        target.hurtFace='both';
        target.hurtFaceT=.7;

        // 水平方向へ強く投げ、少しだけ浮かせる。
        target.vx = f.face*690 + f.vx*.18;
        target.vy = -70;

        target.stun=.55;
        f.tonguePullTarget=null;
        f.tonguePullTimer=0;
        spawnImpact(target.x,target.y,'hit');
        return;
      }

      // 通常の舌。コンボ中でなくても小ダメージ＋引き寄せ。
      playSfx('tongue');
      f.tongueT=.22;
      f.attack='tongue';
      f.attackT=.3;

      // 対象方向へ自動補正。左右差が大きい時は舌を出す瞬間に向きも合わせる。
      if(Math.abs(other.x-f.x)>18){
        f.face=Math.sign(other.x-f.x)||f.face;
      }

      const tongueAim=tongueAutoAim(f,other);
      if(tongueAim && tongueAim.hit){
        setTimeout(()=>{
          if(!other.guard){
            // まず小ダメージ
            damageHit(f,other,1.8*f.damageMul,0,0);

            // 一定時間、相手を自分へ引き寄せる
            f.tonguePullTarget=other;
            f.tonguePullTimer=.72;
            other.stun=Math.max(other.stun,.18);

            const dx=f.x-other.x;
            const dy=f.y-other.y;
            other.vx += dx*1.8;
            other.vy += dy*1.8;
          } else {
            spawnImpact(other.x,other.y,'guard');
          }
        },70);
      }
    }
  }

  function damageHit(attacker,target,dmg,kx,ky,bypassCounter=false){
    if(attacker&&attacker.type==='green'&&attacker.michaelBoostAttackT>0)damage*=1.35;
    if(target && target.webbedT>0){
      target.webbedT=0; target.webMash=0;
      spawnImpact(target.x,target.y,'guard');
    }
    if(attacker && !attacker.isPlayer && target && target.isPlayer){
      dmg*=difficultyProfile().damage;
    }
    if(gameOver) return;

    // ウリエルさんのカウンター構え：打撃を無効化して白オーラ拳で反撃。
    if(!bypassCounter && target && target.type==='orange' && target.counterReady){
      spawnImpact(target.x,target.y,'guard');
      triggerWhiteCounter(target,attacker);
      return;
    }

    // 防御力。ウリエルさんは約22%軽減。
    dmg /= (target.defense||1);

    // ガード直後の緩めの受付時間ならジャストガード。
    const justGuard = target.guard && target.guardStartT>0;
    target.hit(dmg,kx,ky);
    if(gameMode==='practice' && target===enemy) target.hp=999999;

    if(justGuard){
      attacker.stun=Math.max(attacker.stun,.42);
      attacker.attackT=Math.max(attacker.attackT,.42);
      attacker.vx += -attacker.face*55;
      spawnImpact(attacker.x,attacker.y,'guard');
      comboEl.textContent='JUST GUARD!';
      setTimeout(()=>{
        if(comboEl.textContent==='JUST GUARD!') comboEl.textContent='';
      },520);
    }
    if(attacker.isPlayer && !target.guard){
      comboHits++; comboTimer=1.15;
      comboEl.textContent = comboHits>1 ? `${comboHits} HIT!` : '';
    }
    updateHud();
    if(target.hp<=0) endGame(attacker.isPlayer);
  }

  function endGame(playerWon){
    if(gameMode==='practice' || gameMode==='leafMini' || gameMode==='guardMini') return;

    gameOver=true; running=true;
    playSfx('ko');

    // v6.42: 決着後に負けた側が平然と通常顔へ戻らないよう、
    // 被弾顔をそのまま長時間維持する。
    const defeated=playerWon ? enemy : player;
    if(defeated){
      defeated.hurtFace='both';
      defeated.hurtFaceT=999;
      defeated.stun=Math.max(defeated.stun,1.2);
      defeated.guard=false;
      defeated.attack=null;
      defeated.attackT=0;
      defeated.tongueT=0;
      defeated.specialT=0;
      defeated.specialType=null;
    }

    if(mixBattleMode){
      finishMixBattle(playerWon);
      comboEl.textContent=playerWon?'YOU WIN!':'YOU LOSE';
      return;
    }

    if(gameMode==='story'){
      if(playerWon) storyWins++;
      else storyLosses++;

      if(!playerWon && storyLosses>=4){
        storyFinished=true;
        comboEl.textContent=`GAME OVER　${storyWins}勝 ${storyLosses}敗`;
        restartButton.textContent='キャラ選択へ';
      }else if(storyFightIndex>=storyQueue.length-1){
        storyFinished=true;
        const perfectUnlock=playerWon && storyLosses===0 && selectedFighter!=='beelzebub';
        if(perfectUnlock) unlockBeelzebub();

        if(playerWon){
          const firstKawazu=!isKawazuUnlocked();
          unlockKawazu();
          comboEl.textContent=perfectUnlock
            ? `PERFECT CLEAR!　ベルゼブブさん＆カワズさん解禁!`
            : `STORY CLEAR!　カワズさん解禁!`;
          restartButton.hidden=true;
          showStoryNarrative([
            '激闘の末、ベルゼブブさんは倒れた。\n\n……\n\n田んぼを眺めていた河津一郎は、我に返った。',
            '河津一郎「……俺も、負けちゃいられないな」\n\n一郎は立ち上がった。\n\nそして――\n\n思いきり地面を蹴って、高く跳んだ。\n\nぴょーん。',
            '力強い後ろ脚で、空へ勢いよく跳び上がっていく河津一郎。\n\n河津一郎の小さな緑色の体は、田んぼの上を軽々と舞った。\nその跳躍力は、田んぼのどのカエルにも負けていなかった。',
            '河津一郎――いや、\n\nカワズさん参戦！！'
          ],()=>{restartButton.hidden=false;});
        }else{
          comboEl.textContent=`STORY END　${storyWins}勝 ${storyLosses}敗`;
        }
        restartButton.textContent='キャラ選択へ';
      }else{
        comboEl.textContent=playerWon ? 'YOU WIN!　次の相手へ' : `YOU LOSE　残り猶予 ${3-storyLosses}`;
        restartButton.textContent='次の相手';
      }

      if(storyHud){
        storyHud.textContent=`STORY ${storyFightIndex+1}/${storyQueue.length}　勝${storyWins} 敗${storyLosses}/3`;
      }
      restartButton.hidden=false;
      return;
    }

    comboEl.textContent = playerWon ? 'YOU WIN!' : 'YOU LOSE';
    restartButton.textContent='もう一度';
    restartButton.hidden=false;
    if(titleReturnButton) titleReturnButton.hidden=false;
  }

  function updateHud(){
    playerHpEl.style.width=Math.max(0,Math.min(100,player.hp))+'%';
    enemyHpEl.style.width=((gameMode==='practice'||gameMode==='leafMini')?100:Math.max(0,Math.min(100,enemy.hp)))+'%';
  }

  // Touch stick
  const zone=document.getElementById('stickZone'), base=document.getElementById('stickBase'), knob=document.getElementById('stickKnob');
  let stickId=null;
  function stickMove(t){
    const r=base.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
    let dx=t.clientX-cx,dy=t.clientY-cy;
    const max=r.width*.34, len=Math.hypot(dx,dy)||1, scale=Math.min(1,max/len);
    dx*=scale;dy*=scale;
    input.x=dx/max; input.y=dy/max;
    knob.style.transform=`translate(${dx}px,${dy}px)`;
    checkTouchDash();
  }
  zone.addEventListener('touchstart',e=>{
    const t=e.changedTouches[0];
    stickId=t.identifier;
    input.dashUsedThisTouch=false;
    stickMove(t);
    e.preventDefault();
  },{passive:false});
  zone.addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===stickId)stickMove(t);e.preventDefault()},{passive:false});
  function clearStick(){
    if(player && input.currentDir){
      const forward=player.face>0?'right':'left';
      const forwardUp=player.face>0?'upRight':'upLeft';
      const forwardDown=player.face>0?'downRight':'downLeft';
      if(input.currentDir===forward || input.currentDir===forwardUp || input.currentDir===forwardDown){
        const now=performance.now();
        input.forwardTapTimes=(input.forwardTapTimes||[]).filter(t=>now-t<=800);
        input.forwardTapTimes.push(now);
      }
    }
    if(input.currentDir && !input.dashUsedThisTouch){
      input.lastReleasedDir=input.currentDir;
      input.lastReleasedTime=performance.now();
    }
    stickId=null;
    input.x=input.y=0;
    input.currentDir=null;
    input.dashUsedThisTouch=false;
    knob.style.transform='translate(0,0)';
  }
  zone.addEventListener('touchend',clearStick);zone.addEventListener('touchcancel',clearStick);

  document.querySelectorAll('.action').forEach(btn=>{
    const action=btn.dataset.action;
    const down=e=>{
      e.preventDefault();btn.classList.add('pressed');
      if(action==='guard'){
        if(player){
          // MIX簡易コマンド：ガード入力を共通タイマーで記録。
          const simpleNow=performance.now();
          input.simpleGuardTapTimes=(input.simpleGuardTapTimes||[]).filter(t=>simpleNow-t<=650);
          input.simpleGuardTapTimes.push(simpleNow);
          input.lastSimpleGuardTapTime=simpleNow;

          // ミカエル：下→後ろ＋ガードでレッドオーラ。
          if(player.type==='green' && !player.throwState){
            const back=player.face>0?'left':'right';
            if(hasCommand(['down',back],720)){
              input.simpleGuardTapTimes=[];
              if(specialMichaelRedAura(player)){btn.classList.remove('pressed');return;}
            }
          }

          // ラファエル：上＋ガードで高速バブル移動 / エアブースト。
          if(player.type==='yellow' && !player.throwState && input.y<-.35){
            input.simpleGuardTapTimes=[];
            if(specialRaphaelBubbleMove(player)){
              btn.classList.remove('pressed');
              return;
            }
          }

          // ラファエル：ガード×2でヒーリングバブル。
          if(player.type==='yellow' && !player.throwState && input.simpleGuardTapTimes.length>=2){
            input.simpleGuardTapTimes=[];
            input.lastSimpleGuardTapTime=0;
            if(specialHealingBubble(player)){
              btn.classList.remove('pressed');
              return;
            }
          }

          // ウリエル：ガード×2でホワイトカウンター。
          if(player.type==='orange' && !player.throwState && input.simpleGuardTapTimes.length>=2){
            input.simpleGuardTapTimes=[];
            input.lastSimpleGuardTapTime=0;
            if(specialWhiteCounter(player)){
              btn.classList.remove('pressed');
              return;
            }
          }

          // ベルゼブブさん：方向キー1回転＋ガードで毒水
          if(player.type==='beelzebub' && !player.throwState && hasFullCircle(1100)){
            if(specialVenomWater(player)){
              btn.classList.remove('pressed');
              return;
            }
          }


          // ラファエルさん：地上版は「上＋ガード」で即エアブースト。
          // 縦画面では1回転入力の余裕が少ないため、空中機動を主力として簡略化。
          if(player.type==='yellow' && !player.throwState && input.y<-.35){
            if(specialRaphaelBubbleMove(player)){
              btn.classList.remove('pressed');
              return;
            }
          }

          // ウリエルさん：1回転＋ガードでカウンター構え
          if(false && player.type==='orange' && !player.throwState && hasFullCircle(1000)){
            if(specialWhiteCounter(player)){btn.classList.remove('pressed');return;}
          }

          // ウリエルさん：後ろ→前→ガードだけでガーディアンタックル発動。
          if(player.type==='orange' && !player.throwState){
            const back=player.face>0?'left':'right';
            const forward=player.face>0?'right':'left';
            if(hasCommand([back,forward],820)){
              clearCommand();
              if(specialUrielTackle(player)){
                btn.classList.remove('pressed');
                return;
              }
            }
          }

          // リリスさん：後ろを入れたまま、または直前に後ろ入力してガード×2。
          if(player.type==='purple' && !player.throwState){
            const now=performance.now();

            // 現在のスティック方向も直接見る。
            const backNow =
              (player.face>0 && input.x<-.35) ||
              (player.face<0 && input.x>.35);

            const recentlyBack = now-(input.lastBackInputTime||0) <= 1200;

            if(backNow || recentlyBack){
              if(now-(input.purpleGuardLastTime||0) <= 700){
                input.purpleGuardCount=(input.purpleGuardCount||0)+1;
              }else{
                input.purpleGuardCount=1;
              }
              input.purpleGuardLastTime=now;

              if(input.purpleGuardCount>=2){
                input.purpleGuardCount=0;
                input.purpleGuardLastTime=0;
                input.lastBackInputTime=0;
                clearCommand();

                player.guard=false;
                player.attackT=0;

                if(specialCatfishCharge(player)){
                  btn.classList.remove('pressed');
                  return;
                }
              }
            }else{
              input.purpleGuardCount=0;
            }
          }

          // ウリエルさん：通常ガード長押しの計測開始。
          if(player.type==='orange' && !player.throwState && !player.urielGuardHoldStart){
            player.urielGuardHoldStart=performance.now();
          }

          // 舌投げで回転中は通常ガードではなく「壁受け身入力」。
          // 約0.24秒だけ受け身受付を残す。
          if(player.throwState){
            player.wallTechT=.24;
            return;
          }

          if(player.stun<=0){
            const now=performance.now();
            player.guardTapTimes=player.guardTapTimes.filter(t=>now-t<650);
            player.guardTapTimes.push(now);

            // ガード開始直後 約0.28秒はジャストガード受付。
            player.guard=true;
            player.guardStartT=.28;
            if(guardMiniActive) guardMiniGuardTapTime=performance.now();

            // 650ms以内に3回で水押し波。ダメージは0、吹き飛ばしのみ。
            if(player.guardTapTimes.length>=3){
              player.guardTapTimes=[];
              guardWave(player);
            }
          }
        }
      }
      else if(action==='punch' && player && player.type==='black'){
        const backHeld=(player.face>0 && input.x<-.35) || (player.face<0 && input.x>.35);
        if(backHeld && !player.throwState){
          player.attackT=0; player.attack=null;
          if(startAbyssCharge(player)){btn.dataset.charging='1';return;}
        }
        attack(player,action);
      }
      else if(player) attack(player,action);
    };
    const up=e=>{
      e.preventDefault(); btn.classList.remove('pressed');
      if(action==='punch' && player && btn.dataset.charging==='1'){
        btn.dataset.charging=''; releaseAbyssCharge(player);
      }
      if(action==='guard'&&player){
        player.guard=false;
        if(player.type==='orange' && player.urielGuardHoldStart){
          const held=(performance.now()-player.urielGuardHoldStart)/1000;
          player.urielGuardHoldStart=0;
          // 誤タップでは発動しない。0.55秒以上から、押していた長さ程度を維持（最大4秒）。
          if(held>=.55 && !player.counterReady && player.specialType!=='whiteCounter'){
            player.urielAuraT=Math.min(4.0,held);
            comboEl.textContent='ホワイトオーラ!';
            setTimeout(()=>{if(comboEl.textContent==='ホワイトオーラ!')comboEl.textContent='';},600);
          }
        }
      }
    };
    btn.addEventListener('touchstart',down,{passive:false});btn.addEventListener('touchend',up,{passive:false});btn.addEventListener('touchcancel',up,{passive:false});
    btn.addEventListener('mousedown',down);btn.addEventListener('mouseup',up);btn.addEventListener('mouseleave',up);
  });

  // Keyboard support for desktop testing
  const keys={};
  const keyDashTimes={};
  addEventListener('keydown',e=>{
    const key=e.key.toLowerCase();
    keys[key]=true;
    if(e.repeat)return;

    if(['w','a','s','d'].includes(key)){
      const now=performance.now();
      if(keyDashTimes[key] && now-keyDashTimes[key]<=450){
        const map={w:'up',a:'left',s:'down',d:'right'};
        doDash(map[key]);
        keyDashTimes[key]=0;
      }else{
        keyDashTimes[key]=now;
      }
    }
    if(e.key==='j')attack(player,'punch');
    if(e.key==='k')attack(player,'kick');
    if(e.key==='l')attack(player,'tongue');
    if(e.key==='i'&&player){
      if(player.type==='orange'&&!player.urielGuardHoldStart)player.urielGuardHoldStart=performance.now();
      player.guard=true;
      player.guardStartT=.28;
      if(guardMiniActive) guardMiniGuardTapTime=performance.now();
    }
  });
  addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;if(e.key==='i'&&player)player.guard=false});

  function enemyAI(dt){
    const diff=difficultyProfile();
    if(gameMode==='practice' || gameMode==='raceMini' || gameMode==='basketMini') return;
    if(gameOver)return;

    // CPUも舌で引かれている時は、たまに投げ抜けを狙う。
    if(player && player.tonguePullTarget===enemy && player.tonguePullTimer>0){
      if(Math.random()<dt*3.2*diff.tongue) attack(enemy,'tongue');
      return;
    }

    if(enemy.stun>0)return;
    const dx=player.x-enemy.x,dy=player.y-enemy.y,dist=Math.hypot(dx,dy);
    if(enemy.attackT<=0){
      if(enemy.type==='beelzebub' && enemy.specialT<=0 && enemy.bossSpecialCooldown<=0){
        const roll=Math.random();
        if(roll<dt*.16){ specialVenomWater(enemy); return; }
        if(roll<dt*.34){ specialFishRaid(enemy); return; }
        if(roll<dt*.52){ specialAbyssShock(enemy); return; }
      }

      // 地上CPU。カエルは横追尾＋自動ジャンプ。
      // アザゼル／ベリアルは空中で上下も追尾する。
      if(dist>105){
        enemy.vx += Math.sign(dx)*enemy.speed*1.05*diff.move*dt;
        if(enemy.type==='piranha' || enemy.type==='crayfish'){
          enemy.vy += Math.sign(dy)*enemy.speed*.78*diff.move*dt;
        }
      }
      else if(Math.random()<dt*.8*diff.attack) attack(enemy,Math.random()<.62?'punch':'kick');
      if(enemy.tonguePullTarget && enemy.tonguePullTimer>0 && Math.random()<dt*2.2*diff.attack){
        attack(enemy,'tongue');
      } else if(dist>120&&dist<enemy.tongueRange&&Math.random()<dt*.28*diff.tongue) {
        attack(enemy,'tongue');
      }
      enemy.guard = dist<90 && Math.random()<dt*.25*diff.guard;
    }
  }

  function guardWave(f){
    if(!f || gameOver || f.waveCooldown>0) return;

    f.waveCooldown=1.05;
    f.guard=false;
    f.attack='wave';
    f.attackT=.48;

    const dir=f.face;
    guardWaves.push({
      owner:f,
      x:f.x+dir*34,
      y:f.y+18,
      dir,
      r:18,
      t:.48,
      life:.48,
      hit:false
    });

    // 水を両手で押した反動
    f.vx += -dir*42;
  }

  function spawnImpact(x,y,type){
    const n=type==='guard'?8:16;
    for(let i=0;i<n;i++){
      particles.push({
        x,y,
        vx:(Math.random()-.5)*(type==='guard'?160:240),
        vy:(Math.random()-.5)*(type==='guard'?160:240),
        t:type==='guard'?.32:.42,
        r:2+Math.random()*(type==='guard'?4:6),
        type
      });
    }

    // 当たった瞬間に広がるリングで、ヒットを見やすくする
    hitRings.push({
      x,y,
      r:type==='guard'?12:10,
      max:type==='guard'?42:58,
      t:type==='guard'?.28:.34,
      life:type==='guard'?.28:.34,
      type
    });
  }

  function ensureFighterVisible(f,fallbackX,fallbackY){
    if(!f) return;

    if(!Number.isFinite(f.x) || !Number.isFinite(f.y) ||
       !Number.isFinite(f.vx) || !Number.isFinite(f.vy)){
      f.x=fallbackX;
      f.y=fallbackY;
      f.vx=0;
      f.vy=0;
      f.spinAngle=0;
      f.throwState=null;
    }

    const margin=Math.max(42,(Number.isFinite(f.radius)?f.radius:35)+8);
    f.x=Math.max(margin,Math.min(innerWidth-margin,f.x));
    f.y=Math.max(58,Math.min(innerHeight-58,f.y));
  }

  function separateBattleFighters(a,b){
    // 表示・描画処理とは完全に独立した座標補正だけ。
    if(!a || !b) return;
    if(!Number.isFinite(a.x) || !Number.isFinite(a.y) ||
       !Number.isFinite(b.x) || !Number.isFinite(b.y)) return;

    // 舌投げなど、意図的に重なる演出中は何もしない。
    if(a.throwState || b.throwState) return;

    const ar=Number.isFinite(a.radius) ? a.radius : 35;
    const br=Number.isFinite(b.radius) ? b.radius : 35;

    const dx=b.x-a.x;
    const dy=b.y-a.y;

    // 上下差が大きい場合は水中ですれ違える。
    const verticalLimit=(ar+br)*0.62;
    if(Math.abs(dy)>verticalLimit) return;

    // 横方向の最低距離。見た目より少し柔らかめ。
    const minX=(ar+br)*0.76;
    const absDx=Math.abs(dx);
    if(absDx>=minX) return;

    // 完全に同じXなら、PLAYERを左・RIVALを右に分ける。
    const dir=absDx<0.001 ? 1 : Math.sign(dx);
    const overlap=minX-absDx;

    // 一気に弾かず、1フレームで少しずつ押し分ける。
    const push=Math.min(overlap*.52,8);

    a.x-=dir*push;
    b.x+=dir*push;

    // 互いに突っ込み続けて再び重なるのを少し抑える。
    if(Number.isFinite(a.vx) && Number.isFinite(b.vx)){
      const approaching=(b.vx-a.vx)*dir<0;
      if(approaching){
        a.vx*=.72;
        b.vx*=.72;
      }
    }

    // 画面外へ押し出さない。
    const margin=42;
    a.x=Math.max(margin,Math.min(innerWidth-margin,a.x));
    b.x=Math.max(margin,Math.min(innerWidth-margin,b.x));
  }

  function rotatePoint(x,y,a){
    const ca=Math.cos(a), sa=Math.sin(a);
    return {x:x*ca-y*sa,y:x*sa+y*ca};
  }

  function burningCycloneAngle(f){
    if(!f || f.specialType!=='burningCyclone') return 0;
    const elapsed=(performance.now()-(f.cycloneStartTime||performance.now()))/1000;
    // 右向きは時計回り、左向きは鏡映し
    return elapsed*22*(f.face>0?1:-1);
  }

  function updateNewSpecialMoves(f,dt){
    if(!f) return;

    if(f.specialType==='burningCyclone'){
      const other=f.isPlayer?enemy:player;
      const ang=burningCycloneAngle(f);

      // 突進速度を維持
      if(Math.abs(f.vx)<390) f.vx+=f.face*255*dt;

      if(other){
        const feet=[
          {localX:-17,localY:52,key:'cycloneLastHitA'},
          {localX: 17,localY:52,key:'cycloneLastHitB'}
        ];
        const now=performance.now();

        feet.forEach(foot=>{
          const p=rotatePoint(foot.localX,foot.localY,ang);
          const wx=f.x+p.x, wy=f.y+p.y;
          if(
            Math.hypot(other.x-wx,other.y-wy)<other.radius+25 &&
            now-(f[foot.key]||-9999)>68
          ){
            f[foot.key]=now;
            // 超多段用の小ダメージ
            damageHit(f,other,.72*f.damageMul,18*f.face,-2);
          }
        });
      }
    }

    if(f.specialType==='lilithBackSpin'){
      const other=f.isPlayer?enemy:player;
      const elapsed=(performance.now()-(f.lilithSpinStartTime||performance.now()))/1000;
      const ang=elapsed*18*(f.face>0?-1:1);
      if(other){
        const now=performance.now();
        [{x:-58,y:46,key:'lilithSpinLastHitA'},{x:58,y:46,key:'lilithSpinLastHitB'}].forEach(foot=>{
          const p=rotatePoint(foot.x,foot.y,ang);
          if(Math.hypot(other.x-(f.x+p.x),other.y-(f.y+p.y))<other.radius+22 && now-(f[foot.key]||-9999)>115){
            f[foot.key]=now;
            damageHit(f,other,.82*f.damageMul,-38*f.face,-5);
          }
        });
      }
    }

    if(f.specialType==='raphaelBubbleMove'){
      f.raphaelMoveElapsed=(f.raphaelMoveElapsed||0)+dt;
      const dur=f.raphaelMoveDuration||.82;
      const t=Math.max(0,Math.min(1,f.raphaelMoveElapsed/dur));
      const u=1-t;

      // 2次ベジェ：斜め後ろ上へ膨らみ、前方の上端へぐるっと回り込む
      f.x=
        u*u*f.raphaelMoveStartX+
        2*u*t*f.raphaelMoveControlX+
        t*t*f.raphaelMoveEndX;
      f.y=
        u*u*f.raphaelMoveStartY+
        2*u*t*f.raphaelMoveControlY+
        t*t*f.raphaelMoveEndY;

      f.vx=0;
      f.vy=0;
    }
  }

  function projectileImmuneByBubble(f){
    return !!(f && f.specialType==='raphaelBubbleMove' && f.specialT>0);
  }

function drawBackground(dt){
    const themes=[
      {top:'#8fdcff',mid:'#c9efff',bottom:'#efffd6',floor:'#4d7a38',soil:'#6a4d2f',far:'rgba(68,130,82,.24)'},
      {top:'#ffd58d',mid:'#ffe8bd',bottom:'#e8f1c0',floor:'#62763a',soil:'#705136',far:'rgba(107,121,72,.24)'},
      {top:'#9db4c7',mid:'#c8d5df',bottom:'#e8e3c9',floor:'#59614e',soil:'#554c40',far:'rgba(73,81,77,.25)'},
      {top:'#302341',mid:'#594263',bottom:'#b07674',floor:'#342d32',soil:'#211d22',far:'rgba(41,27,51,.35)'}
    ];
    const th=themes[Math.max(0,Math.min(themes.length-1,stageTheme||0))];

    const grad=ctx.createLinearGradient(0,0,0,innerHeight);
    grad.addColorStop(0,th.top);
    grad.addColorStop(.62,th.mid);
    grad.addColorStop(1,th.bottom);
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,innerWidth,innerHeight);

    // Distant hills make the tall portrait stage read as open air rather than water.
    ctx.fillStyle=th.far;
    ctx.beginPath();
    ctx.moveTo(0,innerHeight-150);
    for(let x=0;x<=innerWidth+80;x+=80){
      ctx.quadraticCurveTo(x+40,innerHeight-220-(x%160)*.15,x+80,innerHeight-150);
    }
    ctx.lineTo(innerWidth,innerHeight);ctx.lineTo(0,innerHeight);ctx.closePath();ctx.fill();

    // Slow clouds; bubbles are deliberately gone in the ground prototype.
    const cloudT=performance.now()/22000;
    ctx.fillStyle='rgba(255,255,255,.34)';
    for(let i=0;i<4;i++){
      const x=((i*170 + cloudT*90)%(innerWidth+240))-120;
      const y=90+i*92;
      ctx.beginPath();
      ctx.ellipse(x,y,55,17,0,0,Math.PI*2);
      ctx.ellipse(x+38,y-9,38,19,0,0,Math.PI*2);
      ctx.ellipse(x+75,y+1,46,15,0,0,Math.PI*2);
      ctx.fill();
    }

    // Compact ground: controls remain inside the soil while preserving more sky.
    // Collision uses landFloorY(), so the frogs stand on the same top edge we draw here.
    const groundTop=landGroundTop();
    ctx.fillStyle=th.floor;
    ctx.fillRect(0,groundTop,innerWidth,16);
    ctx.fillStyle=th.soil;
    ctx.fillRect(0,groundTop+16,innerWidth,innerHeight-groundTop-16);

    ctx.strokeStyle='rgba(42,104,48,.62)';ctx.lineWidth=3;ctx.lineCap='round';
    for(let x=12;x<innerWidth;x+=34){
      ctx.beginPath();ctx.moveTo(x,groundTop);ctx.lineTo(x-4,groundTop-13);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x+5,groundTop);ctx.lineTo(x+10,groundTop-9);ctx.stroke();
    }
  }

  function loop(now){
    requestAnimationFrame(loop);
    if(!screens.game.classList.contains('active')||!player||!enemy)return;
    let dt=Math.min(.033,(now-last)/1000);last=now;
    if(!gameOver){
      let ix=input.x+(keys['d']?1:0)-(keys['a']?1:0);
      const iy=input.y+(keys['s']?1:0)-(keys['w']?1:0);
      if(player.webbedT>0 && (Math.abs(ix)>.35 || Math.abs(iy)>.35)){
        player.webbedT=Math.max(0,player.webbedT-dt*1.45);
      }
      // カエルは上下入力をコマンド専用にするが、
      // アザゼルとベリアルは空中生物なので上下にも自在に移動できる。
      if(player.stun<=0&&!player.guard){
        player.vx += ix*player.speed*dt*2.35;
        if(player.type==='piranha' || player.type==='crayfish'){
          player.vy += iy*player.speed*dt*2.05;
        }
      }
      enemyAI(dt);
      player.update(dt);enemy.update(dt);
      updateNewSpecialMoves(player,dt);
      updateNewSpecialMoves(enemy,dt);

      // v6.5: フリー対戦／ストーリーだけ、上下位置が近い時に横へ押し分ける。
      if(gameMode==='battle' || gameMode==='story'){
        separateBattleFighters(player,enemy);
      }

      ensureFighterVisible(player,innerWidth*.28,innerHeight*.52);
      ensureFighterVisible(enemy,innerWidth*.72,innerHeight*.48);




      // ラファエルさんのエアカッター更新
      if(leafMiniActive){
        leafMiniTime-=dt;
        leafSpawnTimer-=dt;

        if(leafMiniTimeEl) leafMiniTimeEl.textContent=Math.max(0,leafMiniTime).toFixed(1);

        if(leafSpawnTimer<=0 && leafTargets.length<22){
          spawnLeafTarget(Math.floor(Math.random()*5),false);
          leafSpawnTimer=.24+Math.random()*.16;
        }

        leafTargets.forEach(leaf=>{
          leaf.x+=leaf.vx*dt;
          leaf.rot+=leaf.spin*dt;
        });

        leafTargets=leafTargets.filter(leaf=>!leaf.hit && leaf.x>-80);
        checkLeafHits();

        if(leafMiniTime<=0){
          leafMiniTime=0;
          endLeafMiniGame();
        }
      }

      if(guardMiniActive){
        guardMiniTime-=dt; guardSpawnTimer-=dt;
        if(guardMiniTimeEl) guardMiniTimeEl.textContent=Math.max(0,guardMiniTime).toFixed(1);
        const progress=1-Math.max(0,guardMiniTime)/60;
        // 最初の20秒は必ず1体ずつ。以降も最大2体まで。
        const maxTargets=guardMiniTime>40 ? 1 : 2;
        if(guardSpawnTimer<=0 && guardTargets.length<maxTargets){
          spawnGuardTarget();
          // 序盤は約2秒間隔。後半だけ少しずつ短くする。
          guardSpawnTimer=Math.max(.95,2.05-progress*.95)+Math.random()*.35;
        }
        guardTargets.forEach(t=>{
          t.x+=t.vx*dt;
          t.phase+=dt*4;
          // 全て主人公へ向かう。上下移動してもゆっくり追尾する。
          t.targetY=player.y;
          t.y+=(t.targetY-t.y)*Math.min(1,dt*3.2);
          if(t.resolved)return;
          const dx=t.x-player.x, dy=Math.abs(t.y-player.y);
          if(dx<player.radius+t.r+13 && dx>-player.radius-t.r-10 && dy<player.radius+t.r+8){
            t.resolved=true;
            const elapsed=performance.now()-guardMiniGuardTapTime;
            if(player.guard && elapsed>=0 && elapsed<=300){
              guardMiniScore++;
              if(guardMiniScoreEl)guardMiniScoreEl.textContent=String(guardMiniScore);
              comboEl.textContent='JUST GUARD!';
              spawnImpact(player.x+player.face*30,player.y,'guard');
            }else{
              guardMiniMiss++;
              if(guardMiniMissEl)guardMiniMissEl.textContent=String(guardMiniMiss);
              comboEl.textContent='MISS';
              player.hurtFace='both'; player.hurtFaceT=.28;
              spawnImpact(player.x+player.face*24,player.y,'hit');
            }
          }
        });
        guardTargets=guardTargets.filter(t=>!t.resolved && t.x>-80);
        if(guardMiniTime<=0){guardMiniTime=0;endGuardMiniGame();}
      }

      if(leafMiniActive){
        // 保険：葉っぱが0枚になっても必ず次を生成する
        if(leafTargets.length===0){
          for(let i=0;i<5;i++){
            spawnLeafTarget(i,false);
            const t=leafTargets[leafTargets.length-1];
            if(t) t.x=innerWidth+35+i*95;
          }
        }
      }

      // オーラのある拳・脚で水圧カッター／ナマズを打ち消す。
      // ガブリエルさんの長い水流は貫通系なので対象外。
      cancelSoftProjectilesByAura();

      michaelAuraShots.forEach(s=>{
        ctx.save();ctx.globalCompositeOperation='lighter';
        ctx.fillStyle='rgba(255,55,35,.85)';ctx.shadowColor='#ff2a18';ctx.shadowBlur=16;
        ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();ctx.restore();
      });
      aquaVortices.forEach(v=>{
        v.t-=dt;
        v.spin+=dt*8.5;

        cancelSoftProjectilesAtZone({owner:v.owner,x:v.x,y:v.y,r:v.r});

        const target=v.owner && v.owner.isPlayer ? enemy : player;
        if(target){
          const d=Math.hypot(target.x-v.x,target.y-v.y);
          const now=performance.now();
          if(d<target.radius+v.r && now-v.lastHitAt>260){
            v.lastHitAt=now;
            if(projectileImmuneByBubble(target)){
              spawnImpact(target.x,target.y,'guard');
            }else{
              v.owner._projectileHit=true;
              damageHit(v.owner,target,1.15*v.owner.damageMul,26*v.owner.face,-8);
              v.owner._projectileHit=false;
              v.owner.hp=Math.min(100,v.owner.hp+.42);
              if(v.owner.isPlayer)updateHud();
            }
          }
        }
      });
      aquaVortices=aquaVortices.filter(v=>v.t>0);
      michaelAuraShots.forEach(s=>{
        s.t-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
        const target=s.owner&&s.owner.isPlayer?enemy:player;
        if(target&&!s.hit&&Math.hypot(target.x-s.x,target.y-s.y)<target.radius+s.r+8){
          s.hit=true;s.t=0;s.owner._projectileHit=true;
          damageHit(s.owner,target,3.4*s.owner.damageMul,95*s.owner.face,-8);
          s.owner._projectileHit=false;spawnImpact(s.x,s.y,'hit');
        }
      });
      michaelAuraShots=michaelAuraShots.filter(s=>s.t>0&&s.x>-80&&s.x<innerWidth+80);


      toxicWaters.forEach(v=>{
        v.t-=dt;
        const target=v.owner&&v.owner.isPlayer?enemy:player;

        if(!v.landed){
          v.vy+=LAND_GRAVITY*1.05*dt;
          v.x+=v.vx*dt;
          v.y+=v.vy*dt;

          // 空中の毒液そのものにも当たり判定。ガード時は継続毒を付与しない。
          if(target){
            const now=performance.now();
            if(Math.hypot(target.x-v.x,target.y-v.y)<target.radius+v.r+7 && now-(v.airHitAt||0)>650){
              v.airHitAt=now;
              const guarded=target.guard;
              v.owner._projectileHit=true;
              damageHit(v.owner,target,2.0*v.owner.damageMul,22*Math.sign(v.vx||v.owner.face),18);
              v.owner._projectileHit=false;
              if(!guarded) applyPoisonDot(v.owner,target,4,.50);
            }
          }

          const floor=landGroundTop()-8;
          if(v.y>=floor){
            v.y=floor;v.vx=0;v.vy=0;v.landed=true;
            v.r=46;v.tick=0;spawnImpact(v.x,v.y,'hit');
          }
        }else{
          // 地面に残った毒溜まり。触れ続けると周期ダメージ。
          v.tick-=dt;
          if(target&&v.tick<=0&&Math.hypot(target.x-v.x,target.y-v.y)<target.radius+v.r+18){
            v.tick=.48;
            const guarded=target.guard;
            v.owner._projectileHit=true;
            damageHit(v.owner,target,1.45*v.owner.damageMul,0,-12);
            v.owner._projectileHit=false;
            if(!guarded) applyPoisonDot(v.owner,target,2,.38);
          }
        }
      });
      toxicWaters=toxicWaters.filter(v=>v.t>0&&v.x>-100&&v.x<innerWidth+100);

      bossFish.forEach(fish=>{
        fish.t-=dt;
        fish.phase+=dt*7;
        const target=fish.target;
        if(target){
          const dx=target.x-fish.x, dy=target.y-fish.y;
          const d=Math.hypot(dx,dy)||1;
          fish.vx+=(dx/d)*260*dt;
          fish.vy+=(dy/d)*210*dt;
          const sp=Math.hypot(fish.vx,fish.vy)||1;
          const maxSp=235;
          if(sp>maxSp){fish.vx=fish.vx/sp*maxSp;fish.vy=fish.vy/sp*maxSp;}
          fish.x+=fish.vx*dt;
          fish.y+=fish.vy*dt+Math.sin(fish.phase)*6*dt;

          // 相手の攻撃に触れれば小魚は1発で倒せる
          const attacking=target.attackT>0 || target.tongueT>0 || target.specialT>0;
          if(attacking && Math.hypot(target.x-fish.x,target.y-fish.y)<target.radius+72){
            fish.hp=0;
            spawnImpact(fish.x,fish.y,'guard');
          }else if(Math.hypot(target.x-fish.x,target.y-fish.y)<target.radius+fish.r+8){
            fish.hp=0;
            fish.owner._projectileHit=true;
            damageHit(fish.owner,target,1.25*fish.owner.damageMul,45*Math.sign(fish.vx||1),-8);
            fish.owner._projectileHit=false;
          }
        }
      });
      bossFish=bossFish.filter(f=>f.t>0 && f.hp>0);

      abyssShocks.forEach(w=>{
        w.t-=dt;
        w.x+=w.vx*dt;
        w.y+=w.vy*dt;
        w.r+=42*dt;
        const target=w.owner && w.owner.isPlayer ? enemy : player;
        if(!w.hit && target && Math.hypot(target.x-w.x,target.y-w.y)<target.radius+w.r){
          w.hit=true;
          w.owner._projectileHit=true;
          damageHit(w.owner,target,8.5*w.owner.damageMul,190*w.owner.face,-165);
          w.owner._projectileHit=false;
        }
      });
      abyssShocks=abyssShocks.filter(w=>w.t>0 && !w.hit && w.x>-100 && w.x<innerWidth+100);

      if(raceMiniActive){
        raceMiniElapsed=(performance.now()-raceMiniStart)/1000;
        if(raceMiniTimeEl)raceMiniTimeEl.textContent=raceMiniElapsed.toFixed(2);
        const cp=raceCheckpoints[raceCheckpointIndex];
        if(cp && Math.hypot(player.x-cp.x,player.y-cp.y)<cp.r){
          raceCheckpointIndex++;
          if(raceCheckpointIndex>=raceCheckpoints.length){
            endRaceMiniGame();
          }
        }
        // v6.41: リング境界では停止させず、接線方向へ滑らせる。
        // これにより楕円の端（見た目上の「角」）で引っ掛からない。
        {
          const xs=raceCheckpoints.map(p=>p.x), ys=raceCheckpoints.map(p=>p.y);
          const rcx=(Math.min(...xs)+Math.max(...xs))/2, rcy=(Math.min(...ys)+Math.max(...ys))/2;
          const rrx=(Math.max(...xs)-Math.min(...xs))/2, rry=(Math.max(...ys)-Math.min(...ys))/2;
          const laneHalf=48;
          const keepOnRing=(f)=>{
            if(!f)return;
            const dx=f.x-rcx, dy=f.y-rcy;
            const a=Math.atan2(dy/Math.max(1,rry),dx/Math.max(1,rrx));
            const ca=Math.cos(a), sa=Math.sin(a);
            const innerRx=Math.max(24,rrx-laneHalf), innerRy=Math.max(24,rry-laneHalf);
            const outerRx=rrx+laneHalf, outerRy=rry+laneHalf;
            const qInner=(dx*dx)/(innerRx*innerRx)+(dy*dy)/(innerRy*innerRy);
            const qOuter=(dx*dx)/(outerRx*outerRx)+(dy*dy)/(outerRy*outerRy);

            // 楕円の接線ベクトル。境界に当たった時は進行成分をこちらへ残す。
            let tx=-innerRx*sa, ty=innerRy*ca;
            const tl=Math.hypot(tx,ty)||1; tx/=tl; ty/=tl;

            if(qInner<1){
              // 内周に少しだけ余白を持たせ、めり込みを一発で解消
              f.x=rcx+ca*(innerRx+3);
              f.y=rcy+sa*(innerRy+3);
              const tang=f.vx*tx+f.vy*ty;
              const speed=Math.max(1.2,Math.hypot(f.vx,f.vy)*0.92);
              const sign=Math.abs(tang)>.08?Math.sign(tang):1;
              f.vx=tx*speed*sign; f.vy=ty*speed*sign;
            }else if(qOuter>1){
              // 外周でも同様に、壁に止めずコース沿いへ滑らせる
              f.x=rcx+ca*(outerRx-3);
              f.y=rcy+sa*(outerRy-3);
              tx=-outerRx*sa; ty=outerRy*ca;
              const otl=Math.hypot(tx,ty)||1; tx/=otl; ty/=otl;
              const tang=f.vx*tx+f.vy*ty;
              const speed=Math.max(1.2,Math.hypot(f.vx,f.vy)*0.92);
              const sign=Math.abs(tang)>.08?Math.sign(tang):1;
              f.vx=tx*speed*sign; f.vy=ty*speed*sign;
            }
          };
          keepOnRing(player); keepOnRing(enemy);
        }

        // CPUレーサーも同じ楕円を走る。少しだけライン取りに揺らぎを入れる。
        const ecp=raceCheckpoints[raceEnemyCheckpointIndex];
        if(ecp && enemy){
          const dx=ecp.x-enemy.x,dy=ecp.y-enemy.y,d=Math.hypot(dx,dy)||1;
          const cpuSpeed=enemy.speed*.88;
          enemy.vx+=dx/d*cpuSpeed*2.2*dt;
          enemy.vy+=dy/d*cpuSpeed*2.2*dt;
          if(d<ecp.r){
            raceEnemyCheckpointIndex++;
            if(raceEnemyCheckpointIndex>=raceCheckpoints.length){
              raceMiniActive=false;
              comboEl.textContent='レース結果：RIVALの勝ち！';
              comboEl.style.fontSize='clamp(28px,5vw,56px)';
              restartButton.hidden=false;
            }
          }
        }
      }

      if(basketMiniActive){
        basketMiniTime-=dt;
        if(basketTimeEl)basketTimeEl.textContent=Math.max(0,basketMiniTime).toFixed(1);

        // 自陣から出られない：中央線を越えない。
        const mid=innerWidth*.5, margin=player.radius+8;
        player.x=Math.min(player.x,mid-margin);
        enemy.x=Math.max(enemy.x,mid+margin);

        if(basketBall){
          basketBall.owner=null;
          basketBall.vx*=Math.pow(.9985,dt*60);
          basketBall.vy*=Math.pow(.9985,dt*60);
          // 遅くなりすぎない。エアホッケーらしく常に速め。
          let sp=Math.hypot(basketBall.vx,basketBall.vy);
          if(sp<330){
            const ang=sp>20?Math.atan2(basketBall.vy,basketBall.vx):(Math.random()*Math.PI*2);
            basketBall.vx=Math.cos(ang)*330;basketBall.vy=Math.sin(ang)*330;
          }else if(sp>820){
            basketBall.vx*=820/sp;basketBall.vy*=820/sp;
          }
          basketBall.x+=basketBall.vx*dt;
          basketBall.y+=basketBall.vy*dt;

          const goalHalf=Math.max(62,innerHeight*.13);
          const cy=innerHeight*.52;
          // 上下壁
          if(basketBall.y<62+basketBall.r || basketBall.y>innerHeight-48-basketBall.r){
            basketBall.vy*=-1;
            basketBall.y=Math.max(62+basketBall.r,Math.min(innerHeight-48-basketBall.r,basketBall.y));
          }
          // 左右壁。ただしゴール開口部は通過して得点。
          if(basketBall.x<8+basketBall.r){
            if(Math.abs(basketBall.y-cy)<goalHalf){
              basketEnemyScore++;
              if(basketEnemyScoreEl)basketEnemyScoreEl.textContent=String(basketEnemyScore);
              comboEl.textContent='RIVAL SCORE';
              resetBasketBall();
            }else{
              basketBall.vx=Math.abs(basketBall.vx);
              basketBall.x=8+basketBall.r;
            }
          }else if(basketBall.x>innerWidth-8-basketBall.r){
            if(Math.abs(basketBall.y-cy)<goalHalf){
              basketPlayerScore++;
              if(basketPlayerScoreEl)basketPlayerScoreEl.textContent=String(basketPlayerScore);
              comboEl.textContent='SCORE!';
              resetBasketBall();
            }else{
              basketBall.vx=-Math.abs(basketBall.vx);
              basketBall.x=innerWidth-8-basketBall.r;
            }
          }

          // CPUは自陣内でマリモのYに合わせて守り、近ければ打ち返す。
          if(enemy && enemy.stun<=0){
            const tx=Math.max(mid+margin,Math.min(innerWidth*.82,basketBall.x));
            const ty=basketBall.y;
            enemy.vx+=Math.sign(tx-enemy.x)*enemy.speed*.72*dt;
            enemy.vy+=Math.sign(ty-enemy.y)*enemy.speed*.62*dt;
            if(Math.hypot(enemy.x-basketBall.x,enemy.y-basketBall.y)<enemy.radius+92 && Math.random()<dt*8){
              hockeyStrike(enemy,Math.random()<.45?'kick':'punch');
            }
          }
        }

        if(basketMiniTime<=0){basketMiniTime=0;endBasketMiniGame();}
      }

      belialPoisonShots.forEach(p=>{
        p.t-=dt;
        const target=p.owner&&p.owner.isPlayer?enemy:player;

        // 発射後も弱い自動補正。完全追尾ではなく、上下のズレを直す程度。
        if(target && !p.hit){
          const dx=target.x-p.x;
          const dy=target.y-p.y;
          const dist=Math.hypot(dx,dy)||1;
          const desiredX=(dx/dist)*360;
          const desiredY=Math.max(180,(dy/dist)*430);

          const steerX=190*dt;
          const steerY=240*dt;
          p.vx += Math.max(-steerX,Math.min(steerX,desiredX-p.vx));
          p.vy += Math.max(-steerY,Math.min(steerY,desiredY-p.vy));
        }

        p.x+=p.vx*dt;
        p.y+=p.vy*dt;
        p.vy+=LAND_GRAVITY*.18*dt;
        if(!p.hit&&target&&Math.hypot(target.x-p.x,target.y-p.y)<target.radius+p.r){
          p.hit=true;
          const guarded=target.guard;
          p.owner._projectileHit=true;
          damageHit(p.owner,target,1.5*p.owner.damageMul,42*Math.sign(p.vx),18);
          p.owner._projectileHit=false;
          if(!guarded) applyPoisonDot(p.owner,target,3,.38);
        }
      });
      belialPoisonShots=belialPoisonShots.filter(p=>p.t>0&&!p.hit&&p.x>-50&&p.x<innerWidth+50&&p.y>-50&&p.y<innerHeight+60);


      kawazuShots.forEach(p=>{
        p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
        const target=p.owner&&p.owner.isPlayer?enemy:player;
        if(!p.hit&&target&&Math.hypot(target.x-p.x,target.y-p.y)<target.radius+p.r){
          p.hit=true;
          p.owner._projectileHit=true;
          damageHit(p.owner,target,1.15*p.owner.damageMul,30*Math.sign(p.vx),p.vy*.08);
          p.owner._projectileHit=false;
        }
      });
      kawazuShots=kawazuShots.filter(p=>p.t>0&&!p.hit&&p.x>-40&&p.x<innerWidth+40&&p.y>-40&&p.y<innerHeight+40);
      kawazuGhosts.forEach(q=>q.t-=dt);
      kawazuGhosts=kawazuGhosts.filter(q=>q.t>0);

    pressureBlades.forEach(p=>{
        p.t-=dt; p.x+=p.vx*dt; p.y+=(p.vy||0)*dt;
        const target=p.owner && p.owner.isPlayer ? enemy : player;
        if(!p.hit && target){
          const d=Math.hypot(target.x-p.x,target.y-p.y);
          if(d<target.radius+28){
            p.hit=true;
            // ウリエルのカウンター構えは飛び道具を無効化。反撃は発生させない。
            if(projectileImmuneByBubble(target)){
              spawnImpact(p.x,p.y,'guard');
            }else if(target.type==='orange' && target.counterReady){
              spawnImpact(p.x,p.y,'guard');
            }else{
              p.owner._projectileHit=true;
              damageHit(p.owner,target,5.2*p.owner.damageMul,105*p.owner.face,-18);
              p.owner._projectileHit=false;
            }
          }
        }
      });
      pressureBlades=pressureBlades.filter(p=>p.t>0 && !p.hit && p.x>-80 && p.x<innerWidth+80);

      aquaTornadoes.forEach(t=>{
        t.t-=dt;

        // 発生中は持ち主の手元に根元を追従
        const owner=t.owner;
        if(owner){
          const length=Math.max(innerWidth,innerHeight)*1.05;
          const downward=t.direction==='down';
          // 水流は発生後も指定角度を維持する。
          // 下: 水平より8° / 上: 水平より15°
          const dx=owner.face*(downward?.990:.966);
          const dy=downward?.139:-.259;

          t.startX=owner.x+owner.face*(t.source==='foot'?28:35);
          t.startY=owner.y+(t.source==='foot'?42:-6);
          t.endX=t.startX+dx*length;
          t.endY=t.startY+dy*length;
          t.dir=owner.face;
        }

        // 下向き水流が底に当たった場所だけ、軽い土煙を出す。
        // 円を大量生成せず、1つの濁り雲を短時間描くだけなので軽量。
        if(t.direction==='down' && !t.siltSpawned){
          const floorY=innerHeight-35;
          const segDy=t.endY-t.startY;
          if(segDy>0 && t.startY<floorY && t.endY>=floorY){
            const u=(floorY-t.startY)/segDy;
            const floorX=t.startX+(t.endX-t.startX)*u;
            if(floorX>-40 && floorX<innerWidth+40){
              t.siltSpawned=true;
              siltClouds.push({
                x:floorX,
                y:floorY-2,
                t:1.05,
                life:1.05,
                radius:32
              });
            }
          }
        }

        const target=owner && owner.isPlayer ? enemy : player;
        if(!t.hit && target){
          const d=pointToSegmentDistance(
            target.x,target.y,
            t.startX,t.startY,t.endX,t.endY
          );

          // 水流全体が当たり判定
          if(d < target.radius + t.width){
            t.hit=true;
            if(projectileImmuneByBubble(target)){
              spawnImpact(target.x,target.y,'guard');
            }else{
              owner._projectileHit=true;
              damageHit(owner,target,7.0*owner.damageMul,125*owner.face,-125);
              owner._projectileHit=false;
            }
          }
        }
      });
      aquaTornadoes=aquaTornadoes.filter(t=>t.t>0);

      catfishCharges.forEach(n=>{
        n.t-=dt;
        const target=n.target;
        // 急降下中だけ弱く追尾。軌道の主役は「上端→斜め下」の対角線。
        if(target){
          const dx=target.x-n.x, dy=(target.y+28)-n.y;
          const len=Math.hypot(dx,dy)||1;
          const desiredVx=dx/len*560 + n.owner.face*85, desiredVy=Math.max(180,dy/len*420);
          const steer=300*dt;
          n.vx += Math.max(-steer,Math.min(steer,desiredVx-n.vx));
          n.vy += Math.max(-steer,Math.min(steer,desiredVy-n.vy));
        }
        n.x+=n.vx*dt;
        n.y+=(n.vy||360)*dt;
        if(!n.hit && target && Math.hypot(target.x-n.x,target.y-n.y)<target.radius+55){
          n.hit=true;
          if(projectileImmuneByBubble(target)){
            spawnImpact(target.x,target.y,'guard');
          }else{
            n.owner._projectileHit=true;
            damageHit(n.owner,target,7.0*n.owner.damageMul,n.vx*.42,-55);
            n.owner._projectileHit=false;
          }
        }
      });
      catfishCharges=catfishCharges.filter(n=>n.t>0);

    burstWaves.forEach(b=>{b.t-=dt;});
      burstWaves=burstWaves.filter(b=>b.t>0);

    ceilingWebs.forEach(w=>{
        w.t-=dt;
        const target=w.target;
        if(!target)return;
        if(w.phase==='up'){
          w.y-=760*dt;
          w.x+=(w.targetX-w.x)*Math.min(1,dt*7);
          if(w.y<=22){w.y=22;w.phase='drop';w.x=target.x;}
        }else{
          w.x+=(target.x-w.x)*Math.min(1,dt*9);
          w.y+=700*dt;
          if(!w.hit && w.y>=target.y-34){
            w.hit=true;
            target.suspendedT=3.0;
            target.suspendedX=target.x;
            target.suspendedY=Math.max(100,target.y-18);
            target.vx=0;target.vy=0;
            spawnImpact(target.x,target.y,'guard');
          }
        }
      });
      ceilingWebs=ceilingWebs.filter(w=>w.t>0&&!w.hit);

    webTraps.forEach(w=>{
        w.t-=dt; w.x+=w.vx*dt; w.y+=w.vy*dt;
        const target=w.owner.isPlayer?enemy:player;
        if(!w.hit && target && Math.hypot(target.x-w.x,target.y-w.y)<target.radius+w.r){
          w.hit=true; target.webbedT=3.2; target.webMash=0;
          target.attack=null; target.attackT=0; target.specialType=null; target.specialT=0;
          target.vx*=.1; target.vy*=.1; spawnImpact(target.x,target.y,'guard');
        }
        });
        webTraps=webTraps.filter(w=>w.t>0&&!w.hit);


    siltClouds.forEach(s=>{
        s.t-=dt;
        s.radius+=34*dt;
        s.y-=5*dt;
      });
      siltClouds=siltClouds.filter(s=>s.t>0);

    guardWaves.forEach(w=>{
        w.t-=dt;
        w.x += w.dir*285*dt;
        w.r += 42*dt;

        const target=w.owner.isPlayer?enemy:player;
        if(!w.hit && target){
          const dx=target.x-w.x, dy=target.y-w.y;
          if(Math.hypot(dx,dy)<w.r+target.radius){
            w.hit=true;
            // ダメージ無し。水圧だけで押し返す。
            target.vx += w.dir*365;
            target.vy += -38;
            target.stun=Math.max(target.stun,.16);
            spawnImpact(target.x,target.y,'guard');
          }
        }
      });
      guardWaves=guardWaves.filter(w=>w.t>0);

      if(comboTimer>0){comboTimer-=dt;if(comboTimer<=0){comboHits=0;comboEl.textContent=''}}
    } else {
      player.update(dt);enemy.update(dt);
    }

    drawBackground(dt);
    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';

    if(raceMiniActive){
      ctx.save();
      const xs=raceCheckpoints.map(p=>p.x), ys=raceCheckpoints.map(p=>p.y);
      const cx=(Math.min(...xs)+Math.max(...xs))/2, cy=(Math.min(...ys)+Math.max(...ys))/2;
      const rx=(Math.max(...xs)-Math.min(...xs))/2, ry=(Math.max(...ys)-Math.min(...ys))/2;
      ctx.strokeStyle='rgba(255,255,255,.32)';ctx.lineWidth=38;
      ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='rgba(70,225,240,.75)';ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();
      // 中央は通れないことが視覚的にも分かる内周境界
      ctx.fillStyle='rgba(0,72,82,.32)';
      ctx.beginPath();ctx.ellipse(cx,cy,Math.max(20,rx-48),Math.max(20,ry-48),0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.62)';ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(cx,cy,Math.max(20,rx-48),Math.max(20,ry-48),0,0,Math.PI*2);ctx.stroke();
      for(let i=2;i<raceCheckpoints.length;i+=4){
        const p=raceCheckpoints[i], q=raceCheckpoints[Math.min(i+1,raceCheckpoints.length-1)];
        const ang=Math.atan2(q.y-p.y,q.x-p.x);
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ang);
        ctx.fillStyle='rgba(255,242,120,.9)';
        ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-10,-9);ctx.lineTo(-5,0);ctx.lineTo(-10,9);ctx.closePath();ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    if(basketMiniActive){
      ctx.save();
      const mid=innerWidth*.5, cy=innerHeight*.52, gh=Math.max(62,innerHeight*.13);
      // 中央線
      ctx.strokeStyle='rgba(255,255,255,.42)';ctx.lineWidth=3;ctx.setLineDash([10,10]);
      ctx.beginPath();ctx.moveTo(mid,58);ctx.lineTo(mid,innerHeight-48);ctx.stroke();ctx.setLineDash([]);
      // 左右ゴール
      for(const x of [10,innerWidth-10]){
        ctx.strokeStyle='#f7d660';ctx.lineWidth=6;
        ctx.beginPath();ctx.moveTo(x,cy-gh);ctx.lineTo(x,cy+gh);ctx.stroke();
        ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;
        for(let y=cy-gh;y<=cy+gh;y+=14){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(x<mid?28:-28),y);ctx.stroke();}
      }
      ctx.restore();
    }

    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';
    ctx.filter='none';
    ctx.shadowBlur=0;
    ctx.shadowColor='transparent';

    ctx.save();
    player.draw();
    ctx.restore();

    ctx.save();
    enemy.draw();
    ctx.restore();

    // カワズ隠し投げ：舌で相手をぐるぐる巻きにしていることを前面に表示。
    const pileOwner=(player&&player.specialType==='kawazuTonguePiledriver')?player:
                    ((enemy&&enemy.specialType==='kawazuTonguePiledriver')?enemy:null);
    if(pileOwner && pileOwner.kawazuPileTarget){
      const t=pileOwner.kawazuPileTarget;
      ctx.save();
      ctx.strokeStyle='#ff718e';
      ctx.lineWidth=6;
      ctx.lineCap='round';

      // カワズさんの口から相手へ伸びる舌。
      ctx.beginPath();
      ctx.moveTo(pileOwner.x,pileOwner.y+8);
      ctx.lineTo(t.x,t.y);
      ctx.stroke();

      // 相手の胴を3周ほど巻く。
      ctx.lineWidth=5;
      for(let i=-1;i<=1;i++){
        ctx.beginPath();
        ctx.ellipse(t.x,t.y+i*13,Math.max(28,t.radius*.92),15,0,0,Math.PI*2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // WATER HOCKEYのマリモは背景・キャラクターの後に描画。
    // update側で描くと次のdrawBackgroundで消えるため、必ずここで表示する。
    if(basketMiniActive && basketBall){
      ctx.save();
      ctx.globalAlpha=1;
      ctx.globalCompositeOperation='source-over';

      // 水中でも見失いにくいよう少し大きめ＋白い縁取り
      const br=Math.max(18,basketBall.r||15);

      ctx.fillStyle='#4f9d45';
      ctx.strokeStyle='#b9ef9f';
      ctx.lineWidth=4;
      ctx.beginPath();
      ctx.arc(basketBall.x,basketBall.y,br,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle='rgba(30,95,36,.65)';
      ctx.lineWidth=2.5;
      ctx.beginPath();
      ctx.moveTo(basketBall.x-br,basketBall.y);
      ctx.lineTo(basketBall.x+br,basketBall.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(basketBall.x,basketBall.y,br*.58,-Math.PI/2,Math.PI/2);
      ctx.stroke();

      // 小さなハイライト
      ctx.fillStyle='rgba(255,255,255,.72)';
      ctx.beginPath();
      ctx.arc(basketBall.x-br*.35,basketBall.y-br*.35,br*.18,0,Math.PI*2);
      ctx.fill();

      ctx.restore();
    }

    if(leafMiniActive){
      leafTargets.forEach(leaf=>{
        ctx.save();
        ctx.translate(leaf.x,leaf.y);
        ctx.rotate(leaf.rot);
        ctx.fillStyle='#62b453';
        ctx.strokeStyle='#2d7b37';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.ellipse(0,0,leaf.r*1.2,leaf.r*.65,-.25,0,Math.PI*2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle='#d9ee91';
        ctx.beginPath();
        ctx.moveTo(-leaf.r*.9,0);
        ctx.lineTo(leaf.r*.9,0);
        ctx.stroke();
        ctx.restore();
      });
    }

    // 同キャラ対戦時は相手側にRIVALマーク
    if(enemy && enemy.sameCharacter && gameMode==='battle'){
      ctx.save();
      ctx.textAlign='center';
      ctx.font='900 13px sans-serif';
      ctx.fillStyle='#fff5a8';
      ctx.strokeStyle='rgba(35,22,10,.7)';
      ctx.lineWidth=4;
      ctx.strokeText('▼ RIVAL ▼',enemy.x,enemy.y-enemy.radius-25);
      ctx.fillText('▼ RIVAL ▼',enemy.x,enemy.y-enemy.radius-25);
      ctx.restore();
    }

    // JUST GUARD ミニゲームの小魚/水生昆虫は、背景とキャラ描画の後に必ず描く。
    if(guardMiniActive){
      guardTargets.forEach(t=>{
        ctx.save();
        ctx.translate(t.x,t.y);

        if(t.kind==='fish'){
          // 小魚
          ctx.fillStyle='#8fd5cf';
          ctx.beginPath();
          ctx.ellipse(0,0,t.r*1.35,t.r*.72,0,0,Math.PI*2);
          ctx.fill();

          ctx.fillStyle='#6cb5b0';
          ctx.beginPath();
          ctx.moveTo(t.r*.95,0);
          ctx.lineTo(t.r*2.15,-t.r*.8);
          ctx.lineTo(t.r*2.15,t.r*.8);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle='#ffffff';
          ctx.beginPath();
          ctx.arc(-t.r*.45,-3,3,0,Math.PI*2);
          ctx.fill();

          ctx.fillStyle='#17282c';
          ctx.beginPath();
          ctx.arc(-t.r*.45,-3,1.5,0,Math.PI*2);
          ctx.fill();
        }else{
          // 水生昆虫
          ctx.fillStyle='#b8d56f';
          ctx.beginPath();
          ctx.ellipse(0,0,t.r*.85,t.r*.52,0,0,Math.PI*2);
          ctx.fill();

          ctx.strokeStyle='#e3f2ad';
          ctx.lineWidth=2.5;
          ctx.beginPath();
          ctx.moveTo(-t.r*.3,-2); ctx.lineTo(-t.r*1.35,-t.r*.9);
          ctx.moveTo(-t.r*.3, 2); ctx.lineTo(-t.r*1.35, t.r*.9);
          ctx.moveTo( t.r*.3,-2); ctx.lineTo( t.r*1.3,-t.r*.9);
          ctx.moveTo( t.r*.3, 2); ctx.lineTo( t.r*1.3, t.r*.9);
          ctx.stroke();
        }

        ctx.restore();
      });
    }

        // ベリアルの毒液弾：描画フェーズで前面表示。
    belialPoisonShots.forEach(p=>{
      const a=Math.max(.35,Math.min(1,p.t/p.life));
      ctx.save();
      ctx.globalCompositeOperation='source-over';
      ctx.globalAlpha=a;
      ctx.translate(p.x,p.y);

      ctx.fillStyle='#4b0b62';
      ctx.beginPath();ctx.arc(0,0,15,0,Math.PI*2);ctx.fill();

      ctx.fillStyle='#9c32c7';
      ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.fill();

      ctx.fillStyle='#e5a6ff';
      ctx.beginPath();ctx.arc(-3,-4,3.5,0,Math.PI*2);ctx.fill();

      const ang=Math.atan2(p.vy,p.vx);
      ctx.rotate(ang);
      ctx.strokeStyle='rgba(116,27,151,.8)';
      ctx.lineWidth=6;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(-24,0);ctx.stroke();

      ctx.restore();
    });

toxicWaters.forEach(v=>{
      ctx.save();ctx.translate(v.x,v.y);
      if(!v.landed){ctx.fillStyle='rgba(128,35,160,.88)';ctx.beginPath();ctx.ellipse(0,0,v.r*.72,v.r,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(211,93,235,.45)';ctx.beginPath();ctx.arc(-6,-7,v.r*.28,0,Math.PI*2);ctx.fill();}
      else{const a=Math.max(.25,Math.min(1,v.t/1.2));ctx.globalAlpha=a;ctx.fillStyle='rgba(111,24,139,.72)';ctx.beginPath();ctx.ellipse(0,3,v.r*1.25,v.r*.35,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.22*a;ctx.fillStyle='#c94be7';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc((i-2)*13,-8-(i%2)*8,10+i%2*4,0,Math.PI*2);ctx.fill();}}
      ctx.restore();
    });

    bossFish.forEach(fish=>{
      ctx.save();ctx.translate(fish.x,fish.y);if(fish.vx<0)ctx.scale(-1,1);
      ctx.fillStyle='rgba(225,245,255,.72)';ctx.beginPath();ctx.ellipse(-5,-9,9,5,-.45,0,Math.PI*2);ctx.ellipse(-5,9,9,5,.45,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f2c230';ctx.beginPath();ctx.ellipse(0,0,fish.r*1.15,fish.r*.72,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#332b20';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-4,-fish.r*.6);ctx.lineTo(-4,fish.r*.6);ctx.moveTo(5,-fish.r*.55);ctx.lineTo(5,fish.r*.55);ctx.stroke();ctx.fillStyle='#332b20';ctx.beginPath();ctx.moveTo(-fish.r*1.05,0);ctx.lineTo(-fish.r*1.55,-4);ctx.lineTo(-fish.r*1.55,4);ctx.closePath();ctx.fill();ctx.restore();
    });

    abyssShocks.forEach(w=>{
      const a=Math.max(0,w.t/w.life);
      ctx.save();
      ctx.translate(w.x,w.y);
      // 衝撃波の進行方向に合わせて左右反転。
      // 右向き時は従来の形、左向き時は鏡映し。
      if(w.vx<0) ctx.scale(-1,1);
      ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.55*a;
      ctx.strokeStyle='#d9ff8a';
      ctx.lineWidth=16;
      ctx.beginPath();
      ctx.arc(0,0,w.r,-1.08,1.08);
      ctx.stroke();
      ctx.globalAlpha=.28*a;
      ctx.strokeStyle='#8fff2c';
      ctx.lineWidth=34;
      ctx.beginPath();
      ctx.arc(0,0,w.r*.84,-1.12,1.12);
      ctx.stroke();
      ctx.restore();
    });

    // ガブリエルさん：その場に残る小型渦
    aquaVortices.forEach(v=>{
      const a=Math.max(0,v.t/v.life);
      ctx.save();
      ctx.translate(v.x,v.y);
      ctx.rotate(v.spin);
      ctx.globalCompositeOperation='lighter';

      for(let i=0;i<3;i++){
        ctx.globalAlpha=(.44-i*.08)*Math.min(1,a*1.8);
        ctx.strokeStyle=i===0?'#e7ffff':(i===1?'#7ee5ff':'#37bee8');
        ctx.lineWidth=6-i*1.2;
        ctx.beginPath();
        ctx.arc(0,0,v.r-i*8,.20*Math.PI,1.78*Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    });

    // ラファエルさん：控えめな三日月型の水圧カッター
    // 描画順だけは修正版のまま。見た目は最初の予定に近くする。
    kawazuGhosts.forEach(q=>{
      const a=Math.max(0,q.t/q.life);
      ctx.save();
      ctx.translate(q.x,q.y);
      ctx.globalAlpha=.28*a;
      ctx.fillStyle='#63d968';
      ctx.beginPath();
      ctx.ellipse(0,4,23,27,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#ff7138';
      ctx.beginPath();
      ctx.arc(-13,-20,10,0,Math.PI*2);
      ctx.arc(13,-20,10,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    });

    kawazuShots.forEach(p=>{
      const a=Math.max(0,p.t/p.life);
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.72*a;
      ctx.fillStyle='#c8f7ff';
      ctx.beginPath();
      ctx.arc(0,0,p.r,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=.35*a;
      ctx.strokeStyle='#6ee7ff';
      ctx.lineWidth=5;
      ctx.beginPath();
      ctx.arc(0,0,p.r+5,0,Math.PI*2);
      ctx.stroke();
      ctx.restore();
    });

    pressureBlades.forEach(p=>{
      const a=Math.max(0,p.t/p.life);

      ctx.save();
      ctx.translate(p.x,p.y);
      if(p.vx<0) ctx.scale(-1,1);
      ctx.rotate(Math.atan2(p.vy||0,Math.abs(p.vx||1)));

      ctx.globalCompositeOperation='lighter';

      // 薄い水色の三日月
      ctx.globalAlpha=.34*a;
      ctx.strokeStyle='#77e8ff';
      ctx.lineWidth=15;
      ctx.lineCap='round';
      ctx.beginPath();
      ctx.arc(0,0,28,-1.05,1.05);
      ctx.stroke();

      // 中心の細い白い水圧線
      ctx.globalAlpha=.62*a;
      ctx.strokeStyle='#d8fbff';
      ctx.lineWidth=5;
      ctx.beginPath();
      ctx.arc(0,0,27,-1.03,1.03);
      ctx.stroke();

      // 内側に少しだけ青
      ctx.globalAlpha=.38*a;
      ctx.strokeStyle='#69d9ff';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.arc(-2,0,22,-1.0,1.0);
      ctx.stroke();

      // 後ろに小さな泡を少量
      ctx.globalAlpha=.42*a;
      ctx.fillStyle='#dffcff';

      ctx.beginPath();
      ctx.arc(-26,-9,3,0,Math.PI*2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-35,7,2.5,0,Math.PI*2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-44,-3,2,0,Math.PI*2);
      ctx.fill();

      ctx.restore();
    });

    burstWaves.forEach(b=>{
      const a=Math.max(0,b.t/b.life);
      const progress=1-a;
      const rr=b.radius+(b.max-b.radius)*progress;
      ctx.save();ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.58*a;ctx.strokeStyle='#ff3447';ctx.lineWidth=8;ctx.beginPath();ctx.arc(b.x,b.y,rr,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.28*a;ctx.strokeStyle='#ff9a59';ctx.lineWidth=18;ctx.beginPath();ctx.arc(b.x,b.y,rr*.72,0,Math.PI*2);ctx.stroke();
      ctx.restore();
    });

    // リリスさんの召喚：カマと羽根を広げた縦長カマキリが上空から急降下。
    catfishCharges.forEach(n=>{
      ctx.save();ctx.translate(n.x,n.y);
      const diveAngle=Math.atan2(n.vy||1,n.vx||0)-Math.PI/2;
      ctx.rotate(diveAngle);
      // 半透明の左右の羽根
      ctx.fillStyle='rgba(205,245,170,.58)';
      ctx.beginPath();ctx.ellipse(-22,-6,18,43,-.38,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(22,-6,18,43,.38,0,Math.PI*2);ctx.fill();
      // 縦長の胴体
      ctx.fillStyle='#76a936';ctx.beginPath();ctx.ellipse(0,12,13,47,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#8fc748';ctx.beginPath();ctx.ellipse(0,-35,18,17,0,0,Math.PI*2);ctx.fill();
      // 大きく左右へ開いた鎌
      ctx.strokeStyle='#5f922c';ctx.lineWidth=8;ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(-8,-25);ctx.lineTo(-37,-53);ctx.lineTo(-54,-35);
      ctx.moveTo(8,-25);ctx.lineTo(37,-53);ctx.lineTo(54,-35);
      ctx.stroke();
      // 脚も縦シルエットを崩さない程度に展開
      ctx.strokeStyle='#4b7d2a';ctx.lineWidth=5;
      ctx.beginPath();
      ctx.moveTo(-8,4);ctx.lineTo(-31,23);ctx.lineTo(-39,42);
      ctx.moveTo(8,4);ctx.lineTo(31,23);ctx.lineTo(39,42);
      ctx.moveTo(-7,25);ctx.lineTo(-25,48);
      ctx.moveTo(7,25);ctx.lineTo(25,48);
      ctx.stroke();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-7,-39,4.5,0,Math.PI*2);ctx.arc(7,-39,4.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#111';ctx.beginPath();ctx.arc(-7,-40,2.2,0,Math.PI*2);ctx.arc(7,-40,2.2,0,Math.PI*2);ctx.fill();
      ctx.restore();
    });

    // 水底の土煙も描画フェーズへ移動
    ceilingWebs.forEach(w=>{
      ctx.save();ctx.strokeStyle='rgba(250,253,250,.96)';ctx.lineWidth=3;ctx.beginPath();
      if(w.phase==='up'){ctx.moveTo(w.owner.x,w.owner.y-12);ctx.lineTo(w.x,w.y);}
      else{ctx.moveTo(w.x,0);ctx.lineTo(w.x,w.y);}
      ctx.stroke();ctx.restore();
    });
    [player,enemy].forEach(f=>{
      if(!f||f.suspendedT<=0)return;
      ctx.save();ctx.strokeStyle='rgba(250,253,250,.96)';ctx.lineWidth=3.5;
      ctx.beginPath();ctx.moveTo(f.x,0);ctx.lineTo(f.x,f.y-32);ctx.stroke();
      ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(f.x,f.y,42,30,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    });

    webTraps.forEach(w=>{
      ctx.save();ctx.translate(w.x,w.y);ctx.strokeStyle='rgba(248,252,248,.95)';ctx.lineWidth=2;
      for(let r=7;r<=28;r+=7){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();}
      for(let a=0;a<Math.PI*2;a+=Math.PI/4){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*30,Math.sin(a)*30);ctx.stroke();}
      ctx.restore();
    });
    [player,enemy].forEach(f=>{
      if(!f||f.webbedT<=0)return;
      ctx.save();ctx.translate(f.x,f.y);ctx.strokeStyle='rgba(250,253,250,.94)';ctx.lineWidth=3;
      for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(-48,i*13);ctx.quadraticCurveTo(0,i*9+(i%2?12:-12),48,i*13);ctx.stroke();}
      for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*18,-52);ctx.quadraticCurveTo(i*10+(i%2?10:-10),0,i*18,52);ctx.stroke();}
      ctx.restore();
    });

    siltClouds.forEach(s=>{
      const a=Math.max(0,s.t/s.life);
      ctx.save();
      ctx.globalAlpha=(s.mega ? .76 : .42)*a;
      ctx.fillStyle=s.mega ? '#674323' : '#8a6848';
      ctx.beginPath();
      ctx.ellipse(s.x,s.y-4,s.radius*(s.mega?1.75:1.45),s.radius*(s.mega?.82:.58),0,0,Math.PI*2);
      ctx.fill();

      ctx.globalAlpha=(s.mega ? .48 : .22)*a;
      ctx.fillStyle=s.mega ? '#9a6938' : '#b08a62';
      ctx.beginPath();
      ctx.ellipse(s.x-10,s.y-12,s.radius*.75,s.radius*.42,-.25,0,Math.PI*2);
      ctx.ellipse(s.x+12,s.y-9,s.radius*.65,s.radius*.36,.2,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    });

    aquaTornadoes.forEach(t=>{
      const alpha=Math.max(0,t.t/t.life);
      const x1=t.startX, y1=t.startY, x2=t.endX, y2=t.endY;
      const dx=x2-x1, dy=y2-y1;
      const len=Math.hypot(dx,dy) || 1;
      const nx=-dy/len, ny=dx/len;

      ctx.save();
      ctx.globalCompositeOperation='lighter';

      // 中心の太い水流
      ctx.globalAlpha=.25*alpha;
      ctx.strokeStyle='#77e8ff';
      ctx.lineWidth=30;
      ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();

      // 竜巻らしい螺旋ライン
      for(let s=0;s<3;s++){
        ctx.globalAlpha=(.55-.12*s)*alpha;
        ctx.strokeStyle=s===0?'#d8fbff':(s===1?'#69d9ff':'#239eea');
        ctx.lineWidth=5-s;
        ctx.beginPath();

        const steps=28;
        for(let i=0;i<=steps;i++){
          const u=i/steps;
          const baseX=x1+dx*u;
          const baseY=y1+dy*u;
          const wave=Math.sin(u*Math.PI*8 + performance.now()/110 + s*2.1);
          const amp=10+u*16;
          const px=baseX+nx*wave*amp;
          const py=baseY+ny*wave*amp;
          if(i===0) ctx.moveTo(px,py);
          else ctx.lineTo(px,py);
        }
        ctx.stroke();
      }

      // 小さな泡
      for(let i=0;i<8;i++){
        const u=((performance.now()/900)+(i/8))%1;
        const bx=x1+dx*u+nx*Math.sin(i*2.2)*14;
        const by=y1+dy*u+ny*Math.sin(i*2.2)*14;
        ctx.globalAlpha=.48*alpha;
        ctx.fillStyle='#dffcff';
        ctx.beginPath();
        ctx.arc(bx,by,2.5+(i%3),0,Math.PI*2);
        ctx.fill();
      }

      ctx.restore();
    });

    guardWaves.forEach(w=>{
      const a=Math.max(0,w.t/w.life);
      ctx.save();
      ctx.globalAlpha=a*.72;
      ctx.strokeStyle='#d9f8ff';
      ctx.lineWidth=7;
      ctx.lineCap='round';

      // 進行方向へ膨らむ短い水の波
      ctx.beginPath();
      if(w.dir>0){
        ctx.arc(w.x,w.y,w.r,-1.05,1.05);
      }else{
        ctx.arc(w.x,w.y,w.r,Math.PI-1.05,Math.PI+1.05);
      }
      ctx.stroke();

      ctx.globalAlpha=a*.42;
      ctx.lineWidth=3;
      ctx.beginPath();
      if(w.dir>0){
        ctx.arc(w.x-w.dir*8,w.y,w.r+10,-.9,.9);
      }else{
        ctx.arc(w.x-w.dir*8,w.y,w.r+10,Math.PI-.9,Math.PI+.9);
      }
      ctx.stroke();
      ctx.restore();
    });

    particles.forEach(p=>{p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.92;p.vy*=.92;
      ctx.globalAlpha=Math.max(0,p.t/.42);ctx.fillStyle=p.type==='guard'?'#d9f5ff':'#fff3a3';
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    });
    particles=particles.filter(p=>p.t>0);

    hitRings.forEach(r=>{
      r.t-=dt;
      const p=1-Math.max(0,r.t)/r.life;
      const radius=r.r+(r.max-r.r)*p;
      ctx.globalAlpha=Math.max(0,r.t/r.life);
      ctx.strokeStyle=r.type==='guard'?'#d9f5ff':'#fff7b0';
      ctx.lineWidth=r.type==='guard'?4:6;
      ctx.beginPath();
      ctx.arc(r.x,r.y,radius,0,Math.PI*2);
      ctx.stroke();
      ctx.globalAlpha=1;
    });
    hitRings=hitRings.filter(r=>r.t>0);
  }

  resize();
  requestAnimationFrame(loop);

  // MIXタイトルの「地上/水中バトル練習」から直接開始。
  if(mixPracticeMode){
    setTimeout(()=>{
      selectedFighter=['green','blue','yellow','orange'].includes(mixPracticeFighter)?mixPracticeFighter:'green';
      show('game');resize();startPractice();
      if(practiceExitButton){
        practiceExitButton.hidden=false;
        practiceExitButton.textContent='MIXタイトルへ戻る';
      }
    },80);
  }

  // MIXから呼ばれた場合はキャラ選択を飛ばして遭遇戦を開始。
  if(mixBattleMode && mixBattleContext){
    setTimeout(()=>{
      const attackerIsKawazu=String(mixBattleContext.attacker||'').startsWith('k');
      mixBattleContext.playerRole=attackerIsKawazu?'attacker':'defender';
      const pType=mixTypeFor(attackerIsKawazu?mixBattleContext.attackerType:mixBattleContext.defenderType);
      const eType=mixTypeFor(attackerIsKawazu?mixBattleContext.defenderType:mixBattleContext.attackerType);
      selectedFighter=pType||'green';
      selectedOpponent=eType||'black';
      show('game');resize();startGame('free',selectedOpponent);
      if(player)player.hp=Math.max(1,attackerIsKawazu?mixBattleContext.attackerHp:mixBattleContext.defenderHp);
      if(enemy)enemy.hp=Math.max(1,attackerIsKawazu?mixBattleContext.defenderHp:mixBattleContext.attackerHp);
      updateHud();
      if(practiceExitButton)practiceExitButton.hidden=true;
      if(mixMapReturn)mixMapReturn.style.display='none';
    },80);
  }
})();
