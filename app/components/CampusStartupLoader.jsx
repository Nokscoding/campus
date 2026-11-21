'use client';
import {useEffect,useRef,useState,Suspense} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import CampusLoaderArtwork from './CampusLoaderArtwork';

// One full-screen branded loader on initial load, internal links, back/forward,
// and programmatic route changes. Next's app/loading.jsx uses the same SVG while streaming.
function CampusNavigationLoader(){
 const pathname=usePathname();
 const params=useSearchParams();
 const routeKey=(pathname||'/')+'?'+(params?.toString()||'');
 const [phase,setPhase]=useState('visible');
 const timers=useRef([]);
 const began=useRef(0);
 const pending=useRef(false);
 const previousRoute=useRef(null);
 const mounted=useRef(false);
 function clearTimers(){
  timers.current.forEach(id=>window.clearTimeout(id));
  timers.current=[];
 }
 function later(fn,ms){
  const id=window.setTimeout(fn,ms);
  timers.current.push(id);
 }
 function start(){
  clearTimers();
  began.current=performance.now();
  pending.current=true;
  setPhase('visible');
  // If a link is canceled or fails, never leave a blocking overlay indefinitely.
  later(()=>{ if(pending.current){pending.current=false;setPhase('hiding');later(()=>setPhase('removed'),550);} },9000);
 }
 function finish(){
  pending.current=false;
  clearTimers();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const minimum=reduced?0:2400;
  later(()=>{
   setPhase('hiding');
   later(()=>setPhase('removed'),reduced?0:550);
  },Math.max(0,minimum-(performance.now()-began.current)));
 }
 useEffect(()=>{
  mounted.current=true;
  began.current=performance.now();
  const onLoad=()=>{if(!pending.current)finish();};
  if(document.readyState==='complete')onLoad();
  else window.addEventListener('load',onLoad,{once:true});
  function click(event){
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const target=event.target;
   const link=target instanceof Element?target.closest('a[href]'):null;
   if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
   let url;
   try{url=new URL(link.href,location.href);}catch{return}
   if(url.origin!==location.origin)return;
   const here=location.pathname+location.search;
   const there=url.pathname+url.search;
   if(here===there)return; // no overlay for an anchor on the current page
   start();
  }
  // Capture the click before Next.js's Link handler changes the route.
  document.addEventListener('click',click,true);
  const back=()=>start();
  window.addEventListener('popstate',back);
  return ()=>{
   mounted.current=false;
   window.removeEventListener('load',onLoad);
   window.removeEventListener('popstate',back);
   document.removeEventListener('click',click,true);
   clearTimers();
  };
 },[]);
 useEffect(()=>{
  if(previousRoute.current===null){previousRoute.current=routeKey;return;}
  if(routeKey===previousRoute.current)return;
  previousRoute.current=routeKey;
  // Router.push/replace may navigate without an anchor click.
  if(!pending.current){began.current=performance.now();setPhase('visible');}
  finish();
 },[routeKey]);
 if(phase==='removed')return null;
 return <CampusLoaderArtwork variant="startup" fading={phase==='hiding'}/>;
}
export default function CampusStartupLoader(){
 // useSearchParams needs a Suspense boundary for statically rendered Next pages.
 return <Suspense fallback={null}><CampusNavigationLoader/></Suspense>;
}
