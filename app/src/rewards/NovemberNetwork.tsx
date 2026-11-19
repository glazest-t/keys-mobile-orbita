import {novemberEditorialText} from '../../../prototype/domain/novemberEditorialText.mjs';
import {Icon} from '../ui';
import {useState} from 'react';
import {ProgramSummarySheet,ProgramBenefits} from './HotelProgramSheet';
// Network count and hotel names: https://cosmosgroup.ru/about and /about/brands/cosmos-hotels (06.11.2026).
// Demonstration discount of 5% requested by the user; not a live offer.
export const novemberNetwork={name:'Cosmos Hotel Group',discountBasisPoints:500,count:52,cities:32,hotels:[{name:'Cosmos Казань Отель',city:'Казань',bookingUrl:'https://kazan.cosmosgroup.ru/rooms'},{name:'Cosmos Москва ВДНХ Отель',city:'Москва',bookingUrl:'https://moscowvdnh.cosmosgroup.ru/'},{name:'Cosmos Сочи Отель',city:'Сочи',bookingUrl:'https://sochi.cosmosgroup.ru/'}]};
export function networkObjectLabel(n:number){const word=n%10===1&&n%100!==11?'объект':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'объекта':'объектов';return novemberEditorialText('Т-3518','отеля',word);}
function NetworkDiscount(){return <span className="benefit-program-perks"><span className="benefit-discount-badge" aria-label="Скидка 5%">−{novemberNetwork.discountBasisPoints/100}%</span></span>;}
export function NovemberNetworkCard({onOpen}:{onOpen?:()=>void}){
 if(onOpen)return <button className="benefit-program-row november-network-row k-surface-action" onClick={onOpen}><span className="november-network-cover"><Icon name="hotel-network" size={28} inheritColor/></span><span className="benefit-program-copy"><strong>{novemberNetwork.name}</strong><small>Сеть отелей · {novemberNetwork.count} {networkObjectLabel(novemberNetwork.count)}</small><NetworkDiscount/></span><Icon name="chevron-right" size={16} inheritColor/></button>;
 const content=<><span className="november-network-icon"><Icon name="hotel-network" size={32} inheritColor/></span><span className="november-network-copy"><small className="november-network-label">Сеть отелей</small><strong>{novemberNetwork.name}</strong><span>{novemberNetwork.count} {novemberEditorialText("Т-3520","отеля ·",networkObjectLabel(novemberNetwork.count)+" ·")} {novemberNetwork.cities} города</span><span>Скидка {novemberNetwork.discountBasisPoints/100}% во всех отелях</span></span></>;
 return <section className="november-network-card november-network-hero">{content}</section>;
}
export function NovemberNetworkPage(){
 const [selected,setSelected]=useState<(typeof novemberNetwork.hotels)[number]|null>(null);
 return <><NovemberNetworkCard/><section className="benefit-section"><h2>Программа Cosmos Stars</h2><p className="benefit-muted">Программа лояльности сети Cosmos Hotel Group</p></section><section className="benefit-section"><h2>Отели сети</h2><div className="benefit-card">{novemberNetwork.hotels.map(h=><button className="benefit-program-row november-network-hotel k-surface-action" key={h.name} onClick={()=>setSelected(h)}><span className="icon-tile"><Icon name="hotel-building" size={24} inheritColor/></span><span className="benefit-program-copy"><strong>{h.name}</strong><small>{h.city}</small><NetworkDiscount/></span><Icon name="chevron-right" size={16} inheritColor/></button>)}</div></section>
 <ProgramSummarySheet open={!!selected} name={selected?.name||'Отель сети'} city={selected?.city} programUrl="https://cosmosgroup.ru/loyalty-program" onClose={()=>setSelected(null)} onBook={()=>{if(selected)window.open(selected.bookingUrl,'_blank','noopener,noreferrer');}}>
  <ProgramBenefits discountBasisPoints={novemberNetwork.discountBasisPoints}/>
 </ProgramSummarySheet></>;
}
