import {useEffect,useRef,useState} from 'react';
import {saveState} from './database';
import {parseSnapshot,type SavedState} from './snapshot';
export function useLocalState(value:SavedState){
 const [status,setStatus]=useState('存档已读好'),revision=useRef(0);
 useEffect(()=>{
  const id=++revision.current;
  try{parseSnapshot(value);if(!Number.isSafeInteger(value.manualBudget)||value.manualBudget<0||value.manualBudget>100000)throw new Error('自定义抽数越界');}catch{setStatus('这个设置填得不对，先保留上次存好的');return;}
  setStatus('正在存档…');
  // 每次变更立即进入串行事务；旧保存完成不能覆盖新保存的状态提示。
  saveState(value).then(()=>{if(revision.current===id)setStatus('已自动存好');},e=>{if(revision.current===id)setStatus('存档失败：'+String(e));});
 },[value]);
 return status;
}
