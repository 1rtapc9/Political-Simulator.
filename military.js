// military.js
import { rand, clamp } from './utils.js';

export const UNIT_TRYOUTS = {
  'Navy SEALs': { req:{fitness:70,lead:50}, time:2, base:30 },
  'Green Berets': { req:{fitness:65,lead:60,int:50}, time:2, base:25 },
  'Airborne Rangers': { req:{fitness:60,lead:50}, time:1, base:33 }
};

export const MIL_RANKS = ['Private','Corporal','Sergeant','Lieutenant','Captain','Major','Lt. Colonel','Colonel','Brigadier','Major General','Lt. General','General'];

export function enlist(state, branch){
  if(state.military.enlisted) return false;
  state.military.enlisted = true;
  state.military.branch = branch;
  state.military.rank = 0;
  state.military.years = 0;
  state.stats.fitness = clamp(state.stats.fitness + rand(5,12));
  state.history.unshift(`${new Date().toLocaleDateString()}: Enlisted in ${branch}`);
  return true;
}

export function promote(state){
  if(!state.military.enlisted) return;
  if(state.military.rank < MIL_RANKS.length - 1){
    state.military.rank++;
    state.stats.leadership = clamp(state.stats.leadership + rand(1,4));
    state.history.unshift(`${new Date().toLocaleDateString()}: Promoted to ${MIL_RANKS[state.military.rank]}`);
  }
}

export function tryout(state, unitName){
  const u = UNIT_TRYOUTS[unitName];
  if(!u) return { success:false, reason:'Unknown unit' };
  if(!state.military.enlisted) return { success:false, reason:'Not enlisted' };
  // time cost and chance computed by caller via passYears
  let score = u.base;
  score += Math.floor((state.stats.fitness - (u.req.fitness || 50))/2);
  score += Math.floor((state.stats.leadership - (u.req.lead || 50))/4);
  score += Math.floor(state.xp / 60);
  const roll = rand(1,100);
  const success = roll <= clamp(score,5,95);
  if(success){
    state.military.units.push(unitName);
    state.stats.reputation = clamp(state.stats.reputation + rand(3,8));
    state.history.unshift(`${new Date().toLocaleDateString()}: Joined ${unitName}`);
  } else {
    state.stats.fitness = clamp(state.stats.fitness - rand(1,4));
    state.history.unshift(`${new Date().toLocaleDateString()}: Failed tryout for ${unitName}`);
  }
  return { success, roll, score };
}

export function deploy(state, typeKey, durationYears, style, volunteer){
  const TYPES = {
    combat:{ label:'Combat Operation', baseRep:8, baseXP:60, baseRisk:18 },
    peace:{ label:'Peacekeeping', baseRep:6, baseXP:40, baseRisk:8 },
    human:{ label:'Humanitarian', baseRep:10, baseXP:35, baseRisk:4 }
  };
  const t = TYPES[typeKey] || TYPES.combat;
  // style modifiers
  let riskMod=0, repMod=0, xpMod=0;
  if(style==='Aggressive'){ riskMod += 8; repMod -= 2; xpMod += 10; }
  if(style==='Restraint'){ riskMod -= 6; repMod += 6; xpMod += 2; }
  const veteranBonus = Math.floor(state.military.years / 2);
  const finalRisk = clamp(t.baseRisk + riskMod - veteranBonus, 1, 95);
  const injRoll = rand(1,100);
  const injured = injRoll <= finalRisk;
  if(injured){ state.stats.fitness = clamp(state.stats.fitness - rand(3,10)); }
  // medals
  const medals = [];
  if(rand(1,100) <= 95){ medals.push('Campaign Medal'); }
  if(typeKey === 'combat'){
    let valorChance = Math.floor((state.stats.fitness - 50)/2) + (style==='Aggressive'?15:5) + Math.floor(state.xp/100);
    if(rand(1,100) <= clamp(valorChance,5,90)){ medals.push('Valour Star'); }
  }
  const leadChance = Math.floor((state.stats.leadership - 45)/2) + Math.floor(state.military.years/2);
  if(rand(1,100) <= clamp(leadChance,5,85)){ medals.push('Leadership Cross'); }
  if(typeKey === 'human' || style === 'Restraint'){ if(rand(1,100) <= 60){ medals.push('Humanitarian Ribbon'); } }
  state.stats.reputation = clamp(state.stats.reputation + t.baseRep + repMod + (medals.length * 2));
  state.xp += t.baseXP + xpMod + (medals.length * 15);
  const rec = { id:'dep_'+Date.now(), type:t.label, duration:durationYears, style, volunteer, injured, medals, year: state.age - durationYears };
  state.military.deployments.push(rec);
  return rec;
}
