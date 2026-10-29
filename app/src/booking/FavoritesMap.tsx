import {useState} from 'react';
import {Button,Icon,IconButton} from '../ui';
import {formatMoney,type Search} from './model';
import {compactDates} from './FindPage';
import {guestCountLabel} from './search';
import {hotelVisual} from './presentation';
import {type favoriteOffers} from './favorites';

type Props={initialSelected?:string;name:string;search:Search;items:ReturnType<typeof favoriteOffers>;onClose:()=>void;onOpen:(id:string)=>void;onDates:()=>void};
/** Same local schematic map as c2. Only the current list's saved hotels are shown. */
export function FavoritesMap({initialSelected,name,search,items,onClose,onOpen,onDates}:Props){
 const [selected,setSelected]=useState(initialSelected||items[0]?.hotel.id);
 const current=items.find(item=>item.hotel.id===selected)||items[0];
 return <section className="expanded-results-map favorite-map" aria-label={'Карта подборки «'+name+'»'}>
  <div className="c2-roads" aria-hidden="true"><i/><i/></div>
  <header><IconButton name="back" label="Назад к подборке" onClick={onClose}/><div className="favorite-map-heading"><strong>{name}</strong><small>{compactDates(search)} · {guestCountLabel(search)}</small></div></header>
  <div className="favorite-map-markers">{items.map(({hotel,quote},index)=><button key={hotel.id} className={'favorite-map-marker '+(current?.hotel.id===hotel.id?'selected':'')+(quote?'':' unavailable')} style={{left:`${index%2===0?24:70}%`,top:`${18+Math.floor(index/2)*28}%`}} aria-label={hotel.name+' · '+(quote?formatMoney(quote.cashDueMinor):'Нет номеров')} aria-pressed={current?.hotel.id===hotel.id} onClick={()=>setSelected(hotel.id)}>{quote?formatMoney(quote.cashDueMinor):<><Icon name="pin" size={14} inheritColor/>Нет номеров</>}</button>)}</div>
  <div className="map-selection"><button className="map-list-button" onClick={onClose}><Icon name="menu" size={16}/>Списком</button>
   {current?<button className="map-hotel-card" onClick={()=>current.quote?onOpen(current.hotel.id):onDates()}><img src={hotelVisual(current.hotel.id).photos[0]} alt={current.hotel.name}/><span><strong>{current.hotel.name}</strong><small>{current.hotel.city} · {hotelVisual(current.hotel.id).distance}</small><span className="map-card-rating"><b>{hotelVisual(current.hotel.id).rating.toLocaleString('ru-RU')}</b><small>{hotelVisual(current.hotel.id).reviews} отзывов</small></span>{current.quote?<strong className="map-card-price">{formatMoney(current.quote.cashDueMinor)}</strong>:<span className="favorite-unavailable">Нет номеров</span>}</span></button>:<div className="map-empty"><h2>В подборке пока нет отелей</h2><Button variant="secondary" onClick={onClose}>К подборке</Button></div>}
  </div>
 </section>;
}
