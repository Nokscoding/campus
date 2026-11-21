'use client';
import {useEffect,useState} from 'react';
import CampusLoaderArtwork from './CampusLoaderArtwork';

// Shown only for the initial full-page launch. This component lives in the
// persistent root layout: client-side links and back/forward never restart it.
export default function CampusStartupLoader(){
 const [phase,setPhase]=useState('visible');
 useEffect(()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const visibleMs=reduced?350:900;
  const fadeMs=reduced?0:320;
  const hide=window.setTimeout(()=>setPhase('hiding'),visibleMs);
  const remove=window.setTimeout(()=>setPhase('removed'),visibleMs+fadeMs);
  return()=>{window.clearTimeout(hide);window.clearTimeout(remove)};
 },[]);
 if(phase==='removed')return null;
 return <CampusLoaderArtwork variant="startup" fading={phase==='hiding'}/>;
}
