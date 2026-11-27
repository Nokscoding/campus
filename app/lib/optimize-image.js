// Optimise les photos avant upload, avec un encodage compatible Safari.
const extensions={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
async function decodePhoto(file){
 if(typeof createImageBitmap==='function'){
  try{return await createImageBitmap(file)}catch{}
 }
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});
  return img;
 }finally{URL.revokeObjectURL(url)}
}
export async function optimizeProductPhoto(file){
 let source;
 try{
  source=await decodePhoto(file);
  const width=source.naturalWidth||source.width,height=source.naturalHeight||source.height;
  const scale=Math.min(1,1280/Math.max(width,height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(width*scale));
  canvas.height=Math.max(1,Math.round(height*scale));
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw Error('Canvas non disponible');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(source,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.82));
  // Safari peut retourner un autre MIME que celui demandé.
  if(blob&&blob.size>0&&extensions[blob.type]&&(blob.size<file.size||scale<1)){
   return {file:blob,type:blob.type,extension:extensions[blob.type]};
  }
 }catch{}finally{source?.close?.()}
 return {file,type:file.type,extension:extensions[file.type]||'jpg'};
}
