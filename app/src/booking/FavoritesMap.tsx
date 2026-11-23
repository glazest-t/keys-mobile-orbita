import {novemberEditorialText} from '../../../prototype/domain/novemberEditorialText.mjs';
import {HotelMap} from '../maps/HotelMap';
import {hotelLocation} from '../maps/locations';
import {RatingBadge} from './RatingBadge';
import {useState} from 'react';
import {Button,Icon,IconButton} from '../ui';
import {formatMoney,type Search} from './model';
import {compactDates} from './FindPage';
import {guestCountLabel} from './search';
import {hotelVisual} from './presentation';
import {type favoriteOffers} from './favorites';

type Props={initialSelected?:string;name:string;search:Search;items:ReturnType<typeof favoriteOffers>;onClose:()=>void;onOpen:(id:string)=>void;onDates:()=>void};
/** Only geolocated hotels from the current saved list are shown. */
export function FavoritesMap({initialSelected,name,search,items,onClose,onOpen,onDates}:Props){
 const [selected,setSelected]=useState(initialSelected||items[0]?.hotel.id);
 const current=items.find(item=>item.hotel.id===selected&&hotelLocation(item.hotel.id))||items.find(item=>hotelLocation(item.hotel.id));
 return <section className="expanded-results-map favorite-map" aria-label={'Карта подборки «'+name+'»'}>
  <HotelMap items={items.map(({hotel,quote})=>({id:hotel.id,price:quote?.cashDueMinor,discountPercent:quote?.baseLodgingMinor?Math.round(quote.hotelDiscountMinor/quote.baseLodgingMinor*100):0,label:quote?undefined:"Нет номеров"}))} city={search.city} selected={current?.hotel.id} onSelect={setSelected} expanded/>
  <header><IconButton outline name="back" label={novemberEditorialText("Т-0844", "Назад к подборке", "Назад")} onClick={onClose}/><div className="favorite-map-heading"><strong>{name}</strong><small>{compactDates(search)} · {guestCountLabel(search)}</small></div></header>
  <div className="map-selection"><button className="map-list-button" onClick={onClose}><Icon outline name="menu" size={16} inheritColor/>Списком</button>
   {current?<button className="map-hotel-card" onClick={()=>current.quote?onOpen(current.hotel.id):onDates()}><img src={hotelVisual(current.hotel.id).photos[0]} alt={current.hotel.name}/><span><strong>{current.hotel.name}</strong><small>{current.hotel.city} · {hotelVisual(current.hotel.id).distance}</small><span className="map-card-rating"><RatingBadge value={hotelVisual(current.hotel.id).rating}/><small>{hotelVisual(current.hotel.id).reviews} отзывов</small></span>{current.quote?<strong className="map-card-price">{formatMoney(current.quote.cashDueMinor)}</strong>:<span className="favorite-unavailable">Нет номеров</span>}</span></button>:<div className="map-empty"><h2>{items.length?novemberEditorialText("Т-0848", "Координаты отелей уточняются", "Уточняем координаты"):novemberEditorialText("Т-0849", "В подборке пока нет отелей", "В подборке пока пусто")}</h2><Button variant="secondary" onClick={onClose}>{novemberEditorialText("Т-0850", "К подборке", "Открыть подборку")}</Button></div>}
  </div>
 </section>;
}
