import type {BookingQuote} from '../../../prototype/domain/booking.mjs';
import {ratePrice} from './friendlyRate';
import {formatMoney} from './model';

export function HotelCardPrice({quote,nightly=false}:{quote:BookingQuote;nightly?:boolean}){
 const {friendly,baseMinor,discountMinor,percent}=ratePrice(quote);
 const displayAmount=(amount:number)=>formatMoney(nightly?Math.round(amount/quote.nights):amount);
 const currentMinor=nightly?quote.lodgingMinor:quote.cashDueMinor;
 return <span className="discovery-price">
  {discountMinor>0&&<s>{displayAmount(baseMinor)}</s>}
  <strong>{displayAmount(currentMinor)}</strong>
  {discountMinor>0&&<b className={friendly?'friendly-discount':undefined}>−{percent}%</b>}
  {nightly&&<small className="hotel-card-nightly-label">за ночь</small>}
 </span>;
}
