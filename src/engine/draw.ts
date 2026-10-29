import {fiveTables,fourTables,standardNames,targetNames} from '../data/rules';
import {obtain} from './account';
import type {Random} from './random';
import type {Account} from './types';
// 0=三星，1=四星；10—15=五星类别，22—29=常驻角色身份。
export function draw(a:Account,pool:number,rng:Random):number{
 const w=pool===2,p=a.pools[w?1:0],t=w?1:0;
 const p5=fiveTables[t][Math.min(91,p.five+1)],q4=fourTables[t][Math.min(91,p.four+1)];
 const roll=rng();a.pulls++;p.five++;p.four++;
 if(roll<p5){
  p.five=0;
  if(!w){
   let up:boolean;
   if(p.guaranteed){up=true;p.guaranteed=false;}
   else if(a.radiance===3){up=true;a.radiance=1;}
   else{up=rng()<.5;if(up)a.radiance=Math.max(0,a.radiance-1);else{a.radiance++;p.guaranteed=true;}}
   if(up){a.counts[pool]++;a.glitter+=obtain(a.owned,pool,true);return 10+pool;}
   const id=2+Math.floor(rng()*8);a.counts[4]++;a.glitter+=obtain(a.owned,id,true);return 20+id;
  }
  let result:number;
  if(a.path>=0&&a.fate===1)result=a.path;
  else if(p.guaranteed)result=Math.floor(rng()*2);
  else{const r=rng();result=r<.375?0:r<.75?1:2;}
  p.guaranteed=result===2;
  if(a.path>=0)a.fate=result===a.path?0:1;
  a.glitter+=10;const category=result===2?5:result+2;a.counts[category]++;return 10+category;
 }
 // 单均匀样本划分联合概率，等价于规则中的条件四星判定。
 if(roll<p5+Math.min(q4,1-p5)){
  p.four=0;a.fourHits[t]++;
  const up=p.fourGuaranteed||rng()<(w?.75:.5);p.fourGuaranteed=!up;
  if(up){if(w)a.glitter+=2;else a.glitter+=obtain(a.fourOwned,Math.floor(rng()*3),false);}
  else if(rng()<.5){const start=w?0:3;const id=start+Math.floor(rng()*(a.fourOwned.length-start));a.glitter+=obtain(a.fourOwned,id,false);}
  else a.glitter+=2;
  return 1;
 }
 return 0;
}
export function eventName(code:number):string{
 if(code>=22)return standardNames[code-22];
 if(code>=10)return[...targetNames,'常驻五星角色','常驻五星武器'][code-10];
 return code===1?'四星物品':'三星武器';
}
