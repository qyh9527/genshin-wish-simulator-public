import SimulationWorker from './simulation.worker?worker&inline';
import {mergeAggregates,type AggregateData} from './aggregate-transfer';
import type {Config} from '../engine/types';
import type {Response} from './protocol';
import type {Summary} from './statistics';
export function runParallel(config:Config,runId:number,onProgress:(s:Summary)=>void,onDone:(s:Summary)=>void,onError:(message:string)=>void){
 const count=Math.min(8,Math.max(1,(navigator.hardwareConcurrency||2)-2));
 const workers:Worker[]=[],parts=new Map<number,AggregateData>(),done=new Set<number>();
 const start=performance.now();let lastReport=start,closed=false,cancelling=false,timer:ReturnType<typeof setTimeout>|undefined;
 const summary=()=>mergeAggregates([...parts.values()]).summary(performance.now()-start,cancelling);
 const terminate=()=>{closed=true;workers.forEach(w=>w.terminate());if(timer)clearTimeout(timer);};
 const finish=()=>{const s=summary();terminate();onDone(s);};
 try{
  for(let i=0;i<count;i++){
   const w=new SimulationWorker();workers.push(w);
   w.onerror=e=>{if(closed)return;terminate();onError(e.message);};
   w.onmessage=(event:MessageEvent<Response>)=>{
    if(closed||event.data.runId!==runId)return;
    const r=event.data;
    if(r.type==='error'){terminate();onError(r.message);return;}
    if(r.type==='manual')return;
    parts.set(i,r.aggregate);
    if(r.type==='done')done.add(i);
    if(done.size===count)finish();else if(performance.now()-lastReport>=150){lastReport=performance.now();onProgress(summary());}
   };
   const first=Math.floor(i*1000000/count),last=Math.floor((i+1)*1000000/count);
   w.postMessage({type:'batch',runId,config,start:first,count:last-first});
  }
 }catch(e){terminate();onError(String(e));}
 return{terminate,cancel(){if(closed)return;cancelling=true;workers.forEach(w=>w.postMessage({type:'cancel',runId}));if(!timer)timer=setTimeout(finish,700);}};
}
