import Link from 'next/link';
import LegalLinks from './LegalLinks';
export default function LegalDocument({title,description,children,updated='17 novembre 2026'}){
 return <>
  <header className="site-header legal-site-header"><Link href="/" className="brand"><span className="legal-brand-mark">C</span><span>CAMPUS</span></Link><nav><Link href="/">Accueil</Link><Link href="/contact" className="account-link">Assistance</Link></nav></header>
  <main className="legal-page">
   <div className="legal-hero"><span className="overline">CAMPUS · INFORMATIONS OFFICIELLES</span><h1>{title}</h1><p>{description}</p><small>Dernière mise à jour : {updated}</small></div>
   <article className="legal-content">{children}</article>
   <div className="legal-contact"><div><strong>Une question sur ces informations ?</strong><p>Notre équipe peut t'aider à comprendre tes droits ou les règles de CAMPUS.</p></div><div><a className="button" href="mailto:nksserviceshelp@gmail.com?subject=Question%20juridique%20CAMPUS">Écrire à CAMPUS</a><a className="legal-whatsapp" href="https://wa.me/243986410520" target="_blank" rel="noreferrer">WhatsApp · +243 986 410 520</a></div></div>
  </main>
  <footer className="footer legal-footer"><div><strong>CAMPUS by NKS Services</strong><p>Lubumbashi · République démocratique du Congo</p></div><LegalLinks/></footer>
 </>;
}
