import Link from 'next/link';
export default function LegalLinks(){return <nav className="footer-legal-links" aria-label="Informations légales">
 <Link href="/mentions-legales">Mentions légales</Link>
 <Link href="/confidentialite">Confidentialité</Link>
 <Link href="/cookies">Cookies</Link>
 <Link href="/conditions-generales">Conditions générales</Link>
 </nav>}
