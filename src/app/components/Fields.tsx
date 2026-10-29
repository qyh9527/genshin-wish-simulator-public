import {InputNumber,Select,Switch} from 'antd';
import type {ReactNode} from 'react';
export function Field({label,children}:{label:string;children:ReactNode}){return <label className="field"><span>{label}</span>{children}</label>;}
export function NumberField({label,value,onChange,min=0,max=100000}:{label:string;value:number;onChange:(v:number)=>void;min?:number;max?:number}){
 return <Field label={label}><InputNumber aria-label={label} value={value} min={min} max={max} precision={0} onChange={v=>onChange(v??min)} changeOnWheel={false}/></Field>;
}
export function OwnedField({label,value,onChange}:{label:string;value:number;onChange:(v:number)=>void}){
 return <Field label={label}><Select aria-label={label} value={value} onChange={onChange} options={Array.from({length:8},(_,i)=>({value:i,label:i===0?'还没有':'C'+(i-1)}))}/></Field>;
}
export function Toggle({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void}){return <Field label={label}><Switch aria-label={label} checked={value} onChange={onChange}/></Field>;}
