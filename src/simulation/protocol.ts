import type {AggregateData} from './aggregate-transfer';
import type {Account,Config} from '../engine/types';
import type {manual} from './trial';
export type Request={type:'batch';runId:number;config:Config;start?:number;count?:number}|{type:'manual';runId:number;config:Config;account?:Account;pool:number;path:number;budget:number;sequence:number}|{type:'cancel';runId:number};
export type Response={type:'progress'|'done';runId:number;aggregate:AggregateData}|{type:'manual';runId:number;account:Account;result:ReturnType<typeof manual>}|{type:'error';runId:number;message:string};
