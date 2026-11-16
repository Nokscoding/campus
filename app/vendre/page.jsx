'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
const categories=['Ordinateurs','Téléphones','Livres & cours','Mode','Accessoires'];
const allowed=new Set(['image/jpeg','image/png','image/webp']);
export default function Sell(){
 const sb=useMemo(()=>{const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return u&&k?createClient(u,k):null},[]);
 const [title,setTitle]=useState(''),[description,setDescription]=useState(''),[category,setCategory]=useState(categories[0]),[condition,setCondition]=useState('Bon état'),[currency,setCurrency]=useState('USD'),[price,setPrice]=useState(''),[files,setFiles]=useState([]),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
 function handleFiles(e){const selected=Array.from(e.target.files||[]).slice(0,5);if(selected.some(f=>!allowed.has(f.type)||f.size>5*1024*1024)){setStatus('Choisis au maximum 5 photos JPG, PNG ou WebP de moins de 5 Mo chacune.');setFiles([]);return}setFiles(selected);setStatus('')}
 async function submit(event){
 event.preventDefault();if(busy)return;setStatus('');setBusy(true);
 try{
  if(!sb)throw Error('Connexion indisponible.');
  const {data:{user},error:userError}=await sb.auth.getUser();if(userError||!user)throw Error("Connecte-toi dans Mon compte avant de déposer une annonce.");
  if(files.length===0)throw Error('Ajoute au moins une photo du produit.');
  if(description.trim().length<20)throw Error('Décris le produit et ses défauts éventuels en au moins 20 caractères.');
  const amount=Number(price);if(!Number.isFinite(amount)||amount<=0)throw Error('Indique un prix valide.');
  setStatus('Création de ton annonce…');
  const {data:listing,error:insertError}=await sb.from('campus_listings').insert({seller_id:user.id,title:title.trim().slice(0,100),description:description.trim(),category,condition,price:amount,currency,status:'pending',images:[]}).select('id').single();
  if(insertError)throw insertError;
  const photos=[];for(let i=0;i<files.length;i++){
    const file=files[i],ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
    const path=user.id+'/'+listing.id+'/'+crypto.randomUUID()+'.'+ext;
    setStatus('Envoi de la photo '+(i+1)+' / '+files.length+'…');
    const {error:uploadError}=await sb.storage.from('campus-listing-photos').upload(path,file,{cacheControl:'3600',contentType:file.type,upsert:false});
    if(uploadError)throw Error('Envoi des photos : '+uploadError.message+'. Ton brouillon reste dans ton compte.');
    photos.push(sb.storage.from('campus-listing-photos').getPublicUrl(path).data.publicUrl);
  }
  const {error:photoError}=await sb.from('campus_listings').update({images:photos}).eq('id',listing.id);
  if(photoError)throw Error('Enregistrement des photos : '+photoError.message);
  setStatus('Annonce envoyée ! Notre équipe va examiner les photos et la description avant publication.');
  setTitle('');setDescription('');setPrice('');setFiles([]);event.target.reset();
 }catch(e){setStatus(e.message||'Erreur lors de la publication.')}finally{setBusy(false)}
 }
 return <><header className="site-header"><Link href="/" className="brand"><img className="brand-image" src="https://res.cloudinary.com/jrgtsxkt/image/upload/v1794856878/campus/brand/approved-ribbon-mark.png" width="36" height="36" alt=""/><span>CAMPUS</span></Link><Link href="/compte" className="account-link">Mon compte</Link></header><main className="sell-page"><div className="form-intro"><span className="overline">VENDRE SUR CAMPUS</span><h1>Tu ne l'utilises plus ?<br/>Quelqu'un en a besoin.</h1><p>Publie ton objet d'occasion gratuitement. Un étudiant intéressé peut le réserver, puis CAMPUS organise la vérification et la livraison.</p></div><form className="form sell-form" onSubmit={submit}><div className="form-section-title"><span>01</span><h2>Présente ton produit</h2></div><label htmlFor="p-title">Nom du produit</label><input id="p-title" maxLength={100} required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex. HP EliteBook 840 G5"/><label htmlFor="p-desc">Description complète</label><textarea id="p-desc" required minLength={20} maxLength={3000} rows={5} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Caractéristiques, accessoires inclus, batterie, rayures, défauts…"/><div className="form-two"><div><label htmlFor="p-cat">Catégorie</label><select id="p-cat" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div><div><label htmlFor="p-condition">État du produit</label><select id="p-condition" value={condition} onChange={e=>setCondition(e.target.value)}>{['Neuf','Comme neuf','Bon état','État correct','À réparer'].map(c=><option key={c}>{c}</option>)}</select></div></div><div className="form-section-title"><span>02</span><h2>Ajoute les photos</h2></div><label htmlFor="p-images">Photos réelles du produit (1 à 5)</label><input id="p-images" type="file" accept="image/png,image/jpeg,image/webp" multiple required onChange={handleFiles}/><p className="muted small-note">JPG, PNG ou WebP · 5 Mo maximum par photo. Photographier le produit sous plusieurs angles.</p>{files.length>0&&<div className="selected-photos">{files.map((f,i)=><div className="selected-photo" key={i}><span>{i+1}</span><small>{f.name}</small></div>)}</div>}<div className="form-section-title"><span>03</span><h2>Fixe ton prix</h2></div><div className="form-two"><div><label htmlFor="p-price">Prix demandé</label><input id="p-price" type="number" required min="0.01" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Ex. 250"/></div><div><label htmlFor="p-currency">Devise</label><select id="p-currency" value={currency} onChange={e=>setCurrency(e.target.value)}><option value="USD">USD — dollar</option><option value="CDF">CDF — franc congolais</option></select></div></div><div className="notice"><strong>Une transaction encadrée</strong><p>CAMPUS prélève une commission vendeur seulement après une vente aboutie. L'acheteur reçoit un devis de livraison à accepter avant le retrait du produit. Aucun paiement en ligne n'est demandé.</p></div><button className="button submit-listing" type="submit" disabled={busy}>{busy?'Enregistrement…':'Envoyer mon annonce à validation'}</button><p className="form-message" aria-live="polite" role="status">{status}</p></form></main></>
}