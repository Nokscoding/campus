'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import {UNIVERSITIES,FACULTIES,universityName,facultyName} from '../lib/campus-schools';

const DEFAULT_FILTERS={university:'',faculty:'',category:'',currency:'',minPrice:'',maxPrice:'',sort:'recommended'};
const PAGE_SIZE=24;

export default function CampusFeed({initialListings=[],search='',category='',variant='home',categoryOptions=[]}){
 const [items,setItems]=useState(initialListings);
 const [preference,setPreference]=useState(null);
 const [filters,setFilters]=useState(DEFAULT_FILTERS);
 const [filtersOpen,setFiltersOpen]=useState(false);
 const [page,setPage]=useState(0);
 const [loading,setLoading]=useState(false);
 const [loadError,setLoadError]=useState('');
 const [hasMore,setHasMore]=useState(false);
 const [totalCount,setTotalCount]=useState(initialListings.length);
 const updateFilter=(key,value)=>setFilters(previous=>({...previous,[key]:value,...(key==='currency'&&value===''?{minPrice:'',maxPrice:''}:{})}));
 const resetFilters=()=>setFilters({...DEFAULT_FILTERS});
 const activeCount=[filters.university,filters.faculty,...(category?[]:[filters.category]),filters.currency,filters.minPrice,filters.maxPrice,filters.sort==='recommended'?'':filters.sort].filter(Boolean).length;
 const selectedCategory=category||filters.category;
 const categoryChoices=[...new Set([category,...categoryOptions, ...initialListings.map(x=>x.category)].filter(Boolean))];
 const priceValid=!filters.currency||filters.minPrice===''||filters.maxPrice===''||Number(filters.minPrice)<=Number(filters.maxPrice);
 const pageTitle=variant==='category'
  ?totalCount+' annonce'+(totalCount!==1?'s':'')+' disponible'+(totalCount!==1?'s':'')
  :search?'Résultats pour « '+search+' »':category?'Annonces : '+category:'Fraîchement mis en vente';

 useEffect(()=>{setPage(0)},[search,category,variant,filters.university,filters.faculty,filters.category,filters.currency,filters.minPrice,filters.maxPrice,filters.sort]);
 useEffect(()=>{
  let alive=true;
  const timeout=setTimeout(async()=>{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key){setLoadError('Le catalogue est momentanément indisponible.');return;}
   if(!priceValid){setLoadError('Le prix minimum doit être inférieur au prix maximum.');return;}
   setLoading(true);setLoadError('');
   try{
    const client=createClient(url,key);
    const {data:{user}}=await client.auth.getUser();
    if(!alive)return;
    if(user){
     const {data:profile}=await client.from('campus_profiles').select('university,faculty').eq('user_id',user.id).maybeSingle();
     if(!alive)return;
     setPreference(profile?.university?profile:null);
    }else setPreference(null);
    const {data,error}=await client.rpc('campus_discover_listings_v3',{
     p_search:search,p_category:selectedCategory,p_university:filters.university,p_faculty:filters.faculty,
     p_currency:filters.currency,
     p_min_price:filters.currency&&filters.minPrice!==''?Number(filters.minPrice):null,
     p_max_price:filters.currency&&filters.maxPrice!==''?Number(filters.maxPrice):null,
     p_sort:filters.sort,p_limit:PAGE_SIZE,p_offset:page*PAGE_SIZE
    });
    if(error)throw error;
    if(!alive)return;
    const results=Array.isArray(data)?data:[];
    const count=Number(results[0]?.total_count||0);
    setTotalCount(count);
    setItems(previous=>page===0?results:[...previous,...results.filter(item=>!previous.some(old=>old.id===item.id))]);
    setHasMore(results.length===PAGE_SIZE&&(page+1)*PAGE_SIZE<count);
   }catch(e){
    if(!alive)return;
    setLoadError('Impossible de charger les annonces. Réessaie.');
    if(page===0){setItems(initialListings);setTotalCount(initialListings.length)}
    setHasMore(false);
   }finally{if(alive)setLoading(false)}
  },180);
  return()=>{alive=false;clearTimeout(timeout)};
 },[search,selectedCategory,variant,filters.university,filters.faculty,filters.currency,filters.minPrice,filters.maxPrice,filters.sort,page,priceValid]);

 return <section className={variant==='category'?'section category-results':'section listings-section'} id={variant==='category'?'produits':'catalogue'}>
  <div className="section-heading"><div><span className="overline">{variant==='category'?'ANNONCES DE LA COMMUNAUTÉ':'LES BONS PLANS DU CAMPUS'}</span>
   <h2>{pageTitle}</h2>
   {preference?<div className="campus-ranking-info"><span className="campus-ranking-dot"/><span>Pour toi : <strong>{universityName(preference.university)}</strong>{preference.faculty?', '+facultyName(preference.faculty):''} — les annonces qui te correspondent passent en premier par défaut, mais tu peux aussi acheter auprès des étudiants des autres universités.</span></div>
   :<p>Découvre les annonces publiées par les étudiants de toutes les universités.</p>}
  </div>{variant==='home'&&<Link href="/vendre" className="text-link">Déposer une annonce <span aria-hidden="true">→</span></Link>}</div>

  <div className="campus-filters" aria-label="Filtrer les produits">
   <div className="campus-filters-toolbar">
    <button type="button" className={'campus-filter-trigger'+(activeCount?' is-active':'')} aria-expanded={filtersOpen} aria-controls="campus-filter-options" onClick={()=>setFiltersOpen(open=>!open)}>
     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M7 12h10m-7 5h4"/><circle cx="8" cy="7" r="2" fill="currentColor" stroke="none"/></svg>
     Filtres {activeCount>0&&<span className="campus-filter-count">{activeCount}</span>}
    </button>
    <span className="campus-filters-description">UNH, UPL, UNILU : toutes les annonces sont accessibles.</span>
    <label className="campus-filter-sort">Trier par
     <select aria-label="Trier les annonces" value={filters.sort} onChange={e=>updateFilter('sort',e.target.value)}>
      <option value="recommended">Pour toi</option><option value="newest">Plus récentes</option>
      <option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option>
     </select>
    </label>
   </div>
   {filtersOpen&&<div id="campus-filter-options" className="campus-filters-panel">
    <div className="campus-filters-grid">
     <label>Université
      <select value={filters.university} onChange={e=>updateFilter('university',e.target.value)}>
       <option value="">Toutes les universités</option>{UNIVERSITIES.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
      </select>
     </label>
     <label>Faculté
      <select value={filters.faculty} onChange={e=>updateFilter('faculty',e.target.value)}>
       <option value="">Toutes les facultés</option>{FACULTIES.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
     </label>
     {!category&&<label>Catégorie
      <select value={filters.category} onChange={e=>updateFilter('category',e.target.value)}>
       <option value="">Toutes les catégories</option>{categoryChoices.map(c=><option key={c} value={c}>{c}</option>)}
      </select>
     </label>}
     <label>Devise
      <select value={filters.currency} onChange={e=>updateFilter('currency',e.target.value)}>
       <option value="">Toutes les devises</option><option value="USD">USD ($)</option><option value="CDF">CDF (FC)</option>
      </select>
     </label>
     <label>Prix minimum
      <input type="number" inputMode="decimal" min="0" placeholder={filters.currency?'Minimum':'Choisir une devise'} disabled={!filters.currency} value={filters.minPrice} onChange={e=>updateFilter('minPrice',e.target.value)}/>
     </label>
     <label>Prix maximum
      <input type="number" inputMode="decimal" min="0" placeholder={filters.currency?'Maximum':'Choisir une devise'} disabled={!filters.currency} value={filters.maxPrice} onChange={e=>updateFilter('maxPrice',e.target.value)}/>
     </label>
    </div>
    <div className="campus-filters-bottom"><span>Filtre par université pour explorer les ventes des autres campus.</span><button type="button" className="campus-clear-filters" disabled={!activeCount} onClick={resetFilters}>Effacer les filtres</button></div>
   </div>}
   {activeCount>0&&<div className="campus-filters-active" role="status"><span>{totalCount} annonce{totalCount!==1?'s':''} trouvée{totalCount!==1?'s':''}</span><button type="button" onClick={resetFilters}>Tout voir</button></div>}
   {loadError&&<p className="campus-filter-error" role="alert">{loadError}</p>}
  </div>

  {loading&&page===0?<div className="campus-feed-loading" role="status">Recherche des annonces en cours…</div>
   :items.length?<div className="product-grid">{items.map(p=><article className="product-card" key={p.id}>
   <Link href={'/produit/'+p.id} className="product-photo">{p.images?.[0]?<img src={p.images[0]} alt={p.title} loading="lazy"/>:<div className="product-placeholder">CAMPUS</div>}</Link>
   <div className="product-info">
    {preference&&p.same_university&&<span className="student-match-label">{p.same_faculty?'Même faculté et université':'De ton université'}</span>}
    {!p.same_university&&preference&&p.same_faculty&&<span className="student-match-label student-match-secondary">Même domaine d'études</span>}
    {p.university&&<span className="campus-product-university">{UNIVERSITIES.some(u=>u.value===p.university)?p.university:universityName(p.university)||'Université'}</span>}
    <span className="product-category">{p.category}</span>
    <h3><Link href={'/produit/'+p.id}>{p.title}</Link></h3>
    <strong>{Number(p.price).toLocaleString('fr-FR')} {p.currency}</strong>
    <p>État déclaré : {p.condition}</p>{p.has_issue&&<span className="campus-defect-card-tag">Défaut déclaré par le vendeur</span>}
   </div></article>)}</div>
  :<div className="empty-listings"><div className="empty-icon"><svg width="82" height="82" viewBox="0 0 82 82" fill="none" aria-hidden="true"><rect x="11" y="24" width="60" height="45" rx="9" fill="#ded4ff"/><path d="M11 36h60M25 24l8-12h16l8 12" stroke="#5935ec" strokeWidth="4" strokeLinecap="round"/><path d="M35 49h12m-6-6v12" stroke="#5935ec" strokeWidth="4" strokeLinecap="round"/></svg></div>
   <h3>{activeCount||search||category?"Aucune annonce avec ces critères":"Les premiers bons plans arrivent !"}</h3><p>{activeCount||search||category?"Essaie de modifier les filtres ou affiche toutes les annonces.":"La communauté CAMPUS démarre. Sois parmi les premiers à proposer un produit."}</p>
   {activeCount?<button type="button" className="button" onClick={resetFilters}>Réinitialiser les filtres</button>:<Link className="button" href="/vendre">Publier mon annonce</Link>}
  </div>}
  {hasMore&&<div className="campus-feed-pagination"><button type="button" disabled={loading} onClick={()=>setPage(p=>p+1)}>{loading?'Chargement…':'Afficher plus d’annonces'}</button><span>{items.length} sur {totalCount}</span></div>}
 </section>;
}
