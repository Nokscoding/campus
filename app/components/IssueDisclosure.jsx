'use client';
export default function IssueDisclosure({hasIssue,onHasIssueChange,details,onDetailsChange,prefix='listing'}){
 return <div className={'campus-issue-disclosure'+(hasIssue?' is-open':'')}>
  {!hasIssue?<button type="button" className="campus-issue-toggle" onClick={()=>onHasIssueChange(true)}>
   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3 2.5 20h19L12 3zM12 9v5m0 3h.01"/></svg>
   Signaler un problème avec mon produit
  </button>:<div className="campus-issue-detail">
   <div className="campus-issue-title"><strong>Défaut ou problème déclaré</strong><button type="button" onClick={()=>{onHasIssueChange(false);onDetailsChange('')}}>Aucun problème à signaler</button></div>
   <label htmlFor={prefix+'-issue'}>Quel est le problème exactement ?</label>
   <textarea id={prefix+'-issue'} required minLength={10} maxLength={600} rows={3} value={details||''} onChange={e=>onDetailsChange(e.target.value)} placeholder="Ex. Le PC démarre, mais son écran ne s'allume pas. Il fonctionne avec un écran externe."/>
   <p className="campus-issue-hint">Décris précisément le défaut. L'acheteur pourra le lire avant sa commande.</p>
  </div>}
 </div>;
}
