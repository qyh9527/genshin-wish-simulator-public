export interface PoolState{five:number;four:number;guaranteed:boolean;fourGuaranteed:boolean}
export interface Config{
 budget:number;glitter:number;initial:number[];standard:number[];
 fourTotal:number;fourMax:number;allFourMax:boolean;upFourMax:boolean;
 initSeed:number;trialSeed:number;character:PoolState;weapon:PoolState;
 radiance:number;path:number;fate:number;order:number[];targets:number[];
}
export interface Account{
 owned:Uint8Array;fourOwned:Uint8Array;pools:PoolState[];radiance:number;path:number;fate:number;
 counts:number[];glitter:number;pulls:number;exchanged:number;fourHits:number[];
}
export interface Detail{pull:number;rarity:number;name:string;glitter:number}
export interface Trial{counts:number[];missing:number[];success:boolean;remaining:number;glitter:number;pulls:number;exchanged:number}
