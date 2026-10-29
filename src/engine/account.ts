import {random} from './random';
import type {Config,Account} from './types';
export function fourSnapshot(c:Config):Uint8Array{
 const rng=random(c.initSeed),a=new Uint8Array(c.fourTotal);
 for(let i=0;i<a.length;i++)a[i]=Math.floor(rng()*7);
 const ids=Array.from({length:a.length},(_,i)=>i);
 for(let i=ids.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
 const max=c.allFourMax?c.fourTotal:c.fourMax;
 if(c.upFourMax&&!c.allFourMax){for(let i=0;i<3;i++)a[i]=7;let n=3;for(const i of ids)if(i>=3&&n<max){a[i]=7;n++;}}
 else for(let i=0;i<max;i++)a[ids[i]]=7;
 return a;
}
export function createAccount(c:Config,snapshot=fourSnapshot(c)):Account{
 return{owned:Uint8Array.from([...c.initial,...c.standard]),fourOwned:snapshot.slice(),pools:[{...c.character},{...c.weapon}],radiance:c.radiance,path:c.path,fate:c.fate,counts:[0,0,0,0,0,0],glitter:c.glitter,pulls:0,exchanged:0,fourHits:[0,0]};
}
export function resetAccount(a:Account,c:Config,snapshot:Uint8Array):void{
 a.owned.set(c.initial);a.owned.set(c.standard,2);a.fourOwned.set(snapshot);
 Object.assign(a.pools[0],c.character);Object.assign(a.pools[1],c.weapon);
 a.radiance=c.radiance;a.path=c.path;a.fate=c.fate;a.counts.fill(0);a.glitter=c.glitter;a.pulls=0;a.exchanged=0;a.fourHits.fill(0);
}
export function characterGlitter(previous:number,five:boolean):number{return previous===0?0:previous>=7?(five?25:5):(five?10:2);}
export function obtain(a:Uint8Array,id:number,five:boolean):number{const g=characterGlitter(a[id],five);if(a[id]<7)a[id]++;return g;}
export function setPath(a:Account,path:number):void{if(a.path!==path){a.path=path;a.fate=0;}}
export function exchange(a:Account):number{const n=Math.floor(a.glitter/5);a.glitter-=n*5;a.exchanged+=n;return n;}
