import type {ReactNode} from 'react';
import {catalog,formatMoney} from '../booking/model';
import {cityCenter,hotelLocation,hotelSearchCoordinates} from './locations';
import {TwoGisMap} from './TwoGisMap';
export function HotelMap({items,selected,onSelect,onHover,onPreviewDismiss,onVisibleChange,preview,interactive=true,expanded=false,city,includeDemoLocations=false}:{items:{id:string;price?:number;label?:string;discountPercent?:number}[];selected?:string;onSelect?:(id:string)=>void;onHover?:(id:string)=>void;onPreviewDismiss?:()=>void;onVisibleChange?:(ids:string[])=>void;preview?:ReactNode;interactive?:boolean;expanded?:boolean;city?:string;includeDemoLocations?:boolean}){
 const points=items.flatMap(item=>{const coordinates=includeDemoLocations?hotelSearchCoordinates(item.id):hotelLocation(item.id)?.coordinates,hotel=catalog.hotels.find(h=>h.id===item.id);return coordinates&&hotel?[{id:item.id,coordinates,name:hotel.name,discountPercent:item.discountPercent,label:item.label??(item.price===undefined?hotel.name:formatMoney(item.price))}]:[];});
 return <TwoGisMap points={points} selected={selected} onSelect={onSelect} onHover={onHover} onPreviewDismiss={onPreviewDismiss} onVisibleChange={onVisibleChange} preview={preview} center={cityCenter(city||catalog.hotels.find(h=>h.id===items[0]?.id)?.city||'Москва')} interactive={interactive} expanded={expanded} missing={items.length-points.length}/>;
}
