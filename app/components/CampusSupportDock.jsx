'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';

export default function CampusSupportDock(){
 const pathname=usePathname();
 const [footerVisible,setFooterVisible]=useState(false);

 useEffect(()=>{
  let frame=null;
  const checkFooter=()=>{
   frame=null;
   const footer=document.querySelector('footer');
   if(!footer){setFooterVisible(false);return}
   const rect=footer.getBoundingClientRect();
   const viewportHeight=window.innerHeight||document.documentElement.clientHeight;
   // Vérifie la position réelle du footer, même si IntersectionObserver manque un événement.
   setFooterVisible(rect.top<=viewportHeight+120 && rect.bottom>=0);
  };
  const scheduleCheck=()=>{
   if(frame!==null)return;
   frame=window.requestAnimationFrame(checkFooter);
  };
  scheduleCheck();
  window.addEventListener('scroll',scheduleCheck,{passive:true});
  window.addEventListener('resize',scheduleCheck);
  window.addEventListener('orientationchange',scheduleCheck);

  let observer=null;
  const footer=document.querySelector('footer');
  if(footer && typeof IntersectionObserver!=='undefined'){
   observer=new IntersectionObserver(scheduleCheck,{rootMargin:'0px 0px 120px 0px'});
   observer.observe(footer);
  }
  return ()=>{
   window.removeEventListener('scroll',scheduleCheck);
   window.removeEventListener('resize',scheduleCheck);
   window.removeEventListener('orientationchange',scheduleCheck);
   observer?.disconnect();
   if(frame!==null)window.cancelAnimationFrame(frame);
  };
 },[pathname]);

 // L'élément reste monté pour que sa sortie soit animée.
 return <div
  className={`campus-support-dock${footerVisible?' campus-support-dock--hidden':''}`}
  style={{
   opacity:footerVisible?0:1,
   transform:footerVisible?'translateX(calc(100% + 40px))':'translateX(0)',
   pointerEvents:footerVisible?'none':'auto'
  }}
  aria-label="Aide CAMPUS" aria-hidden={footerVisible}>
  <Link href="/contact" tabIndex={footerVisible?-1:undefined} className="campus-support-dock-main">
   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.38-4.12-1.04L3 20l1.08-4.2a8.5 8.5 0 1 1 15.92-4.3z"/></svg>
   Nous contacter</Link>
  <Link href="/contact?motif=bug" tabIndex={footerVisible?-1:undefined} className="campus-support-dock-secondary">Signaler un bug</Link>
 </div>;
}
