import { ACADEMY_MODULES, ECOSYSTEM_DISTRICTS } from '../content/academy';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root missing');

type Screen = 'home' | 'race' | 'academy' | 'market' | 'explorer';
let screen: Screen = 'home';
let lessonIndex = 0;
let completed = new Set<string>(JSON.parse(localStorage.getItem('nc-lessons') || '[]'));
let credits = Number(localStorage.getItem('nc-credits') || 120);
let day = 1;
let speed = 0;
let distance = 0;
let boost = 100;
let running = false;
let frame = 0;
const keys = new Set<string>();
let last = 0;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

function save() {
  localStorage.setItem('nc-lessons', JSON.stringify([...completed]));
  localStorage.setItem('nc-credits', String(credits));
}
function nav(next: Screen) { screen = next; running = next === 'race'; render(); }
function render() {
  const lesson = ACADEMY_MODULES[lessonIndex]!;
  root!.innerHTML = `
    <div class="shell">
      <aside class="rail">
        <a class="brand" data-go="home"><span class="mark">N</span><span><b>NEAR CIRCUIT</b><small>RACE / DISCOVER / LEARN</small></span></a>
        <div class="rail-label">CHAMPIONSHIP</div>
        <button data-go="home" class="${screen==='home'?'active':''}">⌂ <span>Paddock</span></button>
        <button data-go="race" class="${screen==='race'?'active':''}">↗ <span>Race circuits</span></button>
        <div class="rail-label">DISCOVER NEAR</div>
        <button data-go="academy" class="${screen==='academy'?'active':''}">✳ <span>NEAR Academy</span><em>${completed.size}/8</em></button>
        <button data-go="explorer" class="${screen==='explorer'?'active':''}>◎ <span>Ecosystem City</span></button>
        <button data-go="market" class="${screen==='market'?'active':''}">↔ <span>Agent market</span></button>
        <div class="rail-foot"><small>ROOKIE DRIVER</small><b>Level 01</b><small>LOCAL DEMO · NO REAL-VALUE REWARDS</small></div>
      </aside>
      <main>
        <header><span><i></i> SEASON 01 / TEST TRACKS OPEN</span><strong>◈ ${credits} CR</strong></header>
        <section class="page">
          ${screen==='home'?home():''}
          ${screen==='race'?raceView():''}
          ${screen==='academy'?academy(lesson):''}
          ${screen==='market'?market():''}
          ${screen==='explorer'?explorer():''}
        </section>
        <footer>NEAR CIRCUIT <b>BUILD 0.1.0</b><span>AN EDUCATIONAL RACING ADVENTURE</span><span>TEST ENVIRONMENT</span></footer>
      </main>
    </div>`;
  root!.querySelectorAll<HTMLElement>('[data-go]').forEach(el=>el.addEventListener('click',()=>nav(el.dataset.go as Screen)));
  root!.querySelectorAll<HTMLElement>('[data-lesson]').forEach(el=>el.addEventListener('click',()=>{lessonIndex=Number(el.dataset.lesson);render();}));
  root!.querySelectorAll<HTMLElement>('[data-answer]').forEach(el=>el.addEventListener('click',()=>answer(Number(el.dataset.answer))));
  root!.querySelector('[data-action="start"]')?.addEventListener('click',()=>nav('race'));
  root!.querySelector('[data-action="next"]')?.addEventListener('click',()=>{lessonIndex=(lessonIndex+1)%ACADEMY_MODULES.length;render();});
  root!.querySelector('[data-action="buy"]')?.addEventListener('click',()=>{if(credits>=32){credits-=32;save();render();}});
  if(screen==='race') setupRace();
}
function home(){return `
  <div class="eyebrow">YOUR CHAMPIONSHIP STARTS HERE · SEASON 01</div>
  <div class="hero"><div><p class="eyebrow lime">THE ROAD IS YOUR CLASSROOM</p><h1>Race the road.<br><span>Understand the network.</span></h1><p class="lede">A side-scrolling racing adventure that teaches you blockchain, NEAR Protocol and the people building on it. No crypto experience needed.</p><button class="primary" data-action="start">ENTER THE CIRCUIT ↗</button><button class="secondary" data-go="academy">START LEARNING</button><div class="stats"><div><b>02</b><small>RACE CIRCUITS</small></div><div><b>08</b><small>ACADEMY MISSIONS</small></div><div><b>03</b><small>MARKET AGENTS</small></div></div></div><div class="hero-art"><img src="/assets/rally-buggy.svg" alt="NEAR Circuit rally buggy"><div class="track-label">NC-01 / RALLY BUGGY</div></div></div>
  <div class="section-head"><div><p class="eyebrow">YOUR NEXT MILESTONE</p><h2>Learn by doing.</h2></div><button class="text-btn" data-go="academy">OPEN ACADEMY ↗</button></div>
  <div class="cards"><article><span class="number">01 / RACE</span><h3>Take the first turn</h3><p>Drive across two circuits. Jump ramps, collect signal fragments and learn the controls.</p><button data-go="race">Choose a circuit ↗</button></article><article><span class="number">02 / DISCOVER</span><h3>Understand NEAR</h3><p>Eight beginner-friendly lessons. Each has an interactive experiment and a knowledge check.</p><button data-go="academy">Enter the Academy ↗</button></article><article><span class="number">03 / ECONOMY</span><h3>Meet the merchants</h3><p>Compare independent garages whose prices respond to inventory and demand.</p><button data-go="market">Visit the market ↗</button></article></div>`;}
function raceView(){return `<div class="eyebrow">CHAMPIONSHIP / GENESIS RIDGE</div><div class="section-head"><div><h1>Genesis Ridge</h1><p class="lede">Hold D or → to accelerate. Use W/S to lean and Space to boost.</p></div><button class="secondary" data-go="home">← BACK TO PADDOCK</button></div><div class="race-hud"><span>SPEED <b id="speed">000</b> KM/H</span><span>DISTANCE <b id="distance">0</b> M</span><span>BOOST <b id="boost">100</b>%</span></div><canvas id="race" width="960" height="440"></canvas><div class="race-bottom"><span id="race-state">READY WHEN YOU ARE</span><button class="primary" id="restart">RESTART RACE</button></div><div class="touch"><button data-key="ArrowLeft">BRAKE</button><button data-key="ArrowUp">LEAN</button><button data-key="ArrowRight">GAS</button><button data-key=" ">BOOST</button></div>`;}
function academy(lesson){return `<div class="eyebrow">NEAR ACADEMY / YOUR LEARNING CAMPAIGN</div><div class="section-head"><div><h1>Learn how <span>NEAR works.</span></h1><p class="lede">Start from zero. Discover the network one mission at a time.</p></div><div class="progress"><b>${completed.size}/8</b><small>MISSIONS COMPLETE</small></div></div><div class="academy-layout"><aside class="lesson-list">${ACADEMY_MODULES.map((m,i)=>`<button data-lesson="${i}" class="${i===lessonIndex?'selected':''}"><small>${m.number} / ${completed.has(m.id)?'COMPLETE':'MISSION'}</small><b>${m.title}</b></button>`).join('')}</aside><article class="lesson"><div class="eyebrow lime">${lesson.eyebrow} · ${lesson.duration}</div><h2>${lesson.title}</h2><p class="lede">${lesson.summary}</p><h3>What you will understand</h3><ul>${lesson.learningPoints.map(p=>`<li>${p}</li>`).join('')}</ul><div class="experiment"><small>INTERACTIVE EXPERIMENT</small><h3>${lesson.demoTitle}</h3><p>${lesson.demoDescription}</p><div class="demo-panel"><div class="demo-nodes"><i>●</i><i>●</i><i>●</i><i>●</i></div><b id="demo-status">Ready to explore</b><button class="primary" id="demo-run">RUN EXPERIMENT</button></div><small class="muted">This is a teaching simulation unless explicitly marked as a live NEAR transaction.</small></div><div class="quiz"><div class="eyebrow">MASTERY CHECK</div><h3>${lesson.quiz.question}</h3><div class="answers">${lesson.quiz.options.map((o,i)=>`<button data-answer="${i}">${o}</button>`).join('')}</div><p id="feedback"></p><a href="${lesson.sourceUrl}" target="_blank" rel="noreferrer">Read the official source: ${lesson.sourceLabel} ↗</a></div><button class="secondary" data-action="next">NEXT MISSION →</button></article></div>`;}
function answer(choice:number){const m=ACADEMY_MODULES[lessonIndex]!;const feedback=root!.querySelector<HTMLElement>('#feedback')!;if(choice===m.quiz.answer){completed.add(m.id);save();feedback.textContent='Correct. '+m.quiz.explanation;feedback.className='correct';}else{feedback.textContent='Not quite. Try again. '+m.quiz.explanation;feedback.className='incorrect';}}
function market(){return `<div class="eyebrow">PADDOCK / AUTONOMOUS GARAGES</div><h1>The agent <span>market.</span></h1><p class="lede">Three independent garage simulations compete for racers. Their stock, demand and prices change as the market moves.</p><div class="market-grid">${[['GripWorks','Handling & suspension','Grip tyres','32','12 / 16'],['TurboLab','Engines & boost','Engine chip','42','10 / 14'],['Apex Salvage','Frames & rare equipment','Carbon frame','58','5 / 7']].map((m,i)=>`<article><small>MERCHANT 0${i+1}</small><h2>${m[0]}</h2><p>${m[1]}</p><div class="stock">INVENTORY <b>${m[4]}</b></div><h3>${m[2]}</h3><strong class="price">${m[3]} CR</strong><button class="primary" data-action="buy">BUY UPGRADE · 32 CR</button><p class="muted">Local economy demo. Purchases are saved in this browser only.</p></article>`).join('')}</div><div class="simulation"><div><small>MARKET SIMULATION</small><h2>Fast-forward seven days</h2><p>Watch demand, inventory and merchant balances change in the teaching model.</p></div><button class="primary" id="simulate">SIMULATE 7 DAYS</button><b id="day">DAY ${day}</b></div>`;}
function explorer(){return `<div class="eyebrow">DISCOVER / THE NEAR ECOSYSTEM</div><h1>Welcome to <span>Ecosystem City.</span></h1><p class="lede">A blockchain ecosystem is more than its base network. Explore the wallets, apps, tools and teams that make it useful.</p><div class="districts">${ECOSYSTEM_DISTRICTS.map(d=>`<article><small>DISTRICT / ${d.id.toUpperCase()}</small><h2>${d.name}</h2><p>${d.note}</p><b>${d.examples.join(' · ')}</b><a href="${d.source}" target="_blank" rel="noreferrer">Explore resources ↗</a></article>`).join('')}</div><p class="muted">Project examples are a starting point. Check each project's official site for current status and availability.</p>`;}
function setupRace(){canvas=root!.querySelector<HTMLCanvasElement>('#race');ctx=canvas?.getContext('2d')||null;distance=0;speed=0;boost=100;running=true;last=0;cancelAnimationFrame(frame);const restart=root!.querySelector('#restart');restart?.addEventListener('click',()=>{distance=0;speed=0;boost=100;running=true;last=0;cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);});root!.querySelectorAll<HTMLElement>('[data-key]').forEach(el=>{const k=el.dataset.key!;el.addEventListener('pointerdown',()=>keys.add(k));el.addEventListener('pointerup',()=>keys.delete(k));el.addEventListener('pointerleave',()=>keys.delete(k));});frame=requestAnimationFrame(tick);}
function tick(t:number){if(!running||!ctx)return;const dt=Math.min((t-last)/1000||0,0.04);last=t;const accel=keys.has('ArrowRight')||keys.has('d')?1:0;const brake=keys.has('ArrowLeft')||keys.has('a')?1:0;const boosting=keys.has(' ')&&boost>0;if(boosting)boost=Math.max(0,boost-38*dt);else boost=Math.min(100,boost+9*dt);speed=Math.max(0,Math.min(340,speed+(accel*230-brake*330+(boosting?160:0)-(!accel?35:0))*dt));distance+=speed*dt;drawRace();root!.querySelector('#speed')!.textContent=String(Math.round(speed)).padStart(3,'0');root!.querySelector('#distance')!.textContent=String(Math.round(distance));root!.querySelector('#boost')!.textContent=String(Math.round(boost));if(distance>6000){credits+=35;save();root!.querySelector('#race-state')!.textContent='FINISH! +35 CREDITS EARNED';running=false;return;}frame=requestAnimationFrame(tick);}
function drawRace(){const c=ctx!;const w=960,h=440;c.clearRect(0,0,w,h);const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#182b29');sky.addColorStop(1,'#405b49');c.fillStyle=sky;c.fillRect(0,0,w,h);c.fillStyle='#b5b47a';c.globalAlpha=.2;c.beginPath();c.arc(760,95,55,0,Math.PI*2);c.fill();c.globalAlpha=1;for(let layer=0;layer<2;layer++){c.fillStyle=layer?'#263d34':'#365247';c.beginPath();c.moveTo(0,300+layer*30);for(let x=0;x<=w;x+=12)c.lineTo(x,220+layer*35+Math.sin((x+distance*(.1+layer*.1))/90)*24+Math.sin(x/37)*8);c.lineTo(w,h);c.lineTo(0,h);c.fill();}c.fillStyle='#5b4938';c.beginPath();c.moveTo(0,350);for(let x=0;x<=w;x+=8)c.lineTo(x,350+Math.sin((x+distance)/70)*16+Math.sin((x+distance)/27)*5);c.lineTo(w,h);c.lineTo(0,h);c.fill();c.strokeStyle='#d7fb69';c.lineWidth=5;c.stroke();const x=235,y=300+Math.sin((distance+235)/70)*16; c.save();c.translate(x,y);c.fillStyle='#d7fb69';c.fillRect(-52,-27,102,20);c.fillStyle='#18211e';c.fillRect(-25,-42,44,18);c.fillStyle='#f0eadb';c.fillRect(-14,-39,16,10);c.fillStyle='#101513';for(const wx of [-34,32]){c.beginPath();c.arc(wx,-3,13,0,7);c.fill();c.strokeStyle='#c6d1bb';c.lineWidth=3;c.stroke();}c.restore();c.fillStyle='#f1efdf';c.font='12px monospace';c.fillText('GENESIS RIDGE',28,32);c.fillText('SIGNAL FRAGMENTS  ◈ ◈ ◈',28,54);}
window.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();keys.add(e.key);});window.addEventListener('keyup',e=>keys.delete(e.key));
root.addEventListener('click',e=>{const target=e.target as HTMLElement;if(target.id==='demo-run'){const status=root!.querySelector<HTMLElement>('#demo-status')!;status.textContent='Experiment complete. You have seen the concept in action. Now test what you learned below.';target.textContent='EXPERIMENT COMPLETE ✓';target.setAttribute('disabled','true');}if(target.id==='simulate'){day+=7;const out=root!.querySelector<HTMLElement>('#day');if(out)out.textContent='DAY '+day;target.textContent='SIMULATION COMPLETE ✓';}});
render();
