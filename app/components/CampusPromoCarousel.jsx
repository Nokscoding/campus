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
 const [paused,setPaused]=useState(false);
 const touch=useRef(null);
 useEffect(()=>{if(index>=items.length)setIndex(0)},[index,items.length]);
 useEffect(()=>{
  if(items.length<2||paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const interval=window.setInterval(()=>setIndex(i=>(i+1)%items.length),6000);
  return()=>window.clearInterval(interval);
 },[paused,items.length]);
 const move=delta=>setIndex(i=>(i+delta+items.length)%items.length);
 if(!items.length)return <div className="hero-photo-panel"><img className="hero-photo" src={fallbackImage} alt="Illustration CAMPUS : étudiants avec ordinateur, téléphone et agent de livraison" width="1536" height="1024"/></div>;
 return <div className="hero-photo-panel campus-promo" aria-roledescription="carrousel" aria-label="Publicités et annonces CAMPUS" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setPaused(false)}} onTouchStart={e=>{touch.current=e.touches[0]?.clientX??null}} onTouchEnd={e=>{const start=touch.current,end=e.changedTouches[0]?.clientX;touch.current=null;if(typeof start==='number'&&typeof end==='number'&&Math.abs(start-end)>45)move(end<start?1:-1)}} onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.key==='ArrowRight'){e.preventDefault();move(1)}}}>
  <div className="campus-promo-window">
   <div className="campus-promo-track" style={{transform:`translateX(-${index*100}%)`}}>
    {items.map((item,i)=>{
     const link=validHref(item.button_url);
     const hasCopy=Boolean(item.title||item.subtitle||item.button_text&&link);
     const external=link&&!link.startsWith('/');
     return <article key={item.id} className={'campus-promo-slide'+(hasCopy?' has-copy':'')} aria-hidden={i!==index} aria-roledescription="diapositive" aria-label={`${i+1} sur ${items.length}`}>
      <img src={item.image_url} alt={item.title||'Annonce CAMPUS'} loading={i===0?'eager':'lazy'} decoding="async" />
      <div className="campus-promo-shade" aria-hidden="true"/>
      <div className="campus-promo-content">
       <div className="campus-promo-copy">
        {item.title&&<h2>{item.title}</h2>}
        {item.subtitle&&<p>{item.subtitle}</p>}
        {link&&item.button_text&&<a className="campus-promo-cta" href={link} target={external?'_blank':undefined} rel={external?'noopener noreferrer':undefined} tabIndex={i===index?0:-1}>{item.button_text}<span aria-hidden="true">↗</span></a>}
       </div>
       <span className="campus-promo-disclosure">{item.badge||'Annonce'}</span>
      </div>
     </article>
    })}
   </div>
  </div>
  {items.length>1&&<>
   <button className="campus-promo-arrow campus-promo-prev" type="button" onClick={()=>move(-1)} aria-label="Annonce précédente">‹</button>
   <button className="campus-promo-arrow campus-promo-next" type="button" onClick={()=>move(1)} aria-label="Annonce suivante">›</button>
   <div className="campus-promo-dots" role="group" aria-label="Choisir une annonce">{items.map((s,i)=><button key={s.id} className={i===index?'active':''} type="button" onClick={()=>setIndex(i)} aria-label={`Afficher l'annonce ${i+1}`} aria-current={i===index?'true':undefined}/>)}</div>
  </>}
 </div>
}
