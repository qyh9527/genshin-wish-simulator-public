import {Empty,Select,Table,Tag} from 'antd';
import {useState} from 'react';
import type {Summary} from '../../simulation/statistics';
const n=(v:number)=>v.toLocaleString('zh-CN');
const pct=(v:number)=>(v*100).toFixed(3)+'%';
function combination(key:string){const v=key.split('/');return '丝柯克 '+v[0]+' 个、爱可菲 '+v[1]+' 个 · 苍耀 '+v[2]+' 把、香韵奏者 '+v[3]+' 把 · 常驻角色 '+v[4]+' 个、常驻武器 '+v[5]+' 把';}
export function BatchResults({result:r}:{result:Summary|null}){
 const[top,setTop]=useState(5);
 if(!r)return <Empty description="先填好预算和想要的角色或武器，再点「开始跑 100 万次」"/>;
 const combos=r.combinations.slice(0,top),coverage=combos.reduce((s,x)=>s+x.count,0),failures=r.completed-r.successes;
 return <div data-testid="batch-result" data-completed={r.completed}>
  <div className="result-heading"><h2>模拟结果</h2><Tag>{r.cancelled?'你中途停下了，这是跑完的部分':r.completed===1000000?'100 万次跑完了':'还在跑，下面是临时结果'}</Tag></div>
  <div className="headline"><span>全部想要的都拿到的概率</span><strong>{r.completed?pct(r.probability):'—'}</strong><p>{n(r.successes)} 次全部拿到，一共跑了 {n(r.completed)} 次</p></div>
  <p className="muted">考虑模拟次数有限，成功率的 95% 估计范围是：{r.completed?r.interval.map(pct).join(' — '):'还没数据'}。这个范围只考虑随机波动，不包含算法和账号假设的偏差。</p>
  <section><h3>拿到全部目标时，还剩多少抽</h3>{r.remaining?<div className="metrics">
   <div><span>最中间的情况</span><strong>{n(r.remaining.median)}</strong></div><div><span>平均剩</span><strong>{r.remaining.mean.toFixed(2)}</strong></div><div><span>中间八成情况的剩余抽数</span><strong>{n(r.remaining.p10)} — {n(r.remaining.p90)}</strong></div>
  </div>:<p>还没有一次全部拿到</p>}<p className="muted">只统计这 {n(r.successes)} 次成功的。最后一抽返的星辉也换成了抽数；剩不到 5 点的星辉没法再换，就不算进抽数。</p><p className="muted">停下来时手里剩的星辉（全部 {n(r.completed)} 次）：{r.glitterHistogram.map((count,i)=>i+' 星辉 '+n(count)+' 次').join('；')}。</p></section>
  <section><div className="result-heading"><h3>最常见的五星结果搭配</h3><Select aria-label="显示几种搭配" value={top} onChange={setTop} options={[3,4,5,6,7].map(value=>({value,label:value+' 种'}))}/></div>
   <Table size="small" pagination={false} rowKey="key" dataSource={combos} columns={[
    {title:'五星结果（各拿到几个）',dataIndex:'key',render:combination},
    {title:'出现了几次',dataIndex:'count',align:'right',render:n,responsive:['md']},
    {title:'占多少',dataIndex:'count',align:'right',render:(v:number)=>pct(v/r.completed)},
   ]}/><p className="muted">百分比按全部 {n(r.completed)} 次算。这几种加起来占 {r.completed?pct(coverage/r.completed):'—'}，剩下 {n(r.completed-coverage)} 次是其他搭配。</p>
  </section>
  <section><h3>没拿到的东西，差在哪</h3><Table size="small" pagination={false} rowKey="key" dataSource={r.failures.slice(0,top)} locale={{emptyText:'没有没拿全的记录'}} columns={[
   {title:'还差什么',dataIndex:'key',render:(k:string)=>{const v=k.split('/');return '丝柯克差 '+v[0]+' 个、爱可菲差 '+v[1]+' 个 · 苍耀差 '+v[2]+' 把、香韵奏者差 '+v[3]+' 把';}},
   {title:'在没拿全的里面占',dataIndex:'count',align:'right',render:(v:number)=>pct(v/failures)},
  ]}/><p className="muted">百分比按没拿全的 {n(failures)} 次算。没拿全就结束了，不会再多抽去猜还差多少。</p></section>
  <p className="muted">一共抽了 {n(r.totalPulls)} 抽 · 其中星辉换了 {n(r.exchanged)} 抽 · 用了 {(r.elapsed/1000).toFixed(2)} 秒 · 每秒 {r.elapsed?Math.round(r.totalPulls/r.elapsed*1000).toLocaleString():0} 抽</p>
 </div>;
}
