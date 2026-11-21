'use client';
import {useEffect,useState} from 'react';

// Keep the loader mounted for the first document load, not each client-side route change.
export default function CampusStartupLoader(){
 const [phase,setPhase]=useState('visible');
 useEffect(()=>{
  const started=performance.now();
  let hideTimer,removeTimer;
  const hide=()=>{
   const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const minimum=reduced?0:2400;
   hideTimer=window.setTimeout(()=>{
    setPhase('hiding');
    removeTimer=window.setTimeout(()=>setPhase('removed'),reduced?0:550);
   },Math.max(0,minimum-(performance.now()-started)));
  };
  if(document.readyState==='complete')hide();
  else window.addEventListener('load',hide,{once:true});
  return ()=>{
   window.removeEventListener('load',hide);
   window.clearTimeout(hideTimer);
   window.clearTimeout(removeTimer);
  };
 },[]);
 if(phase==='removed')return null;
 return <div id="lg-loader" className={phase==='hiding'?'lg-hide':''} role="status" aria-label="Chargement de CAMPUS">
  <svg viewBox="0 0 1254 1254" aria-hidden="true">
   <defs>
    <radialGradient id="lgPg" cx="55%" cy="75%" r="75%">
     <stop offset="0" stopColor="#d4bfff"/>
     <stop offset=".6" stopColor="#c3a4fb"/>
     <stop offset="1" stopColor="#a678f5"/>
    </radialGradient>
    <linearGradient id="lgPe" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0" stopColor="#6b2cff"/>
     <stop offset=".35" stopColor="#6b2cff" stopOpacity="0"/>
    </linearGradient>
   </defs>
   <path className="lg-top" fill="#2f0072" d="M500 538C540 480 590 448 645 448C700 448 750 470 785 500C805 520 830 535 855 535C910 535 945 495 945 450C945 425 935 410 920 390C840 300 750 258 650 258C430 258 280 430 280 615C280 690 310 760 350 815C335 780 340 740 360 700C385 650 430 610 465 583C480 572 492 560 500 538Z"/>
   <g className="lg-bot">
    <path fill="url(#lgPg)" d="M500 538C485 565 480 590 484 615C490 660 520 710 560 740C590 760 620 768 645 768C700 768 745 740 770 712C790 690 820 675 855 675C915 675 957 720 957 768C957 790 948 805 935 820C850 920 750 972 645 972C520 972 410 910 350 815C335 780 340 740 360 700C385 650 430 610 465 583C480 572 492 560 500 538Z"/>
    <path fill="url(#lgPe)" d="M500 538C485 565 480 590 484 615C490 660 520 710 560 740C590 760 620 768 645 768C700 768 745 740 770 712C790 690 820 675 855 675C915 675 957 720 957 768C957 790 948 805 935 820C850 920 750 972 645 972C520 972 410 910 350 815C335 780 340 740 360 700C385 650 430 610 465 583C480 572 492 560 500 538Z"/>
   </g>
  </svg>
 </div>;
}
