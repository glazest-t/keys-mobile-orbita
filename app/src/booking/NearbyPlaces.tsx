import {useNovember} from '../usePrototypeVariant';
import {isDesktop} from '../desktop/surface';
import {useState,type ReactNode} from 'react';
import {BottomSheet,MobileScroll} from '../mobile';
import {Button,Icon} from '../ui';
import {catalog} from './model';
import {filterNearbyPlaces,nearbyPlace,nearbyPlaces,nearbyPhoto,nearbyIllustration,nearbyReason,nearbyJourney,type NearbyCategory,type NearbyPlace} from './nearby';
import {TwoGisMap} from '../maps/TwoGisMap';
import {hotelLocation,type Coordinates} from '../maps/locations';
import './nearby.css';

const placeIcon=(p:NearbyPlace)=>p.category==='Прогулки'?'spa':p.category==='Музеи'?'hotel-building':'pin';
function PlaceIcon({place}:{place:NearbyPlace}){return <span className={'nearby-category-tile '+(place.category==='Прогулки'?'nature':place.category==='Музеи'?'museum':'landmark')}><Icon name={placeIcon(place)} size={24} inheritColor/></span>;}

function PlacePhoto({place,large=false}:{place:NearbyPlace;large?:boolean}){
 const [failed,setFailed]=useState(false),photo=failed?nearbyIllustration(place):nearbyPhoto(place.id)||nearbyIllustration(place);
 return <figure className={large?'nearby-place-photo':'nearby-place-thumb'}><img src={photo.url} alt={photo.illustrative?`Иллюстрация: ${place.categoryLabel}`:place.name} draggable={false} loading="lazy" onError={()=>{if(!photo.illustrative)setFailed(true);}}/>{large&&<figcaption>{photo.source?<a href={photo.source} target="_blank" rel="noreferrer">{photo.credit}</a>:photo.credit}</figcaption>}</figure>;
}

export function NearbyPreview({hotelId,onOpen}:{hotelId:string;onOpen:(id?:string)=>void}){
 if(isDesktop)return <section className="stay-nearby stay-nearby-expanded"><header><h2>Рядом с вами</h2>{nearbyPlaces(hotelId).length>0&&<p className="nearby-radius">В радиусе 1,5 км от отеля</p>}</header><NearbyPlaces key={hotelId} hotelId={hotelId} embedded/></section>;
 const places=nearbyPlaces(hotelId).slice(0,2);
 return <section className="stay-nearby"><header><h2 className="nearby-preview-heading"><button type="button" className="nearby-preview-link" onClick={()=>onOpen()}><span>Рядом с вами</span><span className="nearby-preview-all">Все<Icon name="chevron-right" size={16} inheritColor/></span></button></h2></header>{places.length?places.map(p=><button className="stay-nearby-row k-list-row" key={p.id} onClick={()=>onOpen(p.id)}><span className={"nearby-category-tile "+(p.category==='Прогулки'?'nature':p.category==='Музеи'?'museum':'landmark')}><Icon name={p.category==='Прогулки'?'spa':p.category==='Музеи'?'hotel-building':'pin'} size={24} inheritColor/></span><span><strong>{p.name}</strong><small>{p.categoryLabel} · {nearbyJourney(p)}</small></span></button>):<p>Места рядом с отелем пока не добавлены</p>}</section>;
}

export function NearbyPlaces({hotelId,initialPlaceId,header,embedded=false}:{header?:ReactNode;hotelId:string;initialPlaceId?:string;embedded?:boolean}){
 const november=useNovember();
 const Scroll=embedded?'div':MobileScroll,Content=embedded?'div':'main';
 const initial=nearbyPlace(hotelId,initialPlaceId),hotel=catalog.hotels.find(h=>h.id===hotelId),location=hotelLocation(hotelId);
 const [category,setCategory]=useState<NearbyCategory>(initial?.category||'Всё'),[selected,setSelected]=useState<NearbyPlace|undefined>(initial);
 const all=nearbyPlaces(hotelId),places=filterNearbyPlaces(hotelId,category);
 const categories=(['Всё','Культура','Музеи','Прогулки'] as NearbyCategory[]).filter(c=>c==='Всё'||all.some(p=>p.category===c));
 const points=[...(location?[{id:hotelId,coordinates:location.coordinates,label:'Отель',name:hotel?.name||'Ваш отель'}]:[]),...places.map((p,i)=>{
  const same=places.filter(other=>other.coordinates.join(',')===p.coordinates.join(','));
  return {id:p.id,coordinates:p.coordinates,label:november?p.categoryLabel:String(i+1),icon:november?placeIcon(p):undefined,name:p.name,markerOffset:[(same.findIndex(other=>other.id===p.id)-(same.length-1)/2)*42,0]};
 })];
 return <><Scroll className={embedded?"nearby nearby-embedded":"detail-scroll nearby page-scroll"}>{header}<Content className="detail-content detail-nearby">
 {location&&<div className="nearby-live-map" role="group" aria-label="Места в радиусе 1,5 км от отеля"><TwoGisMap center={location.coordinates as Coordinates} points={points} selected={selected?.id||hotelId} onSelect={id=>{const p=nearbyPlace(hotelId,id);if(p)setSelected(p);}} label="Отель и места рядом"/></div>}
 {all.length>0&&<><div className="detail-segments" aria-label="Категории мест">{categories.map(c=><button key={c} className={category===c?'active':''} aria-pressed={category===c} onClick={()=>{setCategory(c);setSelected(undefined);}}>{c}</button>)}</div></>}
 {places.length?<section className="nearby-real-places" aria-label="Места рядом с отелем" tabIndex={embedded?0:undefined}>{places.map(p=><button className="nearby-place-row" key={p.id} onClick={()=>setSelected(p)}>{november?<PlaceIcon place={p}/>:<PlacePhoto place={p}/>}<span className="nearby-place-copy"><small>{p.categoryLabel}</small><strong>{p.name}</strong><span className="nearby-place-distance">{nearbyJourney(p)}</span></span></button>)}</section>:<div className="nearby-empty"><Icon name="pin" size={32}/><h2>{location?'Пока нет мест поблизости':'Места рядом пока не добавлены'}</h2><p>{hotel?.name}</p></div>}
 </Content></Scroll>
 <BottomSheet open={!!selected} onOpenChange={v=>{if(!v)setSelected(undefined);}} title={selected?.name||'Место рядом'} snap={november?.6:.86}><div className="sheet-body nearby-place-sheet">{selected&&<>{!november&&<PlacePhoto key={selected.id} place={selected} large/>}<div className="nearby-place-meta"><span className="icon-tile"><Icon name={november?placeIcon(selected):selected.icon} size={24} inheritColor/></span><span><strong>{selected.categoryLabel}</strong><small>{nearbyJourney(selected)}</small></span></div><p>{selected.about}</p><section className="nearby-place-reason"><strong>Почему вам может понравиться</strong><p>{nearbyReason(selected)}</p></section><a className="nearby-source" href={selected.source} target="_blank" rel="noreferrer">Информация о месте в 2ГИС<Icon name="chevron-right" size={16} inheritColor/></a><Button dismissOnly onClick={()=>setSelected(undefined)}>Понятно</Button></>}</div></BottomSheet></>;
}
