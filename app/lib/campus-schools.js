// Universités prises en charge par CAMPUS. Les recommandations sont fondées
// uniquement sur l'université de l'acheteur et celle du vendeur.
export const UNIVERSITIES=[
 {value:'UNH',label:'Université Nouveaux Horizons (UNH)'},
 {value:'UPL',label:'Université protestante du Lubumbashi (UPL)'},
 {value:'UNILU',label:'Université de Lubumbashi (UNILU)'}
];
export const universityName=(key)=>UNIVERSITIES.find(x=>x.value===key)?.label||'';
export const validUniversity=(key)=>UNIVERSITIES.some(x=>x.value===key);
