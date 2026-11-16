// Valeurs stables utilisées par CAMPUS pour les profils et le classement.
export const UNIVERSITIES=[
 {value:'UNH',label:'Université Nouveaux Horizons (UNH)'},
 {value:'UPL',label:'Université protestante du Lubumbashi (UPL)'},
 {value:'UNILU',label:'Université de Lubumbashi (UNILU)'}
];
export const FACULTIES=[
 {value:'informatique',label:'Informatique'},
 {value:'medecine',label:'Médecine'},
 {value:'droit',label:'Droit'},
 {value:'economie-gestion',label:'Économie et gestion'},
 {value:'ingenierie',label:'Ingénierie'},
 {value:'sciences',label:'Sciences'},
 {value:'lettres',label:'Lettres et sciences humaines'},
 {value:'autre',label:'Autre domaine'}
];
export const universityName=(key)=>UNIVERSITIES.find(x=>x.value===key)?.label||'';
export const facultyName=(key)=>FACULTIES.find(x=>x.value===key)?.label||'';
export const validUniversity=(key)=>UNIVERSITIES.some(x=>x.value===key);
export const validFaculty=(key)=>FACULTIES.some(x=>x.value===key);
