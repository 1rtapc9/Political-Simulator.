// civilian.js
import { rand, clamp } from './utils.js';

export const JOBS = [
  { id:'student', name:'University Student', time:3, apply: s => { s.stats.intelligence += rand(6,12); s.xp += 30; } },
  { id:'dev', name:'Junior Developer', time:2, apply: s => { s.stats.intelligence += rand(2,6); s.stats.charisma += rand(1,3); s.xp += 20; } },
  { id:'journal', name:'Journalist', time:2, apply: s => { s.stats.charisma += rand(3,7); s.stats.reputation += rand(1,5); s.xp += 18; } }
];

export function startJob(state, jobId){
  const job = JOBS.find(j=>j.id === jobId);
  if(!job) return false;
  state.career = { type:'job', id: jobId, title: job.name, years: 0, time: job.time };
  state.history.unshift(`${new Date().toLocaleDateString()}: Started ${job.name}`);
  return true;
}

export function tickJob(state){
  if(!state.career || state.career.type !== 'job') return;
  state.career.years++;
  if(state.career.years >= state.career.time){
    const job = JOBS.find(j=>j.id === state.career.id);
    if(job) job.apply(state);
    state.career = { type:'none' };
    state.history.unshift(`${new Date().toLocaleDateString()}: Completed program`);
  }
}

export function attemptStartup(state){
  state.age += 2;
  const chance = 30 + Math.floor((state.stats.intelligence - 45)/2) + Math.floor((state.stats.leadership - 30)/3);
  const roll = rand(1,100);
  if(roll <= clamp(chance,5,95)){
    state.xp += 80;
    state.stats.reputation = clamp(state.stats.reputation + rand(6,12));
    state.history.unshift(`${new Date().toLocaleDateString()}: Founded successful company`);
    return true;
  } else {
    state.history.unshift(`${new Date().toLocaleDateString()}: Startup failed`);
    state.stats.reputation = clamp(state.stats.reputation - rand(1,4));
    return false;
  }
}
