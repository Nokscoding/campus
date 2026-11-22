// Empêche les coordonnées directes dans les annonces : toutes les commandes passent par CAMPUS.
// Recherche volontairement limitée aux formats téléphoniques RDC et aux liens de messagerie.
// Une détection ne remplace pas la modération humaine.
const RDC_PHONE=/(?:\+?\s*243(?:[\s().-]*[0-9]){9}\b|(?:^|[^0-9])0[89](?:[\s().-]*[0-9]){8}\b)/i;
const DIRECT_MESSAGING=/(?:wa\.me\/|api\.whatsapp\.com\/|chat\.whatsapp\.com\/|instagram\.com\/|t\.me\/)/i;
export const CAMPUS_CONTACT_POLICY_MESSAGE='Ne mets pas ton numéro de téléphone ou un lien WhatsApp/réseaux sociaux dans la description. Les achats, contrôles et livraisons se font uniquement par CAMPUS.';
export function containsDirectContact(value){
 const text=String(value||'');
 return RDC_PHONE.test(text)||DIRECT_MESSAGING.test(text);
}
