// politics.js
import { rand, clamp } from './utils.js';

export function campaign(state, level){
  const region = state.regionData; // assigned by main
  const minAge = level === 'top' ? 30 : 21;
  if(state.age < minAge) return { success:false, reason:'Too young' };

  const base = 30 + Math.floor((state.stats.charisma - 40)/2) + Math.floor((state.stats.reputation - 30)/2);
  const chance = clamp(base + Math.floor(state.xp / 50), 5, 95);
  // cost time
  state.age += 1;
  const roll = rand(1,100);
  if(roll <= chance){
    const title = level === 'top' ? region.topTitle : (level === 'parliament' ? region.midTitle : region.local);
    state.politics.inOffice = true;
    state.politics.offices.push({ title, startAge: state.age, years: 0 });
    state.history.unshift(`${new Date().toLocaleDateString()}: Elected ${title}`);
    return { success:true, title };
  } else {
    state.history.unshift(`${new Date().toLocaleDateString()}: Lost ${level} campaign`);
    state.stats.reputation = clamp(state.stats.reputation - rand(1,4));
    return { success:false, reason:'Lost election' };
  }
}

export function serveYears(state, years){
  if(!state.politics.inOffice) return;
  const cur = state.politics.offices[state.politics.offices.length - 1];
  cur.years += years;
  state.xp += years * 10;
  state.stats.reputation = clamp(state.stats.reputation + Math.floor(years * rand(1,3)));
  // chance to pass laws
  for(let i=0;i<years;i++){
    if(rand(1,100) < 25 + Math.floor(state.stats.intelligence / 4)){
      state.history.unshift(`${new Date().toLocaleDateString()}: Passed important legislation as ${cur.title}`);
    }
  }
}
