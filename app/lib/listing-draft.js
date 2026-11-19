/* Stores a seller's draft, including the photo Blobs, on this device only.
   This avoids uploading photos before authentication. Drafts expire after 48 hours. */
const DATABASE='campus-seller-draft-v1';
const STORE='listing-drafts';
const KEY='preauth-listing';
const EXPIRY=48*60*60*1000;
function connect(){
 if(typeof window==='undefined'||!('indexedDB' in window))return Promise.reject(Error('Stockage local indisponible'));
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(DATABASE,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error('Stockage du brouillon impossible'));
  req.onblocked=()=>reject(Error('Stockage temporairement bloqué'));
 });
}
async function transaction(mode,makeRequest){
 const db=await connect();
 return new Promise((resolve,reject)=>{
  let result;let settled=false;
  function fail(error){if(settled)return;settled=true;db.close();reject(error||Error('Échec du stockage'))}
  try{
   const tx=db.transaction(STORE,mode);
   const req=makeRequest(tx.objectStore(STORE));
   req.onsuccess=()=>{result=req.result};
   tx.oncomplete=()=>{if(!settled){settled=true;db.close();resolve(result)}};
   tx.onerror=()=>fail(tx.error);
   tx.onabort=()=>fail(tx.error);
  }catch(error){fail(error)}
 });
}
export async function saveListingDraft(data){
 const photos=(data.files||[]).slice(0,5).map(file=>({
  blob:file,name:file.name,type:file.type,lastModified:file.lastModified
 }));
 return transaction('readwrite',s=>s.put({
  version:1,savedAt:Date.now(),
  title:data.title,description:data.description,category:data.category,
  categoryProposal:data.categoryProposal,hasIssue:data.hasIssue,issueDetails:data.issueDetails,
  condition:data.condition,price:data.price,currency:data.currency,photos
 },KEY));
}
export async function loadListingDraft(){
 const draft=await transaction('readonly',s=>s.get(KEY));
 if(!draft)return null;
 if(draft.version!==1||!Number.isFinite(draft.savedAt)||Date.now()-draft.savedAt>EXPIRY){
  await deleteListingDraft().catch(()=>{});
  return null;
 }
 const files=(draft.photos||[]).slice(0,5).map(p=>
  p.blob instanceof File?p.blob:new File([p.blob],p.name||'photo.webp',{type:p.type||'image/webp',lastModified:p.lastModified||Date.now()})
 );
 return {...draft,files};
}
export async function deleteListingDraft(){return transaction('readwrite',s=>s.delete(KEY))}
