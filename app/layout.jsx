import './style.css';
import './components/CampusStartupLoader.css';
import CampusSupportDock from './components/CampusSupportDock';
import CampusStartupLoader from './components/CampusStartupLoader';
import CampusVisitTracker from './components/CampusVisitTracker';
import CampusCorrectionAlert from './components/CampusCorrectionAlert';

import CookieNotice from './components/CookieNotice';
const origin='https://www.campus-rdc.com';
const logo='https://res.cloudinary.com/jrgtsxkt/image/upload/f_auto,q_auto,w_96,h_96,c_fill/v1794856878/campus/brand/approved-ribbon-mark.png';
const hero='https://res.cloudinary.com/jrgtsxkt/image/upload/v1794863470/campus/illustrations/hero-original-etudiant-choisi.webp';
export const metadata={
 metadataBase:new URL(origin),
 title:{default:'CAMPUS | Acheter et vendre entre étudiants à Lubumbashi',template:'%s | CAMPUS'},
 description:"CAMPUS, la marketplace étudiante à Lubumbashi. Achète et vends des PC, téléphones, livres et accessoires d'occasion. Inspection par CAMPUS, remise sur le campus universitaire et paiement en espèces.",
 applicationName:'CAMPUS',
 keywords:['marketplace étudiante Lubumbashi','acheter ordinateur occasion Lubumbashi','vendre PC étudiant RDC','téléphone occasion étudiant Lubumbashi','livres universitaires occasion','petites annonces étudiants RDC'],
 alternates:{canonical:'/'},
 robots:{index:true,follow:true},
 icons:{icon:logo,apple:logo},
 manifest:'/manifest.webmanifest',
 openGraph:{type:'website',locale:'fr_CD',url:origin,siteName:'CAMPUS',title:'CAMPUS — Achète malin, vends tranquille.',description:'La marketplace des étudiants à Lubumbashi, avec inspection et livraison sur le campus organisées par CAMPUS.',images:[{url:hero,width:1536,height:1024,alt:'Étudiants CAMPUS et livraison sécurisée'}]},
 twitter:{card:'summary_large_image',images:[hero]}
};
export default function RootLayout({children}){return <html lang="fr"><body><CampusStartupLoader/><CampusVisitTracker/>{children}<CampusCorrectionAlert/><CookieNotice/><CampusSupportDock/></body></html>}
