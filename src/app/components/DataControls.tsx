import {useRef,useState} from 'react';
import {Alert,Button,Modal} from 'antd';
import {DownloadOutlined,UploadOutlined,UndoOutlined} from '@ant-design/icons';
import {defaults,downloadBackup,parseSnapshot,type SavedState} from '../storage/snapshot';
import {saveState} from '../storage/database';
export function DataControls({value,disabled,status,onRestore}:{value:SavedState;disabled:boolean;status:string;onRestore:(value:SavedState)=>void}){
 const file=useRef<HTMLInputElement>(null),[error,setError]=useState(''),[replacing,setReplacing]=useState(false);
 const replace=async(next:SavedState)=>{
  setReplacing(true);
  try{await saveState(next,true);onRestore(next);setError('');}
  catch(e){setError('未替换当前数据：'+String(e));throw e;}
  finally{setReplacing(false);}
 };
 return <section><h2>存档</h2><p aria-live="polite">存档读好了 · {status}</p>
  <div className="run-actions"><Button disabled={replacing} icon={<DownloadOutlined/>} onClick={()=>downloadBackup(value)}>存一份到电脑</Button>
   <Button disabled={disabled||replacing} icon={<UploadOutlined/>} onClick={()=>file.current?.click()}>读取存档文件</Button>
   <Button disabled={disabled||replacing} icon={<UndoOutlined/>} onClick={()=>Modal.confirm({okText:'确定',cancelText:'取消',title:'全部恢复出厂？',content:'所有设置和体验进度都会清空。清之前会先帮你下载一份存档，浏览器里也会留一份备份。',onOk:async()=>{downloadBackup(value);await replace(defaults());}})}>恢复出厂设置</Button>
  </div>
  <input ref={file} type="file" accept=".json,application/json" aria-label="选择存档文件" hidden onChange={async e=>{
   const selected=e.target.files?.[0];e.target.value='';if(!selected)return;
   try{if(selected.size>2000000)throw new Error('存档文件太大了（超过 2 MB）。');const next=parseSnapshot(JSON.parse(await selected.text()));
    Modal.confirm({okText:'确定',cancelText:'取消',title:'用这个存档替换现在的内容？',content:'会用文件里的设置和体验进度覆盖现在的。覆盖前会先帮你下载一份当前存档。',onOk:async()=>{downloadBackup(value);await replace(next);}});
   }catch(error){setError('读取失败：'+String(error));}
  }}/>
  <p className="muted">设置、体验进度和随机码会自动存在当前这个 Chrome 里，不会上传。清理浏览器数据、换浏览器或挪动文件位置，都可能找不到存档，这时用「读取存档文件」恢复。跑一百万次的结果不保存。</p>
  {error&&<Alert type="error" title={error}/>}
 </section>;
}
