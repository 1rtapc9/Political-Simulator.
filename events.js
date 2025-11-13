// events.js
import { rand, clamp } from './utils.js';

export const GLOBAL_EVENTS = [
  { id: 'econ_boom', title: 'Economic Boom', effect: s => { s.stats.reputation = clamp(s.stats.reputation + 5); s.xp += 40; } , chance: 6 },
  { id: 'pandemic', title: 'Pandemic', effect: s => { s.stats.fitness = clamp(s.stats.fitness - 6); s.stats.reputation = clamp(s.stats.reputation - 4); }, chance: 4 },
  { id: 'regional_conflict', title: 'Regional Conflict', effect: s => { /* used to increase military mobilization */ }, chance: 5 }
];

export function rollGlobalEvent(state){
  if(rand(1,100) <= 12){
    const e = GLOBAL_EVENTS[rand(0, GLOBAL_EVENTS.length - 1)];
    try{ e.effect(state); }catch(e){ console.error(e) }
    state.history.unshift(`${new Date().toLocaleDateString()}: Event: ${e.title}`);
    return e;
  }
  return null;
}

// small narrative arcs
export const NARRATIVE_ARCS = [
  { id:'mentor_missing', title:'Mentor Missing', steps:[
    { text:'Your mentor has disappeared. Investigate or ignore?', opts:[{id:'investigate',txt:'Investigate'},{id:'ignore',txt:'Ignore'}] },
    { text:'You uncover troubling evidence. Expose it or cover it?', opts:[{id:'expose',txt:'Expose'},{id:'cover',txt:'Cover'}] }
  ]},
  { id:'family_crisis', title:'Family Crisis', steps:[
    { text:'A family member needs help. Help them (cost career time) or delegate?', opts:[{id:'help',txt:'Help'},{id:'delegate',txt:'Delegate'}] }
  ]}
];
