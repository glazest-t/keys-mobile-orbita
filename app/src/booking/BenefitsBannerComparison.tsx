import {editorialText} from '../../../prototype/domain/editorialText.mjs';
import {isDesktop} from '../desktop/surface';
import {Icon} from '../ui';
import './benefits-banner-comparison.css';

/** Selected first banner; original artwork is retained without visual changes. */
export function BenefitsBanner({onOpen}:{onOpen:()=>void}){
 return <div className="benefits-banner-comparison">
  <button type="button" className={isDesktop?"desktop-benefits-banner k-surface-action":"benefits-banner-preview trip-promo k-surface-action"} aria-label="Двойная выгода. Баллы Ключей и программа лояльности отеля. Все выгоды" onClick={onOpen}>
   {isDesktop?<><span className="desktop-benefits-copy"><strong>Двойная выгода</strong><span>{editorialText("РШ-364", "Копите баллы «Ключей» и пользуйтесь программой лояльности отеля", "Копите баллы Ключей плюс и пользуйтесь скидками в программах лояльности")}</span><span className="desktop-benefits-link">{editorialText("РШ-365", "Все выгоды", "Мои выгоды")}<Icon name="chevron-right" size={16} inheritColor/></span></span><span className="desktop-benefits-art" aria-hidden="true"><img src="/brand/illustrations/benefits-selected.png" alt="" draggable={false}/></span></>:<><span className="trip-promo-copy"><strong>Двойная выгода</strong><small>{editorialText("РШ-364", "Копите баллы «Ключей» и пользуйтесь программой лояльности отеля", "Копите баллы Ключей плюс и пользуйтесь скидками в программах лояльности")}</small><span>{editorialText("РШ-365", "Все выгоды", "Мои выгоды")}<Icon name="chevron-right" size={16} inheritColor/></span></span><span className="trip-promo-art" aria-hidden="true"><img src="/brand/illustrations/benefits-selected.png" alt="" draggable={false}/></span></>}
  </button>
 </div>;
}
