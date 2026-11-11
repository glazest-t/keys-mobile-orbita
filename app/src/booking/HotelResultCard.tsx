import type {Dispatch,SetStateAction,ReactNode} from 'react';
import type {BookingQuote} from '../../../prototype/domain/booking.mjs';
import {catalog,formatMoney,type Commerce} from './model';
import {hotelVisual} from './presentation';
import {HotelCardPhotos} from './HotelCardPhotos';
import {SavedButton} from './SavedHotelButton';
import {toggleFavorite} from './FavoriteSaving';
import {RatingBadge} from './RatingBadge';
import {FriendlyRateBadge} from '../hotelier/FriendlyRateBadge';
import {ratePrice} from './friendlyRate';
import {Icon} from '../ui';

/** Shared search-result card: assistant results use the same photos, favorite action, rating and price. */
export function HotelResultCard({hotelId,quote:q,commerce,owner,setCommerce,onOpen,startingNightlyMinor,details}:{hotelId:string;quote?:BookingQuote;commerce:Commerce;owner:string|null;setCommerce:Dispatch<SetStateAction<Commerce>>;onOpen:()=>void;startingNightlyMinor?:number;details?:ReactNode}){
 const h=catalog.hotels.find(h=>h.id===hotelId);if(!h)return null;const v=hotelVisual(h.id);
 return <article className="hotel-list-card" data-hotel-id={h.id}>
  <div className="discovery-photo"><HotelCardPhotos name={h.name} photos={v.photos} onOpen={onOpen}/><SavedButton hotelId={h.id} saved={!!commerce.savedHotels?.[owner||'guest']?.includes(h.id)} onClick={()=>setCommerce(s=>toggleFavorite(s,owner,h.id))}/></div>
  <button className="hotel-list-card-info" onClick={onOpen}><h2>{h.name}</h2>{q&&<div className="discovery-price"><strong>{formatMoney(q.cashDueMinor)}</strong>{ratePrice(q).friendly?<FriendlyRateBadge percent={ratePrice(q).percent}/>:q.hotelDiscountMinor>0&&<><s>{formatMoney(q.baseLodgingMinor)}</s><b>−{Math.round(q.hotelDiscountMinor/q.baseLodgingMinor*100)}%</b></>}</div>}{!q&&startingNightlyMinor!==undefined&&<div className="discovery-price"><strong>от {formatMoney(startingNightlyMinor)}</strong><small className="hotel-starting-price-note">за ночь · ориентир</small></div>}<p><Icon name="pin" size={14}/>{h.city} · {v.distance}</p><div className="discovery-rating"><RatingBadge value={v.rating}/><span>{v.reviews} отзывов</span></div></button>
  {details}
 </article>;
}
