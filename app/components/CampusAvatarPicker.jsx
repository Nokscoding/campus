'use client';
import {useMemo,useRef,useState} from 'react';
export const CAMPUS_AVATARS=[
 {id:'avatar-01',label:'Tresses et lunettes'},
 {id:'avatar-02',label:'Casquette rose'},
 {id:'avatar-03',label:'Sweat bleu-vert'},
 {id:'avatar-04',label:'Sweat bleu'},
 {id:'avatar-05',label:'Afro et sweat lilas'},
 {id:'avatar-06',label:'Barbe et sweat vert'},
 {id:'avatar-07',label:'Cheveux blonds et sweat rose'},
 {id:'avatar-08',label:'Sweat jaune'},
 {id:'avatar-09',label:'Longues tresses noires'},
 {id:'avatar-10',label:'Lunettes et hoodie noir'},
 {id:'avatar-11',label:'Veste à col crème'}
];
export function avatarUrl(sb,path,updatedAt){
 if(!sb||!path)return null;
 const {data}=sb.storage.from('campus-profile-photos').getPublicUrl(path);
 if(!data?.publicUrl)return null;
 return data.publicUrl+'?t='+encodeURIComponent(updatedAt||'1');
}
export function AvatarVisual({choice,photoUrl,className='',label,size='regular'}){
 const index=CAMPUS_AVATARS.findIndex(v=>v.id===choice);
 const css=choice==='avatar-09'
  ? {backgroundImage:"url('https://res.cloudinary.com/jrgtsxkt/image/upload/v1795113099/campus/avatars/avatar-09-tresses-noires.webp')",backgroundSize:'cover',backgroundPosition:'center'}
  : index>=0 ? {backgroundImage:"url('/avatars/campus-sprite.webp')",
  backgroundSize:'400% 300%',backgroundPosition:(index%4)*100/3+'% '+Math.floor(index/4)*50+'%'} : null;
 return <span className={'campus-avatar-visual '+className+' campus-avatar-'+size} style={choice==='custom'&&photoUrl?{backgroundImage:'url('+JSON.stringify(photoUrl).slice(1,-1)+')',backgroundSize:'cover',backgroundPosition:'center'}:css||{}} role="img" aria-label={label||'Avatar CAMPUS'}>
 {!css&&!(choice==='custom'&&photoUrl)&&<span aria-hidden="true">C</span>}
 </span>;
}
function getFileName(file){return (file?.name||'').slice(0,70)}
async function imageToWebp(file){
 if(!file||!file.type.startsWith('image/'))throw Error('Choisis une image au format JPG, PNG ou photo de ta galerie.');
 if(file.size>8*1024*1024)throw Error('La photo doit faire moins de 8 Mo.');
 let image,cleanup=()=>{};
 try{
  try{image=await createImageBitmap(file)}catch{
   const url=URL.createObjectURL(file);
   const img=new Image();img.src=url;
   try{await img.decode();image=img;cleanup=()=>URL.revokeObjectURL(url)}
   catch{URL.revokeObjectURL(url);throw Error('Ce format de photo ne peut pas être ouvert sur ton appareil. Essaie une image JPEG ou PNG.')}
  }
  const w=image.width||image.naturalWidth,h=image.height||image.naturalHeight;
  if(!w||!h)throw Error('Image invalide.');
  const square=Math.min(w,h),sx=(w-square)/2,sy=(h-square)/2;
  const canvas=document.createElement('canvas');canvas.width=400;canvas.height=400;
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw Error("Impossible de préparer la photo sur cet appareil.");
  ctx.drawImage(image,sx,sy,square,square,0,0,400,400);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.82));
  if(!blob||blob.type!=='image/webp')throw Error('Le format WebP est indisponible sur cet appareil.');
  if(blob.size>524288)throw Error('La photo reste trop lourde après optimisation. Choisis une autre photo.');
  return blob;
 }finally{image?.close?.();cleanup()}
}
export default function AvatarPicker({sb,user,profile,onSaved}){
 const [saving,setSaving]=useState(false),[message,setMessage]=useState(''),[status,setStatus]=useState('info');
 const input=useRef(null);
 const current=profile.avatar_choice;
 const photoUrl=useMemo(()=>current==='custom'?avatarUrl(sb,profile.avatar_path,profile.avatar_updated_at):null,[sb,current,profile.avatar_path,profile.avatar_updated_at]);
 async function selectAvatar(id){
  if(saving||!sb||!user||id===current)return;
  setSaving(true);setMessage('');
  try{
   if(profile.avatar_path){
    const {error:deleteError}=await sb.storage.from('campus-profile-photos').remove([profile.avatar_path]);
    if(deleteError)throw new Error('Impossible de supprimer ta photo précédente. Réessaie.');
   }
   const date=new Date().toISOString();
   const {data,error}=await sb.from('campus_profiles').upsert({user_id:user.id,avatar_choice:id,avatar_path:null,avatar_updated_at:date},{onConflict:'user_id'}).select('avatar_choice,avatar_path,avatar_updated_at').single();
   if(error)throw error;
   onSaved(data);setStatus('success');setMessage('Avatar enregistré.');
  }catch(e){setStatus('error');setMessage(e.message||"L'avatar n'a pas pu être enregistré.")}
  finally{setSaving(false)}
 }
 async function uploadCustom(event){
  const file=event.target.files?.[0];event.target.value='';
  if(!file||!sb||!user||saving)return;
  setSaving(true);setStatus('info');setMessage('Préparation de ta photo…');
  try{
   const blob=await imageToWebp(file);
   setMessage('Enregistrement de la photo…');
   const path=user.id+'/avatar.webp';
   const {error:uploadError}=await sb.storage.from('campus-profile-photos').upload(path,blob,{contentType:'image/webp',cacheControl:'3600',upsert:true});
   if(uploadError)throw uploadError;
   const date=new Date().toISOString();
   const {data,error}=await sb.from('campus_profiles').upsert({user_id:user.id,avatar_choice:'custom',avatar_path:path,avatar_updated_at:date},{onConflict:'user_id'}).select('avatar_choice,avatar_path,avatar_updated_at').single();
   if(error)throw error;
   onSaved(data);setStatus('success');setMessage('Ta photo de profil a été enregistrée.');
  }catch(e){setStatus('error');setMessage(e.message||'Impossible de téléverser la photo.')}
  finally{setSaving(false)}
 }
 return <section className="campus-avatar-picker" aria-label="Photo de profil">
  <div className="campus-avatar-top"><AvatarVisual choice={current} photoUrl={photoUrl} size="large"/><div><strong>Ma photo de profil</strong><p>Choisis un personnage CAMPUS ou importe ta propre photo.</p><span className="campus-avatar-note">Ton avatar est visible sur CAMPUS. Tu peux le modifier à tout moment.</span></div></div>
  <div className="campus-avatar-grid" role="group" aria-label="Choisir un avatar parmi 11 illustrations">
   {CAMPUS_AVATARS.map(item=><button type="button" key={item.id} aria-label={item.label} aria-pressed={current===item.id} title={item.label} className={'campus-avatar-item'+(current===item.id?' selected':'')} disabled={saving} onClick={()=>selectAvatar(item.id)}><AvatarVisual choice={item.id} label={item.label}/>{current===item.id&&<span className="campus-avatar-check" aria-hidden="true">✓</span>}</button>)}
  </div>
  <div className="campus-avatar-upload">
   <button type="button" disabled={saving} className="campus-avatar-upload-button" onClick={()=>input.current?.click()}>
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 16V4m-4 4 4-4 4 4M4 17v3h16v-3"/></svg>
    {saving?'Enregistrement…':'Importer ma photo'}
   </button>
   <input ref={input} type="file" accept="image/*,.heic,.heif" aria-label="Importer une photo personnelle" onChange={uploadCustom} hidden/>
   <small>JPG, PNG ou photo de galerie · 8 Mo maximum · cadrage carré automatique.</small>
  </div>
  {message&&<p className={'campus-avatar-result '+(status==='error'?'error':status==='success'?'success':'')} role={status==='error'?'alert':'status'}>{message}</p>}
 </section>;
}
