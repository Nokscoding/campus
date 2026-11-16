// Optimise les photos localement avant upload, sans envoyer les EXIF/GPS.
export async function optimizeProductPhoto(file){
 const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
 try{
  const bitmap=await createImageBitmap(file);
  const scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));
  canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw Error('Canvas non disponible');
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.8));
  if(blob&&blob.size>0&&blob.size<file.size)return {file:blob,type:'image/webp',extension:'webp'};
 }catch{}
 return {file,type:file.type,extension:ext};
}
