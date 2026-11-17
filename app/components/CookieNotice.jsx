'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
const KEY='campus_cookie_notice_v1';
export default function CookieNotice(){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{try{setVisible(localStorage.getItem(KEY)!=='seen')}catch{setVisible(true)}},[]);
 function close(){try{localStorage.setItem(KEY,'seen')}catch{}setVisible(false)}
 if(!visible)return null;
 return <aside className="campus-cookie-notice" aria-label="Information sur les cookies et le stockage">
  <div><strong>Ta vie privée compte.</strong><p>CAMPUS utilise le stockage nécessaire à la connexion et aux fonctions que tu actives. Aucun cookie publicitaire ni outil de mesure d’audience n’est actuellement activé.</p><Link href="/cookies">Comprendre les cookies et le stockage</Link></div>
  <button type="button" onClick={close}>Compris</button>
 </aside>;
}
