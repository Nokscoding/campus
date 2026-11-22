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
  <div><strong>Ta vie privée compte.</strong><p>CAMPUS mesure les visites et la provenance des campagnes à l’aide de statistiques internes, sans cookie publicitaire. Des identifiants pseudonymes sont conservés sur cet appareil. Tu peux désactiver cette mesure dans les préférences.</p><Link href="/cookies">Consulter et gérer les préférences</Link></div>
  <button type="button" onClick={close}>Compris</button>
 </aside>;
}
