import {useNovember} from '../usePrototypeVariant';
import {ServiceDetailIntro} from './ServiceDetailIntro';
import {useState,type Dispatch,type SetStateAction} from 'react';
import {Carousel} from '../mobile';
import {ServiceSheet as BottomSheet} from './ServiceSheet';
import {isDesktop} from '../desktop/surface';
import './hotel-services.css';
import './booking-service-catalog.css';
import {Button,Icon,StatusBadge} from '../ui';
import {catalog,formatMoney,nights,type Commerce} from './model';
import {isBookingTimeService} from './bookingTimes';
import {breakfastVenue} from './breakfastVenue';

// Descriptions of the existing demonstration offers; prices come from the shared catalogue.
const details:Record<string,{title:string;category:'Еда'|'Отдых'|'Транспорт';icon:string;image?:string;description:string;unit:string;caption:string}>={
 'sea-transfer':{title:'Трансфер из аэропорта',category:'Транспорт',icon:'transfer',description:'Поездка из аэропорта в отель на автомобиле. Время в пути зависит от дорожной обстановки. Данные рейса и время встречи можно уточнить в чате с отелем.',unit:'За одну поездку',caption:'Аэропорт → отель'},
 'sea-dinner':{title:'Ужин в ресторане',category:'Еда',icon:'restaurant',image:'brand/ideas/covers/gastro.webp',description:'Ужин в ресторане отеля: сет на двоих. Стоимость включает один сет для двух гостей, независимо от длительности проживания. Время посещения и состав меню можно уточнить у отеля.',unit:'За один сет на двоих',caption:'Сет на двоих'},
 'sea-spa':{title:'Спа-программа',category:'Отдых',icon:'spa',image:'brand/ideas/covers/hammam.webp',description:'Два часа отдыха в термальной зоне отеля. Услуга включает одно посещение; дополнительные посещения не входят в стоимость. Удобное время и правила посещения можно уточнить у отеля.',unit:'За одно посещение',caption:'Термы · 2 часа'},
 'sea-breakfast':{title:'Завтрак «шведский стол»',category:'Еда',icon:'breakfast',image:'assets/services/breakfast-buffet.png',description:'Завтрак «шведский стол» в ресторане отеля. При добавлении в бронирование завтраки рассчитываются на всех гостей и каждый день проживания. Приходите в любое время в часы работы ресторана.',unit:'За гостя в день',caption:'За гостя в день'},
};

export function DesktopBookingServices({commerce,setCommerce,disabled=false,catalogue=false}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;disabled?:boolean;catalogue?:boolean}){
 const november=useNovember();
 const [opened,setOpened]=useState<string|null>(null),draft=commerce.draft!;
 const services=catalog.services.filter(s=>s.hotelId===draft.hotelId&&!!details[s.id]&&!isBookingTimeService(s.id)&&(s.id!=='sea-breakfast'||catalog.rates.find(r=>r.id===draft.rateId)?.mealPlan!=='breakfast'));
 const service=services.find(s=>s.id===opened),selected=!!service&&draft.services.includes(service.id);
 const view=(s:typeof catalog.services[number])=>details[s.id];
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
  {catalogue?<BookingServiceCatalogue services={services} selected={draft.services} disabled={disabled} onOpen={setOpened}/>:<div className="desktop-service-list">{services.map(s=>{const item=view(s),added=draft.services.includes(s.id);return <div className="desktop-service-row" key={s.id}>
   <button type="button" className="desktop-service-details-trigger" disabled={disabled} aria-label={`Подробнее: ${item.title}`} aria-haspopup="dialog" onClick={()=>setOpened(s.id)}/>
   <span className="icon-tile"><Icon name={november&&item.category!=='Еда'?'room-service':item.icon} size={22}/></span><span className="desktop-service-copy"><strong>{item.title}</strong><small>{!november||item.category==='Еда'?item.caption+' · ':''}{formatMoney(s.unitPriceMinor)}</small></span>
   {added?<StatusBadge tone="success" icon="check">Добавлено</StatusBadge>:<Button className="desktop-service-add" variant="secondary" disabled={disabled} aria-label={`Добавить: ${item.title}`} onClick={()=>setAdded(s,true)}>Добавить</Button>}
  </div>;})}</div>}
  <BottomSheet open={!!service} onOpenChange={open=>{if(!open)setOpened(null);}} title={info?.title||'Услуга'}>
   {service&&info&&<div className="desktop-service-detail booking-service-detail">
    <ServiceDetailIntro kind={service.id.replace('sea-','')} image={info.image} icon={info.icon} description={info.description} unit={info.unit}/>
    {service.id==='sea-breakfast'&&<p className="desktop-service-venue"><Icon name="breakfast" size={18}/>{venue.hours} · {venue.restaurant} · {venue.floor}</p>}
    <div className="desktop-service-calculation"><div><span>{info.unit}</span><strong>{formatMoney(service.unitPriceMinor)}</strong></div>{service.id==='sea-breakfast'&&<div><span>Гостей: {people} · дней: {days}</span><span>{formatMoney(service.unitPriceMinor)} × {quantity}</span></div>}</div>
    <div className="desktop-service-footer"><div><small>{selected?'Добавлено в бронирование':'Стоимость услуги'}</small><strong>{formatMoney(service.unitPriceMinor*quantity)}</strong></div><Button variant={selected?'secondary':'primary'} disabled={disabled} onClick={apply}>{selected?'Убрать из брони':'Добавить'}</Button></div>
   </div>}
  </BottomSheet>
 </>;
}


type BookingService=typeof catalog.services[number];
function BookingServiceCatalogue({services,selected,disabled,onOpen}:{services:BookingService[];selected:string[];disabled:boolean;onOpen:(id:string)=>void}){
 const november=useNovember();
 const [category,setCategory]=useState('Все');
 const categories=november?['Все','Общие','Питание']:['Все',...['Еда','Отдых','Транспорт'].filter(c=>services.some(s=>details[s.id].category===c))];
 const categoryOf=(s:BookingService)=>november?(details[s.id].category==='Еда'?'Питание':'Общие'):details[s.id].category;
 const imageOf=(s:BookingService)=>november&&categoryOf(s)==='Общие'?undefined:details[s.id].image;
 const activeCategory=categories.includes(category)?category:'Все';
 const visible=services.filter(s=>activeCategory==='Все'||categoryOf(s)===activeCategory);
 const featured=visible.filter(s=>imageOf(s)),compact=visible.filter(s=>!imageOf(s));
 const categoryIcons:Record<string,string>={'Общие':'room-service','Питание':'restaurant','Все':'menu','Еда':'restaurant','Отдых':'spa','Транспорт':'transfer'};
 const card=(s:BookingService)=>{const item={...details[s.id],image:imageOf(s)},added=selected.includes(s.id);return <button type="button" key={s.id} className={'hotel-service-row service-catalog-card'+(item.image?' is-featured':'')} disabled={disabled} aria-label={`Подробнее: ${item.title}`} aria-haspopup="dialog" onClick={()=>onOpen(s.id)}>
  {item.image?<span className="service-catalog-photo"><img src={import.meta.env.BASE_URL+item.image} alt=""/>{added&&<span className="service-added-badge"><Icon name="check" size={14} inheritColor/>Добавлено</span>}</span>:<span className="icon-tile"><Icon name={november&&item.category!=='Еда'?'room-service':item.icon} size={22} inheritColor/></span>}
  <span className="service-catalog-copy"><strong>{item.title}</strong>{(!november||item.category==='Еда')&&<small>{item.caption}</small>}</span>
  <span className="hotel-service-action"><b>{formatMoney(s.unitPriceMinor)}</b><span>{added?'Добавлено':'Подробнее'}<Icon name={added?'check':'chevron-right'} size={16} inheritColor/></span></span>
 </button>;};
 const filters=<nav aria-label="Категории услуг">{categories.map(c=><button type="button" key={c} aria-current={activeCategory===c?'page':undefined} onClick={()=>setCategory(c)}><Icon name={categoryIcons[c]} size={18} inheritColor/>{c}</button>)}</nav>;
 return <div className={'service-catalog-layout booking-service-catalog'+(!isDesktop?' mobile-service-catalog':'')}>
  <aside className="service-catalog-nav">{isDesktop?filters:<Carousel ariaLabel="Категории услуг">{filters}</Carousel>}</aside>
  <section className="service-catalog-main">

   {!!featured.length&&(isDesktop?<div className="service-catalog-featured">{featured.map(card)}</div>:<Carousel ariaLabel="Услуги для поездки" contentClassName="service-catalog-featured">{featured.map(card)}</Carousel>)}
   {!!compact.length&&<section className="service-catalog-more">{!!featured.length&&<h3>Ещё для вашей поездки</h3>}<div className="service-catalog-grid">{compact.map(card)}</div></section>}
   {!visible.length&&<div className="hotel-service-empty"><Icon name="nav-search" size={32}/><h3>{services.length?'Ничего не найдено':'Нет дополнительных услуг'}</h3><p>{services.length?'Выберите другую категорию.':'Для выбранного тарифа сейчас нет доступных услуг.'}</p>{services.length>0&&<Button variant="secondary" onClick={()=>{setCategory('Все');}}>Сбросить фильтры</Button>}</div>}
  </section>
 </div>;
}
