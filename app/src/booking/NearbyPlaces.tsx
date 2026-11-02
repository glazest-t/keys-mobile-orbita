import {useState,type ReactNode} from 'react';
import {BottomSheet,MobileScroll} from '../mobile';
import {Button,Icon} from '../ui';
import {catalog} from './model';
import {filterNearbyPlaces,nearbyPlace,nearbyPlaces,nearbyPhoto,nearbyIllustration,nearbyReason,nearbyJourney,type NearbyCategory,type NearbyPlace} from './nearby';
import {TwoGisMap} from '../maps/TwoGisMap';
import {hotelLocation,type Coordinates} from '../maps/locations';
import './nearby.css';

function PlacePhoto({place,large=false}:{place:NearbyPlace;large?:boolean}){
 const [failed,setFailed]=useState(false),photo=failed?nearbyIllustration(place):nearbyPhoto(place.id)||nearbyIllustration(place);
 return <figure className={large?'nearby-place-photo':'nearby-place-thumb'}><img src={photo.url} alt={photo.illustrative?`Иллюстрация: ${place.categoryLabel}`:place.name} draggable={false} loading="lazy" onError={()=>{if(!photo.illustrative)setFailed(true);}}/>{large&&<figcaption>{photo.source?<a href={photo.source} target="_blank" rel="noreferrer">{photo.credit}</a>:photo.credit}</figcaption>}</figure>;
}

export function NearbyPreview({hotelId,onOpen}:{hotelId:string;onOpen:(id?:string)=>void}){
 const places=nearbyPlaces(hotelId).slice(0,2);
 return <section className="stay-nearby"><header><h2>Рядом с вами</h2><button className="text-action" onClick={()=>onOpen()}>Все</button></header>{places.length?places.map(p=><button className="stay-nearby-row k-list-row" key={p.id} onClick={()=>onOpen(p.id)}><span className="icon-tile"><Icon name={p.icon} size={18} inheritColor/></span><span><strong>{p.name}</strong><small>{nearbyJourney(p)}</small></span></button>):<p>Места рядом с отелем пока не добавлены</p>}</section>;
}

export function NearbyPlaces({hotelId,initialPlaceId,header}:{header?:ReactNode;hotelId:string;initialPlaceId?:string}){
 const initial=nearbyPlace(hotelId,initialPlaceId),hotel=catalog.hotels.find(h=>h.id===hotelId),location=hotelLocation(hotelId);
 const [category,setCategory]=useState<NearbyCategory>(initial?.category||'Всё'),[selected,setSelected]=useState<NearbyPlace|undefined>(initial);
 const all=nearbyPlaces(hotelId),places=filterNearbyPlaces(hotelId,category);
 const categories=(['Всё','Культура','Музеи','Прогулки'] as NearbyCategory[]).filter(c=>c==='Всё'||all.some(p=>p.category===c));
 const points=[...(location?[{id:hotelId,coordinates:location.coordinates,label:'Отель',name:hotel?.name||'Ваш отель'}]:[]),...places.map((p,i)=>{
  const same=places.filter(other=>other.coordinates.join(',')===p.coordinates.join(','));
  return {id:p.id,coordinates:p.coordinates,label:String(i+1),name:p.name,markerOffset:[(same.findIndex(other=>other.id===p.id)-(same.length-1)/2)*42,0]};
 })];
 return <><MobileScroll className="detail-scroll nearby page-scroll">{header}<main className="detail-content detail-nearby">
 {all.length>0&&<>{location&&<div className="nearby-live-map" role="group" aria-label="Места в радиусе 1,5 км от отеля"><TwoGisMap center={location.coordinates as Coordinates} points={points} selected={selected?.id||hotelId} onSelect={id=>{const p=nearbyPlace(hotelId,id);if(p)setSelected(p);}} label="Отель и места рядом"/></div>}
 <p className="nearby-radius">В радиусе 1,5 км от отеля</p>
 <div className="detail-segments" aria-label="Категории мест">{categories.map(c=><button key={c} className={category===c?'active':''} aria-pressed={category===c} onClick={()=>{setCategory(c);setSelected(undefined);}}>{c}</button>)}</div></>}
 {places.length?<section className="nearby-real-places">{places.map(p=><button className="nearby-place-row" key={p.id} onClick={()=>setSelected(p)}><PlacePhoto place={p}/><span className="nearby-place-copy"><small>{p.categoryLabel}</small><strong>{p.name}</strong><span className="nearby-place-distance">{nearbyJourney(p)}</span></span></button>)}</section>:<div className="nearby-empty"><Icon name="pin" size={32}/><h2>{location?'Пока нет мест поблизости':'Места рядом пока не добавлены'}</h2><p>{hotel?.name}</p></div>}
 </main></MobileScroll>
 <BottomSheet open={!!selected} onOpenChange={v=>{if(!v)setSelected(undefined);}} title={selected?.name||'Место рядом'} snap={.86}><div className="sheet-body nearby-place-sheet">{selected&&<><PlacePhoto key={selected.id} place={selected} large/><div className="nearby-place-meta"><span className="icon-tile"><Icon name={selected.icon} size={24} inheritColor/></span><span><strong>{selected.categoryLabel}</strong><small>{nearbyJourney(selected)}</small></span></div><p>{selected.about}</p><section className="nearby-place-reason"><strong>Почему вам может понравиться</strong><p>{nearbyReason(selected)}</p></section><a className="nearby-source" href={selected.source} target="_blank" rel="noreferrer">Информация о месте в 2ГИС<Icon name="chevron-right" size={16} inheritColor/></a><Button onClick={()=>setSelected(undefined)}>Понятно</Button></>}</div></BottomSheet></>;
}
