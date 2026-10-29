const DATABASE='genshin-wish-lab';
let connection:Promise<IDBDatabase>|undefined;
function open():Promise<IDBDatabase>{
 if(connection)return connection;
 const attempt=new Promise<IDBDatabase>((resolve,reject)=>{
  let rejected=false;
  const request=indexedDB.open(DATABASE,1);
  const fail=(error:unknown)=>{rejected=true;reject(error);};
  request.onupgradeneeded=()=>request.result.createObjectStore('state');
  request.onsuccess=()=>{
   if(rejected){request.result.close();return;}
   request.result.onversionchange=()=>{request.result.close();connection=undefined;};resolve(request.result);
  };
  request.onerror=()=>fail(request.error);
  request.onblocked=()=>fail(new Error('另一个模拟器页面占着存档，关掉它再试一次。'));
 });
 connection=attempt;void attempt.catch(()=>{if(connection===attempt)connection=undefined;});return attempt;
}
export async function loadState():Promise<unknown>{
 const db=await open();return new Promise((resolve,reject)=>{
  const transaction=db.transaction('state','readonly'),request=transaction.objectStore('state').get('current');
  transaction.oncomplete=()=>resolve(request.result);transaction.onabort=()=>reject(transaction.error);
 });
}
let pending:Promise<void>=Promise.resolve();
export function saveState(value:unknown,backup=false):Promise<void>{
 const snapshot=structuredClone(value);
 const operation=pending.catch(()=>{}).then(async()=>{
  const db=await open();await new Promise<void>((resolve,reject)=>{
   const transaction=db.transaction('state','readwrite'),store=transaction.objectStore('state');
   if(backup){const previous=store.get('current');previous.onsuccess=()=>{if(previous.result)store.put(previous.result,'before-replace');};}
   store.put(snapshot,'current');transaction.oncomplete=()=>resolve();transaction.onabort=()=>reject(transaction.error);
  });
 });pending=operation;return operation;
}
