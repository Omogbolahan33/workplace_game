/*
  R — from 00-cities.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface RShape {
  s: number;
  next: (() => any);
  f: (() => any);
  int: ((a0: any, a1: any) => any);
  range: ((a0: any, a1: any) => any);
  pick: ((a0: any) => any);
  chance: ((a0: any) => any);
  gauss: ((a0: any, a1: any) => any);
  weighted: ((a0: any, a1: any) => any);
  pickN: ((a0: any, a1: any) => any);
}

const R: RShape = {
  s: 12345,
  next(){ let t = (this.s = (this.s + 0x6D2B79F5) | 0); t = Math.imul(t ^ (t>>>15), 1|t); t = (t + Math.imul(t ^ (t>>>7), 61|t)) ^ t; return ((t ^ (t>>>14))>>>0)/4294967296; },
  f(){ return this.next(); },
  int(a,b){ return a + Math.floor(this.next()*(b-a+1)); },
  range(a,b){ return a + this.next()*(b-a); },
  pick(a){ return a[Math.floor(this.next()*a.length)]; },
  chance(p){ return this.next() < p; },
  gauss(m,sd){ let u = 1-this.next(), v = this.next(); return m + sd*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); },
  weighted(list, wf){ let tot = 0; const w = list.map(x=>{const v=Math.max(0,wf(x)); tot+=v; return v;}); if(tot<=0) return null;
    let r = this.next()*tot; for(let i=0;i<list.length;i++){ r -= w[i]; if(r<=0) return list[i]; } return list[list.length-1]; },
  pickN(a,n){ const c=a.slice(); const out=[]; while(c.length && out.length<n) out.push(c.splice(Math.floor(this.next()*c.length),1)[0]); return out; }
};
