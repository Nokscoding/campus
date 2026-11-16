'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import {universityName,facultyName} from '../lib/campus-schools';

export default function CampusFeed({initialListings=[],search='',category='',variant='home'}){
 const [items,setItems]=useState(initialListings);
 const [preference,setPreference]=useState(null);
 useEffect(()=>{
  let alive=true;
  setItems(initialListings);setPreference(null);
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return;
  const client=createClient(url,key);
  const personalize=async()=>{
   try{
    const {data:{user}}=await client.auth.getUser();
    if(!alive||!user)return;
    const {data:p}=await client.from('campus_profiles').select('university,faculty').eq('user_id',user.id).maybeSingle();
    if(!alive||!p?.university)return;
    // L'algorithme s'exécute côté base : seuls les produits publiés sont renvoyés.
    const {data:recommended,error}=await client.rpc('campus_discover_listings',{
      p_search:search,p_category:category,p_limit:variant==='category'?48:24
    });
    if(!alive||error||!Array.isArray(recommended))return;
    setItems(recommended);setPreference(p);
   }catch{/* L'accueil public demeure disponible en cas de déconnexion réseau. */}
  };
  personalize();
  return()=>{alive=false};
 },[search,category,variant]);
 const title=variant==='category'
  ?items.length+' annonce'+(items.length!==1?'s':'')+' disponible'+(items.length!==1?'s':'')
  :search?'Résultats pour « '+search+' »':category?'Annonces : '+category:'Fraîchement mis en vente';
 return <section className={variant==='category'?'section category-results':'section listings-section'} id={variant==='category'?'produits':'catalogue'}>
  <div className="section-heading"><div><span className="overline">{variant==='category'?'ANNONCES DE LA COMMUNAUTÉ':'LES BONS PLANS DU CAMPUS'}</span>
   <h2>{title}</h2>
   {preference?<div className="campus-ranking-info"><span className="campus-ranking-dot"/><span>Pour toi : <strong>{universityName(preference.university)}</strong>{preference.faculty?', '+facultyName(preference.faculty):''} — tes préférences sont affichées en premier lorsqu'il y a des annonces.</span></div>
   :variant==='home'?<p>Découvre les annonces publiées par la communauté.</p>:null}
  </div>{variant==='home'&&<Link href="/vendre" className="text-link">Déposer une annonce <span aria-hidden="true">→</span></Link>}</div>
  {items.length?<div className="product-grid">{items.map(p=><article className="product-card" key={p.id}>
   <Link href={'/produit/'+p.id} className="product-photo">{p.images?.[0]?<img src={p.images[0]} alt={p.title} loading="lazy"/>:<div className="product-placeholder">CAMPUS</div>}</Link>
   <div className="product-info">
    {preference&&p.same_university&&<span className="student-match-label">{p.same_faculty?'Même faculté et université':'De ton université'}</span>}
    {!p.same_university&&preference&&p.same_faculty&&<span className="student-match-label student-match-secondary">Même domaine d'études</span>}
    <span className="product-category">{p.category}</span>
    <h3><Link href={'/produit/'+p.id}>{p.title}</Link></h3>
    <strong>{Number(p.price).toLocaleString('fr-FR')} {p.currency}</strong>
    <p>État déclaré : {p.condition}</p>
   </div></article>)}</div>
  :<div className="empty-listings"><div className="empty-icon"><svg width="82" height="82" viewBox="0 0 82 82" fill="none" aria-hidden="true"><rect x="11" y="24" width="60" height="45" rx="9" fill="#ded4ff"/><path d="M11 36h60M25 24l8-12h16l8 12" stroke="#5935ec" strokeWidth="4" strokeLinecap="round"/><path d="M35 49h12m-6-6v12" stroke="#5935ec" strokeWidth="4" strokeLinecap="round"/></svg></div><h3>{search||category?"Aucune annonce trouvée":"Les premiers bons plans arrivent !"}</h3><p>{search||category?"Essaie une autre recherche ou consulte toutes les catégories.":"La communauté CAMPUS démarre. Sois parmi les premiers à proposer un produit."}</p><Link className="button" href="/vendre">Publier mon annonce</Link></div>}
 </section>;
}
