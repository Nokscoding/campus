'use client';
import Link from 'next/link';
import CampusProfileShortcut from '../components/CampusProfileShortcut';
import CampusNotificationBell from '../components/CampusNotificationBell';
import SellerCommissionPreview from '../components/SellerCommissionPreview';import CategoryChoice,{DEFAULT_CAMPUS_CATEGORIES} from '../components/CategoryChoice';import IssueDisclosure from '../components/IssueDisclosure';
import {useEffect,useMemo,useState} from 'react';
import {saveListingDraft,loadListingDraft,deleteListingDraft} from '../lib/listing-draft';
import {createClient} from '@supabase/supabase-js';import {optimizeProductPhoto} from '../lib/optimize-image';

const allowed=new Set(['image/jpeg','image/png','image/webp']);
export default function Sell(){
 const sb=useMemo(()=>{const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return u&&k?createClient(u,k):null},[]);
 const [title,setTitle]=useState(''),[description,setDescription]=useState(''),[category,setCategory]=useState(DEFAULT_CAMPUS_CATEGORIES[0]),[categoryProposal,setCategoryProposal]=useState(''),[hasIssue,setHasIssue]=useState(false),[issueDetails,setIssueDetails]=useState(''),[condition,setCondition]=useState('Bon état'),[currency,setCurrency]=useState('USD'),[price,setPrice]=useState(''),[files,setFiles]=useState([]),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),[reviewModal,setReviewModal]=useState(null),[draftLoading,setDraftLoading]=useState(true);
 useEffect(()=>{
  let active=true;
  loadListingDraft().then(draft=>{
   if(!active)return;
   if(draft){
    setTitle(draft.title||'');setDescription(draft.description||'');
    setCategory(draft.category||DEFAULT_CAMPUS_CATEGORIES[0]);
    setCategoryProposal(draft.categoryProposal||'');setHasIssue(Boolean(draft.hasIssue));
    setIssueDetails(draft.issueDetails||'');setCondition(draft.condition||'Bon état');
    setPrice(draft.price||'');setCurrency(draft.currency||'USD');setFiles(draft.files||[]);
    setStatus('Ton annonce et tes photos ont été retrouvées. Vérifie les informations puis appuie sur « Envoyer mon annonce à validation ».');
   }else if(new URLSearchParams(window.location.search).get('reprendre')==='1'){
    setStatus('Aucun brouillon n’a été retrouvé sur cet appareil. Tu peux créer une annonce.');
   }
  }).catch(()=>{
   if(active)setStatus('Le brouillon enregistré sur cet appareil ne peut pas être récupéré.');
  }).finally(()=>{if(active)setDraftLoading(false)});
  return()=>{active=false};
 },[]);
 function handleFiles(e){const selected=Array.from(e.target.files||[]).slice(0,5);if(selected.some(f=>!allowed.has(f.type)||f.size>5*1024*1024)){setStatus('Choisis au maximum 5 photos JPG, PNG ou WebP de moins de 5 Mo chacune.');setFiles([]);return}setFiles(selected);setStatus('')}
 async function submit(event){
 event.preventDefault();if(busy||draftLoading)return;setStatus('');setBusy(true);
 try{
  if(!sb)throw Error('Connexion indisponible.');
  const {data:{user},error:userError}=await sb.auth.getUser();
  if(userError&&!String(userError.message||'').toLowerCase().includes('session'))throw userError;
  if(!user){
   setStatus('Sauvegarde sécurisée de ton brouillon et de tes photos sur cet appareil…');
   try{
    await saveListingDraft({title,description,category,categoryProposal,hasIssue,issueDetails,condition,currency,price,files});
   }catch{
    throw Error("Impossible de sauvegarder tes photos sur cet appareil. Libère de l'espace de stockage et réessaie pour éviter de perdre ton annonce.");
   }
   try{sessionStorage.setItem('campus_return_to_listing','1')}catch{}
   window.location.assign('/compte?retour=vendre');
   return;
  }
  if(files.length===0)throw Error('Ajoute au moins une photo du produit.');
  if(description.trim().length<20)throw Error('Décris le produit en au moins 20 caractères.');if(hasIssue&&issueDetails.trim().length<10)throw Error('Précise le problème du produit en au moins 10 caractères.');if(category==='Autres'&&categoryProposal.trim().length<3)throw Error('Indique une catégorie proposée.');if(category!=='Autres'&&!DEFAULT_CAMPUS_CATEGORIES.includes(category)){const {data:known}=await sb.from('campus_categories').select('name').eq('name',category).maybeSingle();if(!known)throw Error('Choisis une catégorie dans la liste.');}
  const {data:p}=await sb.from('campus_profiles').select('phone,university').eq('user_id',user.id).maybeSingle();if(!p?.phone||p.phone.trim().length<6||!p.university||p.university.trim().length<2)throw Error("Complète d'abord ton profil CAMPUS (université et téléphone) dans Mon compte.");const amount=Number(price);if(!Number.isFinite(amount)||amount<=0)throw Error('Indique un prix valide.');
  setStatus('Création de ton annonce…');
  const {data:listing,error:insertError}=await sb.from('campus_listings').insert({seller_id:user.id,title:title.trim().slice(0,100),description:description.trim(),category,category_proposal:category==='Autres'?categoryProposal.trim():null,has_issue:hasIssue,issue_details:hasIssue?issueDetails.trim():null,condition,price:amount,currency,status:'draft',images:[]}).select('id').single();
  if(insertError)throw insertError;
  const photos=[];for(let i=0;i<files.length;i++){
    const prepared=await optimizeProductPhoto(files[i]);const ext=prepared.extension;
    const path=user.id+'/'+listing.id+'/'+crypto.randomUUID()+'.'+ext;
    setStatus('Envoi de la photo '+(i+1)+' / '+files.length+'…');
    const {error:uploadError}=await sb.storage.from('campus-listing-photos').upload(path,prepared.file,{cacheControl:'3600',contentType:prepared.type,upsert:false});
    if(uploadError)throw Error('Envoi des photos : '+uploadError.message+'. Ton brouillon reste dans ton compte.');
    photos.push(sb.storage.from('campus-listing-photos').getPublicUrl(path).data.publicUrl);
  }
  const {error:photoError}=await sb.from('campus_listings').update({images:photos,status:'pending'}).eq('id',listing.id);
  if(photoError)throw Error('Enregistrement des photos : '+photoError.message);
  await deleteListingDraft().catch(()=>{});
  try{sessionStorage.removeItem('campus_return_to_listing')}catch{}
  setStatus('Annonce envoyée ! Notre équipe va examiner les photos et la description avant publication.');setReviewModal({title:title.trim(),id:listing.id});
  setTitle('');setDescription('');setPrice('');setFiles([]);setHasIssue(false);setIssueDetails('');setCategoryProposal('');setCategory(DEFAULT_CAMPUS_CATEGORIES[0]);event.target.reset();
 }catch(e){setStatus(e.message||'Erreur lors de la publication.')}finally{setBusy(false)}
 }
 return <><header className="site-header"><Link href="/" className="brand"><img className="brand-image" src="https://res.cloudinary.com/jrgtsxkt/image/upload/f_auto,q_auto,w_96,h_96,c_fill/v1794856878/campus/brand/approved-ribbon-mark.png" width="36" height="36" alt=""/><span>CAMPUS</span></Link><nav className="campus-header-actions"><CampusProfileShortcut/><CampusNotificationBell/></nav></header><main className="sell-page"><div className="form-intro"><span className="overline">VENDRE SUR CAMPUS</span><h1>Tu ne l'utilises plus ?<br/>Quelqu'un en a besoin.</h1><p>Publie ton objet d'occasion gratuitement. Un étudiant intéressé peut le réserver. CAMPUS organise ensuite l'inspection et la remise sur le campus universitaire, au point de rendez-vous convenu. Pas de livraison à domicile.</p></div><form className="form sell-form" onSubmit={submit}><div className="form-section-title"><span>01</span><h2>Présente ton produit</h2></div><label htmlFor="p-title">Nom du produit</label><input id="p-title" maxLength={100} required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex. HP EliteBook 840 G5"/><label htmlFor="p-desc">Description complète</label><textarea id="p-desc" required minLength={20} maxLength={3000} rows={5} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Caractéristiques, accessoires inclus, batterie, rayures, défauts…"/><div className="form-two"><CategoryChoice category={category} onCategoryChange={setCategory} proposal={categoryProposal} onProposalChange={setCategoryProposal} idPrefix="p"/><div><label htmlFor="p-condition">État du produit</label><select id="p-condition" value={condition} onChange={e=>setCondition(e.target.value)}>{['Neuf','Comme neuf','Bon état','État correct','À réparer'].map(c=><option key={c}>{c}</option>)}</select></div></div><IssueDisclosure hasIssue={hasIssue} onHasIssueChange={setHasIssue} details={issueDetails} onDetailsChange={setIssueDetails} prefix="p"/><div className="form-section-title"><span>02</span><h2>Ajoute les photos</h2></div><aside className="campus-photo-tips" aria-label="Conseils pour photographier ton produit"><div className="campus-photo-tips-heading"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="3.5"/></svg><strong>De belles photos donnent plus envie d'acheter</strong></div><ul><li>Place ton produit dans un endroit propre et bien éclairé, idéalement près d'une fenêtre.</li><li>Montre-le en entier, avec plusieurs angles et des photos nettes, sans filtre.</li><li>Photographie aussi ses éventuels défauts et les accessoires inclus.</li></ul></aside><label htmlFor="p-images">Photos réelles du produit (1 à 5)</label><input id="p-images" type="file" accept="image/png,image/jpeg,image/webp" multiple required={files.length===0} onChange={handleFiles}/><p className="muted small-note">JPG, PNG ou WebP · 5 Mo maximum par photo, optimisées automatiquement. Photographier le produit sous plusieurs angles.</p>{files.length>0&&<div className="selected-photos">{files.map((f,i)=><div className="selected-photo" key={i}><span>{i+1}</span><small>{f.name}</small></div>)}</div>}<div className="form-section-title"><span>03</span><h2>Fixe ton prix</h2></div><div className="form-two"><div><label htmlFor="p-price">Prix demandé</label><input id="p-price" type="number" required min="0.01" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Ex. 250"/></div><div><label htmlFor="p-currency">Devise</label><select id="p-currency" value={currency} onChange={e=>setCurrency(e.target.value)}><option value="USD">USD — dollar</option><option value="CDF">CDF — franc congolais</option></select></div></div><SellerCommissionPreview key={currency} price={price} currency={currency}/><div className="notice"><strong>Avant de publier</strong><p>Indique ton université et ton téléphone dans <Link href="/compte" style={{textDecoration:'underline'}}>Mon compte</Link> pour permettre la récupération du produit.</p></div><div className="notice"><strong>Une transaction encadrée</strong><p>CAMPUS retient 10 % du prix du produit uniquement après une vente aboutie. Le vendeur reçoit les 90 % restants. L'acheteur reçoit un devis de livraison sur le campus à accepter avant le retrait du produit. Le rendez-vous est fixé avec CAMPUS sur le campus, pas à domicile. Aucun paiement en ligne n'est demandé.</p></div><button className="button submit-listing" type="submit" disabled={busy||draftLoading}>{busy?'Enregistrement…':draftLoading?'Récupération du brouillon…':'Envoyer mon annonce à validation'}</button><p className="form-message" aria-live="polite" role="status">{status}</p></form></main><footer className="footer"><strong>CAMPUS by NKS Services</strong><p>Lubumbashi · RDC</p></footer>{reviewModal&&<div className="campus-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setReviewModal(null)}}><section className="campus-modal publish-success-modal" role="dialog" aria-modal="true" aria-labelledby="publish-confirmation-heading"><div className="publish-success-icon" aria-hidden="true"><svg width="53" height="53" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="27" fill="#E7DFFF"/><path d="m16 28 8 8 16-18" stroke="#5935EC" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg></div><span className="overline">ANNONCE BIEN REÇUE</span><h2 id="publish-confirmation-heading">C'est envoyé !</h2><p>Ton annonce <strong>« {reviewModal.title} »</strong> a bien été transmise à CAMPUS.</p><p>Notre équipe va vérifier les photos et la description avant sa publication. Tu recevras une <strong>notification dans ton compte CAMPUS</strong> dès qu'une décision aura été prise.</p><div className="publish-success-actions"><Link href="/compte?onglet=annonces" className="button">Suivre mon annonce</Link><button type="button" className="soft-dismiss" onClick={()=>setReviewModal(null)}>Fermer</button></div></section></div>}</>
}