'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';

export default function CampusSupportDock(){
 const pathname=usePathname();
 const [footerVisible,setFooterVisible]=useState(false);

 useEffect(()=>{
  const footer=document.querySelector('footer');
  if(!footer || typeof IntersectionObserver==='undefined'){
   setFooterVisible(false);
   return;
  }
  const observer=new IntersectionObserver(([entry])=>{
   setFooterVisible(entry.isIntersecting);
  },{threshold:0,rootMargin:'0px 0px 100px 0px'});
  observer.observe(footer);
  return ()=>observer.disconnect();
 },[pathname]);

 // Le pied de page dispose déjà des liens d'assistance : ne pas les recouvrir.
 return <div className={`campus-support-dock${footerVisible?' campus-support-dock--hidden':''}`} aria-label="Aide CAMPUS" aria-hidden={footerVisible}>
  <Link href="/contact" tabIndex={footerVisible?-1:undefined} className="campus-support-dock-main">
   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.38-4.12-1.04L3 20l1.08-4.2a8.5 8.5 0 1 1 15.92-4.3z"/></svg>
   Nous contacter</Link>
  <Link href="/contact?motif=bug" tabIndex={footerVisible?-1:undefined} className="campus-support-dock-secondary">Signaler un bug</Link>
 </div>;
}
