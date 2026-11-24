import type {HotelLoyaltySnapshot} from '../rewards/loyalty';
import type {ReactNode} from 'react';
import type {BookingQuote} from '../../../prototype/domain/booking.mjs';
import {Button,Icon} from '../ui';
import {usePrototypeCopy} from '../usePrototypeText';
import {BookingLegal} from './BookingLegal';
import {BookingReward} from './BookingReward';
import {bookingPayment} from './bookingPayment';
import {catalog,formatMoney,type Draft} from './model';
import {cancellationPolicyFor,cancellationSummary,cancellationTerms,policyPenalty} from './bookingCancellation';
import './checkout-review.css';

export function CheckoutReview({draft,quote,price,busy,error,onPay,hotelLoyalty}:{hotelLoyalty?:HotelLoyaltySnapshot;draft:Draft;quote?:BookingQuote;price:ReactNode;busy:boolean;error:string;onPay:()=>void}){
 const policy=cancellationPolicyFor(draft);
 const terms=cancellationTerms(draft.search.checkIn,policy);
 const heading=usePrototypeCopy(terms[0],cancellationSummary(draft.search.checkIn,policy));
 const penalty=quote?policyPenalty(quote.lodgingMinor,quote.nights,policy):0;
 const shortPenalty=policy.penalty.kind==='none'?'Без удержаний.':quote?`При отмене позже — ${formatMoney(penalty)}${policy.penalty.kind==='first_night'?' за первую ночь':''}.`:terms[1];
 const penaltyText=usePrototypeCopy(terms[1]??'',shortPenalty);
 const schedule=quote&&(quote.paymentSchedule??bookingPayment(quote,draft));
 const now=schedule?.nowMinor??0,later=schedule?.laterMinor??0;
 const actionLabel=draft.method==='at_hotel'||now===0?'Подтвердить бронь':'Оплатить';
 const hotel=catalog.hotels.find(item=>item.id===draft.hotelId)!;
 return <div className="checkout-review">
  <section className="checkout-cost-card" aria-label="Стоимость и баллы">
   <details className="checkout-cost-details" open>
    <summary><span><strong>Расчёт стоимости</strong></span><span className="checkout-cost-arrow"><Icon name="chevron-down" size={20} inheritColor/></span></summary>
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
  <BookingLegal actionLabel={actionLabel}>
   {error&&<p className="booking-error" role="alert">{error}</p>}
   {later>0&&<dl className="checkout-payment-split" aria-label="Когда платить">
    <div><dt>Сейчас к оплате</dt><dd>{formatMoney(now)}</dd></div>
    <div><dt>При заселении</dt><dd>{formatMoney(later)}</dd></div>
   </dl>}
   <Button className="checkout-pay-button" busy={busy} disabled={!quote} onClick={onPay}>
    <span>{actionLabel}{actionLabel==='Оплатить'&&<> · <strong className="checkout-pay-amount">{formatMoney(now)}</strong></>}</span>
   </Button>
  </BookingLegal>
 </div>;
}
