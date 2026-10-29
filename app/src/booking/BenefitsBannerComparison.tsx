import './benefits-banner-comparison.css';

/** Selected first banner; original artwork is retained without visual changes. */
export function BenefitsBanner({onOpen}:{onOpen:()=>void}){
 return <div className="benefits-banner-comparison">
  <button type="button" className="benefits-banner-preview benefits-banner-preview--one k-surface-action" aria-label="Двойная выгода. Баллы Ключей и программа лояльности отеля. Все выгоды" onClick={onOpen}>
   <img src="/design-previews/benefits-1.png" alt="" draggable={false}/>
  </button>
 </div>;
}
