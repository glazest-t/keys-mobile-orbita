import type {HotelLoyaltySnapshot} from '../rewards/loyalty';
import type {ReactNode} from 'react';
import type {BookingQuote} from '../../../prototype/domain/booking.mjs';
import {Button,Icon} from '../ui';
import {usePrototypeCopy} from '../usePrototypeText';
import {BookingLegal} from './BookingLegal';
import {BookingReward} from './BookingReward';
import {catalog,formatMoney,type Draft} from './model';
import {cancellationPolicyFor,cancellationSummary,cancellationTerms,policyPenalty} from './bookingCancellation';
import './checkout-review.css';

export function CheckoutReview({draft,quote,price,busy,error,onPay,onChange,hotelLoyalty}:{hotelLoyalty?:HotelLoyaltySnapshot;draft:Draft;quote?:BookingQuote;price:ReactNode;busy:boolean;error:string;onPay:()=>void;onChange:(patch:Partial<Draft>)=>void}){
 const policy=cancellationPolicyFor(draft);
 const terms=cancellationTerms(draft.search.checkIn,policy);
 const heading=usePrototypeCopy(terms[0],cancellationSummary(draft.search.checkIn,policy));
 const penalty=quote?policyPenalty(quote.lodgingMinor,quote.nights,policy):0;
 const shortPenalty=policy.penalty.kind==='none'?'Без удержаний.':quote?`При отмене позже — ${formatMoney(penalty)}${policy.penalty.kind==='first_night'?' за первую ночь':''}.`:terms[1];
 const penaltyText=usePrototypeCopy(terms[1]??'',shortPenalty);
 const now=quote?.paymentSchedule?.nowMinor??(draft.method==='at_hotel'?0:quote?.cashDueMinor??0);
 const later=quote?.paymentSchedule?.laterMinor??(draft.method==='at_hotel'?quote?.cashDueMinor??0:0);
 const actionLabel=draft.method==='at_hotel'||now===0?'Подтвердить бронь':'Оплатить';
 const hotel=catalog.hotels.find(item=>item.id===draft.hotelId)!;
 return <div className="checkout-review">
  <section className="checkout-cost-card" aria-label="Стоимость и баллы">
   <details className="checkout-cost-details">
    <summary><span><strong>Расчёт стоимости</strong><small>Налоги и сборы включены</small></span><span className="checkout-cost-arrow"><Icon name="chevron-down" size={20} inheritColor/></span></summary>
    <div className="checkout-cost-expanded">{price}</div>
   </details>
   {quote&&<BookingReward quote={quote} hotelLoyalty={hotelLoyalty}/>}
  </section>
  <section className="checkout-cancellation" aria-label="Условия отмены и проживания">
   <Icon name="info" size={20} inheritColor/>
   <div><strong>{heading}</strong>{penaltyText&&<p>{penaltyText}</p>}
    <details className="checkout-hotel-rules"><summary>Правила гостиницы <Icon name="chevron-down" size={16} inheritColor/></summary><div><p>Заезд с {hotel.checkInTime} · Выезд до {hotel.checkOutTime}</p>{terms.map(term=><p key={term}>{term}</p>)}</div></details>
   </div>
  </section>
  <BookingLegal draft={draft} onChange={onChange} actionLabel={actionLabel}>
   {error&&<p className="booking-error" role="alert">{error}</p>}
   {later>0&&<p className="checkout-pay-later">При заселении <strong>{formatMoney(later)}</strong></p>}
   <Button busy={busy} disabled={!quote} onClick={onPay}>{actionLabel}{actionLabel==='Оплатить'?` · ${formatMoney(now)}`:''}</Button>
  </BookingLegal>
 </div>;
}
