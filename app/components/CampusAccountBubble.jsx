'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import {AvatarVisual,avatarUrl} from './CampusAvatarPicker';

export default function CampusAccountBubble(){
 const sb=useMemo(()=>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url&&key?createClient(url,key):null;
 },[]);
 const [user,setUser]=useState(null);
 const [profile,setProfile]=useState(null);

 useEffect(()=>{
  if(!sb)return;
  let active=true,request=0;
  const refresh=async(person)=>{
   const currentRequest=++request;
   if(!active)return;
   setUser(person||null);
   if(!person){setProfile(null);return}
   const {data,error}=await sb.from('campus_profiles')
    .select('avatar_choice,avatar_path,avatar_updated_at')
    .eq('user_id',person.id).maybeSingle();
   if(active&&currentRequest===request)setProfile(!error?data||null:null);
  };
  sb.auth.getUser().then(({data})=>refresh(data?.user||null)).catch(()=>refresh(null));
  const {data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>{
   Promise.resolve().then(()=>{if(active)refresh(session?.user||null)});
  });
  const onAvatarChange=()=>sb.auth.getUser().then(({data})=>refresh(data?.user||null)).catch(()=>{});
  window.addEventListener('campus-avatar-updated',onAvatarChange);
  return()=>{
   active=false;request++;
   subscription.unsubscribe();
   window.removeEventListener('campus-avatar-updated',onAvatarChange);
  };
 },[sb]);

 const choice=profile?.avatar_choice;
 const hasAvatar=Boolean(user&&choice&&(choice!=='custom'||profile?.avatar_path));
 const customPhoto=choice==='custom'?avatarUrl(sb,profile?.avatar_path,profile?.avatar_updated_at):null;
 return <Link href="/compte" className="campus-account-bubble"
  aria-label={user?'Ouvrir mon profil CAMPUS':'Se connecter ou créer un compte CAMPUS'}
  title={user?'Mon profil':'Se connecter / s’inscrire'}>
  {hasAvatar?<AvatarVisual choice={choice} photoUrl={customPhoto} size="header" label="Ma photo de profil"/>:
   <svg className="campus-account-outline" viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4"/><path d="M4.5 20c.6-4 3.3-6 7.5-6s6.9 2 7.5 6"/>
   </svg>}
 </Link>;
}
