import {xoroshiro128plus} from 'pure-rand/generator/xoroshiro128plus';
import {uniformFloat32} from 'pure-rand/distribution/uniformFloat32';
export type Random=()=>number;
export function random(seed:number):Random{const rng=xoroshiro128plus(seed);return()=>uniformFloat32(rng);}
export function trialSeed(seed:number,index:number):number{
 let x=(seed+Math.imul(index+1,0x9e3779b9))|0;
 x=Math.imul(x^(x>>>16),0x21f0aaad);x=Math.imul(x^(x>>>15),0x735a2d97);return(x^(x>>>15))|0;
}
