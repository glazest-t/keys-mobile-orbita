import {manteraNearbyPlaces} from './manteraNearbyPlaces';
import {nearbyScreenshotExamples} from './nearbyScreenshotExamples';
import {tripEditorialText} from '../../../prototype/domain/tripEditorialText.mjs';
import {useNearbyPlacesMode} from '../demoNearbyPlaces';
import {useNovember} from '../usePrototypeVariant';
import {isDesktop} from '../desktop/surface';
import {useState,useEffect,useId,useRef,type CSSProperties,type ReactNode} from 'react';
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

function PlacePhoto({place,large=false,cover=false,fit=false,children}:{place:NearbyPlace;large?:boolean;cover?:boolean;fit?:boolean;children?:ReactNode}){
 const source=place.photo||nearbyPhoto(place.id)||nearbyIllustration(place);
 const [failedUrl,setFailedUrl]=useState<string>();
 const photo=failedUrl===source.url?nearbyIllustration(place):source;
 const [loadedSize,setLoadedSize]=useState<{url:string;aspectRatio:number}>();
 const aspectRatio=loadedSize?.url===photo.url?loadedSize.aspectRatio:undefined;
 if(place.id.startsWith('mantera-')&&!place.photo)return <figure className="nearby-place-cover nearby-cover-icon" aria-label={place.categoryLabel}><PlaceIcon place={place}/></figure>;
 return <figure className={large?'nearby-place-photo':cover?'nearby-place-cover':'nearby-place-thumb'} style={fit&&aspectRatio?{'--nearby-photo-aspect':aspectRatio} as CSSProperties:undefined}>
  <img src={photo.url} alt={photo.illustrative?`Иллюстрация: ${place.categoryLabel}`:place.name} draggable={false} loading={fit?'eager':'lazy'} onLoad={fit?event=>{
   const {naturalWidth,naturalHeight}=event.currentTarget;
   if(naturalHeight)setLoadedSize({url:photo.url,aspectRatio:naturalWidth/naturalHeight});
  }:undefined} onError={()=>{if(!photo.illustrative)setFailedUrl(photo.url);}}/>
  {children}
  {large&&photo.credit&&<figcaption>{photo.source?<a href={photo.source} target="_blank" rel="noreferrer">{photo.credit}</a>:photo.credit}</figcaption>}
 </figure>;
}

function DesktopPlaceGallery({place,initialIndex}:{place:NearbyPlace;initialIndex:number}){
 const photos=place.photos||[];
 const [index,setIndex]=useState(initialIndex);
 const photo=photos[index]||place.photo;
 const canPage=photos.length>1;
 if(!canPage)return <PlacePhoto place={{...place,photo}} large fit/>;

 const changePhoto=(step:number)=>setIndex(current=>(current+step+photos.length)%photos.length);
 return <div className="nearby-desktop-gallery" role="group" aria-label={`Фотографии: ${place.name}`} onKeyDown={event=>{
  if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
  event.preventDefault();
  changePhoto(event.key==='ArrowLeft'?-1:1);
 }}>
  <PlacePhoto place={{...place,photo,name:`${place.name} · фото ${index+1}`}} large fit>
   <IconButton name="chevron-right" mirrored label="Предыдущее фото" onClick={()=>changePhoto(-1)}/>
   <IconButton name="chevron-right" label="Следующее фото" onClick={()=>changePhoto(1)}/>
   <span className="nearby-desktop-photo-count" role="status">{index+1} из {photos.length}</span>
  </PlacePhoto>
 </div>;
}

function NearbyPlaceDetails({place,photoMode,desktopHotelDetail,initialIndex=0,onClose}:{place?:NearbyPlace;photoMode:boolean;desktopHotelDetail:boolean;initialIndex?:number;onClose:()=>void}){
 const showDesktopPhoto=desktopHotelDetail&&(photoMode||Boolean(place?.photo||place?.photos?.length));
 return <BottomSheet open={!!place} onOpenChange={open=>{if(!open)onClose();}} title={place?.name||'Место рядом'} snap={photoMode?.86:.6}>
  <div className={'sheet-body nearby-place-sheet'+(desktopHotelDetail?' nearby-place-sheet--desktop-hotel':'')}>
   {place&&<>
    {showDesktopPhoto&&<DesktopPlaceGallery key={place.id} place={place} initialIndex={initialIndex}/>}
    {!desktopHotelDetail&&photoMode&&(
     place.photos&&place.photos.length>1?<Carousel className="nearby-photo-gallery" contentClassName="nearby-photo-gallery-track" ariaLabel={`Фотографии: ${place.name}`}>
      {place.photos.map((photo,index)=><PlacePhoto key={photo.url} place={{...place,photo,name:`${place.name} · фото ${index+1}`}} large/>)}
     </Carousel>:<PlacePhoto key={place.id} place={place} large/>
    )}
    <div className="nearby-place-meta"><span className="icon-tile"><Icon name={photoMode?place.icon:placeIcon(place)} size={24} inheritColor/></span><span><strong>{place.categoryLabel}</strong><small>{nearbyJourney(place)}</small></span></div>
    {place.about!==`${place.categoryLabel}.`&&<p>{place.about}</p>}
    {!place.id.startsWith('mantera-')&&<section className="nearby-place-reason"><strong>Почему вам может понравиться</strong><p>{nearbyReason(place)}</p></section>}
    <Button dismissOnly onClick={onClose}>Понятно</Button>
   </>}
  </div>
 </BottomSheet>;
}

function PlacePhotoCard({place,onClick,gallery=false,showPhoto=true}:{place:NearbyPlace;onClick:(index?:number)=>void;gallery?:boolean;showPhoto?:boolean}){
 const caption=<span className="nearby-photo-caption"><strong>{place.name}</strong><small>{place.categoryLabel}</small><span>{nearbyJourney(place)}</span></span>;
 if(gallery&&place.photos&&place.photos.length>1)return <article className="nearby-photo-card">
  <Carousel className="nearby-card-gallery" contentClassName="nearby-card-gallery-track" ariaLabel={`Фотографии: ${place.name}`}>
   {place.photos.map((photo,index)=><button type="button" className="nearby-gallery-photo" key={photo.url} onClick={()=>onClick(index)} aria-haspopup="dialog" aria-label={`${place.name} · фото ${index+1} из ${place.photos!.length}`}><PlacePhoto place={{...place,photo}} cover/></button>)}
  </Carousel>
  <button type="button" className="nearby-card-open" onClick={()=>onClick()} aria-haspopup="dialog">{caption}</button>
 </article>;
 return <button type="button" className="nearby-photo-card" onClick={()=>onClick()} aria-haspopup="dialog">{showPhoto?<PlacePhoto place={place} cover/>:<PlaceIcon place={place}/>}{caption}</button>;
}

function HotelLocationPreview({hotelId,places,onOpen,onRoute}:{hotelId:string;places:NearbyPlace[];onOpen:(id?:string,mapOpen?:boolean)=>void;onRoute?:()=>void}){
 const november=useNovember();
 const location=hotelLocation(hotelId),hotel=catalog.hotels.find(h=>h.id===hotelId);
 if(!location)return null;
 const address=hotelAddress(hotelId,hotel?.city||'');
 const points=nearbyMapPoints(hotelId,places,november);
 const route=onRoute&&<Button type="button" variant="secondary" className="nearby-location-route" onClick={onRoute}><Icon name="route" size={16} inheritColor/>Маршрут</Button>;
 const addressRow=<div className="nearby-hotel-address-row">
  <div className="nearby-hotel-address"><Icon name="pin" size={18} outline/><span className="nearby-address-text">{address}</span></div>
  {isDesktop?<div className="nearby-location-actions">
   {route}
   <Button type="button" variant="secondary" className="nearby-location-on-map" onClick={()=>onOpen(undefined,true)}><Icon name="map" size={16} inheritColor/>На карте</Button>
  </div>:route}
 </div>;
 return <div className="nearby-location-link-area">
  <button type="button" className="nearby-location-open" aria-label="Расположение — перейти в Рядом с вами" onClick={()=>onOpen()}/>
  {isDesktop&&addressRow}
  <div className="nearby-location-map">
   <div className="nearby-live-map nearby-hotel-preview" aria-hidden="true" inert>
    <TwoGisMap center={location.coordinates as Coordinates} points={points} selected={hotelId} interactive={false} label="Расположение отеля"/>
   </div>
   {!isDesktop&&<button type="button" className="nearby-location-expand" onClick={()=>onOpen(undefined,true)}><Icon name="map" size={16}/>Развернуть карту</button>}
  </div>
  {!isDesktop&&addressRow}
 </div>;
}

export function NearbyPreview({hotelId,onOpen,onRoute,showLocation=false,locationId}:{hotelId:string;showLocation?:boolean;locationId?:string;onOpen:(id?:string,mapOpen?:boolean)=>void;onRoute?:()=>void}){
 const titleId=useId();
 const photos=useNearbyPlacesMode()==='photos';
 const desktopLocation=isDesktop&&showLocation;
 const [selected,setSelected]=useState<NearbyPlace>();
 const openPlace=(place:NearbyPlace)=>{
  if(showLocation)setSelected(place);
  else onOpen(place.id);
 };
 const all=hotelId==='orbit-sea'?manteraNearbyPlaces:photos?nearbyScreenshotExamples:nearbyPlaces(hotelId);
 const places=desktopLocation?all:all.slice(0,photos?6:2);
 const Card=showLocation?'div':'section';
 const locationHeading=<div className="section-label">
  <h2 id={titleId}><button type="button" className="nearby-location-title" onClick={()=>onOpen()}>Расположение</button></h2>
 </div>;
 const card=<Card className={'stay-nearby stay-location-preview'+(desktopLocation?' desktop-location-preview':'')}>
  {desktopLocation&&locationHeading}
  {showLocation&&<HotelLocationPreview key={hotelId} hotelId={hotelId} places={all} onOpen={onOpen} onRoute={onRoute}/>}
  <div className="nearby-preview-places">
  <h3 className="nearby-preview-heading"><button type="button" className="nearby-preview-link" onClick={()=>onOpen()}><span>Рядом с вами</span><span className="nearby-preview-all">Все<Icon name="chevron-right" size={16} inheritColor/></span></button></h3>
  {places.length?desktopLocation?<div className="nearby-desktop-preview-list" role="region" aria-label="Места рядом с вами" tabIndex={0}>
   {places.map(place=><PlacePhotoCard key={place.id} place={place} showPhoto={photos} onClick={()=>openPlace(place)}/>)}
  </div>:photos?<Carousel ariaLabel="Места рядом с вами" className="nearby-preview-carousel" contentClassName="nearby-preview-track">{places.map(p=><PlacePhotoCard key={p.id} place={p} onClick={()=>openPlace(p)}/>)}</Carousel>:places.map(p=><button className="stay-nearby-row k-list-row" key={p.id} aria-haspopup={showLocation?'dialog':undefined} onClick={()=>openPlace(p)}><PlaceIcon place={p}/><span><strong>{p.name}</strong><small>{p.categoryLabel} · {nearbyJourney(p)}</small></span></button>):<p>{tripEditorialText("ПР-098", "Места рядом с отелем пока не добавлены", "Места рядом пока не добавлены")}</p>}
  </div>
 </Card>;
 if(!showLocation)return card;
 return <section className="hotel-section hotel-location-section" id={locationId} tabIndex={locationId?-1:undefined} aria-labelledby={titleId}>
  {!desktopLocation&&locationHeading}
  {card}
  <NearbyPlaceDetails place={selected} photoMode={photos} desktopHotelDetail={isDesktop} onClose={()=>setSelected(undefined)}/>
 </section>;
}

export function NearbyPlaces({hotelId,initialPlaceId,initialMapOpen=false,header,embedded=false}:{header?:ReactNode;hotelId:string;initialPlaceId?:string;initialMapOpen?:boolean;embedded?:boolean}){
 const photos=useNearbyPlacesMode()==='photos',november=useNovember();
 const Scroll=embedded?'div':MobileScroll,Content=embedded?'div':'main';
 const all=hotelId==='orbit-sea'?manteraNearbyPlaces:photos?nearbyScreenshotExamples:nearbyPlaces(hotelId);
 const initial=all.find(p=>p.id===initialPlaceId),hotel=catalog.hotels.find(h=>h.id===hotelId),location=hotelLocation(hotelId);
 const [category,setCategory]=useState<NearbyCategory>(initial?.category||'Всё'),[selected,setSelected]=useState<NearbyPlace|undefined>(initial);
 const desktopHotelDetail=isDesktop&&!embedded;
 const [selectedPhotoIndex,setSelectedPhotoIndex]=useState(0);
 const openPlace=(place:NearbyPlace,index=0)=>{
  setSelectedPhotoIndex(index);
  setSelected(place);
 };
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
  const top=isDesktop?(desktopHotelDetail?0:72):frame.top;
  const bottom=isDesktop?window.innerHeight:frame.bottom;
  const origin=`inset(${Math.max(0,(map.top-top)/scale)}px ${(frame.right-map.right)/scale}px ${Math.max(0,(bottom-map.bottom)/scale)}px ${(map.left-frame.left)/scale}px round 24px)`;
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
  onSelect={id=>{const place=all.find(p=>p.id===id);if(place)openPlace(place);}}
  label="Отель и достопримечательности"
  expanded={expanded} boundsPadding={expanded?{top:140,bottom:120,left:55,right:55}:undefined} interactive={expanded||isDesktop}/>;
 return <><Scroll className={embedded?"nearby nearby-embedded":"detail-scroll nearby page-scroll"}>{header}<Content className="detail-content detail-nearby" inert={!isDesktop&&mapView?.open||undefined}>
 {location&&<div className="nearby-live-map" role="group" aria-label="Отель и достопримечательности">
  {renderMap(false)}
  <button ref={mapTrigger} type="button" className="map-expand" onClick={event=>openMap(event.currentTarget)}><Icon name="map" size={16}/>Развернуть карту</button>
 </div>}
 {all.length>0&&<><div className="detail-segments" aria-label="Категории мест">{categories.map(c=><button key={c} className={category===c?'active':''} aria-pressed={category===c} onClick={()=>{setCategory(c);setSelected(undefined);}}>{c}</button>)}</div></>}
 {places.length?<section className={'nearby-real-places'+(photos?' nearby-photo-list':'')} aria-label="Места рядом с отелем" tabIndex={embedded?0:undefined}>{places.map(p=>photos?<PlacePhotoCard key={p.id} place={p} onClick={index=>openPlace(p,index)} gallery/>:<button className="nearby-place-row" key={p.id} onClick={()=>openPlace(p)}><PlaceIcon place={p}/><span className="nearby-place-copy"><small>{p.categoryLabel}</small><strong>{p.name}</strong><span className="nearby-place-distance">{nearbyJourney(p)}</span></span></button>)}</section>:<div className="nearby-empty"><Icon outline name="pin" size={32}/><h2>{location?tripEditorialText("ПР-101", 'Пока нет мест поблизости', "Пока нет мест рядом"):'Места рядом пока не добавлены'}</h2><p>{hotel?.name}</p></div>}
 </Content></Scroll>
 {mapView&&createPortal(<ExpandingMap open={mapView.open} origin={mapView.origin} onClose={closeMap} title="Карта мест рядом">
  <section className="expanded-results-map nearby-expanded-map" aria-label="Карта мест рядом">
   {renderMap(true)}
   <header><IconButton name="back" inheritColor label="Назад к местам рядом" onClick={closeMap}/></header>
   <div className="map-selection"><button type="button" className="map-list-button" onClick={closeMap}><Icon name="menu" size={16} inheritColor/>Списком</button></div>
  </section>
 </ExpandingMap>,mapView.host)}
 <NearbyPlaceDetails place={selected} photoMode={photos} desktopHotelDetail={desktopHotelDetail} initialIndex={selectedPhotoIndex} onClose={()=>setSelected(undefined)}/>
 </>;
}
