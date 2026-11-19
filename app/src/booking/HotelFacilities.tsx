import {novemberEditorialText} from '../../../prototype/domain/novemberEditorialText.mjs';
import {useState} from 'react';
import {Icon} from '../ui';
import {Carousel} from '../mobile';
import {isDesktop} from '../desktop/surface';
import {FullscreenPhotoGallery} from './FullscreenPhotoGallery';
import {amenityIcon} from './amenityIcons';
import {hotelFacets} from './searchFacets';
import './hotel-facilities.css';

const groups = [
 {title:'Отдых и спа',icon:'spa',items:['pool','spa','sauna','beach','terrace','picnic','board-games','route']},
 {title:'Питание и рестораны',icon:'restaurant',items:['breakfast','restaurant','bar','cafe']},
 {title:'Спорт',icon:'fitness',items:['fitness']},
 {title:'Транспорт',icon:'car',items:['parking','transfer','taxi']},
 {title:'Для детей',icon:'kids-room',items:['kids-room','baby-cot']},
 {title:'Услуги отеля',icon:'reception',items:['reception','contactless-check-in','luggage','laundry','iron','cleaning','linen','towels']},
 {title:'Общие удобства',icon:'hotel-building',items:[]},
];

const facilityPhotos:Record<string,string[]> = {
 pool:['/brand/ideas/covers/pool.webp'],
 breakfast:['/brand/ideas/covers/breakfast.webp','/assets/services/breakfast-buffet.png','/assets/services/breakfast-in-room.png'],
 restaurant:['/brand/ideas/covers/gastro.webp','/assets/nearby/restaurant.webp'],
 spa:['/brand/ideas/covers/hammam.webp'],
 sauna:['/brand/ideas/covers/hammam.webp'],
 terrace:['/brand/ideas/covers/terrace.webp'],
};

// Reference photos from the booking widget and official site of Istochnik, Zheleznovodsk.
const istochnikPhotos:Record<string,string[]> = {
 pool:['/assets/istochnik-amenities/pool-1.jpg','/assets/istochnik-amenities/pool-2.jpg'],
 breakfast:['/assets/istochnik-amenities/buffet-1.jpg','/assets/istochnik-amenities/buffet-2.jpg'],
 restaurant:['/assets/istochnik-amenities/restaurant-1.jpg','/assets/istochnik-amenities/restaurant-2.jpg'],
 spa:['/assets/istochnik-amenities/hammam-1.jpg','/assets/istochnik-amenities/sauna-1.jpg'],
 fitness:['/assets/istochnik-amenities/fitness-1.jpg'],
 parking:['/assets/istochnik-amenities/parking-1.jpg'],
};

function facilityDetails(label:string,hotelId:string):string[]{
 if(label==='Круглосуточная стойка регистрации')return ['Круглосуточно'];
 if(label==='Уборка по запросу')return ['По запросу'];
 if(label==='Заказ трансфера'||label==='Вызов такси')return ['По заказу'];
 if(label==='Парковка'){
  if(hotelId==='orbit-sea')return ['Бесплатно','Въезд с ул. Голубая'];
  const parking=hotelFacets(hotelId)?.parking||[];
  return parking.filter(detail=>detail!=='Есть парковка').map(detail=>detail==='Бесплатная парковка'?'Бесплатно':detail==='Платная парковка'?'Платно':detail);
 }
 return [];
}

export function HotelFacilities({amenities,hotelId,onShowAll,showPopular=true}:{amenities:string[];hotelId:string;onShowAll?:()=>void;showPopular?:boolean}){
 const [galleryState,setGalleryState]=useState<{label:string;index:number}|null>(null);
 const usesIstochnikPhotos=hotelId==='orbit-sea';
 const photosByAmenity=usesIstochnikPhotos?istochnikPhotos:facilityPhotos;
 const facilities=amenities.map(label=>{
  const icon=amenityIcon(label);
  return {label,group:groups.find(group=>group.items.includes(icon))??groups[groups.length-1],photos:photosByAmenity[icon]??[]};
 });
 const visibleGroups=groups.filter(group=>facilities.some(item=>item.group===group));
 const popular=showPopular?facilities.filter(item=>item.photos.length>0).slice(0,6):[];
 const gallery=popular.find(item=>item.label===galleryState?.label);
 const shownGroups=onShowAll?visibleGroups.slice(0,3):visibleGroups;
 const showAllButton=onShowAll&&visibleGroups.length>shownGroups.length;

 const facilitiesCard=<div className="hotel-facilities-card">
   <div className="hotel-facilities-groups">
    {shownGroups.map(group=><section className="hotel-facility-group" key={group.title}>
     <h3><span className="icon-tile" aria-hidden="true"><Icon name={group.icon} size={22} inheritColor/></span><span>{group.title}</span></h3>
     <ul role="list">
      {facilities.filter(item=>item.group===group).map(({label})=>{
       const details=facilityDetails(label,hotelId);
       const title=label==='Круглосуточная стойка регистрации'?'Стойка регистрации':label==='Уборка по запросу'?'Уборка':label;
       return <li key={label}>
        <span>{title}</span>
        {details.length>0&&<div className="hotel-facility-labels">{details.map(detail=><span key={detail}>{detail}</span>)}</div>}
       </li>;
      })}
     </ul>
    </section>)}
   </div>
   {showAllButton&&<button type="button" className="hotel-facilities-all" aria-haspopup="dialog" onClick={onShowAll}>
    <span>Все удобства отеля</span><Icon name="chevron-right" size={18} inheritColor/>
   </button>}
  </div>;

 return <>
  {showPopular?<section className="hotel-section hotel-amenities-section">
   <h2>{novemberEditorialText("Т-1077", "Удобства отеля", "Удобства")}</h2>
   {facilitiesCard}
  </section>:facilitiesCard}
  {popular.length>0&&<section className={`hotel-section hotel-popular-facilities${isDesktop?'':' hotel-popular-facilities-mobile'}`}>
   <h2>Популярные удобства</h2>
   <Carousel ariaLabel="Фото популярных удобств" className="hotel-popular-facilities-scroll" contentClassName="hotel-popular-facilities-track">
    {popular.map(({label,photos})=><div className="hotel-facility-photo-card" key={label}>
     <button type="button" className="hotel-facility-photo-cover" aria-label={`Посмотреть фото: ${label}${photos.length>1?` · ${photos.length} фото`:""}`} aria-haspopup="dialog" onClick={()=>setGalleryState({label,index:0})}>
      <img src={photos[0]} alt="" draggable={false}/>
      {photos.length>1&&<span className="photo-counter" aria-hidden="true"><Icon name="camera" size={14} inheritColor/>{photos.length}</span>}
     </button>
     <span className="hotel-facility-photo-caption">{label}</span>
    </div>)}
   </Carousel>
  </section>}
  {gallery&&<FullscreenPhotoGallery title={gallery.label} subject="удобства"
   photos={gallery.photos.map((src,index)=>({src,label:`${gallery.label} · фото ${index+1}`}))}
   selected={galleryState?.index??null}
   onSelect={index=>setGalleryState(index===null?null:{label:gallery.label,index})}/>}
 </>;
}
