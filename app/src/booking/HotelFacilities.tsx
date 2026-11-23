import {novemberEditorialText} from '../../../prototype/domain/novemberEditorialText.mjs';
import {useId,useRef,useState} from 'react';
import {Icon} from '../ui';
import {Carousel} from '../mobile';
import {isDesktop} from '../desktop/surface';
import {FullscreenPhotoGallery} from './FullscreenPhotoGallery';
import {amenityIcon} from './amenityIcons';
import {hotelFacets} from './searchFacets';
import {manteraFacilities,type HotelFacilityGroup} from './manteraFacilities';
import './hotel-facilities.css';

const groups = [
 {title:'Отдых и спа',icon:'spa',items:['pool','spa','sauna','beach','terrace','picnic','board-games','route']},
 {title:'Питание и рестораны',icon:'restaurant',items:['breakfast','restaurant','bar','cafe']},
 {title:'Спорт',icon:'fitness',items:['fitness']},
 {title:'Транспорт',icon:'car',items:['parking','transfer','taxi']},
 {title:'Для детей',icon:'kids-room',items:['kids-room','baby-cot']},
 {title:'Услуги отеля',icon:'reception',items:['reception','contactless-check-in','luggage','laundry','iron','cleaning','linen','towels','pet']},
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

const isPriceTag=(tag:string)=>tag==='Бесплатно'||tag==='Платно';
type FacilityDetails={tags:string[];description?:string};
function facilityDetails(label:string,hotelId:string):FacilityDetails{
 if(label==='Круглосуточная стойка регистрации')return {tags:['Круглосуточно']};
 if(label==='Уборка по запросу')return {tags:['По запросу']};
 if(label==='Заказ трансфера'||label==='Вызов такси')return {tags:['По заказу']};
 if(label==='Парковка'){
  if(hotelId==='orbit-sea')return {tags:['Бесплатно'],description:'Въезд с ул. Голубая'};
  const parking=hotelFacets(hotelId)?.parking||[];
  return {tags:parking.filter(detail=>detail!=='Есть парковка').map(detail=>detail==='Бесплатная парковка'?'Бесплатно':detail==='Платная парковка'?'Платно':detail)};
 }
 return {tags:[]};
}

export function HotelFacilities({amenities,hotelId,showPopular=true}:{amenities:string[];hotelId:string;showPopular?:boolean}){
 const [expanded,setExpanded]=useState(false);
 const listId=useId();
 const cardRef=useRef<HTMLDivElement>(null);
 const [galleryState,setGalleryState]=useState<{label:string;index:number}|null>(null);
 const usesIstochnikPhotos=hotelId==='orbit-sea';
 const photosByAmenity=usesIstochnikPhotos?istochnikPhotos:facilityPhotos;
 const facilityLabels=[...new Set(amenities)];
 const facilities=facilityLabels.map(label=>{
  const icon=amenityIcon(label);
  return {label,group:groups.find(group=>group.items.includes(icon))??groups[groups.length-1],photos:photosByAmenity[icon]??[]};
 });
 const visibleGroups=groups.filter(group=>facilities.some(item=>item.group===group));
 const popular=showPopular?facilities.filter(item=>item.photos.length>0).slice(0,6):[];
 const gallery=popular.find(item=>item.label===galleryState?.label);
 const facilityGroups:HotelFacilityGroup[]=hotelId==='orbit-sea'?manteraFacilities:visibleGroups.map(group=>({...group,items:facilities.filter(item=>item.group===group).map(({label})=>({label:label==='Круглосуточная стойка регистрации'?'Стойка регистрации':label==='Уборка по запросу'?'Уборка':label,...facilityDetails(label,hotelId)}))}));
 const showAllButton=facilityGroups.length>3||facilityGroups.some(group=>group.items.length>1);
 const compact=!expanded&&showAllButton;
 const shownGroups=compact?facilityGroups.slice(0,3).map(group=>({...group,items:group.items.slice(0,1)})):facilityGroups;
 const toggleFacilities=()=>{
  if(expanded)cardRef.current?.scrollIntoView({block:'start',behavior:'instant'});
  setExpanded(value=>!value);
 };

 const facilitiesCard=<div className="hotel-facilities-card" data-compact={compact||undefined} ref={cardRef}>
   <div className="hotel-facilities-groups" id={listId}>
    {shownGroups.map(group=><section className="hotel-facility-group" key={group.title}>
     <h3><span className="icon-tile" aria-hidden="true"><Icon name={group.icon} size={22} inheritColor/></span><span>{group.title}</span></h3>
     <ul role="list">
      {group.items.map(({label,...details})=>{
       const title=label;
       const priceTags=details.tags.filter(isPriceTag);
       const tags=details.tags.filter(tag=>!isPriceTag(tag));
       return <li key={label}>
        <div className="hotel-facility-line"><span>{title}</span>{priceTags.map(tag=><span className="hotel-facility-price-inline" key={tag}>{' '}<span className="hotel-facility-tag hotel-facility-tag-price" data-price={tag==='Бесплатно'?'free':'paid'}>{tag}</span></span>)}</div>
        {(tags.length>0||details.description)&&<div className="hotel-facility-details">
         {tags.map(tag=><span className="hotel-facility-tag" key={tag}>{tag}</span>)}
         {details.description&&<p className="hotel-facility-tag hotel-facility-description">{details.description}</p>}
        </div>}
       </li>;
      })}
     </ul>
    </section>)}
   </div>
   {showAllButton&&<button type="button" className="hotel-facilities-all" aria-expanded={expanded} aria-controls={listId} onClick={toggleFacilities}>
    <span>{expanded?'Свернуть удобства':'Все удобства отеля'}</span><Icon name="chevron-down" size={18} inheritColor/>
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
