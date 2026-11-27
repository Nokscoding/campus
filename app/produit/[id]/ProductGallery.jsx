'use client';

import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';

function Arrow({direction}){
 return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={direction==='left'?'M19 12H5m7 7-7-7 7-7':'M5 12h14m-7-7 7 7-7 7'}/></svg>;
}
export default function ProductGallery({images=[],title='Produit'}){
 const [activePhoto,setActivePhoto]=useState(null);
 const [attempts,setAttempts]=useState({});
 const [retrySeed,setRetrySeed]=useState(0);
 const closeRef=useRef(null);
 const touchStart=useRef(null);
 const allPhotos=Array.from(new Set((Array.isArray(images)?images:[]).filter(src=>typeof src==='string'&&src.trim()).map(src=>src.trim())));
 const photos=allPhotos.filter(src=>(attempts[src]||0)<2);
 const count=photos.length;
 const activeIndex=photos.indexOf(activePhoto);
 const open=activeIndex>=0;
 const close=()=>setActivePhoto(null);
 const photosRef=useRef(photos);
 photosRef.current=photos;
 const move=(delta)=>setActivePhoto(src=>{
  const current=photosRef.current,i=current.indexOf(src);
  return i<0||!current.length?null:current[(i+delta+current.length)%current.length];
 });
 const imageSource=(src)=>{
  if(!(attempts[src]||retrySeed))return src;
  try{
   const url=new URL(src);
   if(url.pathname.includes('/storage/v1/object/public/')){
    url.searchParams.set('campus_retry',String(retrySeed)+'-'+String(attempts[src]||0));
    return url.href;
   }
  }catch{}
  return src;
 };
 const handleError=(src,attempt)=>setAttempts(prev=>{
  if((prev[src]||0)!==attempt)return prev;
  return {...prev,[src]:attempt+1};
 });
 const retryFailed=()=>{setRetrySeed(n=>n+1);setAttempts({})};
 useEffect(()=>{setAttempts({});setRetrySeed(0);setActivePhoto(null)},[title,images]);

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

 if(!count)return <div className="product-gallery"><div className="product-no-picture">Photo indisponible{allPhotos.length>0&&<button type="button" onClick={retryFailed}>Réessayer</button>}</div></div>;
 return <>
  <div className="product-gallery">
   {photos.map((src,i)=><button className="campus-product-photo-button" type="button" key={src} onClick={()=>setActivePhoto(src)} aria-label={'Voir en grand la photo '+(i+1)+' de '+title}>
     <img key={retrySeed+'-'+(attempts[src]||0)} src={imageSource(src)} alt={'Photo '+(i+1)+' de '+title} loading="eager" decoding="async" fetchPriority={i===0?'high':'auto'} onError={()=>handleError(src,attempts[src]||0)}/>
     {i===0&&<span className="campus-product-photo-hint" aria-hidden="true">Agrandir la photo <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3H3v5M16 3h5v5M3 16v5h5m13-5v5h-5"/></svg></span>}
    </button>)}
   {photos.length<allPhotos.length&&<button type="button" onClick={retryFailed} style={{gridColumn:'1 / -1',justifySelf:'start',padding:'8px 12px',border:'1px solid #e4dcf5',borderRadius:10,background:'#fff',color:'#5737c7',cursor:'pointer'}}>Réessayer les photos indisponibles</button>}
  </div>
  {open&&createPortal(<div className="campus-photo-lightbox" role="dialog" aria-modal="true" aria-label={'Galerie photo : '+title} onClick={close}>
    <div className="campus-photo-lightbox-top">
     <span className="campus-photo-lightbox-count">{activeIndex+1} / {count}</span>
     <button ref={closeRef} className="campus-photo-lightbox-close" type="button" onClick={close} aria-label="Fermer la photo"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg></button>
    </div>
    <div className="campus-photo-lightbox-stage" onClick={e=>e.stopPropagation()} onTouchStart={e=>{touchStart.current=e.touches[0]?.clientX??null}} onTouchEnd={e=>{const x=touchStart.current,y=e.changedTouches[0]?.clientX;touchStart.current=null;if(count>1&&typeof x==='number'&&typeof y==='number'&&Math.abs(x-y)>55)move(y<x?1:-1)}}>
     <img key={activePhoto+'-'+retrySeed+'-'+(attempts[activePhoto]||0)} src={imageSource(activePhoto)} alt={'Photo '+(activeIndex+1)+' de '+title} draggable={false} onError={()=>handleError(activePhoto,attempts[activePhoto]||0)}/>
    </div>
    {count>1&&<div className="campus-photo-lightbox-nav" onClick={e=>e.stopPropagation()}>
     <button type="button" onClick={()=>move(-1)} aria-label="Photo précédente"><Arrow direction="left"/></button>
     <span>Faire défiler les photos</span>
     <button type="button" onClick={()=>move(1)} aria-label="Photo suivante"><Arrow direction="right"/></button>
    </div>}
   </div>,document.body)}
 </>;
}
