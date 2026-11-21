'use client';

import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';

function Arrow({direction}){
 return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={direction==='left'?'M19 12H5m7 7-7-7 7-7':'M5 12h14m-7-7 7 7-7 7'}/></svg>;
}
export default function ProductGallery({images=[],title='Produit'}){
 const [activeIndex,setActiveIndex]=useState(null);
 const closeRef=useRef(null);
 const touchStart=useRef(null);
 const count=images.length;
 const open=activeIndex!==null&&count>0;
 const close=()=>setActiveIndex(null);
 const move=(delta)=>setActiveIndex(i=>i===null?null:(i+delta+count)%count);

 useEffect(()=>{
  if(!open)return;
  const oldOverflow=document.body.style.overflow;
  const oldFocus=document.activeElement;
  document.body.style.overflow='hidden';
  closeRef.current?.focus();
  const onKey=(event)=>{
   if(event.key==='Escape'){event.preventDefault();close()}
   if(event.key==='ArrowLeft'&&count>1){event.preventDefault();move(-1)}
   if(event.key==='ArrowRight'&&count>1){event.preventDefault();move(1)}
  };
  document.addEventListener('keydown',onKey);
  return()=>{
   document.removeEventListener('keydown',onKey);
   document.body.style.overflow=oldOverflow;
   oldFocus?.focus?.();
  };
 },[open,count]);

 if(!count)return <div className="product-gallery"><div className="product-no-picture">Photo indisponible</div></div>;
 return <>
  <div className="product-gallery">
   {images.map((src,i)=><button className="campus-product-photo-button" type="button" key={src+'-'+i} onClick={()=>setActiveIndex(i)} aria-label={'Voir en grand la photo '+(i+1)+' de '+title}>
     <img src={src} alt={'Photo '+(i+1)+' de '+title} loading={i===0?'eager':'lazy'}/>
     {i===0&&<span className="campus-product-photo-hint" aria-hidden="true">Agrandir la photo <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3H3v5M16 3h5v5M3 16v5h5m13-5v5h-5"/></svg></span>}
    </button>)}
  </div>
  {open&&createPortal(<div className="campus-photo-lightbox" role="dialog" aria-modal="true" aria-label={'Galerie photo : '+title} onClick={close}>
    <div className="campus-photo-lightbox-top">
     <span className="campus-photo-lightbox-count">{activeIndex+1} / {count}</span>
     <button ref={closeRef} className="campus-photo-lightbox-close" type="button" onClick={close} aria-label="Fermer la photo"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg></button>
    </div>
    <div className="campus-photo-lightbox-stage" onClick={e=>e.stopPropagation()} onTouchStart={e=>{touchStart.current=e.touches[0]?.clientX??null}} onTouchEnd={e=>{const x=touchStart.current,y=e.changedTouches[0]?.clientX;touchStart.current=null;if(count>1&&typeof x==='number'&&typeof y==='number'&&Math.abs(x-y)>55)move(y<x?1:-1)}}>
     <img key={activeIndex} src={images[activeIndex]} alt={'Photo '+(activeIndex+1)+' de '+title} draggable={false}/>
    </div>
    {count>1&&<div className="campus-photo-lightbox-nav" onClick={e=>e.stopPropagation()}>
     <button type="button" onClick={()=>move(-1)} aria-label="Photo précédente"><Arrow direction="left"/></button>
     <span>Faire défiler les photos</span>
     <button type="button" onClick={()=>move(1)} aria-label="Photo suivante"><Arrow direction="right"/></button>
    </div>}
   </div>,document.body)}
 </>;
}
