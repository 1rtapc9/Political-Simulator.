// main.js
import { rand, clamp, nowStr, saveToStorage, loadFromStorage, loadLeaderboard, saveLeaderboard } from './utils.js';
import * as Events from './events.js';
import * as Military from './military.js';
import * as Politics from './politics.js';
import * as Civilian from './civilian.js';

const ROOT = document.getElementById('app-root');

const REGIONS = {
  us: { name:'United States', topTitle:'President', midTitle:'Senator/Representative', local:'Mayor', term:4 },
  uk: { name:'United Kingdom', topTitle:'Prime Minister', midTitle:'MP', local:'Local Councillor', term:5 },
  ca: { name:'Canada', topTitle:'Prime Minister', midTitle:'MP', local:'Mayor', term:4 },
  de: { name:'Germany', topTitle:'Chancellor', midTitle:'Bundestag Member', local:'Mayor', term:4 },
  au: { name:'Australia', topTitle:'Prime Minister', midTitle:'MP', local:'Mayor', term:3 }
};

function defaultState(){
  return {
    name: 'Player',
    region: 'us',
    regionData: REGIONS['us'],
    age: 18,
    stats: {
      charisma: rand(30,60),
      intelligence: rand(30,70),
      fitness: rand(30,65),
      leadership: rand(25,60),
      reputation: rand(10,30)
    },
    xp: 0,
    skillPoints: 0,
    skills: { civilian:[], military:[], politics:[] },
    career: { type:'none' },
    military: { enlisted:false, branch:null, rank:0, years:0, units:[], deployments:[] },
    politics: { inOffice:false, offices:[] },
    relationships: [],
    medals: [],
    achievements: [],
    history: [],
    events: [],
    retired: false,
    score: 0
  };
}

let state = null;

function loadOrInit(){
  const raw = loadFromStorage();
  if(raw){ state = raw; state.regionData = REGIONS[state.region] || REGIONS.us; }
  else { state = defaultState(); state.history.unshift(nowStr() + ' — New life started.'); }
}

function render(){
  // build main UI (simple, re-render)
  ROOT.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'header';
  header.innerHTML = `<div><h1>LifeSim</h1><div class="sub muted">Start at age 18 — aim for highest offices</div></div>`;
  ROOT.appendChild(header);

  const layout = document.createElement('div'); layout.className = 'layout';

  // left
  const left = document.createElement('div'); left.className = 'panel sidebar';
  left.innerHTML = `
    <div class="title">Character</div>
    <div style="display:flex;gap:8px"><input id="name" placeholder="Name" value="${state.name}"/><select id="region">
      <option value="us">United States</option><option value="uk">United Kingdom</option><option value="ca">Canada</option><option value="de">Germany</option><option value="au">Australia</option>
    </select></div>
    <div style="margin-top:10px" class="controls">
      <button id="btnNew">New Life</button><button id="btnLoad" class="alt">Load</button><button id="btnSave" class="alt">Save</button>
    </div>
    <div style="margin-top:12px">
      <div class="title">Stats</div>
      <div class="stat"><div>Charisma</div><div style="display:flex;align-items:center"><div style="width:48px;text-align:right">${state.stats.charisma}</div><div class="bar"><i style="width:${state.stats.charisma}% ; background:linear-gradient(90deg,#60a5fa,#38bdf8)"></i></div></div></div>
      <div class="stat"><div>Intelligence</div><div style="display:flex;align-items:center"><div style="width:48px;text-align:right">${state.stats.intelligence}</div><div class="bar"><i style="width:${state.stats.intelligence}% ; background:linear-gradient(90deg,#c084fc,#7c3aed)"></i></div></div></div>
      <div class="stat"><div>Fitness</div><div style="display:flex;align-items:center"><div style="width:48px;text-align:right">${state.stats.fitness}</div><div class="bar"><i style="width:${state.stats.fitness}% ; background:linear-gradient(90deg,#34d399,#10b981)"></i></div></div></div>
      <div class="stat"><div>Leadership</div><div style="display:flex;align-items:center"><div style="width:48px;text-align:right">${state.stats.leadership}</div><div class="bar"><i style="width:${state.stats.leadership}% ; background:linear-gradient(90deg,#f59e0b,#f97316)"></i></div></div></div>
      <div class="stat"><div>Reputation</div><div style="display:flex;align-items:center"><div style="width:48px;text-align:right">${state.stats.reputation}</div><div class="bar"><i style="width:${state.stats.reputation}% ; background:linear-gradient(90deg,#60a5fa,#34d399)"></i></div></div></div>
      <div class="muted small">Age: ${state.age} — XP: ${state.xp}</div>
    </div>
  `;
  layout.appendChild(left);

  // right / main
  const right = document.createElement('div'); right.className = 'panel';
  right.innerHTML = `
    <div class="title">Actions & Progress</div>
    <div id="actionsArea" class="muted"></div>
    <div style="margin-top:12px" class="title">Log</div>
    <div id="gamelog" class="log"></div>
  `;
  layout.appendChild(right);

  ROOT.appendChild(layout);

  // hookup simple events
  document.getElementById('name').onchange = e => { state.name = e.target.value; saveToStorage(state); render(); };
  document.getElementById('region').value = state.region;
  document.getElementById('region').onchange = e => { state.region = e.target.value; state.regionData = REGIONS[state.region]; saveToStorage(state); render(); };
  document.getElementById('btnNew').onclick = ()=> { if(confirm('Start a new life? This will overwrite current save.')){ state = defaultState(); state.history.unshift(nowStr() + ' — New life started.'); saveToStorage(state); render(); } };
  document.getElementById('btnSave').onclick = ()=> { saveToStorage(state); alert('Saved'); };
  document.getElementById('btnLoad').onclick = ()=> { const raw = loadFromStorage(); if(raw){ state = raw; state.regionData = REGIONS[state.region] || REGIONS.us; render(); alert('Loaded'); } else alert('No save found'); };

  // populate actions area (simple; full UI in separate module would be more advanced)
  const act = document.getElementById('actionsArea');
  let html = '';
  html += `<div class="notice"><strong>Available</strong></div>`;
  // civilian
  if(state.career.type === 'none'){
    html += `<div class="muted"><strong>Civilian</strong></div>`;
    Civilian.JOBS.forEach(j => { html += `<div class="role-pill">${j.name} <button data-job="${j.id}">Start</button></div>`; });
    html += `<div style="margin-top:6px"><button id="btnStartup">Found Company</button></div>`;
  } else {
    html += `<div class="muted">Career: ${state.career.title || state.career.type}</div>`;
  }
  // military
  if(!state.military.enlisted){
    html += `<div style="margin-top:8px"><strong>Military</strong><div class="controls"><button id="enlistArmy">Enlist Army</button><button id="enlistNavy" class="alt">Enlist Navy</button></div></div>`;
  } else {
    html += `<div style="margin-top:8px"><strong>Military</strong><div class="muted">Branch: ${state.military.branch} — Rank: ${Military.MIL_RANKS[state.military.rank]}</div>`;
    Object.keys(Military.UNIT_TRYOUTS).forEach(u => html += `<div class="role-pill">${u} <button data-try="${u}">Tryout</button></div>`);
    html += `<div style="margin-top:6px" class="controls"><button data-deploy="combat">Deploy (Combat)</button><button data-deploy="peace" class="alt">Deploy (Peacekeeping)</button><button data-deploy="human" class="alt">Deploy (Humanitarian)</button></div></div>`;
  }
  // politics
  if(!state.politics.inOffice){
    html += `<div style="margin-top:8px"><strong>Politics</strong><div class="controls"><button id="runLocal">Run Local (${state.regionData.local})</button><button id="runPar" class="alt">Run ${state.regionData.midTitle}</button><button id="runTop" class="alt">Run ${state.regionData.topTitle}</button></div></div>`;
  } else {
    const cur = state.politics.offices[state.politics.offices.length - 1];
    html += `<div style="margin-top:8px"><strong>In Office</strong><div class="muted">${cur.title} — ${cur.years} years</div><div class="controls"><button id="serve1">Serve 1 year</button><button id="serve5" class="alt">Serve 5 years</button></div></div>`;
  }

  html += `<div style="margin-top:10px"><strong>Other</strong><div><button id="nextYear">Pass 1 Year</button><button id="auto10" class="alt">Auto 10 years</button></div></div>`;

  act.innerHTML = html;

  // wire dynamic action buttons
  act.querySelectorAll('[data-job]').forEach(btn => btn.onclick = (ev)=> {
    const id = ev.target.getAttribute('data-job');
    Civilian.startJob(state, id);
    saveToStorage(state); render();
  });
  const btnStartup = act.querySelector('#btnStartup'); if(btnStartup) btnStartup.onclick = ()=> { Civilian.attemptStartup(state); saveToStorage(state); render(); };
  const enA = act.querySelector('#enlistArmy'); if(enA) enA.onclick = ()=> { Military.enlist(state, 'Army'); saveToStorage(state); render(); };
  const enN = act.querySelector('#enlistNavy'); if(enN) enN.onclick = ()=> { Military.enlist(state, 'Navy'); saveToStorage(state); render(); };
  act.querySelectorAll('[data-try]').forEach(b=> b.onclick = (ev)=> {
    const unit = ev.target.getAttribute('data-try');
    // pass time cost based on unit
    const u = Military.UNIT_TRYOUTS[unit];
    if(u) { passYears(u.time); }
    const res = Military.tryout(state, unit);
    saveToStorage(state); render(); if(res.success) alert('Tryout success!'); else alert('Tryout failed.');
  });
  act.querySelectorAll('[data-deploy]').forEach(b=> b.onclick = (ev)=> {
    const key = ev.target.getAttribute('data-deploy');
    const years = parseInt(prompt('Enter duration in years (1-4):', '2'), 10) || 2;
    const style = prompt('Engagement style: Aggressive / Balanced / Restraint', 'Balanced') || 'Balanced';
    passYears(years);
    const r = Military.deploy(state, key, years, style, true);
    // if any medals returned, add to state.medals
    (r.medals || []).forEach(m => { if(!state.medals.includes(m)) state.medals.push(m); });
    saveToStorage(state); render(); alert('Deployment complete.');
  });

  const runLocal = act.querySelector('#runLocal'); if(runLocal) runLocal.onclick = ()=> { const res = Politics.campaign(state, 'local'); saveToStorage(state); render(); if(res.success) alert(`Won: ${res.title}`); else alert('Lost'); };
  const runPar = act.querySelector('#runPar'); if(runPar) runPar.onclick = ()=> { const res = Politics.campaign(state, 'parliament'); saveToStorage(state); render(); if(res.success) alert(`Won: ${res.title}`); else alert('Lost'); };
  const runTop = act.querySelector('#runTop'); if(runTop) runTop.onclick = ()=> { const res = Politics.campaign(state, 'top'); saveToStorage(state); render(); if(res.success) alert(`Won: ${res.title}`); else alert('Lost'); };
  const serve1 = act.querySelector('#serve1'); if(serve1) serve1.onclick = ()=> { Politics.serveYears(state,1); saveToStorage(state); render(); };
  const serve5 = act.querySelector('#serve5'); if(serve5) serve5.onclick = ()=> { Politics.serveYears(state,5); saveToStorage(state); render(); };
  const nextYear = act.querySelector('#nextYear'); if(nextYear) nextYear.onclick = ()=> { passYears(1); saveToStorage(state); render(); };
  const auto10 = act.querySelector('#auto10'); if(auto10) auto10.onclick = ()=> { for(let i=0;i<10;i++){ passYears(1); } saveToStorage(state); render(); };

  // render log
  const logEl = document.getElementById('gamelog');
  logEl.innerHTML = state.history.slice(0,120).map(h => `<div>${h}</div>`).join('');
}

function passYears(n){
  for(let i=0;i<n;i++){
    state.age++;
    // stat drift
    if(state.age < 40){
      state.stats.intelligence = clamp(state.stats.intelligence + rand(0,2));
      state.stats.charisma = clamp(state.stats.charisma + rand(0,2));
      state.stats.fitness = clamp(state.stats.fitness - rand(0,1));
    } else {
      state.stats.fitness = clamp(state.stats.fitness - rand(0,2));
      state.stats.intelligence = clamp(state.stats.intelligence - rand(0,1));
    }
    // career & job tick
    Civilian.tickJob(state);
    // military yearly
    if(state.military.enlisted){
      state.military.years++;
      if(rand(1,100) < 25){
        const chanceMod = Math.floor((state.stats.leadership - 40)/5) + Math.floor(state.xp/50);
        if(rand(1,100) < 30 + chanceMod) Military.promote(state);
      }
      if(state.military.years >= 10 && !state.medals.includes('Long Service Medal')) state.medals.push('Long Service Medal');
    }
    // award skill point occasionally
    if(state.age % 3 === 0) state.skillPoints++;
    // global events
    Events.rollGlobalEvent(state);
    // small rep fluct
    state.stats.reputation = clamp(state.stats.reputation + rand(-1,1));
    state.history.unshift(`${new Date().toLocaleDateString()}: Aged 1 year to ${state.age}`);
  }
}

function init(){
  loadOrInit();
  render();
}

// Expose for debug/test
window._get_state = () => state;

init();
