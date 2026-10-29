import {defaultConfig,validate} from '../../engine/config';
import type {Account,Config} from '../../engine/types';
import type {manual} from '../../simulation/trial';
export interface SavedState{
 version:1;config:Config;mode:string;pool:number;path:number;manualBudget:number;
 account:Account|null;accountKey:string;sequence:number;manualResult:ReturnType<typeof manual>|null;
}
export function defaults():SavedState{return{version:1,config:structuredClone(defaultConfig),mode:'batch',pool:0,path:0,manualBudget:10,account:null,accountKey:'',sequence:0,manualResult:null};}
export function parseSnapshot(input:unknown):SavedState{
 if(!input||typeof input!=='object')throw new Error('这个文件不是模拟器的存档。');
 const value=input as Partial<SavedState>;
 if(value.version!==undefined&&value.version!==1)throw new Error('这个存档太新或太旧，现在的版本读不了。');
 const c=value.config;
 if(!c||!Array.isArray(c.initial)||c.initial.length!==2||!Array.isArray(c.standard)||!Array.isArray(c.targets)||!Array.isArray(c.order)||!c.character||!c.weapon)throw new Error('存档里缺了设置内容。');
 const errors=validate(c);if(errors.length)throw new Error(errors.join(' '));
 for(const p of [c.character,c.weapon])if(typeof p.guaranteed!=='boolean'||typeof p.fourGuaranteed!=='boolean')throw new Error('存档里的保底进度看不懂。');
 if(typeof c.allFourMax!=='boolean'||typeof c.upFourMax!=='boolean')throw new Error('存档里的四星满命设置看不懂。');
 const result={...defaults(),config:structuredClone(c)};
 if(value.mode==='manual')result.mode='manual';
 if([0,1,2].includes(value.pool!))result.pool=value.pool!;
 if([-1,0,1].includes(value.path!))result.path=value.path!;
 if(Number.isSafeInteger(value.manualBudget)&&value.manualBudget!>=0&&value.manualBudget!<=100000)result.manualBudget=value.manualBudget!;
 if(value.account){
  const a=structuredClone(value.account),int=(v:number,max:number)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
  const owned=Array.from(a.owned||[]),four=Array.from(a.fourOwned||[]);
  if(owned.length!==10||four.length<4||four.length>1000||[...owned,...four].some(v=>!int(v,7))||!Array.isArray(a.pools)||a.pools.length!==2||a.pools.some(p=>!int(p.five,89)||!int(p.four,1000000)||typeof p.guaranteed!=='boolean'||typeof p.fourGuaranteed!=='boolean')||!int(a.radiance,3)||![-1,0,1].includes(a.path)||!int(a.fate,1)||!int(a.glitter,4)||!int(a.pulls,Number.MAX_SAFE_INTEGER)||!int(a.exchanged,Number.MAX_SAFE_INTEGER)||!Array.isArray(a.counts)||a.counts.length!==6||a.counts.some(v=>!int(v,Number.MAX_SAFE_INTEGER))||!Array.isArray(a.fourHits)||a.fourHits.length!==2||a.fourHits.some(v=>!int(v,Number.MAX_SAFE_INTEGER)))throw new Error('存档里的体验进度坏了，当前内容没动。');
  if(typeof value.accountKey!=='string'||!Number.isSafeInteger(value.sequence)||value.sequence!<0)throw new Error('存档里的体验进度不完整。');
  const accountConfig=JSON.parse(value.accountKey);validate(accountConfig).forEach(e=>{throw new Error(e);});
  if(four.length!==accountConfig.fourTotal)throw new Error('存档里的体验进度和账号设置对不上。');
  a.owned=Uint8Array.from(owned);a.fourOwned=Uint8Array.from(four);result.account=a;result.accountKey=value.accountKey;result.sequence=value.sequence!;
  const r=value.manualResult;
  if(r){
   if(!int(r.spent,Number.MAX_SAFE_INTEGER)||!int(r.exchanged,Number.MAX_SAFE_INTEGER)||!int(r.glitter,4)||!Array.isArray(r.counts)||r.counts.length!==6||r.counts.some(v=>!int(v,Number.MAX_SAFE_INTEGER))||!Array.isArray(r.details)||r.details.length>100||r.details.some(d=>!int(d.pull,Number.MAX_SAFE_INTEGER)||![4,5].includes(d.rarity)||typeof d.name!=='string'||d.name.length>100||!int(d.glitter,25)))throw new Error('存档里的抽卡记录看不懂。');
   result.manualResult=structuredClone(r);
  }
 }
 return result;
}
export function downloadBackup(value:SavedState){
 const json=JSON.stringify(value,(_,v)=>v instanceof Uint8Array?Array.from(v):v,2);
 const url=URL.createObjectURL(new Blob([json],{type:'application/json'})),a=document.createElement('a');
 a.href=url;a.download='祈愿模拟器-备份-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
