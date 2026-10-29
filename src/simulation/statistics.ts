import type {Trial} from '../engine/types';
export interface Summary{
 completed:number;successes:number;totalPulls:number;exchanged:number;elapsed:number;
 glitterHistogram:number[];probability:number;interval:[number,number];remaining:null|{mean:number;median:number;p10:number;p90:number};
 combinations:{key:string;count:number}[];failures:{key:string;count:number}[];combinationTotal:number;cancelled:boolean;
}
export function wilson(success:number,n:number):[number,number]{
 if(!n)return[0,1];const z=1.95996398454,p=success/n,d=1+z*z/n;
 const center=(p+z*z/(2*n))/d,half=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return[Math.max(0,center-half),Math.min(1,center+half)];
}
export class Aggregator{
 glitterHistogram=[0,0,0,0,0];completed=0;successes=0;totalPulls=0;exchanged=0;remainingSum=0;
 histogram=new Map<number,number>();combinations=new Map<string,number>();failures=new Map<string,number>();
 add(t:Trial){
  this.glitterHistogram[t.glitter]++;this.completed++;this.totalPulls+=t.pulls;this.exchanged+=t.exchanged;
  const key=t.counts.join('/');this.combinations.set(key,(this.combinations.get(key)||0)+1);
  if(t.success){this.successes++;this.remainingSum+=t.remaining;this.histogram.set(t.remaining,(this.histogram.get(t.remaining)||0)+1);}
  else{const k=t.missing.join('/');this.failures.set(k,(this.failures.get(k)||0)+1);}
 }
 summary(elapsed:number,cancelled=false):Summary{
  let remaining:Summary['remaining']=null;
  if(this.successes){const sorted=[...this.histogram].sort((a,b)=>a[0]-b[0]);
   const quantile=(q:number)=>{const rank=Math.ceil(this.successes*q);let acc=0;for(const[v,n]of sorted){acc+=n;if(acc>=rank)return v;}return 0;};
   remaining={mean:this.remainingSum/this.successes,median:quantile(.5),p10:quantile(.1),p90:quantile(.9)};
  }
  const rank=(m:Map<string,number>)=>[...m].map(([key,count])=>({key,count})).sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key)).slice(0,7);
  return{completed:this.completed,successes:this.successes,totalPulls:this.totalPulls,exchanged:this.exchanged,elapsed,
   glitterHistogram:this.glitterHistogram.slice(),probability:this.completed?this.successes/this.completed:0,interval:wilson(this.successes,this.completed),remaining,
   combinations:rank(this.combinations),failures:rank(this.failures),combinationTotal:[...this.combinations.values()].reduce((a,b)=>a+b,0),cancelled};
 }
}
