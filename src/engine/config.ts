import type {Config} from './types';
export const defaultConfig:Config={
 budget:600,glitter:0,initial:[1,0],standard:Array(8).fill(0),fourTotal:48,fourMax:24,
 allFourMax:false,upFourMax:false,initSeed:20261023,trialSeed:713579,
 character:{five:0,four:0,guaranteed:false,fourGuaranteed:false},
 weapon:{five:0,four:0,guaranteed:false,fourGuaranteed:false},
 radiance:1,path:0,fate:0,order:[0,2,1,3],targets:[6,0,1,0],
};
export function validate(c:Config):string[]{
 const e:string[]=[];const int=(v:number,min:number,max:number)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
 if(!int(c.budget,0,100000))e.push('准备的抽数要填 0 到 100000 的整数，星辉换来的另外算。');
 if(!int(c.glitter,0,1000000))e.push('手上的星辉要填 0 到 1000000 的整数。');
 if(!int(c.fourTotal,4,1000)||!int(c.fourMax,0,c.fourTotal))e.push('四星总数要在 4 到 1000 之间，满命的不能比总数还多。');
 if(!c.allFourMax&&c.upFourMax&&c.fourMax<3)e.push('三个 UP 四星都满命的话，满命总数至少要填 3。');
 for(let i=0;i<2;i++)if(!int(c.initial[i],0,7)||!int(c.targets[i],0,7-c.initial[i]))e.push('角色最多到 C6，已有的加上想再抽的不能超过 7 个。');
 if(c.standard.length!==8||c.standard.some(v=>!int(v,0,7)))e.push('常驻五星的已有数量要在 0 到 7 个之间。');
 if(c.targets.length!==4||c.targets.slice(2).some(v=>!int(v,0,100)))e.push('每把武器想再抽的数量要在 0 到 100 之间。');
 if(!int(c.character.five,0,89)||!int(c.weapon.five,0,76))e.push('五星垫抽只能填：角色 0 到 89，武器 0 到 76。这里按玩家推算的第 77 抽必出金来算，不能填更高。');
 if([c.character,c.weapon].some(p=>!int(p.four,0,89)))e.push('四星垫抽要填 0 到 89；出五星时，四星保底可能往后顺延。');
 if(!int(c.radiance,0,3)||(c.character.guaranteed&&c.radiance===0))e.push('捕获明光计算用的数只能填 0 到 3；按这里的算法，下次必出 UP 时不能填 0。');
 if(!int(c.path,-1,1)||!int(c.fate,0,1)||(c.path===-1&&c.fate!==0))e.push('没选定轨武器，就不能有命定值。');
 if(!int(c.initSeed,0,2147483647)||!int(c.trialSeed,0,2147483647))e.push('账号生成码和随机码要填 0 到 2147483647 的整数。');
 if(c.order.length!==4||new Set(c.order).size!==4||c.order.some(v=>!int(v,0,3)))e.push('抽取顺序里要有四个不同的角色或武器，不能重复或漏掉。');
 return e;
}
