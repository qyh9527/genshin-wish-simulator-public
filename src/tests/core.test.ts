import {describe,it,expect} from 'vitest';
import {p5,q4,fourNames,standardNames} from '../data/rules';
import {defaultConfig,validate} from '../engine/config';
import {createAccount,fourSnapshot,characterGlitter,setPath,obtain,resetAccount} from '../engine/account';
import {draw} from '../engine/draw';
import {random,trialSeed} from '../engine/random';
import {runTrial,manual} from '../simulation/trial';
import {Aggregator,wilson} from '../simulation/statistics';
import type {Trial} from '../engine/types';
const config=()=>structuredClone(defaultConfig);
const sequence=(...values:number[])=>{let i=0;return()=>{if(i>=values.length)throw new Error('随机序列耗尽');return values[i++];};};
describe('规则与状态转移',()=>{
 it('概率断点与正式名单',()=>{
  expect(fourNames).toHaveLength(48);expect(standardNames).toHaveLength(8);
  for(const[n,v]of [[1,.006],[73,.006],[74,.066],[89,.966],[90,1],[200,1]])expect(p5(false,n)).toBeCloseTo(v);
  for(const[n,v]of [[1,.007],[62,.007],[63,.077],[76,.987],[77,1],[90,1]])expect(p5(true,n)).toBeCloseTo(v);
  expect([8,9,10].map(n=>q4(false,n))).toEqual([.051,.561,1]);expect([7,8,9].map(n=>q4(true,n))).toEqual([.06,.66,1]);
 });
 it('首次出金、歪后UP保证、双角色共享而武器独立',()=>{
  const a=createAccount(config());draw(a,0,sequence(0,.8,0));
  expect(a.counts[4]).toBe(1);expect(a.pools[0].guaranteed).toBe(true);expect(a.radiance).toBe(2);
  draw(a,1,sequence(0));expect(a.counts[1]).toBe(1);expect(a.radiance).toBe(2);expect(a.pools[0].guaranteed).toBe(false);expect(a.pools[1].five).toBe(0);
 });
 it('五星挤占不重置四星；下一次递延保证',()=>{
  const a=createAccount(config());a.pools[0].five=89;a.pools[0].four=9;a.pools[0].guaranteed=true;
  expect(draw(a,0,sequence(.99))).toBe(10);expect(a.pools[0].four).toBe(10);
  expect(draw(a,0,sequence(.9,0,0))).toBe(1);expect(a.pools[0].four).toBe(0);
 });
 it('明光0—3赢输与大保底计数转移',()=>{
  for(const c of [0,1,2]){
   const a=createAccount(config());a.radiance=c;draw(a,0,sequence(0,.1));expect(a.radiance).toBe(Math.max(0,c-1));
   const b=createAccount(config());b.radiance=c;draw(b,0,sequence(0,.9,0));expect(b.radiance).toBe(c+1);expect(b.pools[0].guaranteed).toBe(true);
  }
  const a=createAccount(config());a.radiance=3;draw(a,0,sequence(0));expect(a.radiance).toBe(1);expect(a.counts[0]).toBe(1);
  a.pools[0].guaranteed=true;a.radiance=2;draw(a,0,sequence(0));expect(a.radiance).toBe(2);
 });
 it('定轨与UP保底独立，命中后清除，换轨不改垫抽',()=>{
  const a=createAccount(config());draw(a,2,sequence(0,.6));expect(a.counts[3]).toBe(1);expect(a.fate).toBe(1);
  a.pools[1].guaranteed=true;draw(a,2,sequence(0));expect(a.counts[2]).toBe(1);expect(a.fate).toBe(0);expect(a.pools[1].guaranteed).toBe(false);
  a.fate=1;a.pools[1].five=25;a.pools[1].guaranteed=true;setPath(a,1);expect(a.fate).toBe(0);expect(a.pools[1].five).toBe(25);expect(a.pools[1].guaranteed).toBe(true);
 });
});
describe('星辉与目标停机',()=>{
 it('首次、第7份与第8份，四星动态满命',()=>{
  expect([0,6,7].map(n=>characterGlitter(n,true))).toEqual([0,10,25]);expect([0,6,7].map(n=>characterGlitter(n,false))).toEqual([0,2,5]);
  const a=new Uint8Array([6]);expect(obtain(a,0,false)).toBe(2);expect(a[0]).toBe(7);expect(obtain(a,0,false)).toBe(5);
 });
 it('零预算初始星辉兑换，最后一抽返还算剩余',()=>{
  const c=config();c.budget=0;c.glitter=5;c.targets=[1,0,0,0];c.initial=[6,0];c.character.guaranteed=true;
  const a=createAccount(c),t=runTrial(a,c,sequence(0));expect(t.success).toBe(true);expect(t.pulls).toBe(1);expect(t.remaining).toBe(2);expect(t.exchanged).toBe(3);expect(a.owned[0]).toBe(7);
  c.targets=[0,0,0,0];c.glitter=4;const z=runTrial(createAccount(c),c,()=>{throw new Error('不应抽卡');});expect(z.pulls).toBe(0);expect(z.remaining).toBe(0);expect(z.glitter).toBe(4);
 });
 it('另一UP武器顺带达标，全部目标即停',()=>{
  const c=config();c.budget=2;c.targets=[0,0,1,1];c.order=[2,3,0,1];
  const a=createAccount(c),t=runTrial(a,c,sequence(0,.6,0));expect(t.success).toBe(true);expect(t.pulls).toBe(2);expect(t.counts.slice(2,4)).toEqual([1,1]);expect(t.remaining).toBe(4);
 });
 it('手动满命仍可抽且星辉回投，不套目标停机',()=>{
  const c=config();c.initial=[7,0];c.targets=[0,0,0,0];const a=createAccount(c);
  const r=manual(a,0,1,sequence(0,.1,.9,.9,.9,.9,.9),0);expect(r.spent).toBe(6);expect(r.exchanged).toBe(5);expect(a.owned[0]).toBe(7);
 });
 it('五星武器每份返10星辉，四星武器返2',()=>{
  const a=createAccount(config());draw(a,2,sequence(0,.1));expect(a.glitter).toBe(10);draw(a,2,sequence(.02,0));expect(a.glitter).toBe(12);
 });
});
describe('隔离复现、校验与统计',()=>{
 it('快照固定且试验增长不污染其他试验',()=>{
  const c=config();c.upFourMax=true;c.fourMax=3;const snapshot=fourSnapshot(c);expect([...snapshot].filter(v=>v===7)).toHaveLength(3);expect([...snapshot.slice(0,3)]).toEqual([7,7,7]);
  const a=createAccount(c,snapshot),b=createAccount(c,snapshot);a.fourOwned[5]=7;expect(b.fourOwned[5]).toBe(snapshot[5]);resetAccount(a,c,snapshot);expect(a.fourOwned).toEqual(snapshot);
  const rng1=random(43),rng2=random(43);expect(Array.from({length:30},rng1)).toEqual(Array.from({length:30},rng2));expect(trialSeed(4,1)).not.toBe(trialSeed(4,2));
  const t1=runTrial(createAccount(c),c,random(trialSeed(9,0))),t2=runTrial(createAccount(c),c,random(trialSeed(9,0)));expect(t1).toEqual(t2);
 });
 it('拒绝不可达历史、满命冲突和溢出目标',()=>{
  const c=config();expect(validate(c)).toEqual([]);c.weapon.five=79;expect(validate(c).length).toBeGreaterThan(0);
  c.weapon.five=0;c.character.guaranteed=true;c.radiance=0;expect(validate(c).length).toBeGreaterThan(0);
  c.character.guaranteed=false;c.upFourMax=true;c.fourMax=2;expect(validate(c).length).toBeGreaterThan(0);
  c.fourMax=3;c.initial[0]=7;c.targets[0]=1;expect(validate(c).length).toBeGreaterThan(0);
 });
 it('手算统计夹具的分母、最近秩、组合与星辉频数',()=>{
  const a=new Aggregator();const fixture=(remaining:number,success:boolean,glitter=0):Trial=>({counts:success?[1,0,0,0,0,0]:[0,0,0,0,0,0],missing:success?[0,0,0,0]:[1,0,0,0],success,remaining,glitter,pulls:10,exchanged:2});
  for(const v of [1,3,8,10])a.add(fixture(v,true));a.add(fixture(0,false,4));const s=a.summary(100);
  expect(s.completed).toBe(5);expect(s.successes).toBe(4);expect(s.probability).toBe(.8);expect(s.remaining).toEqual({mean:5.5,median:3,p10:1,p90:10});expect(s.combinationTotal).toBe(5);expect(s.combinations[0].count).toBe(4);expect(s.failures[0]).toEqual({key:'1/0/0/0',count:1});expect(s.glitterHistogram).toEqual([4,0,0,0,1]);
  expect(s.interval).toEqual(wilson(4,5));expect(s.interval[0]).toBeLessThan(.8);expect(s.interval[1]).toBeGreaterThan(.8);
  const none=new Aggregator();none.add(fixture(0,false));expect(none.summary(0).remaining).toBeNull();expect(new Aggregator().summary(0).interval).toEqual([0,1]);
 });
});

describe('持久化备份',()=>{
 it('兼容升级前仅配置备份，恢复类型数组与明细',async()=>{
  const {parseSnapshot,defaults}=await import('../app/storage/snapshot');
  const c=config();c.budget=360;const old=parseSnapshot({config:c});expect(old.config.budget).toBe(360);expect(old.account).toBeNull();
  const state=defaults();state.account=createAccount(c);state.accountKey=JSON.stringify(c);state.sequence=2;
  state.manualResult={details:[{pull:1,rarity:5,name:'丝柯克',glitter:0}],spent:1,counts:[1,0,0,0,0,0],glitter:0,exchanged:0};
  const restored=parseSnapshot(JSON.parse(JSON.stringify(state,(_,v)=>v instanceof Uint8Array?Array.from(v):v)));
  expect(restored.account?.owned).toBeInstanceOf(Uint8Array);expect(restored.manualResult).toEqual(state.manualResult);expect(restored.sequence).toBe(2);
  expect(()=>parseSnapshot({config:{}})).toThrow();expect(()=>parseSnapshot({...state,version:2})).toThrow();
 });
 it('热循环调整与原逐抽执行顺序逐试验完全相同',()=>{
  for(const setup of [0,1,2]){
   const c=config();if(setup===1){c.targets=[1,1,1,1];c.order=[3,1,2,0];c.path=1;c.fate=1;}if(setup===2){c.budget=0;c.glitter=25;}
   for(let i=0;i<100;i++){
    const a=createAccount(c),b=createAccount(c),seed=trialSeed(7123,i),r=random(seed);
    let left=c.budget+Math.floor(b.glitter/5),cursor=0;b.exchanged=Math.floor(b.glitter/5);b.glitter%=5;
    while(cursor<4){const id=c.order[cursor];if(b.counts[id]>=c.targets[id]){cursor++;continue;}if(left===0)break;if(id>=2)setPath(b,id-2);left--;draw(b,id>=2?2:id,r);const n=Math.floor(b.glitter/5);left+=n;b.exchanged+=n;b.glitter%=5;}
    const t=runTrial(a,c,random(seed));expect(t.remaining).toBe(left);expect(a).toEqual(b);
   }
  }
 });
});

describe('并行聚合',()=>{
 it('完整直方图与组合跨分片合并，不合并局部Top7',async()=>{
  const {exportAggregate,mergeAggregates}=await import('../simulation/aggregate-transfer');
  const c=config(),all=new Aggregator(),parts=[new Aggregator(),new Aggregator(),new Aggregator()];
  for(let i=0;i<150;i++){const t=runTrial(createAccount(c),c,random(trialSeed(c.trialSeed,i)));all.add(t);parts[i%3].add(t);}
  expect(mergeAggregates(parts.map(exportAggregate)).summary(0)).toEqual(all.summary(0));
 });
});
