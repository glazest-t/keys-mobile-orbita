import {manteraNearbyPlaces} from './manteraNearbyPlaces';
import {nearbyScreenshotExamples} from './nearbyScreenshotExamples';
import {tripEditorialText} from '../../../prototype/domain/tripEditorialText.mjs';
import {useNearbyPlacesMode} from '../demoNearbyPlaces';
import {useNovember} from '../usePrototypeVariant';
import {isDesktop} from '../desktop/surface';
import {useState,useEffect,useRef,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {BottomSheet,MobileScroll,Carousel} from '../mobile';
import {Button,Icon,IconButton} from '../ui';
import {ExpandingMap} from '../interactions';
import {catalog} from './model';
import {nearbyPlaces,nearbyPhoto,nearbyIllustration,nearbyReason,nearbyJourney,type NearbyCategory,type NearbyPlace} from './nearby';
import {TwoGisMap} from '../maps/TwoGisMap';
import {hotelAddress,hotelLocation,type Coordinates} from '../maps/locations';
import './nearby.css';

const placeIcon=(p:NearbyPlace)=>p.category==='Прогулки'?'park':p.category==='Музеи'?'museum':'pin';
function nearbyMapPoints(hotelId:string,places:NearbyPlace[],november:boolean){
 const location=hotelLocation(hotelId),hotel=catalog.hotels.find(h=>h.id===hotelId);
 return [...(location?[{id:hotelId,coordinates:location.coordinates,label:'Отель',name:hotel?.name||'Ваш отель'}]:[]),...places.map((p,i)=>{
  const same=places.filter(other=>other.coordinates.join(',')===p.coordinates.join(','));
  return {id:p.id,coordinates:p.coordinates,label:november?p.categoryLabel:String(i+1),icon:november?placeIcon(p):undefined,name:p.name,markerOffset:[(same.findIndex(other=>other.id===p.id)-(same.length-1)/2)*42,0]};
 })];
}
function PlaceIcon({place}:{place:NearbyPlace}){return <span className={'nearby-category-tile '+(place.category==='Прогулки'?'nature':place.category==='Музеи'?'museum':'landmark')}><Icon name={placeIcon(place)} size={24} inheritColor/></span>;}

function PlacePhoto({place,large=false,cover=false}:{place:NearbyPlace;large?:boolean;cover?:boolean}){
 const [failed,setFailed]=useState(false),photo=failed?nearbyIllustration(place):place.photo||nearbyPhoto(place.id)||nearbyIllustration(place);
 if(place.id.startsWith('mantera-')&&!place.photo)return <figure className="nearby-place-cover nearby-cover-icon" aria-label={place.categoryLabel}><PlaceIcon place={place}/></figure>;
 return <figure className={large?'nearby-place-photo':cover?'nearby-place-cover':'nearby-place-thumb'}><img src={photo.url} alt={photo.illustrative?`Иллюстрация: ${place.categoryLabel}`:place.name} draggable={false} loading="lazy" onError={()=>{if(!photo.illustrative)setFailed(true);}}/>{large&&photo.credit&&<figcaption>{photo.source?<a href={photo.source} target="_blank" rel="noreferrer">{photo.credit}</a>:photo.credit}</figcaption>}</figure>;
}

function PlacePhotoCard({place,onClick,gallery=false}:{place:NearbyPlace;onClick:()=>void;gallery?:boolean}){
 const caption=<span className="nearby-photo-caption"><strong>{place.name}</strong><small>{place.categoryLabel}</small><span>{nearbyJourney(place)}</span></span>;
 if(gallery&&place.photos&&place.photos.length>1)return <article className="nearby-photo-card">
  <Carousel className="nearby-card-gallery" contentClassName="nearby-card-gallery-track" ariaLabel={`Фотографии: ${place.name}`}>
   {place.photos.map((photo,index)=><button type="button" className="nearby-gallery-photo" key={photo.url} onClick={onClick} aria-haspopup="dialog" aria-label={`${place.name} · фото ${index+1} из ${place.photos!.length}`}><PlacePhoto place={{...place,photo}} cover/></button>)}
  </Carousel>
  <button type="button" className="nearby-card-open" onClick={onClick} aria-haspopup="dialog">{caption}</button>
 </article>;
 return <button type="button" className="nearby-photo-card" onClick={onClick} aria-haspopup="dialog"><PlacePhoto place={place} cover/>{caption}</button>;
}

function HotelLocationPreview({hotelId,places,onOpen,locationId}:{hotelId:string;places:NearbyPlace[];onOpen:(id?:string,mapOpen?:boolean)=>void;locationId?:string}){
 const location=hotelLocation(hotelId),hotel=catalog.hotels.find(h=>h.id===hotelId);
 const address=hotelAddress(hotelId,hotel?.city||'');
 const november=useNovember(),points=nearbyMapPoints(hotelId,places,november);
 return <div className="nearby-location-link-area" id={locationId} tabIndex={locationId?-1:undefined} role={locationId?"region":undefined} aria-labelledby={locationId?locationId+"-title":undefined}>
  <h2 id={locationId?locationId+"-title":undefined}>Расположение</h2>
  {location&&<div className="nearby-hotel-address"><Icon name="pin" size={18} outline/><span className="nearby-address-text">{address}</span></div>}
  {location&&<div className="nearby-live-map nearby-hotel-preview" aria-hidden="true" inert>
   <TwoGisMap center={location.coordinates as Coordinates} points={points} selected={hotelId} interactive={false} label="Расположение отеля"/>
  </div>}
  <button type="button" className="nearby-location-open" aria-label="Расположение — перейти в Рядом с вами" onClick={()=>onOpen()}/>
  {location&&<button type="button" className="nearby-location-expand" onClick={()=>onOpen(undefined,true)}><Icon name="map" size={16}/>Развернуть карту</button>}
 </div>;
}

export function NearbyPreview({hotelId,onOpen,showLocation=false,locationId}:{hotelId:string;showLocation?:boolean;locationId?:string;onOpen:(id?:string,mapOpen?:boolean)=>void}){
 const photos=useNearbyPlacesMode()==='photos';
 const all=hotelId==='orbit-sea'?manteraNearbyPlaces:photos?nearbyScreenshotExamples:nearbyPlaces(hotelId);
 const places=all.slice(0,photos?6:2);
 return <section className="stay-nearby stay-location-preview">
  {showLocation&&<HotelLocationPreview key={hotelId} hotelId={hotelId} places={all} onOpen={onOpen} locationId={locationId}/>}
  <div className="nearby-preview-places">
  <h3 className="nearby-preview-heading"><button type="button" className="nearby-preview-link" onClick={()=>onOpen()}><span>Рядом с вами</span><span className="nearby-preview-all">Все<Icon name="chevron-right" size={16} inheritColor/></span></button></h3>
  {places.length?photos?<Carousel ariaLabel="Места рядом с вами" className="nearby-preview-carousel" contentClassName="nearby-preview-track">{places.map(p=><PlacePhotoCard key={p.id} place={p} onClick={()=>onOpen(p.id)}/>)}</Carousel>:places.map(p=><button className="stay-nearby-row k-list-row" key={p.id} onClick={()=>onOpen(p.id)}><PlaceIcon place={p}/><span><strong>{p.name}</strong><small>{p.categoryLabel} · {nearbyJourney(p)}</small></span></button>):<p>{tripEditorialText("ПР-098", "Места рядом с отелем пока не добавлены", "Места рядом пока не добавлены")}</p>}
  </div>
 </section>;
}

export function NearbyPlaces({hotelId,initialPlaceId,initialMapOpen=false,header,embedded=false}:{header?:ReactNode;hotelId:string;initialPlaceId?:string;initialMapOpen?:boolean;embedded?:boolean}){
 const photos=useNearbyPlacesMode()==='photos',november=useNovember();
 const Scroll=embedded?'div':MobileScroll,Content=embedded?'div':'main';
 const all=hotelId==='orbit-sea'?manteraNearbyPlaces:photos?nearbyScreenshotExamples:nearbyPlaces(hotelId);
 const initial=all.find(p=>p.id===initialPlaceId),hotel=catalog.hotels.find(h=>h.id===hotelId),location=hotelLocation(hotelId);
 const [category,setCategory]=useState<NearbyCategory>(initial?.category||'Всё'),[selected,setSelected]=useState<NearbyPlace|undefined>(initial);
 const mapTrigger=useRef<HTMLButtonElement>(null),initialMapHandled=useRef(false);
 const [mapView,setMapView]=useState<{host:HTMLElement;origin:string;trigger:HTMLButtonElement;open:boolean}|null>(null);
 const places=all.filter(p=>category==='Всё'||p.category===category);
 const categories=(['Всё','Культура','Музеи','Прогулки','Пляжи'] as NearbyCategory[]).filter(c=>c==='Всё'||all.some(p=>p.category===c));
 const points=nearbyMapPoints(hotelId,places,november);
 const openMap=(trigger:HTMLButtonElement)=>{
  const host=trigger.closest<HTMLElement>('.keys-app'),preview=trigger.parentElement;
  if(!host||!preview)return;
  const frame=host.getBoundingClientRect(),map=preview.getBoundingClientRect();
  const scale=frame.width/host.clientWidth;
  const top=isDesktop?frame.top+72:frame.top;
  const origin=`inset(${Math.max(0,(map.top-top)/scale)}px ${(frame.right-map.right)/scale}px ${(frame.bottom-map.bottom)/scale}px ${(map.left-frame.left)/scale}px round 24px)`;
  setMapView({host,origin,trigger,open:true});
 };
 useEffect(()=>{
  if(initialMapOpen&&!initialMapHandled.current&&mapTrigger.current){initialMapHandled.current=true;openMap(mapTrigger.current);}
 },[initialMapOpen]);
 const closeMap=()=>{
  if(!mapView?.open)return;
  setMapView({...mapView,open:false});
  if(!isDesktop)requestAnimationFrame(()=>mapView.trigger.focus({preventScroll:true}));
 };
 const renderMap=(expanded:boolean)=>location&&<TwoGisMap
  center={location.coordinates as Coordinates} points={points} selected={selected?.id||hotelId}
  onSelect={id=>{const place=all.find(p=>p.id===id);if(place)setSelected(place);}}
  label="Отель и достопримечательности"
  expanded={expanded} boundsPadding={expanded?{top:140,bottom:120,left:55,right:55}:undefined} interactive={expanded||isDesktop}/>;
 return <><Scroll className={embedded?"nearby nearby-embedded":"detail-scroll nearby page-scroll"}>{header}<Content className="detail-content detail-nearby" inert={!isDesktop&&mapView?.open||undefined}>
 {location&&<div className="nearby-live-map" role="group" aria-label="Отель и достопримечательности">
  {renderMap(false)}
  <button ref={mapTrigger} type="button" className="map-expand" onClick={event=>openMap(event.currentTarget)}><Icon name="map" size={16}/>Развернуть карту</button>
 </div>}
 {all.length>0&&<><div className="detail-segments" aria-label="Категории мест">{categories.map(c=><button key={c} className={category===c?'active':''} aria-pressed={category===c} onClick={()=>{setCategory(c);setSelected(undefined);}}>{c}</button>)}</div></>}
 {places.length?<section className={'nearby-real-places'+(photos?' nearby-photo-list':'')} aria-label="Места рядом с отелем" tabIndex={embedded||isDesktop?0:undefined}>{places.map(p=>photos?<PlacePhotoCard key={p.id} place={p} onClick={()=>setSelected(p)} gallery/>:<button className="nearby-place-row" key={p.id} onClick={()=>setSelected(p)}><PlaceIcon place={p}/><span className="nearby-place-copy"><small>{p.categoryLabel}</small><strong>{p.name}</strong><span className="nearby-place-distance">{nearbyJourney(p)}</span></span></button>)}</section>:<div className="nearby-empty"><Icon outline name="pin" size={32}/><h2>{location?tripEditorialText("ПР-101", 'Пока нет мест поблизости', "Пока нет мест рядом"):'Места рядом пока не добавлены'}</h2><p>{hotel?.name}</p></div>}
 </Content></Scroll>
 {mapView&&createPortal(<ExpandingMap open={mapView.open} origin={mapView.origin} onClose={closeMap} title="Карта мест рядом">
  <section className="expanded-results-map nearby-expanded-map" aria-label="Карта мест рядом">
   {renderMap(true)}
   <header><IconButton name="back" label="Назад к местам рядом" onClick={closeMap}/></header>
   <div className="map-selection"><button type="button" className="map-list-button" onClick={closeMap}><Icon name="menu" size={16} inheritColor/>Списком</button></div>
  </section>
 </ExpandingMap>,mapView.host)}
 <BottomSheet open={!!selected} onOpenChange={v=>{if(!v)setSelected(undefined);}} title={selected?.name||'Место рядом'} snap={photos?.86:.6}><div className="sheet-body nearby-place-sheet">{selected&&<>{photos&&(selected.photos&&selected.photos.length>1?<Carousel className="nearby-photo-gallery" contentClassName="nearby-photo-gallery-track" ariaLabel={`Фотографии: ${selected.name}`}>{selected.photos.map((photo,index)=><PlacePhoto key={photo.url} place={{...selected,photo,name:`${selected.name} · фото ${index+1}`}} large/>)}</Carousel>:<PlacePhoto key={selected.id} place={selected} large/>)}<div className="nearby-place-meta"><span className="icon-tile"><Icon name={!photos?placeIcon(selected):selected.icon} size={24} inheritColor/></span><span><strong>{selected.categoryLabel}</strong><small>{nearbyJourney(selected)}</small></span></div>{selected.about!==`${selected.categoryLabel}.`&&<p>{selected.about}</p>}{!selected.id.startsWith('mantera-')&&<section className="nearby-place-reason"><strong>Почему вам может понравиться</strong><p>{nearbyReason(selected)}</p></section>}<Button dismissOnly onClick={()=>setSelected(undefined)}>Понятно</Button></>}</div></BottomSheet></>;
}
