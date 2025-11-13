// utils.js
export function rand(min,max){ return Math.floor(Math.random()*(max-min+1)) + min; }
export function clamp(v,a=0,b=100){ return Math.max(a, Math.min(b, v)); }
export function nowStr(){ return new Date().toLocaleString(); }

export const STORAGE_KEY = 'lifesim_modular_v1';
export const LB_KEY = 'lifesim_modular_lb_v1';

export function saveToStorage(obj){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    return true;
  }catch(e){ console.error('Save error', e); return false; }
}
export function loadFromStorage(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch(e){ console.error(e); return null; }
}
export function saveLeaderboard(arr){
  try{ localStorage.setItem(LB_KEY, JSON.stringify(arr)); return true; }catch(e){console.error(e);return false;}
}
export function loadLeaderboard(){ try{ const raw=localStorage.getItem(LB_KEY); return raw?JSON.parse(raw):[] }catch(e){return []} }

// small event bus
const bus = {};
export function on(event,fn){ bus[event] = bus[event] || []; bus[event].push(fn); }
export function emit(event,...args){ (bus[event]||[]).forEach(f=>{ try{ f(...args) }catch(e){console.error(e)} }); }
