'use client';
import {useEffect,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
export const DEFAULT_CAMPUS_CATEGORIES=['Ordinateurs','Téléphones','Livres & cours','Mode','Accessoires'];
export default function CategoryChoice({category,onCategoryChange,proposal,onProposalChange,idPrefix='sell'}){
 const [options,setOptions]=useState(DEFAULT_CAMPUS_CATEGORIES);
 useEffect(()=>{let alive=true;const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)return;
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  db.from('campus_categories').select('name').order('created_at',{ascending:true}).limit(80).then(({data,error})=>{if(alive&&!error&&data?.length)setOptions([...new Set([...DEFAULT_CAMPUS_CATEGORIES,...data.map(c=>c.name)])])});
  return()=>{alive=false};
 },[]);
 return <div className="campus-category-choice">
  <label htmlFor={idPrefix+'-cat'}>Catégorie</label>
  <select id={idPrefix+'-cat'} required value={category==='Autres'?'__propose__':category} onChange={e=>{
   if(e.target.value==='__propose__'){onCategoryChange('Autres');onProposalChange(proposal||'');}
   else{onCategoryChange(e.target.value);onProposalChange('');}
  }}>
   <option value="" disabled>Sélectionner une catégorie</option>
   {options.map(x=><option key={x} value={x}>{x}</option>)}
   <option value="__propose__">+ Proposer une catégorie…</option>
  </select>
  {category==='Autres'&&<div className="campus-category-proposal">
   <label htmlFor={idPrefix+'-proposal'}>Nom de ta nouvelle catégorie</label>
   <input id={idPrefix+'-proposal'} required minLength={3} maxLength={60} value={proposal||''} onChange={e=>onProposalChange(e.target.value)} placeholder="Ex. Instruments de musique"/>
   <p>La catégorie sera créée uniquement si l'équipe CAMPUS l'accepte lors de la vérification. Sinon, l'annonce pourra être reclassée.</p>
  </div>}
 </div>;
}
