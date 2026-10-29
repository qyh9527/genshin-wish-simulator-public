import {createRoot} from 'react-dom/client';
import {Alert,Button,ConfigProvider,Modal,theme} from 'antd';
import App from './App';
import {loadState} from './storage/database';
import {defaults,parseSnapshot} from './storage/snapshot';
import './styles/workspace.css';
import './styles/responsive.css';
const root=createRoot(document.getElementById('root')!);
root.render(<p>正在读存档…</p>);
async function boot(){
 try{const saved=await loadState();root.render(<App initial={saved===undefined?defaults():parseSnapshot(saved)}/>);}
 catch(error){root.render(<ConfigProvider theme={{algorithm:theme.darkAlgorithm}}><Alert type="error" title="读不了存档，原来的内容没动" description={String(error)}/><Button onClick={()=>void boot()}>再读一次</Button><Button onClick={()=>Modal.confirm({title:'用默认设置覆盖现在的存档？',okText:'确认覆盖',cancelText:'取消',content:'现在这份存档读不出来。请先保留之前下载的存档文件；继续的话会写入默认设置，进入后可以再读取存档文件。',onOk:()=>root.render(<App initial={defaults()}/>)})}>改用默认设置（会覆盖现在的存档）</Button></ConfigProvider>);}
}
void boot();
