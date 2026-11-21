'use client';
import {useEffect,useRef,useState} from 'react';
import './CampusPromoCarousel.css';

const fallbackImage='https://res.cloudinary.com/jrgtsxkt/image/upload/v1794863470/campus/illustrations/hero-original-etudiant-choisi.webp';
function validHref(raw){
 const value=String(raw||'').trim();
 if(value.startsWith('/')&&!value.startsWith('//'))return value;
 try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:null}catch{return null}
}
export default function CampusPromoCarousel({promotions=[]}){
 const items=Array.isArray(promotions)?promotions:[];
 const [index,setIndex]=useState(0);
 const touch=useRef(null);
 useEffect(()=>{if(index>=items.length)setIndex(0)},[index,items.length]);
 useEffect(()=>{
  if(items.length<2||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  // Autoplay also resumes after touch, swipe, arrow click and focus on mobile.
  const interval=window.setInterval(()=>{
   if(document.visibilityState==='visible')setIndex(i=>(i+1)%items.length);
  },5000);
  return()=>window.clearInterval(interval);
 },[items.length]);
 const move=delta=>setIndex(i=>(i+delta+items.length)%items.length);
 if(!items.length)return <div className="hero-photo-panel"><img className="hero-photo" src={fallbackImage} alt="Illustration CAMPUS : étudiants avec ordinateur, téléphone et agent de livraison" width="1536" height="1024"/></div>;

 const active=items[index]||items[0];
 const link=validHref(active.button_url);
 const external=link&&!link.startsWith('/');
 const hasCopy=Boolean(active.title||active.subtitle||(link&&active.button_text));
 return <div className="hero-photo-panel campus-promo" aria-roledescription="carrousel" aria-label="Publicités et annonces CAMPUS"
  onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.key==='ArrowRight'){e.preventDefault();move(1)}}}>
  <div className="campus-promo-window"
   onTouchStart={e=>{touch.current=e.touches[0]?.clientX??null}}
   onTouchEnd={e=>{const start=touch.current,end=e.changedTouches[0]?.clientX;touch.current=null;if(typeof start==='number'&&typeof end==='number'&&Math.abs(start-end)>45)move(end<start?1:-1)}}>
   <div className="campus-promo-track" style={{transform:`translateX(-${index*100}%)`}}>
    {items.map((item,i)=><article key={item.id} className="campus-promo-slide" aria-hidden={i!==index} aria-roledescription="diapositive" aria-label={`${i+1} sur ${items.length}`}>
      <img src={item.image_url} alt={item.title||'Visuel publicitaire CAMPUS'} width="1536" height="1024" loading={i===0?'eager':'lazy'} decoding="async"/>
     </article>)}
   </div>
  </div>
  {hasCopy&&<div className="campus-promo-copy" aria-live="polite">
   <div className="campus-promo-copy-body">
    {active.title&&<h2>{active.title}</h2>}
    {active.subtitle&&<p>{active.subtitle}</p>}
   </div>
   {link&&active.button_text&&<a className="campus-promo-cta" href={link} target={external?'_blank':undefined} rel={external?'noopener noreferrer':undefined}><span className="campus-promo-cta-label">{active.button_text}</span><svg className="campus-promo-cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a>}
  </div>}
  <div className="campus-promo-toolbar">
   <span className="campus-promo-disclosure">{active.badge||'Annonce'}</span>
   {items.length>1&&<div className="campus-promo-navigation">
    <button className="campus-promo-arrow" type="button" onClick={()=>move(-1)} aria-label="Annonce précédente">‹</button>
    <div className="campus-promo-dots" role="group" aria-label="Choisir une annonce">{items.map((s,i)=><button key={s.id} className={i===index?'active':''} type="button" onClick={()=>setIndex(i)} aria-label={`Afficher l'annonce ${i+1}`} aria-current={i===index?'true':undefined}/>)}</div>
    <button className="campus-promo-arrow" type="button" onClick={()=>move(1)} aria-label="Annonce suivante">›</button>
   </div>}
  </div>
 </div>;
}
