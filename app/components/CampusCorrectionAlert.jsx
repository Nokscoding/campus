'use client';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import './CampusCorrectionAlert.css';

export default function CampusCorrectionAlert(){
 const sb=useMemo(()=>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url&&key?createClient(url,key):null;
 },[]);
 const [userId,setUserId]=useState(null);
 const [request,setRequest]=useState(null);
 const [listingTitle,setListingTitle]=useState('');
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState('');

 useEffect(()=>{
  if(!sb)return;
  let active=true;
  sb.auth.getUser().then(({data})=>{
   if(active)setUserId(data.user?.id||null);
  });
  const {data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>{
   if(active)setUserId(session?.user?.id||null);
  });
  return()=>{active=false;subscription.unsubscribe()};
 },[sb]);

 const refresh=useCallback(async()=>{
  if(!sb||!userId){setRequest(null);return}
  const {data,error}=await sb.from('campus_listing_correction_requests')
   .select('id,listing_id,message,warning_about_masking,created_at,seen_at,status')
   .eq('seller_id',userId).eq('status','requested').is('seen_at',null)
   .order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(error||!data){if(!error)setRequest(null);return}
  setRequest(prev=>prev?.id===data.id?prev:data);
  const {data:listing}=await sb.from('campus_listings')
   .select('title').eq('id',data.listing_id).maybeSingle();
  setListingTitle(listing?.title||'ton annonce');
 },[sb,userId]);

 useEffect(()=>{
  if(!userId){setRequest(null);return}
  refresh();
  const interval=window.setInterval(refresh,25000);
  const onFocus=()=>{if(document.visibilityState==='visible')refresh()};
  window.addEventListener('focus',onFocus);
  document.addEventListener('visibilitychange',onFocus);
  return()=>{window.clearInterval(interval);window.removeEventListener('focus',onFocus);document.removeEventListener('visibilitychange',onFocus)};
 },[userId,refresh]);

 useEffect(()=>{
  if(!request)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=previous};
 },[request?.id]);

 const acknowledge=async(goToEdit)=>{
  if(!sb||!request||saving)return;
  setSaving(true);setMessage('');
  const id=request.id,listingId=request.listing_id;
  const {error}=await sb.rpc('campus_acknowledge_listing_correction',{p_id:id});
  if(error){setMessage('Impossible d’enregistrer la lecture. Réessaie.');setSaving(false);return}
  setRequest(null);setSaving(false);
  if(goToEdit)window.location.assign('/annonce/'+encodeURIComponent(listingId)+'/modifier');
 };

 if(!userId||!request)return null;
 return <div className="campus-correction-backdrop">
  <section className="campus-correction-dialog" role="dialog" aria-modal="true"
   aria-labelledby="campus-correction-title" aria-describedby="campus-correction-description">
   <div className="campus-correction-icon" aria-hidden="true">!</div>
   <span className="campus-correction-eyebrow">MODÉRATION CAMPUS · ACTION REQUISE</span>
   <h2 id="campus-correction-title">Une correction est demandée sur ton annonce</h2>
   <p className="campus-correction-target">Annonce concernée : <strong>{listingTitle}</strong></p>
   <div className="campus-correction-message" id="campus-correction-description">
    <strong>Message de l’équipe CAMPUS</strong>
    <p>{request.message}</p>
   </div>
   {request.warning_about_masking&&
    <p className="campus-correction-warning">Merci de corriger ce problème rapidement. Si l’annonce reste non conforme, l’équipe CAMPUS pourra la masquer.</p>
   }
   <p className="campus-correction-explain">La demande est aussi disponible dans tes notifications. Les modifications d'une annonce déjà publiée seront examinées avant de remplacer la version actuelle.</p>
   {message&&<p className="campus-correction-error" role="alert">{message}</p>}
   <div className="campus-correction-actions">
    <button type="button" className="campus-correction-primary" disabled={saving} onClick={()=>acknowledge(true)}>
     {saving?'Enregistrement…':'Modifier mon annonce'}
    </button>
    <button type="button" className="campus-correction-secondary" disabled={saving} onClick={()=>acknowledge(false)}>
     J’ai compris
    </button>
   </div>
   <Link className="campus-correction-notifications" href="/compte?onglet=notifications">Consulter mes notifications Campus</Link>
  </section>
 </div>;
}
