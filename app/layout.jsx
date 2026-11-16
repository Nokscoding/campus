import './style.css';
const origin='https://campus-marketplace-smoky-one.vercel.app';
const logo='https://res.cloudinary.com/jrgtsxkt/image/upload/f_auto,q_auto,w_96,h_96,c_fill/v1794856878/campus/brand/approved-ribbon-mark.png';
const hero='https://res.cloudinary.com/jrgtsxkt/image/upload/v1794856931/campus/illustrations/hero-etudiants-v1.webp';
export const metadata={
 metadataBase:new URL(origin),
 title:{default:'CAMPUS | Acheter et vendre entre étudiants à Lubumbashi',template:'%s | CAMPUS'},
 description:"CAMPUS, la marketplace étudiante à Lubumbashi. Achète et vends des PC, téléphones, livres et accessoires d'occasion. Inspection par un agent, livraison et paiement en espèces.",
 applicationName:'CAMPUS',
 keywords:['marketplace étudiante Lubumbashi','acheter ordinateur occasion Lubumbashi','vendre PC étudiant RDC','téléphone occasion étudiant Lubumbashi','livres universitaires occasion','petites annonces étudiants RDC'],
 alternates:{canonical:'/'},
 robots:{index:true,follow:true},
 icons:{icon:logo,apple:logo},
 manifest:'/manifest.webmanifest',
 openGraph:{type:'website',locale:'fr_CD',url:origin,siteName:'CAMPUS',title:'CAMPUS — Achète malin, vends tranquille.',description:'La marketplace des étudiants à Lubumbashi, avec inspection et livraison organisées par CAMPUS.',images:[{url:hero,width:1536,height:1024,alt:'Étudiants CAMPUS et livraison sécurisée'}]},
 twitter:{card:'summary_large_image',images:[hero]}
};
export default function RootLayout({children}){return <html lang="fr"><body>{children}</body></html>}
