'use client';
import Link from 'next/link';
import CampusProfileShortcut from '../../../components/CampusProfileShortcut';
import CampusNotificationBell from '../../../components/CampusNotificationBell';
import SellerCommissionPreview from '../../../components/SellerCommissionPreview';import CategoryChoice from '../../../components/CategoryChoice';import IssueDisclosure from '../../../components/IssueDisclosure';import {useEffect,useMemo,useState} from 'react';import {useParams} from 'next/navigation';import {createClient} from '@supabase/supabase-js';import {optimizeProductPhoto} from '../../../lib/optimize-image';
const logo='https://res.cloudinary.com/jrgtsxkt/image/upload/f_auto,q_auto,w_96,h_96,c_fill/v1794856878/campus/brand/approved-ribbon-mark.png';
export default function Edit(){
 const {id}=useParams(),sb=useMemo(()=>{const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return u&&k?createClient(u,k):null},[]);
 const [listing,setListing]=useState(null),[files,setFiles]=useState([]),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[archived,setArchived]=useState(false),[moderationNotice,setModerationNotice]=useState(null),[revision,setRevision]=useState(null),[publicVersion,setPublicVersion]=useState(null);
 useEffect(()=>{
  if(!sb||!id)return;
  let active=true;
  Promise.all([sb.from('campus_listings').select('*').eq('id',id).maybeSingle(),sb.from('campus_listing_revisions').select('*').eq('listing_id',id).maybeSingle()]).then(([base,proposed])=>{
   if(!active)return;
   if(base.error){setMessage(base.error.message);return}
   if(!base.data){setMessage('Annonce introuvable ou accès refusé.');return}
   setPublicVersion(base.data);
   if(proposed.error){setMessage('Historique des modifications indisponible : '+proposed.error.message);setListing(base.data);return}
   setRevision(proposed.data||null);
   if(base.data.status==='published'&&proposed.data&&['pending','rejected'].includes(proposed.data.status)){
    setListing({...base.data,...proposed.data,id:base.data.id,seller_id:base.data.seller_id,status:'published',currency:base.data.currency});
   }else setListing(base.data);
  });
  sb.from('campus_notifications').select('kind,title,body,created_at').eq('listing_id',id)
   .in('kind',['listing_moderator_message','listing_hidden','listing_correction_requested','listing_rejected'])
   .order('created_at',{ascending:false}).limit(1).maybeSingle().then(({data,error})=>{
    if(active&&!error)setModerationNotice(data||null);
   });
  return()=>{active=false};
 },[sb,id]);

 async function save(e){
  e.preventDefault();if(!listing||busy)return;setBusy(true);setMessage('');
  try{
   const existing=[...(listing.images||[])];
   if(existing.length+files.length<1)throw Error('Conserve au moins une photo du produit.');
   if(existing.length+files.length>5)throw Error('Maximum 5 photos.');
   if(!String(listing.title||'').trim()||String(listing.title||'').trim().length<5)throw Error('Le titre doit contenir au moins 5 caractères.');
   if(String(listing.description||'').trim().length<20)throw Error('La description doit contenir au moins 20 caractères.');
   if(listing.has_issue&&String(listing.issue_details||'').trim().length<10)throw Error('Décris le défaut en au moins 10 caractères.');
   if(listing.category==='Autres'&&String(listing.category_proposal||'').trim().length<3)throw Error('Précise la catégorie proposée.');
   if(!sb)throw Error('Connexion indisponible.');
   const {data:{user},error:userError}=await sb.auth.getUser();if(userError||!user)throw Error('Connecte-toi pour modifier ton annonce.');
   const photos=[...existing];
   for(let i=0;i<files.length;i++){
    const f=files[i];
    if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>5242880)throw Error('Photos JPG, PNG ou WebP de 5 Mo maximum.');
    const prepared=await optimizeProductPhoto(f),filePath=user.id+'/'+listing.id+'/'+crypto.randomUUID()+'.'+prepared.extension;
    setMessage('Envoi de la photo '+(i+1)+' / '+files.length+'…');
    const {error:uploadError}=await sb.storage.from('campus-listing-photos').upload(filePath,prepared.file,{contentType:prepared.type,upsert:false});
    if(uploadError)throw Error('Impossible d’envoyer la photo : '+uploadError.message);
    photos.push(sb.storage.from('campus-listing-photos').getPublicUrl(filePath).data.publicUrl);
   }
   setMessage('Envoi de la version corrigée à la modération…');
   const {error}=await sb.rpc('campus_submit_listing_revision',{
    p_id:listing.id,p_title:listing.title,p_description:listing.description,
    p_price:Number(listing.price),p_condition:listing.condition,
    p_category:listing.category,p_category_proposal:listing.category==='Autres'?(listing.category_proposal||'').trim():null,
    p_has_issue:Boolean(listing.has_issue),p_issue_details:listing.has_issue?(listing.issue_details||'').trim():null,
    p_images:photos
   });
   if(error)throw error;
   const isAlreadyPublished=publicVersion?.status==='published';
   setListing({...listing,images:photos,status:isAlreadyPublished?'published':'pending'});
   setRevision(isAlreadyPublished?{...listing,images:photos,status:'pending',rejection_reason:null}:null);
   setFiles([]);
   setModerationNotice(null);
   setMessage(isAlreadyPublished?'Modifications envoyées en validation. Ton annonce déjà approuvée reste visible et inchangée jusqu’à leur validation.':'Version envoyée en validation. Tu seras informé de la décision de CAMPUS.');
  }catch(e){setMessage(e.message||'Erreur de modification')}finally{setBusy(false)}
 }
 async function archive(){if(!listing||!window.confirm('Archiver cette annonce et la retirer du catalogue ?'))return;setBusy(true);const {error}=await sb.rpc('campus_archive_listing',{p_id:listing.id});setBusy(false);if(error)setMessage(error.message);else{setArchived(true);setMessage('Annonce archivée. Elle ne sera plus visible dans le catalogue.')}}
 const editable=listing&&['draft','pending','published','rejected','hidden'].includes(listing.status)&&!archived;
 return <><header className="site-header"><Link href="/" className="brand"><img className="brand-image" src={logo} alt="" width="38" height="38"/>CAMPUS</Link><nav className="campus-header-actions"><CampusProfileShortcut/><CampusNotificationBell/></nav></header><main className="sell-page"><div className="form-intro"><span className="overline">MES ANNONCES</span><h1>Modifier une annonce</h1><p>Une annonce déjà publiée reste en ligne avec sa version approuvée pendant que CAMPUS vérifie les modifications. En cas de refus, l'annonce actuelle n'est pas retirée.</p></div>{!listing?<div className="form">{message||'Chargement…'}</div>:!editable?<div className="form"><h2>Annonce non modifiable</h2><p>{message||'Cette annonce est réservée, vendue ou archivée.'}</p><Link className="button" href="/compte">Revenir à mon espace</Link></div>:<form className="form sell-form" onSubmit={save}>
{publicVersion?.status==='published'&&revision&&['pending','rejected'].includes(revision.status)&&<section className="campus-edit-moderation-notice" role="status"><strong>{revision.status==='pending'?'Modifications en attente de validation':'Tes dernières modifications ont été refusées'}</strong><p>{revision.status==='pending'?'Ta version déjà approuvée est toujours publiée. Seuls les changements proposés attendent validation.':"L'annonce d'origine reste visible sur CAMPUS. Corrige les modifications refusées pour les soumettre à nouveau."}</p>{revision.status==='rejected'&&revision.rejection_reason&&<p><b>Motif du refus : </b>{revision.rejection_reason}</p>}<small>Version publique actuelle : « {publicVersion.title} » · {publicVersion.price} {publicVersion.currency}</small></section>}
{moderationNotice&&<section className="campus-edit-moderation-notice" aria-live="polite"><strong>{moderationNotice.title}</strong><p>{moderationNotice.body}</p><small>Effectue les changements demandés, puis envoie la version corrigée à la validation.</small></section>}
{listing.status==='hidden'&&!moderationNotice&&<section className="campus-edit-moderation-notice"><strong>Annonce masquée</strong><p>Cette annonce n'est plus visible. Modifie les informations, puis renvoie-la à notre équipe pour vérification.</p></section>}
<label htmlFor="edit-title">Titre du produit</label><input id="edit-title" required minLength={5} maxLength={100} value={listing.title} onChange={e=>setListing({...listing,title:e.target.value})}/><label htmlFor="edit-description">Description complète</label><textarea id="edit-description" required minLength={20} maxLength={3000} rows={6} value={listing.description} onChange={e=>setListing({...listing,description:e.target.value})}/><CategoryChoice category={listing.category} proposal={listing.category_proposal||''} onCategoryChange={v=>setListing({...listing,category:v,category_proposal:''})} onProposalChange={v=>setListing({...listing,category_proposal:v})} idPrefix="edit"/><IssueDisclosure hasIssue={Boolean(listing.has_issue)} onHasIssueChange={v=>setListing({...listing,has_issue:v,issue_details:v?listing.issue_details:null})} details={listing.issue_details||''} onDetailsChange={v=>setListing({...listing,issue_details:v})} prefix="edit"/><div className="form-two"><div><label htmlFor="edit-condition">État</label><select id="edit-condition" value={listing.condition} onChange={e=>setListing({...listing,condition:e.target.value})}>{['Neuf','Comme neuf','Bon état','État correct','À réparer'].map(s=><option key={s}>{s}</option>)}</select></div><div><label htmlFor="edit-price">Prix ({listing.currency})</label><input id="edit-price" type="number" min=".01" step=".01" required value={listing.price} onChange={e=>setListing({...listing,price:e.target.value})}/></div></div><SellerCommissionPreview key={listing.currency} price={listing.price} currency={listing.currency}/><label>Photos du produit</label><div className="edit-photo-grid">{(listing.images||[]).map((url,i)=><div className="edit-photo" key={url}><img src={url} alt={'Photo '+(i+1)}/><button type="button" onClick={()=>setListing({...listing,images:listing.images.filter(x=>x!==url)})}>Retirer</button></div>)}</div><label htmlFor="edit-images">Ajouter des photos (maximum 5 au total)</label><input id="edit-images" type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={e=>setFiles(Array.from(e.target.files||[]).slice(0,5))}/><p className="muted small-note">{files.length} nouvelle(s) photo(s) sélectionnée(s).</p><button className="button submit-listing" disabled={busy}>Enregistrer et soumettre à validation</button><button type="button" className="archive-button" disabled={busy} onClick={archive}>Archiver mon annonce</button><p className="form-message" role="status" aria-live="polite">{message}</p></form>}</main><footer className="footer"><strong>CAMPUS by NKS Services</strong></footer></>
}