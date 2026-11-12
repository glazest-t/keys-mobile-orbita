import type {ReactNode,Dispatch,SetStateAction} from 'react';
import type {BookingQuote} from '../../../prototype/domain/booking.mjs';
import {formatMoney,type Draft,type Booking,type Commerce} from './model';
import {bookingCostLines,bookingPaymentView} from './bookingPaymentView';
import {BookingPaymentStatus} from './BookingPaymentStatus';
import {StatusBadge} from '../ui';
import './payment-summary.css';

export function MoneyRow({label,amount,detail,tone='',children}:{label:string;amount?:number;detail?:string;tone?:string;children?:ReactNode}){
 return <div className={'payment-summary-row '+tone}><span>{label}{detail&&<small>{detail}</small>}</span><strong>{children??formatMoney(amount||0)}</strong></div>;
}
function CostLines({draft,quote,headings=true}:{draft:Draft;quote:BookingQuote;headings?:boolean}){
 const {price,services}=bookingCostLines(draft,quote);
 return <><section className="payment-summary-group">{headings&&<h3>Стоимость</h3>}<MoneyRow label={`Проживание за ${quote.nights} ${quote.nights%10===1&&quote.nights%100!==11?'ночь':quote.nights%10>=2&&quote.nights%10<=4&&(quote.nights%100<12||quote.nights%100>14)?'ночи':'ночей'}`} amount={price.baseMinor}/>{services.map(s=><MoneyRow key={s.id} label={s.title} detail={s.detail} amount={s.amount}/>)}</section>
 {price.discountMinor>0&&<section className="payment-summary-group">{headings&&<h3>Скидки</h3>}<MoneyRow label={price.friendly?`Friendly Rate · −${price.percent}%`:`Скидка на проживание · −${price.percent}%`} amount={-price.discountMinor} tone="saving"/></section>}
 <MoneyRow label="Итого по брони" amount={quote.orderTotalMinor} tone="subtotal"/></>;
}
function PointsLines({quote,extra=0,confirmed=false}:{quote:BookingQuote;extra?:number;confirmed?:boolean}){
 if(!quote.applied.pointsMinor&&!extra)return null;
 return <section className="payment-summary-group">{!confirmed&&<h3>Оплата баллами</h3>}
 {quote.applied.hotelPoints>0&&<MoneyRow label={confirmed?'Списано баллов отеля':'Баллы отеля'} amount={-quote.applied.hotelPoints*100} tone="saving"/>}
 {quote.applied.keysPoints>0&&<MoneyRow label={confirmed?'Списано баллов «Ключей»':'Баллы «Ключей»'} amount={-quote.applied.keysPoints*100} tone="saving"/>}
 {extra>0&&<MoneyRow label="Баллы за услуги вне брони" amount={-extra} tone="saving"/>}
 {!confirmed&&<p className="payment-summary-note">1 балл = 1 ₽</p>}</section>;
}
export function PaymentSchedule({draft,quote}:{draft:Draft;quote:BookingQuote}){
 const now=quote.paymentSchedule?.nowMinor??(draft.method==='at_hotel'?0:quote.cashDueMinor),later=quote.cashDueMinor-now;
 return <section className="payment-summary-settlement" aria-label="Когда платить"><MoneyRow label="Сейчас к оплате" amount={now} tone="total"/>{later>0&&<MoneyRow label="При заселении" amount={later}/>}{now===0&&later>0&&<p className="payment-summary-note">При бронировании ничего не списываем.</p>}{quote.cashDueMinor===0&&<p className="payment-summary-note">Стоимость полностью покрыта баллами.</p>}</section>;
}
export function DraftPaymentSummary({draft,quote,pointsControl,showSettlement=true}:{draft:Draft;quote:BookingQuote;pointsControl?:ReactNode;showSettlement?:boolean}){
 return <div className="payment-summary"><CostLines draft={draft} quote={quote}/>{pointsControl}<PointsLines quote={quote}/>
 {quote.applied.pointsMinor>0&&<MoneyRow label="Итого деньгами" amount={quote.cashDueMinor} tone="subtotal"/>}
 {showSettlement&&<PaymentSchedule draft={draft} quote={quote}/>}
 <p className="payment-summary-note">Налоги и сборы включены</p></div>;
}
export function BookingPaymentSummary({booking:b,commerce,setCommerce,failNext,onPaymentAttempt,children}:{booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;failNext?:boolean;onPaymentAttempt?:()=>void;children?:ReactNode}){
 const v=bookingPaymentView(b),q=b.quote;
 return <section className="booking-payment-card"><header><h2>Оплата бронирования</h2>{!v.cancelled&&<StatusBadge tone={v.due?'warning':'success'} icon={v.due?'pending':'check'}>{v.status}</StatusBadge>}</header>
 <div className="payment-summary"><CostLines draft={b.draft} quote={q} headings={false}/>
 {v.groups.length>0&&<section className="payment-summary-group"><h3>Услуги вне брони</h3>{v.groups.map(s=><MoneyRow key={s.id} label={s.title} detail={s.status} amount={s.amount}/>)}{!v.cancelled&&v.serviceRefunds.cash>0&&<MoneyRow label="Возвращено за отменённые услуги" amount={v.serviceRefunds.cash}/>} {!v.cancelled&&v.serviceRefunds.points>0&&<MoneyRow label="Возвращено баллов за услуги">{(v.serviceRefunds.points/100).toLocaleString('ru-RU')} баллов</MoneyRow>}{v.retained>0&&<MoneyRow label="Удержано за отмену услуг" amount={v.retained}/>}{v.groups.some(g=>["Ждёт подтверждения","Нужна проверка","Отменено","Отклонено"].includes(g.status))&&<p className="payment-summary-note">В итог входят только подтверждённые услуги и удержания за отмену.</p>}</section>}
 {v.serviceTotal>0&&!v.cancelled&&<MoneyRow label="Всего с услугами" amount={v.total} tone="subtotal"/>}
 <PointsLines quote={q} extra={v.servicePoints} confirmed/>
 {v.cancelled?<section className="payment-summary-settlement"><h3>Возврат и удержание</h3><MoneyRow label="Возврат денег" amount={v.refundCash}/>{!!v.returnedPoints&&<MoneyRow label="Возврат баллов">{(v.returnedPoints/100).toLocaleString('ru-RU')} баллов</MoneyRow>}<MoneyRow label="Удержано" amount={v.penalty}/>{v.due>0&&<MoneyRow label="Осталось оплатить" amount={v.due} tone="total"/>}</section>:<>
 {v.points>0&&<MoneyRow label="Итого деньгами" amount={v.total-v.points} tone="subtotal"/>}
 <section className="payment-summary-settlement"><MoneyRow label="Уже оплачено деньгами" amount={v.cash}/><MoneyRow label="Осталось оплатить" amount={v.due} detail={v.due>0&&v.serviceDue===0?(b.stay?"В отеле":"При заселении"):undefined} tone={v.due>0?"total":""}/>
 {v.due>0&&<>{v.serviceDue>0&&b.operation.dueAtHotelMinor>0&&<MoneyRow label="По бронированию" detail={b.stay?'В отеле':'При заселении'} amount={b.operation.dueAtHotelMinor}/>} {v.serviceDue>0&&<MoneyRow label="За услуги вне брони" detail={b.stay?'В отеле при выезде':'По условиям услуг'} amount={v.serviceDue}/>}</>}
 {b.operation.dueAtHotelMinor>0&&<BookingPaymentStatus hideStatus booking={b} commerce={commerce} setCommerce={setCommerce} failNext={failNext} onPaymentAttempt={onPaymentAttempt} linkLabel="Оплатить остаток брони"/>}
 </section></>}
 <p className="payment-summary-note">Налоги и сборы включены</p></div>{children}</section>;
}
