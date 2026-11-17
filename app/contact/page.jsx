'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import CampusNotificationBell from '../components/CampusNotificationBell';
const email='nksserviceshelp@gmail.com';
export default function Contact(){
 const sb=useMemo(()=>{const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return u&&k?createClient(u,k):null},[]);
 const [user,setUser]=useState(null),[subject,setSubject]=useState(''),[description,setDescription]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{if(new URLSearchParams(window.location.search).get('motif')==='bug')setSubject('Problème rencontré sur CAMPUS')},[]);
 useEffect(()=>{if(!sb)return;let on=true;sb.auth.getUser().then(({data})=>{if(on)setUser(data.user||null)});
  const {data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>{if(on)setUser(session?.user||null)});
  return()=>{on=false;subscription.unsubscribe()};
 },[sb]);
 async function submit(e){e.preventDefault();setMessage('');
  if(!user){setMessage('Connecte-toi pour envoyer le signalement dans CAMPUS.');return}
  setBusy(true);
  const {error}=await sb.from('campus_bug_reports').insert({user_id:user.id,subject:subject.trim(),description:description.trim(),page_url:location.origin+'/contact'});
  if(error)setMessage('Erreur : '+error.message);
  else{setMessage('Signalement envoyé à l’équipe CAMPUS. Merci !');setSubject('');setDescription('');}
  setBusy(false);
 }
 return <><header className="site-header"><Link href="/" className="brand">CAMPUS</Link><nav><Link href="/" className="account-link">Accueil</Link><CampusNotificationBell/></nav></header>
 <main className="campus-contact-page">
  <div className="campus-contact-hero"><span className="overline">ASSISTANCE CAMPUS</span><h1>Besoin d’aide ?</h1><p>Pour tes annonces, commandes ou livraisons sur le campus, notre équipe est disponible via WhatsApp ou e-mail.</p></div>
  <div className="campus-contact-methods">
   <a className="campus-contact-method" href={'https://wa.me/243986410520?text='+encodeURIComponent('Bonjour CAMPUS, j’ai besoin d’aide.')} target="_blank" rel="noopener noreferrer"><span className="campus-contact-method-icon">WA</span><div><strong>Nous écrire sur WhatsApp</strong><span>+243 986 410 520</span><small>Questions, commandes et assistance</small></div><b>↗</b></a>
   <a className="campus-contact-method" href={'mailto:'+email+'?subject='+encodeURIComponent('Assistance CAMPUS')}><span className="campus-contact-method-icon">✉</span><div><strong>Envoyer un e-mail</strong><span>{email}</span><small>Assistance et signalements</small></div><b>↗</b></a>
  </div>
  <section className="campus-bug-panel" id="signaler-un-bug"><span className="overline">AMÉLIORONS CAMPUS</span><h2>Signaler un bug</h2><p>Une page plante, un bouton ne répond pas, ou tu remarques une erreur ? Décris le problème afin que l’équipe technique puisse l’examiner.</p>
   {user?<form onSubmit={submit}>
    <label htmlFor="campus-bug-title">Quel est le problème ?</label><input id="campus-bug-title" value={subject} onChange={e=>setSubject(e.target.value)} required minLength={5} maxLength={120} placeholder="Ex. Je ne peux pas confirmer ma commande"/>
    <label htmlFor="campus-bug-description">Explique ce qui se passe</label><textarea id="campus-bug-description" rows={5} required minLength={15} maxLength={3000} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Les étapes, la page concernée et le message d’erreur éventuel…"/>
    <button className="button" disabled={busy}>{busy?'Envoi en cours…':'Envoyer le signalement'}</button>
   </form>:<div className="campus-bug-login"><p>Pour transmettre un bug directement à l’équipe, connecte-toi à ton compte CAMPUS.</p><Link href="/compte" className="button">Se connecter</Link><p>Sans compte, tu peux aussi <a href={'mailto:'+email+'?subject='+encodeURIComponent('Bug CAMPUS')}>nous écrire par e-mail</a>.</p></div>}
   {message&&<p className="campus-contact-feedback" role="status">{message}</p>}
  </section>
  <p className="campus-contact-footnote">Ne communique jamais ton mot de passe ou un code de connexion par WhatsApp ou par e-mail.</p>
 </main><footer className="footer"><strong>CAMPUS by NKS Services</strong><Link href="/">Retour à CAMPUS</Link></footer></>;
}
