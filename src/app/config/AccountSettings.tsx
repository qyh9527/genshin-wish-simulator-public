import {Collapse,Tag} from 'antd';
import {standardNames,fourNames} from '../../data/rules';
import {NumberField,OwnedField,Toggle} from '../components/Fields';
import type {Config} from '../../engine/types';
export function AccountSettings({config:c,change}:{config:Config;change:(patch:Partial<Config>)=>void}){
 return <Collapse ghost items={[
  {key:'four',label:'四星角色 · '+(c.allFourMax?'全部满命':c.fourMax+' / '+c.fourTotal+' 个已满命'),children:<>
   <Toggle label="四星角色全部满命" value={c.allFourMax} onChange={v=>change({allFourMax:v})}/>
   {!c.allFourMax&&<><div className="pair"><NumberField label="池子里一共有几个四星角色" value={c.fourTotal} min={4} max={1000} onChange={v=>change({fourTotal:v})}/><NumberField label="其中已经满命几个" value={c.fourMax} max={c.fourTotal} onChange={v=>change({fourMax:v})}/></div>
    <p>还没满命：{c.fourTotal-c.fourMax} 个</p><Toggle label="这期三个 UP 四星都满命了" value={c.upFourMax} onChange={v=>change({upFourMax:v})}/></>}
   <NumberField label="账号生成码" value={c.initSeed} max={2147483647} onChange={v=>change({initSeed:v})}/>
   <p className="muted">没满命的四星，初始各有 0 到 6 个，是随机的。整轮模拟都从这一套假设账号出发，每次模拟单独成长。改了这里的数字，就等于换了一套假设账号。</p>
   {c.fourTotal!==48&&<Tag color="warning">这是你自己设的账号</Tag>}
   <details><summary>7.1 官方可抽到的四星名单（{fourNames.length} 名）</summary><p className="muted">{fourNames.join('、')}</p></details>
  </>},
  {key:'standard',label:'常驻五星现在几命 · 8 个',children:<><p className="muted">只在活动池歪到这些角色时，用来算返多少星辉。这里不模拟常驻池。</p><div className="pair">{standardNames.map((name,i)=><OwnedField key={name} label={name} value={c.standard[i]} onChange={v=>change({standard:c.standard.map((x,j)=>i===j?v:x)})}/>)}</div></>},
 ]}/>;
}
