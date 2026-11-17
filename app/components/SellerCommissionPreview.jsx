'use client';
import Link from 'next/link';
export const SELLER_COMMISSION_RATE=0.10;
export function computeSellerProceeds(price){
 const value=Number(price);
 if(!Number.isFinite(value)||value<=0)return null;
 const commission=Math.round(value*SELLER_COMMISSION_RATE*100)/100;
 return {price:value,commission,net:Math.round((value-commission)*100)/100};
}
export function displaySellerMoney(value,currency='USD'){
 const number=Number(value);
 return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(Number.isFinite(number)?number:0)+' '+(currency==='CDF'?'FC':'$');
}
export default function SellerCommissionPreview({price,currency='USD'}){
 const amounts=computeSellerProceeds(price);
 return <aside className="campus-seller-fee-preview" aria-label="Commission et montant destiné au vendeur">
   <div className="campus-seller-fee-heading"><strong>Commission CAMPUS : 10 %</strong><span>Annonce gratuite</span></div>
   <p>CAMPUS retient 10 % du prix du produit <strong>uniquement si la vente aboutit</strong>.</p>
   {amounts?<div className="campus-seller-fee-breakdown">
     <div><span>Prix de vente</span><strong>{displaySellerMoney(amounts.price,currency)}</strong></div>
     <div><span>Commission CAMPUS (10 %)</span><strong>− {displaySellerMoney(amounts.commission,currency)}</strong></div>
     <div className="campus-seller-fee-net"><span>Montant pour toi</span><strong>{displaySellerMoney(amounts.net,currency)}</strong></div>
   </div>:<p className="campus-seller-fee-placeholder">Indique ton prix pour connaître ta commission et le montant que tu recevras.</p>}
   <small>Les frais de livraison sont calculés séparément pour l'acheteur. <Link href="/conditions-generales">Voir les conditions de vente</Link>.</small>
 </aside>;
}
