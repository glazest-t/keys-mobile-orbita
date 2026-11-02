import {catalog,formatMoney} from '../booking/model';
import {cityCenter,hotelLocation} from './locations';
import {TwoGisMap} from './TwoGisMap';
export function HotelMap({items,selected,onSelect,interactive=true,expanded=false,city}:{items:{id:string;price?:number;label?:string}[];selected?:string;onSelect?:(id:string)=>void;interactive?:boolean;expanded?:boolean;city?:string}){
 const points=items.flatMap(item=>{const location=hotelLocation(item.id),hotel=catalog.hotels.find(h=>h.id===item.id);return location&&hotel?[{id:item.id,coordinates:location.coordinates,name:hotel.name,label:item.label??(item.price===undefined?hotel.name:formatMoney(item.price))}]:[];});
 return <TwoGisMap points={points} selected={selected} onSelect={onSelect} center={cityCenter(city||catalog.hotels.find(h=>h.id===items[0]?.id)?.city||'Москва')} interactive={interactive} expanded={expanded} missing={items.length-points.length}/>;
}
