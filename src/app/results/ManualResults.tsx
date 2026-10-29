import {Empty,Table,Tag} from 'antd';
import type {Account} from '../../engine/types';
import type {manual} from '../../simulation/trial';
import {targetNames} from '../../data/rules';
export function ManualResults({account:a,result:r}:{account:Account|null;result:ReturnType<typeof manual>|null}){
 if(!a||!r)return <Empty description="填个抽数点开始，就会接着现在的进度抽；星辉够 5 点马上换抽继续"/>;
 return <div data-testid="manual-result"><h2>这次抽到的</h2>
  <p className="manual-total">一共抽了 <strong>{r.spent.toLocaleString()}</strong> 抽 <Tag>其中星辉换的 {r.exchanged.toLocaleString()} 抽</Tag></p>
  <div className="count-list">{[...targetNames,'常驻五星角色','常驻五星武器'].map((name,i)=><div key={name}><span>{name}</span><strong>+{r.counts[i]}</strong><small>总共 {a.counts[i]}</small></div>)}</div>
  <section><h3>现在的抽卡进度</h3><p>角色池：五星垫了 {a.pools[0].five} 抽，四星垫了 {a.pools[0].four} 抽 · {a.pools[0].guaranteed?'下次出金一定是 UP':'下次出金不一定是 UP'} · 捕获明光第 {a.radiance} 步</p><p>武器池：五星垫了 {a.pools[1].five} 抽，四星垫了 {a.pools[1].four} 抽 · {a.pools[1].guaranteed?'下次出金一定是 UP':'下次出金不一定是 UP'} · 命定值 {a.fate} 点</p><p>手上星辉 {a.glitter} 点 · 四星角色满命 {Array.from(a.fourOwned).filter(v=>v===7).length} / {a.fourOwned.length} 个</p></section>
  <section><h3>最近的 {r.details.length} 次出货（四星和五星）</h3><p className="muted">最多留最近 100 条，抽得再多也不会把页面撑爆。</p>
   <Table size="small" rowKey="pull" pagination={{pageSize:10,showSizeChanger:false}} dataSource={r.details.slice().reverse()} columns={[
    {title:'第几抽',dataIndex:'pull',width:85},
    {title:'抽到了',dataIndex:'name',render:(name:string,row)=> <span>{row.rarity}★ {name}</span>},
    {title:'返的星辉',dataIndex:'glitter',align:'right'},
   ]}/>
  </section>
 </div>;
}
