import {Collapse,Select} from 'antd';
import {Field,NumberField,Toggle} from '../components/Fields';
import type {Config,PoolState} from '../../engine/types';
export function AdvancedSettings({config:c,change}:{config:Config;change:(patch:Partial<Config>)=>void}){
 const pool=(key:'character'|'weapon',patch:Partial<PoolState>)=>change({[key]:{...c[key],...patch}});
 return <Collapse ghost items={[{key:'advanced',label:'已有的保底进度（不清楚可不改）',children:<>
  {(['character','weapon'] as const).map(key=><div key={key} className="advanced-pool"><h3>{key==='character'?'两个角色池共用一套进度':'武器池单独算'}</h3>
   <div className="pair"><NumberField label={(key==='character'?'角色池':'武器池')+'五星垫抽'} value={c[key].five} max={key==='character'?89:76} onChange={v=>pool(key,{five:v})}/><NumberField label={(key==='character'?'角色池':'武器池')+'四星垫抽'} value={c[key].four} max={89} onChange={v=>pool(key,{four:v})}/></div>
   <Toggle label={(key==='character'?'角色池':'武器池')+'下次出金必是 UP'} value={c[key].guaranteed} onChange={v=>pool(key,{guaranteed:v})}/>
   <Toggle label={(key==='character'?'角色池':'武器池')+'下次四星必是 UP'} value={c[key].fourGuaranteed} onChange={v=>pool(key,{fourGuaranteed:v})}/>
  </div>)}
  <NumberField label="捕获明光计算用的数（默认 1）" value={c.radiance} max={3} onChange={v=>change({radiance:v})}/>
  <Field label="武器池现在定轨的是"><Select aria-label="武器池现在定轨的是" value={c.path} options={[{value:-1,label:'无定轨'},{value:0,label:'苍耀 A'},{value:1,label:'香韵奏者 B'}]} onChange={v=>change({path:v,fate:0})}/></Field>
  <NumberField label="命定值已有几点" value={c.fate} max={1} onChange={v=>change({fate:v})}/>
  <NumberField label="随机码（填同一个数能重现结果）" value={c.trialSeed} max={2147483647} onChange={v=>change({trialSeed:v})}/>
  <p className="muted">换定轨或取消定轨会把命定值清零，垫抽和「下次必是 UP」不受影响。按玩家社区推算，武器最迟第 77 抽出金，靠定轨最多 154 抽拿到；官方写的最迟是 80 / 160 抽。</p>
 </>}]} />;
}
