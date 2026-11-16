import './style.css';
export const metadata={
 title:{default:'CAMPUS — Marketplace étudiante à Lubumbashi',template:'%s | CAMPUS'},
 description:"Achète et vends des ordinateurs, téléphones, livres et accessoires d'occasion entre étudiants à Lubumbashi. CAMPUS organise l'inspection et la livraison, avec paiement en espèces.",
 keywords:['marketplace étudiante Lubumbashi','acheter PC occasion Lubumbashi','vendre ordinateur étudiant','téléphone occasion RDC','livres universitaires occasion','petites annonces étudiants Lubumbashi','CAMPUS NKS Services'],
 robots:{index:true,follow:true},
 openGraph:{type:'website',locale:'fr_CD',siteName:'CAMPUS by NKS Services',title:'CAMPUS — Achète et vends entre étudiants',description:"La marketplace étudiante de Lubumbashi : des annonces, une inspection par un agent et une livraison organisée par CAMPUS."}
};
export default function RootLayout({children}){return <html lang="fr"><body>{children}</body></html>}
