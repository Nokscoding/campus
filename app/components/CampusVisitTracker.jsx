'use client';
import {Suspense,useEffect} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {createClient} from '@supabase/supabase-js';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb=url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):null;
const VISITOR='campus_marketing_visitor_v1';
const SESSION='campus_marketing_session_v1';
const ATTRIBUTION='campus_marketing_attribution_v1';
const OPTOUT='campus_marketing_optout_v1';

function limited(value,max){return String(value||'').trim().slice(0,max)}
function referrerHost(){
 try {return document.referrer?new URL(document.referrer).hostname.slice(0,120):'';} catch {return '';}
}
function track(type='page_view'){
 if(!sb||typeof window==='undefined')return;
 try{
  if(localStorage.getItem(OPTOUT)==='1')return;
  let visitor=localStorage.getItem(VISITOR);
  if(!visitor){visitor=crypto.randomUUID();localStorage.setItem(VISITOR,visitor)}
  let session=sessionStorage.getItem(SESSION);
  if(!session){session=crypto.randomUUID();sessionStorage.setItem(SESSION,session)}
  const params=new URLSearchParams(location.search);
  const ref=referrerHost();
  let attribution={};
  try{attribution=JSON.parse(sessionStorage.getItem(ATTRIBUTION)||'{}')||{}}catch{}
  const utmSource=limited(params.get('utm_source'),80);
  if(!attribution.source||utmSource){
   attribution={
    source:utmSource||(ref&&!ref.endsWith('campus-rdc.com')?ref:'direct'),
    medium:limited(params.get('utm_medium'),80),
    campaign:limited(params.get('utm_campaign'),100),
    referrer:ref
   };
   sessionStorage.setItem(ATTRIBUTION,JSON.stringify(attribution));
  }
  const w=window.innerWidth;
  const device=w<700?'mobile':w<1100?'tablet':'desktop';
  const row={
   visitor_id:visitor,session_id:session,event_type:type,
   page_path:limited(location.pathname,240)||'/',
   traffic_source:limited(attribution.source,80)||'direct',
   traffic_medium:attribution.medium||null,
   traffic_campaign:attribution.campaign||null,
   referrer_host:attribution.referrer||null,
   device_type:device
  };
  void sb.from('campus_marketing_events').insert(row).then(({error})=>{
   if(error&&process.env.NODE_ENV==='development')console.warn('Campus analytics:',error.message);
  });
 }catch(e){
  if(process.env.NODE_ENV==='development')console.warn('Campus analytics:',e);
 }
}
function Tracker(){
 const pathname=usePathname();
 const query=useSearchParams()?.toString()||'';
 useEffect(()=>{track('page_view')},[pathname,query]);
 useEffect(()=>{
  const onAction=(e)=>{
   const type=e?.detail?.type;
   if(['order_click','sell_click','promo_click'].includes(type))track(type);
  };
  window.addEventListener('campus:marketing',onAction);
  return ()=>window.removeEventListener('campus:marketing',onAction);
 },[]);
 return null;
}
export default function CampusVisitTracker(){
 return <Suspense fallback={null}><Tracker/></Suspense>;
}
