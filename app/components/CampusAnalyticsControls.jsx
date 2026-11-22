'use client';
import {useEffect,useState} from 'react';
const KEY='campus_marketing_optout_v1';
export default function CampusAnalyticsControls(){
 const [enabled,setEnabled]=useState(null);
 useEffect(()=>{try{setEnabled(localStorage.getItem(KEY)!=='1')}catch{setEnabled(false)}},[]);
 function change(next){
  try{
   localStorage.setItem(KEY,next?'0':'1');
   if(!next){
    localStorage.removeItem('campus_marketing_visitor_v1');
    sessionStorage.removeItem('campus_marketing_session_v1');
    sessionStorage.removeItem('campus_marketing_attribution_v1');
   }
  }catch{}
  setEnabled(next);
 }
 return <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',marginTop:12}}>
  <strong>Mesure d'audience : {enabled===null?'chargement…':enabled?'activée':'désactivée'}</strong>
  {enabled!==null&&<button type="button" onClick={()=>change(!enabled)}
   style={{border:'1px solid #7563b8',padding:'10px 16px',borderRadius:10,background:'transparent',color:'inherit',fontWeight:700,cursor:'pointer'}}>
   {enabled?'Désactiver la mesure':'Réactiver la mesure'}
  </button>}
 </div>;
}
