import {createAccount,fourSnapshot,resetAccount} from '../engine/account';
import {validate} from '../engine/config';
import {random,trialSeed} from '../engine/random';
import {manual,runTrial} from './trial';
import {exportAggregate} from './aggregate-transfer';
import {Aggregator} from './statistics';
import type {Request,Response} from './protocol';
let cancelled=false;
const send=(message:Response)=>self.postMessage(message);
self.onmessage=async(event:MessageEvent<Request>)=>{
 const r=event.data;if(r.type==='cancel'){cancelled=true;return;}
 try{
  const errors=validate(r.config);if(errors.length)throw new Error(errors.join(' '));
  if(r.type==='manual'){
   const account=r.account||createAccount(r.config);
   const result=manual(account,r.pool,r.budget,random(trialSeed(r.config.trialSeed,r.sequence)),r.path);
   send({type:'manual',runId:r.runId,account,result});return;
  }
  cancelled=false;const snapshot=fourSnapshot(r.config),account=createAccount(r.config,snapshot),stats=new Aggregator();
  const first=r.start??0,total=r.count??1000000;
  const start=performance.now();let last=start,yieldAt=start;
  while(stats.completed<total&&!cancelled){
   const end=Math.min(total,stats.completed+256);
   for(;stats.completed<end;){resetAccount(account,r.config,snapshot);stats.add(runTrial(account,r.config,random(trialSeed(r.config.trialSeed,first+stats.completed))));if(performance.now()-yieldAt>=12)break;}
   const now=performance.now();
   if(now-last>=150){send({type:'progress',runId:r.runId,aggregate:exportAggregate(stats)});last=now;}
   if(now-yieldAt>=12){await new Promise(resolve=>setTimeout(resolve,0));yieldAt=performance.now();}
  }
  send({type:'done',runId:r.runId,aggregate:exportAggregate(stats)});
 }catch(e){send({type:'error',runId:r.runId,message:e instanceof Error?e.message:String(e)});}
};
