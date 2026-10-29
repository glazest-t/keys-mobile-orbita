import {useState,type ReactNode} from 'react';
import {BottomSheet,MobileScroll} from '../mobile';
import {Button,Icon} from '../ui';
import {catalog} from './model';
import {filterNearbyPlaces,nearbyPlace,nearbyPlaces,type NearbyCategory,type NearbyPlace} from './nearby';
import mapArt from './art/nearby-map-base.html?raw';
import './nearby.css';

export function NearbyPreview({hotelId,onOpen}:{hotelId:string;onOpen:(id?:string)=>void}){
 const places=nearbyPlaces(hotelId).slice(0,2);
 return <section className="stay-nearby"><header><h2>Рядом с вами</h2><button className="text-action" onClick={()=>onOpen()}>Все</button></header>{places.length?places.map(p=><button className="stay-nearby-row k-list-row" key={p.id} onClick={()=>onOpen(p.id)}><span className="icon-tile"><Icon name={p.icon} size={18} inheritColor/></span><span><strong>{p.name}</strong><small>{p.description} · {p.distance}</small></span></button>):<p>Места рядом с отелем пока не добавлены</p>}</section>;
}

export function NearbyPlaces({hotelId,initialPlaceId,header}:{header?:ReactNode;hotelId:string;initialPlaceId?:string}){
 const initial=nearbyPlace(hotelId,initialPlaceId),hotel=catalog.hotels.find(h=>h.id===hotelId)!;
 const [category,setCategory]=useState<NearbyCategory>(initial?.category||'Всё'),[selected,setSelected]=useState<NearbyPlace|undefined>(initial);
 const places=filterNearbyPlaces(hotelId,category);
 const open=(p:NearbyPlace)=>{setSelected(p);};
 return <><MobileScroll className="detail-scroll nearby page-scroll">{header}<main className="detail-content detail-nearby">
 {nearbyPlaces(hotelId).length>0&&<><div className="nearby-live-map" role="group" aria-label="Места рядом с отелем на схеме"><div className="nearby-base" aria-hidden="true" dangerouslySetInnerHTML={{__html:mapArt}}/><span className="nearby-hotel-dot" aria-label={hotel.name}/>{places.map(p=><button key={p.id} className={'nearby-marker '+(selected?.id===p.id?'selected':'')} style={{left:p.x+'%',top:p.y+'%'}} aria-label={p.name+' на карте'} aria-pressed={selected?.id===p.id} onClick={()=>open(p)}><Icon name={p.icon} size={16} inheritColor/></button>)}</div>
 <div className="detail-segments" aria-label="Категории мест">{(['Всё','Еда','Пляж','Культура'] as const).map(c=><button key={c} className={category===c?'active':''} aria-pressed={category===c} onClick={()=>{setCategory(c);setSelected(undefined);}}>{c}</button>)}</div></>}
 {places.length?<section className="nearby-places">{places.map(p=><button className="k-list-row" key={p.id} onClick={()=>open(p)}><span className="icon-tile"><Icon name={p.icon} size={22} inheritColor/></span><span><strong>{p.name}</strong><small>{p.description}</small></span><span><small>{p.distance}</small></span></button>)}</section>:<div className="nearby-empty"><Icon name="pin" size={32}/><h2>Места рядом пока не добавлены</h2><p>{hotel.name}</p></div>}
 </main></MobileScroll>
 <BottomSheet open={!!selected} onOpenChange={v=>{if(!v)setSelected(undefined);}} title={selected?.name||'Место рядом'} snap={.86}><div className="sheet-body nearby-place-sheet">{selected&&<><figure className="nearby-place-photo"><img src={selected.photo} alt={selected.name} draggable={false}/>{selected.photoCredit&&<figcaption><a href={selected.photoSource} target="_blank" rel="noreferrer">{selected.photoCredit}</a></figcaption>}</figure><div className="nearby-place-meta"><span className="icon-tile"><Icon name={selected.icon} size={24} inheritColor/></span><span><strong>{selected.category} · {selected.distance}</strong><small>≈ {selected.minutes} мин пешком от отеля</small></span></div><p>{selected.about}</p><section className="nearby-place-reason"><strong>Почему стоит зайти</strong><p>{selected.reason}</p></section><div className="nearby-visit"><span>На посещение</span><strong>{selected.visit}</strong></div><Button onClick={()=>setSelected(undefined)}>Понятно</Button></>}</div></BottomSheet></>;
}
