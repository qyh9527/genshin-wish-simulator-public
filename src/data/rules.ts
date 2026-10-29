import official from './official.json';
export const MODEL_ID='community-counter-conservative-v1';
export const DATA_VERSION='7.1 / 2026-10-23';
export const standardNames=official[0].r5_prob_list.filter(x=>!x.is_up).map(x=>x.item_name);
export const fourNames=official[0].r4_prob_list.filter(x=>x.item_type==='角色').map(x=>x.item_name);
export const targetNames=['丝柯克 A','爱可菲 B','苍耀 A','香韵奏者 B'];
export const sources=official.map(x=>x.url);
export function p5(w:boolean,n:number):number{return w?(n>=77?1:n<=62?.007:.007+.07*(n-62)):(n>=90?1:n<=73?.006:Math.min(1,.006+.06*(n-73)));}
export function q4(w:boolean,n:number):number{return w?(n>=9?1:n===8?.66:.06):(n>=10?1:n===9?.561:.051);}
export const fiveTables=[false,true].map(w=>Float64Array.from({length:92},(_,n)=>p5(w,n)));
export const fourTables=[false,true].map(w=>Float64Array.from({length:92},(_,n)=>q4(w,n)));
