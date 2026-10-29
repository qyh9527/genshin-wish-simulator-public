import {readdir,stat,readFile} from 'node:fs/promises';
const dir=new URL('../../release/',import.meta.url),files=(await readdir(dir)).filter(name=>name!=='.gitattributes');
if(files.length!==1||files[0]!=='genshin抽卡模拟器.html')throw new Error('发行目录必须仅有 genshin抽卡模拟器.html，实际：'+files.join(', '));
const file=new URL(files[0],dir),html=await readFile(file,'utf8');
if(/<script[^>]+src=|<link[^>]+rel=["']stylesheet/i.test(html))throw new Error('产物仍有外部脚本或样式引用');
console.log('单HTML断言通过：'+(await stat(file)).size+' bytes');
