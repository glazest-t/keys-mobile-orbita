import {useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Icon,StatusBadge} from '../ui';
import {catalog,formatMoney,nights,type Commerce} from './model';
import {isBookingTimeService} from './bookingTimes';
import {breakfastVenue} from './breakfastVenue';

// Descriptions of the existing demonstration offers; prices come from the shared catalogue.
const details:Record<string,{title:string;icon:string;image?:string;description:string;unit:string;caption:string}>={
 'sea-transfer':{title:'Трансфер из аэропорта',icon:'transfer',description:'Поездка из аэропорта в отель на автомобиле. Дорога занимает около 35 минут; точное время зависит от дорожной обстановки. Данные рейса и время встречи можно уточнить в чате с отелем.',unit:'За одну поездку',caption:'Аэропорт → отель'},
 'sea-dinner':{title:'Ужин в ресторане',icon:'restaurant',image:'brand/ideas/covers/gastro.webp',description:'Ужин в ресторане отеля: сет на двоих. Стоимость включает один сет для двух гостей, независимо от длительности проживания. Время посещения и состав меню можно уточнить у отеля.',unit:'За один сет на двоих',caption:'Сет на двоих'},
 'sea-spa':{title:'Спа-программа',icon:'spa',image:'brand/ideas/covers/hammam.webp',description:'Два часа отдыха в термальной зоне отеля. Услуга включает одно посещение; дополнительные посещения не входят в стоимость. Удобное время и правила посещения можно уточнить у отеля.',unit:'За одно посещение',caption:'Термы · 2 часа'},
 'sea-breakfast':{title:'Завтрак',icon:'breakfast',image:'brand/ideas/covers/breakfast.webp',description:'Завтрак «шведский стол» в ресторане отеля. При добавлении в бронирование завтраки рассчитываются на всех гостей и каждый день проживания. Приходите в любое время в часы работы ресторана.',unit:'За гостя в день',caption:'Шведский стол'},
};

export function DesktopBookingServices({commerce,setCommerce,disabled=false}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;disabled?:boolean}){
 const [opened,setOpened]=useState<string|null>(null),draft=commerce.draft!;
 const services=catalog.services.filter(s=>s.hotelId===draft.hotelId&&!isBookingTimeService(s.id)&&(s.id!=='sea-breakfast'||catalog.rates.find(r=>r.id===draft.rateId)?.mealPlan!=='breakfast'));
 const service=services.find(s=>s.id===opened),selected=!!service&&draft.services.includes(service.id);
 const view=(s:typeof catalog.services[number])=>details[s.id]||{title:s.title,icon:'room-service',description:'Дополнительная услуга отеля на период проживания.',unit:'За услугу целиком',caption:'За поездку'};
 const info=service?view(service):null;
 const people=draft.search.adults+draft.search.childrenAges.length,days=nights(draft.search);
 const quantity=service?.id==='sea-breakfast'?people*days:1;
 const venue=breakfastVenue(draft.hotelId);
 const setAdded=(item:typeof catalog.services[number],added:boolean)=>{
  if(disabled)return;
  setCommerce(current=>{
   const d=current.draft;
   if(!d||d.hotelId!==item.hotelId)return current;
   return {...current,draft:{...d,services:added?[...new Set([...d.services,item.id])]:d.services.filter(id=>id!==item.id)}};
  });
 };
 const apply=()=>{if(!service||disabled)return;setAdded(service,!selected);setOpened(null);};
 return <>
  <div className="desktop-service-list">{services.map(s=>{const item=view(s),added=draft.services.includes(s.id);return <div className="desktop-service-row" key={s.id}>
   <button type="button" className="desktop-service-details-trigger" disabled={disabled} aria-label={`Подробнее: ${item.title}`} aria-haspopup="dialog" onClick={()=>setOpened(s.id)}/>
   <span className="icon-tile"><Icon name={item.icon} size={22}/></span><span className="desktop-service-copy"><strong>{item.title}</strong><small>{item.caption} · {formatMoney(s.unitPriceMinor)}</small></span>
   {added?<StatusBadge tone="success" icon="check">Добавлено</StatusBadge>:<Button className="desktop-service-add" variant="secondary" disabled={disabled} aria-label={`Добавить: ${item.title}`} onClick={()=>setAdded(s,true)}>Добавить</Button>}
  </div>;})}</div>
  <BottomSheet open={!!service} onOpenChange={open=>{if(!open)setOpened(null);}} title={info?.title||'Услуга'}>
   {service&&info&&<div className="desktop-service-detail">
    {info.image?<img className="desktop-service-image" style={{objectPosition:service.id==='sea-breakfast'?'center 25%':'center 35%'}} src={import.meta.env.BASE_URL+info.image} alt={info.title}/>:<div className="desktop-service-art" role="img" aria-label="Трансфер из аэропорта в отель"><span><Icon name="car" size={76} inheritColor/></span></div>}
    <p className="desktop-service-description">{info.description}</p>
    {service.id==='sea-breakfast'&&<p className="desktop-service-venue"><Icon name="breakfast" size={18}/>{venue.hours} · {venue.restaurant} · {venue.floor}</p>}
    <div className="desktop-service-calculation"><div><span>{info.unit}</span><strong>{formatMoney(service.unitPriceMinor)}</strong></div>{service.id==='sea-breakfast'&&<div><span>Гостей: {people} · дней: {days}</span><span>{formatMoney(service.unitPriceMinor)} × {quantity}</span></div>}</div>
    <div className="desktop-service-footer"><div><small>{selected?'Добавлено в бронирование':'Стоимость услуги'}</small><strong>{formatMoney(service.unitPriceMinor*quantity)}</strong></div><Button variant={selected?'secondary':'primary'} disabled={disabled} onClick={apply}>{selected?'Убрать из брони':'Добавить'}</Button></div>
   </div>}
  </BottomSheet>
 </>;
}
