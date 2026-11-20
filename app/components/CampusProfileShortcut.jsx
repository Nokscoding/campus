'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import {AvatarVisual,avatarUrl} from './CampusAvatarPicker';

export default function CampusProfileShortcut(){
 const sb=useMemo(()=>{const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return u&&k?createClient(u,k):null},[]);
 const [userId,setUserId]=useState(null),[avatar,setAvatar]=useState(null);
 useEffect(()=>{
  if(!sb)return;
  let mounted=true;
  sb.auth.getUser().then(({data})=>{if(mounted)setUserId(data.user?.id||null)}).catch(()=>{if(mounted)setUserId(null)});
  const {data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>{if(mounted)setUserId(session?.user?.id||null)});
  return()=>{mounted=false;subscription.unsubscribe()};
 },[sb]);
 useEffect(()=>{
  if(!sb||!userId){setAvatar(null);return}
  let active=true;
  sb.from('campus_profiles').select('avatar_choice,avatar_path,avatar_updated_at').eq('user_id',userId).maybeSingle()
   .then(({data,error})=>{if(active)setAvatar(!error&&data?data:null)});
  return()=>{active=false};
 },[sb,userId]);
 useEffect(()=>{
  const changed=event=>{
   if(event.detail?.userId===userId)setAvatar({avatar_choice:event.detail.avatar_choice,avatar_path:event.detail.avatar_path,avatar_updated_at:event.detail.avatar_updated_at});
  };
  window.addEventListener('campus:avatar-updated',changed);
  return()=>window.removeEventListener('campus:avatar-updated',changed);
 },[userId]);
 const hasAvatar=avatar?.avatar_choice==='custom'?Boolean(avatar.avatar_path):/^avatar-(0[1-9]|1[01])$/.test(avatar?.avatar_choice||'');
 const photoUrl=avatar?.avatar_choice==='custom'?avatarUrl(sb,avatar.avatar_path,avatar.avatar_updated_at):null;
 return <Link href={userId?'/compte?onglet=profil':'/compte'} className={'campus-profile-shortcut'+(userId?' is-connected':'')} aria-label={userId?'Ouvrir mon profil CAMPUS':'Se connecter ou créer un compte CAMPUS'} title={userId?'Mon profil':'Connexion / inscription'}>
  {userId&&hasAvatar?<AvatarVisual choice={avatar.avatar_choice} photoUrl={photoUrl} size="header" label="Ma photo de profil"/>:
   <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 20v-1.6a7.5 7.5 0 0 1 15 0V20"/></svg>}
 </Link>;
}
