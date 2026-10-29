import {Button,InputNumber} from 'antd';
import {ArrowUpOutlined,ArrowDownOutlined} from '@ant-design/icons';
import {targetNames} from '../../data/rules';
import {OwnedField} from '../components/Fields';
import type {Config} from '../../engine/types';
export function Targets({config:c,change}:{config:Config;change:(patch:Partial<Config>)=>void}){
 const move=(index:number,delta:number)=>{const order=c.order.slice();[order[index],order[index+delta]]=[order[index+delta],order[index]];change({order});};
 return <section><h2>我想要什么 <small>按这个顺序抽，中途顺带抽到的也算</small></h2>
  <div className="target-head"><span>要什么 / 现在有什么</span><span>想再抽几个</span><span>先抽哪个</span></div>
  {c.order.map((id,index)=><div className="target-row" key={id}>
   <div><strong>{targetNames[id]}</strong>{id<2?<OwnedField label={id===0?'角色 A 初始':'角色 B 初始'} value={c.initial[id]} onChange={v=>change({initial:c.initial.map((x,i)=>i===id?v:x)})}/>:<small>一把就是 R1，抽到几把算几个</small>}</div>
   <InputNumber aria-label={targetNames[id]+'想再抽几个'} value={c.targets[id]} min={0} max={id<2?7-c.initial[id]:100} precision={0} onChange={v=>change({targets:c.targets.map((x,i)=>i===id?(v??0):x)})}/>
   <div className="reorder"><Button aria-label={targetNames[id]+'往前排'} disabled={index===0} icon={<ArrowUpOutlined/>} onClick={()=>move(index,-1)}/><Button aria-label={targetNames[id]+'往后排'} disabled={index===3} icon={<ArrowDownOutlined/>} onClick={()=>move(index,1)}/></div>
  </div>)}
  <p className="muted">不想要的就填 0。角色最多到满命 C6；全都要到了会马上停。</p>
 </section>;
}
