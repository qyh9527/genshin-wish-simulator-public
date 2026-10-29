import {useMemo,useState} from 'react';
import {Alert,Button,ConfigProvider,Modal,Progress,Segmented,Select,Tag,theme} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {PlayCircleOutlined,ReloadOutlined,StopOutlined,ExperimentOutlined} from '@ant-design/icons';
import {validate} from '../engine/config';
import type {Config} from '../engine/types';
import {Targets} from './config/Targets';
import {AccountSettings} from './config/AccountSettings';
import {AdvancedSettings} from './config/AdvancedSettings';
import {Field,NumberField} from './components/Fields';
import {ModelNotes} from './components/ModelNotes';
import {BatchResults} from './results/BatchResults';
import {ManualResults} from './results/ManualResults';
import {useSimulation} from './hooks/useSimulation';
import {DataControls} from './components/DataControls';
import {useLocalState} from './storage/useLocalState';
import type {SavedState} from './storage/snapshot';
export default function App({initial}:{initial:SavedState}){
 const[c,setConfig]=useState<Config>(()=>structuredClone(initial.config)),[mode,setMode]=useState(initial.mode);
 const[pool,setPool]=useState(initial.pool),[path,setPath]=useState(initial.path),[manualBudget,setManualBudget]=useState(initial.manualBudget);
 const[errors,setErrors]=useState<string[]>([]),sim=useSimulation(initial);
 const saved=useMemo<SavedState>(()=>({version:1,config:c,mode,pool,path,manualBudget,account:sim.account,accountKey:sim.accountKey,sequence:sim.sequence,manualResult:sim.manualResult}),[c,mode,pool,path,manualBudget,sim.account,sim.accountKey,sim.sequence,sim.manualResult]);
 const storageStatus=useLocalState(saved);
 const restore=(v:SavedState)=>{setConfig(v.config);setMode(v.mode);setPool(v.pool);setPath(v.path);setManualBudget(v.manualBudget);sim.restore(v);setErrors([]);};
 const key=JSON.stringify(c),resultKey=mode==='batch'?sim.batchKey:sim.accountKey,stale=!!resultKey&&resultKey!==key;
 const change=(patch:Partial<Config>)=>setConfig(v=>({...v,...patch}));
 const start=()=>{
  const list=validate(c);if(mode==='manual'&&(!Number.isSafeInteger(manualBudget)||manualBudget<0||manualBudget>100000))list.push('抽数要填 0 到 100000 之间的整数。');
  if(mode==='manual'&&stale&&sim.account)list.push('账号设置改过了，请先点「清空体验进度」，不然新设置会和旧进度混在一起。');
  setErrors(list);if(list.length)return;
  if(mode==='batch')sim.startBatch(c,key);else sim.startManual(c,key,pool,path,manualBudget);
 };
 return <ConfigProvider locale={zhCN} componentSize="small" theme={{algorithm:theme.darkAlgorithm,token:{colorBgBase:'#191a1b',colorTextBase:'#f4f4f5',colorPrimary:'#73a9ed',fontSize:13,borderRadius:5,controlHeightSM:28,fontFamily:'system-ui,"Microsoft YaHei",sans-serif'}}}>
 <div className="shell">
  <header><div className="brand"><ExperimentOutlined/><div><h1>原神祈愿实验室</h1><p>预算有数，祈愿有据</p></div></div><div className="version"><Tag>7.1 规则数据</Tag><span>断网也能用 · 你的数据不会上传</span></div></header>
  <div className="model-warning">「捕获明光」用的是偏保守的算法，算出来的成功率可能偏低。软保底、四星歪出规则和四星初始命座也都是估算，不等于游戏服务器的真实结果。</div>
  <div className="workspace"><aside>
   <Segmented block aria-label="模拟模式" value={mode} onChange={v=>setMode(String(v))} options={[{value:'batch',label:'跑一百万次看看'},{value:'manual',label:'抽卡体验'}]}/>
   <section><h2>{mode==='batch'?'抽卡预算':'体验用的账号设置'}</h2><div className="pair"><NumberField label="准备了多少抽" value={c.budget} onChange={v=>change({budget:v})}/><NumberField label="手上的星辉" value={c.glitter} max={1000000} onChange={v=>change({glitter:v})}/></div><p className="muted">每攒够 5 星辉就马上去换 1 抽继续抽，不算星尘。最多填 100,000 抽；星辉换来的抽数另外算。</p></section>
   <Targets config={c} change={change}/>
   <AccountSettings config={c} change={change}/><AdvancedSettings config={c} change={change}/><ModelNotes/><DataControls value={saved} disabled={sim.busy} status={storageStatus} onRestore={restore}/>
  </aside><main>
   <div className="run-panel">
    {mode==='manual'&&<><h2>这次抽多少</h2><div className="pair"><Field label="抽哪个池"><Select aria-label="抽哪个池" value={pool} onChange={setPool} options={[{value:0,label:'角色 A · 丝柯克'},{value:1,label:'角色 B · 爱可菲'},{value:2,label:'武器活动池'}]}/></Field><NumberField label="这次先抽几抽" value={manualBudget} onChange={setManualBudget}/></div>{pool===2&&<Field label="这次定轨哪把武器"><Select aria-label="这次定轨哪把武器" value={path} onChange={setPath} options={[{value:-1,label:'无定轨'},{value:0,label:'苍耀 A'},{value:1,label:'香韵奏者 B'}]}/></Field>}<p className="muted">每点一次都接着上次的账号继续抽。这里不会因为达成就停下，满命以后照样能抽。</p></>}
    <div className="run-actions"><Button type="primary" icon={<PlayCircleOutlined/>} loading={sim.busy} onClick={start}>{mode==='batch'?'开始跑 100 万次':'开始抽'}</Button>
     {sim.busy&&<Button icon={<StopOutlined/>} onClick={sim.cancel}>停下</Button>}
     {mode==='manual'&&<Button disabled={sim.busy} icon={<ReloadOutlined/>} onClick={()=>Modal.confirm({title:'清空体验进度？',content:'清掉这次体验的抽卡进度，下一轮从左边设置的状态重新开始。',onOk:()=>sim.reset()})}>清空体验进度</Button>}
    </div>
    {mode==='batch'&&<><Progress percent={Number(((sim.batch?.completed||0)/10000).toFixed(2))} showInfo={false}/><p aria-live="polite" className="progress-label">{sim.busy?'正在模拟':'已经跑了'} {(sim.batch?.completed||0).toLocaleString()} / 1,000,000 次{sim.batch?' · '+(sim.batch.elapsed/1000).toFixed(1)+' 秒':''}</p></>}
    {(errors.length>0||sim.error)&&<Alert type="error" showIcon title="这里还没填对" description={<ul>{[...errors,...(sim.error?[sim.error]:[])].map((e,i)=><li key={i}>{e}</li>)}</ul>}/>}
    {stale&&<Alert type="warning" showIcon title="设置改过了，下面的结果还是旧的" description="下面是上一次开始时的设置算出来的。改设置不会影响已经在跑的；想用新设置抽卡，请先点「清空体验进度」。"/>}
   </div>
   <div className="results">{mode==='batch'?<BatchResults result={sim.batch}/>:<ManualResults account={sim.account} result={sim.manualResult}/>}</div>
  </main></div>
  <footer>结果按官方公示和玩家社区推算，不会和游戏服务器完全一样。账号生成码 {c.initSeed} · 随机码 {c.trialSeed}</footer>
 </div></ConfigProvider>;
}
