import {runParallel} from '../../simulation/parallel';
import {useEffect,useRef,useState} from 'react';
import SimulationWorker from '../../simulation/simulation.worker?worker&inline';
import type {Config,Account} from '../../engine/types';
import type {Request,Response} from '../../simulation/protocol';
import type {Summary} from '../../simulation/statistics';
import type {SavedState} from '../storage/snapshot';
import type {manual} from '../../simulation/trial';
export function useSimulation(initial:SavedState){
 const parallel=useRef<ReturnType<typeof runParallel>|null>(null);
 const activeMode=useRef('batch'),worker=useRef<Worker|null>(null),runId=useRef(0),sequence=useRef(initial.sequence),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[batch,setBatch]=useState<Summary|null>(null);
 const [account,setAccount]=useState<Account|null>(initial.account),[manualResult,setManualResult]=useState<ReturnType<typeof manual>|null>(initial.manualResult);
 const [batchKey,setBatchKey]=useState(''),[accountKey,setAccountKey]=useState(initial.accountKey);const latest=useRef<Summary|null>(null);
 const dispose=()=>{parallel.current?.terminate();parallel.current=null;worker.current?.terminate();worker.current=null;if(timer.current)clearTimeout(timer.current);timer.current=null;};
 useEffect(()=>()=>{parallel.current?.terminate();worker.current?.terminate();if(timer.current)clearTimeout(timer.current);},[]);
 function launch(request:Request,key:string){
  dispose();activeMode.current=request.type;setError('');setBusy(true);if(request.type==='batch')setBatchKey(key);
  try{
   const w=new SimulationWorker();worker.current=w;
   w.onerror=e=>{if(worker.current!==w)return;setError('计算过程出错了：'+e.message);setBusy(false);dispose();};
   w.onmessage=(event:MessageEvent<Response>)=>{
    const r=event.data;if(r.runId!==runId.current)return;
    if(r.type==='error'){setError(r.message);setBusy(false);dispose();}
    else if(r.type==='manual'){setAccountKey(key);setAccount(r.account);setManualResult(r.result);setBusy(false);dispose();}

   };
   w.postMessage(request);
  }catch(e){setError('计算程序没能启动：'+String(e));setBusy(false);dispose();}
 }
 return{busy,error,batch,account,manualResult,batchKey,accountKey,sequence:sequence.current,
  restore(value:SavedState){dispose();runId.current++;sequence.current=value.sequence;setBusy(false);setAccount(value.account);setManualResult(value.manualResult);setAccountKey(value.accountKey);setBatch(null);setBatchKey('');setError('');},
  startBatch(c:Config,key:string){
   dispose();const id=++runId.current;latest.current=null;setBatch(null);setBatchKey(key);setBusy(true);setError('');activeMode.current='batch';
   parallel.current=runParallel(structuredClone(c),id,s=>{if(id!==runId.current)return;latest.current=s;setBatch(s);},s=>{if(id!==runId.current)return;setBatch(s);setBusy(false);parallel.current=null;},message=>{if(id!==runId.current)return;setError(message);setBusy(false);parallel.current=null;});
  },
  startManual(c:Config,key:string,pool:number,path:number,budget:number){launch({type:'manual',runId:++runId.current,config:structuredClone(c),account:account??undefined,pool,path,budget,sequence:sequence.current++},key);},
  cancel(){
   if(parallel.current){parallel.current.cancel();return;}
   const id=runId.current;worker.current?.postMessage({type:'cancel',runId:id});
   timer.current=setTimeout(()=>{if(id!==runId.current)return;dispose();runId.current++;setBusy(false);if(activeMode.current==='batch'&&latest.current)setBatch({...latest.current,cancelled:true});},800);
  },
  reset(){dispose();runId.current++;sequence.current=0;setBusy(false);setAccount(null);setManualResult(null);setAccountKey('');},
 };
}
