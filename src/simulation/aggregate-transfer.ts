import {Aggregator} from './statistics';
export interface AggregateData{
 completed:number;successes:number;totalPulls:number;exchanged:number;remainingSum:number;
 glitterHistogram:number[];histogram:[number,number][];combinations:[string,number][];failures:[string,number][];
}
export function exportAggregate(a:Aggregator):AggregateData{return{completed:a.completed,successes:a.successes,totalPulls:a.totalPulls,exchanged:a.exchanged,remainingSum:a.remainingSum,glitterHistogram:a.glitterHistogram.slice(),histogram:[...a.histogram],combinations:[...a.combinations],failures:[...a.failures]};}
export function mergeAggregates(parts:AggregateData[]):Aggregator{
 const a=new Aggregator();
 for(const p of parts){
  a.completed+=p.completed;a.successes+=p.successes;a.totalPulls+=p.totalPulls;a.exchanged+=p.exchanged;a.remainingSum+=p.remainingSum;
  for(let i=0;i<5;i++)a.glitterHistogram[i]+=p.glitterHistogram[i];
  for(const key of ['histogram','combinations','failures'] as const){const map=a[key] as Map<string|number,number>;for(const[k,n]of p[key])map.set(k,(map.get(k)||0)+n);}
 }
 return a;
}
