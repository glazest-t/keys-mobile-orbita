import {Button,Icon} from '../ui';
import {formatMoney,type Commerce} from '../booking/model';
import {roomVisual} from '../booking/roomVisuals';
import {finderRoomOffers,type FinderTrip} from './model';
const nightsLabel=(n:number)=>`${n} ${n%10===1&&n%100!==11?'ночь':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'ночи':'ночей'}`;
export function FinderRooms({commerce,owner,hotelId,trip,onChoose}:{commerce:Commerce;owner:string;hotelId:string;trip:FinderTrip;onChoose:(rateId:string)=>void}){
 const offers=finderRoomOffers(commerce,owner,hotelId,trip);
 if(!offers.length)return null;
 return <div className="finder-rooms" aria-label="Номера в отеле">
  {offers.map(({room,rate,quote,nightlyMinor})=><section className="finder-room" key={room.id} data-room-id={room.id} data-rate-id={rate.id}>
   <div className="finder-room-heading"><span className="icon-tile"><Icon name="bed" size={20}/></span><div><h3>{room.title}</h3><p>{roomVisual(room.id).area} м² · до {room.maxGuests} гостей</p></div></div>
   <div className="finder-room-bottom"><div className="finder-room-price"><strong>{quote?'':'от '}{formatMoney(quote?.lodgingMinor??nightlyMinor)}</strong><small>{quote?`за ${nightsLabel(quote.nights)}`:'за ночь · ориентир'}</small></div><Button variant={!trip.datesSet?'primary':'secondary'} onClick={()=>onChoose(rate.id)} aria-label={`${quote?'Забронировать':'Уточнить стоимость'} · ${room.title}`}>{quote?'Забронировать':!trip.datesSet?'Выбрать даты':'Указать гостей'}</Button></div>
  </section>)}
 </div>;
}
