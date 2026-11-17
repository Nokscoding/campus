'use client';
import Link from 'next/link';
export default function CampusSupportDock(){
 return <div className="campus-support-dock" aria-label="Aide CAMPUS">
  <Link href="/contact" className="campus-support-dock-main">
   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.38-4.12-1.04L3 20l1.08-4.2a8.5 8.5 0 1 1 15.92-4.3z"/></svg>
   Nous contacter</Link>
  <Link href="/contact?motif=bug" className="campus-support-dock-secondary">Signaler un bug</Link>
 </div>;
}
