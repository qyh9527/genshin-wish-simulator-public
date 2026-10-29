import {test,expect,type Page} from '@playwright/test';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {defaultConfig} from '../engine/config';

const release=resolve('../release/genshin抽卡模拟器.html');

// 直接读取 IndexedDB 库 genshin-wish-lab / store state / key current；兼容记录被包装或二次字符串化的实现。
async function readStoredState(page:Page):Promise<unknown>{
 return page.evaluate(()=>new Promise<unknown>((ok,fail)=>{
  const open=indexedDB.open('genshin-wish-lab');
  open.onerror=()=>fail(open.error);
  open.onsuccess=()=>{
   const db=open.result;
   if(!db.objectStoreNames.contains('state')){db.close();ok(null);return;}
   const get=db.transaction('state','readonly').objectStore('state').get('current');
   get.onerror=()=>{const e=get.error;db.close();fail(e);};
   get.onsuccess=()=>{const value=get.result??null;db.close();ok(value);};
  };
 }));
}
const storedText=(value:unknown)=>JSON.stringify(value)?.replace(/\\"/g,'"')??'';

test('备份导入导出、恢复默认与体验进度持久化',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 const budget=page.getByRole('spinbutton',{name:'准备了多少抽'});
 const loaded=()=>expect(page.getByText('存档读好了')).toBeVisible();
 const saved=()=>expect(page.getByText('已自动存好')).toBeVisible();

 await page.goto(pathToFileURL(release).href);
 await loaded();

 // 1. 预算改动写入 IndexedDB，刷新后保留
 await budget.fill('321');
 await budget.blur();
 await saved();
 await expect.poll(async()=>storedText(await readStoredState(page))).toContain('"budget":321');
 await page.reload();
 await loaded();
 await expect(budget).toHaveValue('321');

 // 2. 导入备份：原生 file input 上传，确认弹窗后应用新配置
 const dir=await mkdtemp(resolve(tmpdir(),'gacha-storage-'));
 const backup=resolve(dir,'backup.json');
 await writeFile(backup,JSON.stringify({config:{...defaultConfig,budget:360,fourMax:35}}));
 await page.getByLabel('选择存档文件').setInputFiles(backup);
 const importConfirm=page.getByRole('dialog').filter({hasText:'用这个存档替换现在的内容？'});
 await expect(importConfirm).toBeVisible();
 await importConfirm.getByRole('button',{name:/确\s*定/}).click();
 await expect(importConfirm).toBeHidden();
 await expect(budget).toHaveValue('360');

 // 3. 导出备份导出当前配置
 const[download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'存一份到电脑'}).click()]);
 const exported=resolve(dir,'exported.json');
 await download.saveAs(exported);
 const payload=JSON.parse(await readFile(exported,'utf8'));
 expect(payload.config.budget).toBe(360);
 expect(payload.config.fourMax).toBe(35);

 // 4. 恢复默认：确认后回到 600，刷新仍为 600
 await page.getByRole('button',{name:'恢复出厂设置'}).click();
 const resetConfirm=page.getByRole('dialog').filter({hasText:'全部恢复出厂'});
 await expect(resetConfirm).toBeVisible();
 await resetConfirm.getByRole('button',{name:/确\s*定/}).click();
 await expect(resetConfirm).toBeHidden();
 await expect(budget).toHaveValue('600');
 await page.reload();
 await loaded();
 await expect(budget).toHaveValue('600');

 // 无效编辑不能覆盖最后一次可恢复存档。
 await page.getByText('四星角色 · 24 / 48 个已满命',{exact:true}).click();
 await page.getByRole('spinbutton',{name:'池子里一共有几个四星角色'}).fill('4');
 await page.getByRole('spinbutton',{name:'池子里一共有几个四星角色'}).blur();
 await expect(page.getByText(/这个设置填得不对/)).toBeVisible();
 await page.reload();
 await page.getByText('四星角色 · 24 / 48 个已满命',{exact:true}).click();
 await expect(page.getByRole('spinbutton',{name:'池子里一共有几个四星角色'})).toHaveValue('48');
 // 无效编辑后恢复默认仍保留数据库里的最后有效快照。
 await page.getByRole('spinbutton',{name:'池子里一共有几个四星角色'}).fill('4');
 await expect(page.getByText(/这个设置填得不对/)).toBeVisible();
 await page.getByRole('button',{name:'恢复出厂设置'}).click();
 await page.getByRole('dialog').getByRole('button',{name:/确\s*定/}).click();
 await expect(budget).toHaveValue('600');
 const previous=await page.evaluate(()=>new Promise<any>((resolve,reject)=>{
  const request=indexedDB.open('genshin-wish-lab');request.onerror=()=>reject(request.error);
  request.onsuccess=()=>{const db=request.result,get=db.transaction('state').objectStore('state').get('before-replace');get.onsuccess=()=>{resolve(get.result);db.close();};};
 }));
 expect(previous.config.fourTotal).toBe(48);
 // 5. 体验模式抽卡结果刷新后保留
 await page.getByText('抽卡体验',{exact:true}).click();
 await page.getByRole('button',{name:'开始抽'}).click();
 const manual=page.getByTestId('manual-result');
 await expect(manual).toBeVisible();
 const before=await manual.innerText();
 await page.reload();
 await loaded();
 await page.getByText('抽卡体验',{exact:true}).click();
 await expect(manual).toBeVisible();
 expect(await manual.innerText()).toBe(before);

 expect(errors).toEqual([]);
});
