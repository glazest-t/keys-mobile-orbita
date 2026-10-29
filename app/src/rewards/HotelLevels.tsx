import '../profile/history-timeline.css';
import {Icon,StatusBadge} from '../ui';

/** Presentation contract: independent of level names, currency, qualification metric
 * or a particular hotel's combination of benefits. Omit absent information. */
export type HotelLevelCard={
 id:string;
 name:string;
 condition?:string;
 description?:string;
 benefits?:{label:string;kind:'discount'|'points'|'privilege'}[];
};
export function HotelLevels({levels,currentId,onDetails}:{levels:HotelLevelCard[];currentId?:string;onDetails:(id:string)=>void}){
 const currentIndex=levels.findIndex(level=>level.id===currentId);
 return <div className="hotel-level-cards hotel-level-timeline history-timeline" role="list" aria-label="Уровни программы отеля">{levels.map((level,index)=><div role="listitem" key={level.id} className={'history-timeline-item timeline-tone-'+(index===currentIndex?'info':currentIndex>index?'success':'neutral')}>
  <button className={'hotel-level-card k-surface-action'+(currentId===level.id?' is-current':'')} onClick={()=>onDetails(level.id)} aria-label={`${level.name}${currentId===level.id?' · ваш уровень':''}. Условия и привилегии`}>
   <span className="hotel-level-card-heading"><span className="hotel-level-card-title"><strong>{level.name}</strong>{currentId===level.id&&<StatusBadge tone="success" icon="check">Ваш уровень</StatusBadge>}</span><Icon name="chevron-right" size={16} inheritColor/></span>
   {level.condition&&<span className="hotel-level-card-condition">{level.condition}</span>}
   {level.description&&<span className="hotel-level-card-description">{level.description}</span>}
   {!!level.benefits?.length&&<span className="hotel-level-card-benefits">{level.benefits.map((benefit,index)=><span key={index} className={'hotel-level-perk '+benefit.kind}>{benefit.label}</span>)}</span>}
  </button>
 </div>)}</div>;
}
