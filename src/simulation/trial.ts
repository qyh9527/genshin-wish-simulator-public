import {draw,eventName} from '../engine/draw';
import {exchange,setPath} from '../engine/account';
import type {Account,Config,Detail,Trial} from '../engine/types';
import type {Random} from '../engine/random';
export function runTrial(a:Account,c:Config,rng:Random):Trial{
 let left=c.budget+exchange(a),cursor=0;
 while(cursor<4){
  const id=c.order[cursor++];
  if(a.counts[id]>=c.targets[id])continue;
  if(left===0)break;
  const pool=id>=2?2:id;
  if(id>=2)setPath(a,id-2);
  while(left>0&&a.counts[id]<c.targets[id]){
   left--;
   if(draw(a,pool,rng)!==0)left+=exchange(a);
  }
 }
 const missing=c.targets.map((v,i)=>Math.max(0,v-a.counts[i]));
 return{counts:a.counts.slice(),missing,success:missing.every(v=>v===0),remaining:left,glitter:a.glitter,pulls:a.pulls,exchanged:a.exchanged};
}
export function manual(a:Account,pool:number,budget:number,rng:Random,path:number){
 if(pool===2)setPath(a,path);
 const before=a.counts.slice(),start=a.pulls,ex=a.exchanged;let left=budget+exchange(a);const details:Detail[]=[];
 while(left>0){left--;const g=a.glitter,code=draw(a,pool,rng),earned=a.glitter-g;left+=exchange(a);
  if(code!==0){details.push({pull:a.pulls,rarity:code>=10?5:4,name:eventName(code),glitter:earned});if(details.length>100)details.shift();}
 }
 return{details,spent:a.pulls-start,counts:a.counts.map((v,i)=>v-before[i]),glitter:a.glitter,exchanged:a.exchanged-ex};
}
