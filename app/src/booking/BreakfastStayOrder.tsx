import {tripEditorialText} from '../../../prototype/domain/tripEditorialText.mjs';
import {useState,type Dispatch,type SetStateAction} from 'react';
import {ServiceSheet} from './ServiceSheet';
import {ServiceDetailIntro} from './ServiceDetailIntro';
import {ServiceHotelPaymentNote} from './ServiceHotelPaymentNote';
import {Button,StatusBadge} from '../ui';
import {DialogActions} from '../dialogActions';
import {formatMoney,type Booking,type Commerce} from './model';
import {requestStatus} from './serviceRequests';
import {breakfastVenue} from './breakfastVenue';
import {serviceCancellationAvailability} from './serviceLifecycle';
import {cancelPaidService,serviceCancellation} from './serviceSettlement';
import {stayNow} from './stay';
export function buffetOrders(b:Booking){return (b.serviceRequests||[]).filter(r=>r.kind==='breakfast'&&(r.mode||'buffet')==='buffet'&&!['cancelled','declined'].includes(requestStatus(b,r))).sort((a,b)=>a.date.localeCompare(b.date));}
export function buffetPeriod(rows:ReturnType<typeof buffetOrders>){const label=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'});return rows.length?label(rows[0].date)+(rows.length>1?' — '+label(rows[rows.length-1].date):''):'';}
export function BreakfastStayOrder({booking:b,commerce,setCommerce,onClose,onCancelled}:{booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;onClose:()=>void;onCancelled:()=>void}){
 const [cancelling,setCancelling]=useState(false),[error,setError]=useState(''),rows=buffetOrders(b),venue=breakfastVenue(b.draft.hotelId),total=rows.reduce((sum,r)=>sum+r.amountMinor,0),unpaid=rows.filter(r=>r.settlement==='at_hotel'&&!r.operation).reduce((sum,r)=>sum+r.amountMinor,0),cancelable=rows.filter(r=>serviceCancellationAvailability(b,r).allowed);
 const refunds=cancelable.filter(r=>r.operation).map(r=>serviceCancellation(r,new Date(stayNow(b)).toISOString())),cash=refunds.reduce((sum,r)=>sum+r.cashReturn+r.depositReturn,0),penalty=refunds.reduce((sum,r)=>sum+r.penalty,0),points=refunds.reduce((sum,r)=>sum+r.pointsReturn,0);
 const cancel=()=>{try{const now=new Date().toISOString();setCommerce(cancelable.reduce((next,r)=>cancelPaidService(next,b.owner,b.id,r.id,now),commerce));onCancelled();}catch(e){setError((e as Error).message);}};
 return <ServiceSheet open title={cancelling?'Отменить завтрак?':'Завтрак «шведский стол»'} onOpenChange={open=>{if(!open)onClose();}}><div className="service-sheet-layout"><div className="service-sheet-fields service-order-detail">
 {!cancelling&&<ServiceDetailIntro kind="buffet"/>}
 <div className="service-order-summary"><div><span>{tripEditorialText("ПР-186", `${buffetPeriod(rows)} · ${rows[0]?.persons} перс.`, `${buffetPeriod(rows)} · ${rows[0]?.persons} чел`)}</span><span>{venue.hours} · {venue.restaurant} · {venue.floor}</span><StatusBadge tone="success" icon="check">Добавлено</StatusBadge></div></div>
 {cancelling?<><p>{cancelable.length===rows.length?tripEditorialText("ПР-187", 'Завтрак будет отменён на весь заказанный период.', "Завтрак будет отменён на весь заказанный период"):tripEditorialText("ПР-188", 'Отменим все оставшиеся завтраки. Уже оказанные услуги сохранятся.', "Отменим все оставшиеся завтраки. Уже оказанные услуги сохранятся")}</p>{refunds.length>0&&<div className="service-order-price"><div><span>Вернём</span><strong>{formatMoney(cash)}</strong></div>{points>0&&<div><span>Вернём баллы</span><strong>{points.toLocaleString('ru-RU')}</strong></div>}{penalty>0&&<div><span>Удержание</span><strong>{formatMoney(penalty)}</strong></div>}</div>}</>:unpaid>0&&<ServiceHotelPaymentNote booking={b} amount={unpaid}/>}
 </div><div className="service-action-footer service-order-footer">{error&&<p role="alert" className="field-error">{error}</p>}{!cancelling&&<div><span>Стоимость за весь период</span><strong>{formatMoney(total)}</strong></div>}<DialogActions>{cancelling?<><Button onClick={cancel}>Отменить завтрак</Button><Button variant="secondary" onClick={()=>setCancelling(false)}>{tripEditorialText("ПР-189", "Оставить заказ", "Не отменять")}</Button></>:<><Button dismissOnly onClick={onClose}>Готово</Button>{cancelable.length>0&&<Button variant="secondary" onClick={()=>setCancelling(true)}>Отменить заказ</Button>}</>}</DialogActions></div></div></ServiceSheet>;
}
