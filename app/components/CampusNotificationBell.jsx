'use client';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import CampusPushControl from './CampusPushControl';

const SELECT='id,kind,title,body,read_at,listing_id,created_at';
const BellIcon=()=> <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>;
const niceDate=value=>new Date(value).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
export default function CampusNotificationBell(){
 const sb=useMemo(()=>{const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return url&&key?createClient(url,key):null},[]);
 const [userId,setUserId]=useState(null),[items,setItems]=useState([]),[open,setOpen]=useState(false),[flash,setFlash]=useState(null),[permission,setPermission]=useState('unsupported');
 const wrapper=useRef(null),seen=useRef(new Set()),initialized=useRef(false);
 useEffect(()=>{if(typeof window!=='undefined')setPermission('Notification' in window?Notification.permission:'unsupported')},[]);
 useEffect(()=>{
  if(!sb)return;let live=true;
  sb.auth.getUser().then(({data})=>{if(live)setUserId(data.user?.id||null)});
  const {data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>{if(live)setUserId(session?.user?.id||null)});
  return()=>{live=false;subscription.unsubscribe()};
 },[sb]);
 const announce=useCallback((n)=>{
  if(n.kind==='listing_submitted')return;
  setFlash({title:n.title,body:n.body});
  if(typeof window!=='undefined'&&'Notification' in window&&Notification.permission==='granted'){
   try{new Notification('CAMPUS · '+n.title,{body:n.body,icon:'/icon.png',tag:'campus-notification-'+n.id})}catch{}
  }
 },[]);
 useEffect(()=>{
  if(!sb||!userId){setItems([]);setOpen(false);seen.current=new Set();initialized.current=false;return}
  let active=true;
  const load=async()=>{
   const {data,error}=await sb.from('campus_notifications').select(SELECT).order('created_at',{ascending:false}).limit(40);
   if(!active||error)return;
   const list=data||[];
   if(initialized.current){
    const added=list.filter(n=>!seen.current.has(n.id));
    if(added.length)announce(added[0]);
   }
   list.forEach(n=>seen.current.add(n.id));
   setItems(list);
   initialized.current=true;
  };
  seen.current=new Set();initialized.current=false;load();
  const channel=sb.channel('campus-notifications-'+userId)
   .on('postgres_changes',{event:'INSERT',schema:'public',table:'campus_notifications',filter:'user_id=eq.'+userId},payload=>{
    if(!active)return;
    const n=payload.new;
    if(!n||seen.current.has(n.id))return;
    seen.current.add(n.id);
    setItems(old=>[n,...old.filter(x=>x.id!==n.id)].slice(0,40));
    if(initialized.current)announce(n);
   })
   .on('postgres_changes',{event:'UPDATE',schema:'public',table:'campus_notifications',filter:'user_id=eq.'+userId},payload=>{
    if(!active)return;
    setItems(old=>old.map(x=>x.id===payload.new?.id?{...x,read_at:payload.new.read_at}:x));
   })
   .subscribe();
  const onFocus=()=>{if(document.visibilityState==='visible')load()};
  window.addEventListener('focus',onFocus);
  document.addEventListener('visibilitychange',onFocus);
  const interval=window.setInterval(load,30000);
  return()=>{active=false;window.clearInterval(interval);window.removeEventListener('focus',onFocus);document.removeEventListener('visibilitychange',onFocus);sb.removeChannel(channel)};
 },[sb,userId,announce]);
 useEffect(()=>{
  if(!open)return;
  const outside=e=>{if(wrapper.current&&!wrapper.current.contains(e.target))setOpen(false)};
  const escape=e=>{if(e.key==='Escape')setOpen(false)};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)};
 },[open]);
 useEffect(()=>{if(!flash)return;const timeout=window.setTimeout(()=>setFlash(null),6500);return()=>clearTimeout(timeout)},[flash]);
 async function markAsRead(n){
  if(!sb||n.read_at)return;
  const date=new Date().toISOString();
  const {error}=await sb.from('campus_notifications').update({read_at:date}).eq('id',n.id);
  if(!error)setItems(old=>old.map(x=>x.id===n.id?{...x,read_at:date}:x));
 }
 async function markAll(){
  if(!sb||!userId)return;
  const date=new Date().toISOString();
  const {error}=await sb.from('campus_notifications').update({read_at:date}).eq('user_id',userId).is('read_at',null);
  if(!error)setItems(old=>old.map(x=>({...x,read_at:x.read_at||date})));
 }
 async function allowBrowserAlerts(){
  if(!('Notification' in window))return;
  try{const state=await Notification.requestPermission();setPermission(state)}catch{}
 }
 if(!userId)return null;
 const unread=items.filter(n=>!n.read_at).length;
 return <div className="campus-notification-widget" ref={wrapper}>
  <button type="button" className={'campus-bell-trigger'+(unread?' has-unread':'')} onClick={()=>setOpen(v=>!v)} aria-label={'Notifications CAMPUS'+(unread?' : '+unread+' non lues':'')} aria-haspopup="dialog" aria-expanded={open}>
   <BellIcon/>{unread>0&&<span className="campus-bell-badge">{unread>9?'9+':unread}</span>}
  </button>
  {open&&<div className="campus-bell-panel" role="dialog" aria-label="Dernières notifications CAMPUS">
   <div className="campus-bell-top"><div><strong>Notifications</strong><span>{unread?unread+' non lue'+(unread>1?'s':''):'Tu es à jour'}</span></div><button type="button" aria-label="Fermer les notifications" className="campus-bell-close" onClick={()=>setOpen(false)}>×</button></div>
   {items.length===0?<div className="campus-bell-empty"><BellIcon/><strong>Aucune notification</strong><p>Tu retrouveras ici les nouvelles concernant tes annonces CAMPUS.</p></div>:<div className="campus-bell-feed">{items.slice(0,6).map(n=><div className={'campus-bell-entry'+(!n.read_at?' unread':'')} key={n.id}>
    <div className="campus-bell-entry-top"><strong>{n.title}</strong>{!n.read_at&&<span className="campus-bell-dot" aria-label="Non lue"/>}</div>
    <p>{n.body}</p>{['listing_hidden','listing_correction_requested','listing_moderator_message','listing_rejected','listing_revision_rejected','listing_revision_submitted'].includes(n.kind)&&n.listing_id&&<Link className="campus-bell-edit-link" href={'/annonce/'+n.listing_id+'/modifier'} onClick={()=>setOpen(false)}>Modifier mon annonce</Link>}<div className="campus-bell-entry-bottom"><time dateTime={n.created_at}>{niceDate(n.created_at)}</time>{!n.read_at&&<button type="button" onClick={()=>markAsRead(n)}>Marquer comme lue</button>}</div>
   </div>)}</div>}
   <div className="campus-bell-footer">
    <Link href="/compte?onglet=notifications" onClick={()=>setOpen(false)}>Toutes mes notifications</Link>
    {unread>0&&<button type="button" onClick={markAll}>Tout marquer comme lu</button>}
    <CampusPushControl compact/>{permission==='default'&&<button type="button" onClick={allowBrowserAlerts}>Alertes de bureau</button>}
   </div>
  </div>}
  {flash&&<div className="campus-bell-toast" role="status"><div><strong>{flash.title}</strong><p>{flash.body}</p></div><button type="button" aria-label="Fermer l'alerte" onClick={()=>setFlash(null)}>×</button></div>}
 </div>;
}
