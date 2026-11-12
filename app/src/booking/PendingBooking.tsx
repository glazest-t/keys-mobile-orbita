import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {createPortal} from 'react-dom';
import {Button,Icon,IconButton} from '../ui';
import {BottomSheet,useScreenPortal,useMobileDevice} from '../mobile';
import {interactionMotion} from '../interactions';
import {isDesktop} from '../desktop/surface';
import {cancelBooking,catalog,hotelPhoto,formatMoney,type Booking,type Commerce} from './model';
import {completeBookingPayment,pendingAmount} from './pendingPayment';
import {bookingNumber} from './bookingNumber';
import {tripFacts} from './trip';
import {guestCountLabel} from './search';
import {hotelLocation} from '../maps/locations';
import {hotelVisual} from './presentation';
import {TripLayoutGroup} from './TripLayoutGroup';
import {usePrototypeCopy} from '../usePrototypeText';
import {TripDetailsActions} from '../profile/TripDetailsActions';
import {CancellationPanel} from './Catalog';
import './pending-booking.css';

type PaymentProps={booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;failNext?:boolean;onPaymentAttempt?:()=>void};
export function AwaitingPaymentStatus({className=""}:{className?:string}){const label=usePrototypeCopy("Ожидает оплаты","Ожидаем оплаты");return <span className={"k-status k-status--info awaiting-payment-status "+className} role="status"><span className="k-spinner" aria-hidden="true"/><span className="k-status-label">{label}</span></span>;}
function AcquiringPage(props:PaymentProps&{onClose:()=>void}){
 const {booking:b,onClose}=props,{screenRef}=useScreenPortal(),{device}=useMobileDevice();
 const method={card:'Банковская карта',sbp:'СБП',sberpay:'SberPay',tpay:'T-Pay',yandexpay:'Яндекс Пэй'}[b.draft.paymentOption||'sbp'];
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const latest=useRef(props),lock=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null),panel=useRef<HTMLDivElement>(null);latest.current=props;
 useEffect(()=>{const prior=document.activeElement as HTMLElement|null;const siblings=Array.from(panel.current?.parentElement?.children||[]).filter((el):el is HTMLElement=>el instanceof HTMLElement&&el!==panel.current);const previous=siblings.map(el=>el.inert);siblings.forEach(el=>{el.inert=true;});panel.current?.focus();return()=>{if(timer.current)clearTimeout(timer.current);siblings.forEach((el,i)=>{el.inert=previous[i];});prior?.focus();};},[]);
 const pay=()=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');const outcome=props.failNext?'failure':'success';props.onPaymentAttempt?.();timer.current=setTimeout(()=>{try{const p=latest.current;p.setCommerce(completeBookingPayment(p.commerce,p.booking.owner,p.booking.id,outcome));}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}},interactionMotion.paymentWaitMs);};
 return createPortal(<div className={'demo-acquiring '+(isDesktop?'demo-acquiring-desktop':'')} style={isDesktop?undefined:{top:device.geometry.safeArea.top,paddingTop:8}} ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Оплата бронирования" onKeyDown={e=>{if(e.key==='Escape'&&!busy)onClose();if(e.key==='Tab'){const nodes=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled)')||[]),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}>
 <header><IconButton name="back" label="Вернуться к брони без оплаты" disabled={busy} onClick={onClose}/><span>Оплата бронирования</span><Icon name="secure" size={22}/></header>
 <main><p className="acquiring-demo-label">Демонстрационный эквайринг</p><h1>{formatMoney(pendingAmount(b))}</h1><p>{catalog.hotels.find(h=>h.id===b.draft.hotelId)?.name}</p><p className="acquiring-booking-number">Бронь № {bookingNumber(b)}</p><div className="acquiring-method"><span className="icon-tile"><Icon name={b.draft.paymentOption==='card'?'card':'secure'} size={24}/></span><div><strong>{method}</strong><span>{b.draft.paymentOption==='card'?'Тестовая карта •••• 4242':'Демонстрационный платёж'}</span></div></div><p className="acquiring-note">Реальные деньги не спишутся. Данные карты вводить не нужно.</p>{error&&<p className="field-error" role="alert">{error}</p>}<Button busy={busy} onClick={pay}>Оплатить {formatMoney(pendingAmount(b))}</Button><Button variant="ghost" disabled={busy} onClick={onClose}>Вернуться к брони</Button></main>
 </div>,isDesktop?document.body:screenRef.current||document.body);
}
export function PendingPaymentButton(props:PaymentProps&{initialOpen?:boolean;className?:string}){
 const [open,setOpen]=useState(!!props.initialOpen);
 return <><Button className={'pending-payment-button '+(props.className||'')} onClick={()=>setOpen(true)}>Оплатить</Button>{open&&<AcquiringPage {...props} onClose={()=>setOpen(false)}/>}</>;
}
export function PendingCancellationButton({booking,commerce,setCommerce}:PaymentProps){
 const [open,setOpen]=useState(false);
 return <><Button variant="ghost" className="record-cancel" onClick={()=>setOpen(true)}>Отменить бронь</Button><BottomSheet open={open} onOpenChange={setOpen} title="Отменить бронь?" snap={.75}><div className="sheet-body record-cancellation"><CancellationPanel booking={booking} onClose={()=>setOpen(false)} onConfirm={()=>{setCommerce(cancelBooking(commerce,booking.owner,booking.id));setOpen(false);}}/></div></BottomSheet></>;
}
export function PendingPaymentFooter(props:PaymentProps&{initialOpen?:boolean}){
 return <TripDetailsActions className="pending-payment-fixed"><div className="pending-payment-fixed-inner"><PendingPaymentButton {...props}/></div></TripDetailsActions>;
}
export function PendingTrip(props:PaymentProps&{onDetails:()=>void}){
 const {booking:b}=props,hotel=catalog.hotels.find(h=>h.id===b.draft.hotelId)!,facts=tripFacts(b);
 const date=(value:string)=>new Date(value+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'});
 const visual=hotelVisual(hotel.id),address=[visual.location.replaceAll(' · ', ', '),hotelLocation(hotel.id)?.address||visual.address].filter(Boolean).join(', ');
 const n=b.quote.nights,nightLabel=`${n} ${n%10===1&&n%100!==11?'ночь':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'ночи':'ночей'}`;
 return <div className="trip-home pending-trip"><div className="trip-greeting"><h1>Поездки</h1></div><TripLayoutGroup className="desktop-trip-columns"><TripLayoutGroup className="desktop-trip-column desktop-trip-booking"><article className="upcoming-card"><div className="upcoming-photo"><img src={hotelPhoto(hotel.id)} alt={hotel.name}/><AwaitingPaymentStatus className="upcoming-status"/><div className="upcoming-hotel-heading"><div className="upcoming-hotel-copy"><h2>{hotel.name}</h2><p>{address}</p></div></div></div><div className="upcoming-body"><div className="upcoming-dates"><span><small>Заезд</small><strong>{date(b.draft.search.checkIn)}</strong><b>с {facts.checkInTime}</b></span><span className="trip-date-direction" aria-hidden="true"><i className="trip-date-line"/></span><span><small>Выезд</small><strong>{date(b.draft.search.checkOut)}</strong><b>до {facts.checkOutTime}</b></span></div><div className="upcoming-payment"><div className="upcoming-payment-overview"><span className="upcoming-payment-facts"><span><Icon name="moon" size={17} inheritColor/>{nightLabel}</span><span><Icon name="guests" size={17} inheritColor/>{guestCountLabel(b.draft.search)}</span></span><span className="upcoming-payment-price"><strong>{formatMoney(b.quote.orderTotalMinor)}</strong></span></div><div className="upcoming-payment-settlement"><span className="booking-payment-remaining">К оплате {formatMoney(pendingAmount(b))}</span></div></div><div className="booking-card-actions"><Button variant="secondary" className="booking-card-action" onClick={props.onDetails}><Icon name="document" size={20} inheritColor/>Детали</Button><PendingPaymentButton {...props} className="pending-trip-pay"/></div></div></article></TripLayoutGroup></TripLayoutGroup></div>;
}
