import {editorialText} from '../../../prototype/domain/editorialText.mjs';
import {useNovember} from '../usePrototypeVariant';
import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Icon,StatusBadge} from '../ui';
import {interactionMotion} from '../interactions';
import {catalog,formatMoney,type Booking,type Commerce} from './model';
import {isPartiallyPaid,payBookingBalance,quoteBookingBalance} from './bookingBalance';
import './booking-payment-status.css';

type Props={booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;showAmount?:boolean;hideStatus?:boolean;linkLabel?:string;failNext?:boolean;onPaymentAttempt?:()=>void};
export function BookingPaymentBadge({booking:b}:{booking:Booking}){
 const november=useNovember(),due=b.operation.dueAtHotelMinor,partial=isPartiallyPaid(b);
 if(b.operation.status!=='confirmed')return null;
 if(november&&(!due||partial))return <span className="november-paid-status"><span className={partial?'november-partial-clock':'november-paid-check'}><Icon name={partial?'pending':'check'} size={16} inheritColor/></span><span>{partial?'Оплачено частично':'Оплачено'}</span></span>;
 return <StatusBadge tone={due?(partial?'warning':'info'):(november?'neutral':'success')} icon={due?'pending':'check'}>{due?(partial?'Частично оплачено':editorialText("РШ-315", "Оплата в отеле", "Оплата на месте")):'Оплачено'}</StatusBadge>;
}
export function BookingPaymentStatus(props:Props){
 const {booking:b,showAmount=false}=props,partial=isPartiallyPaid(b),due=b.operation.dueAtHotelMinor;
 const [open,setOpen]=useState(false),[expected,setExpected]=useState<ReturnType<typeof quoteBookingBalance>|null>(null),[busy,setBusy]=useState(false),[success,setSuccess]=useState(false),[error,setError]=useState('');
 const latest=useRef(props),lock=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null),event=useRef('');latest.current=props;
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const start=()=>{try{setExpected(quoteBookingBalance(b));event.current=crypto.randomUUID();setError('');setSuccess(false);setOpen(true);}catch(e){setError((e as Error).message);}};
 const pay=()=>{
  if(lock.current||!expected)return;
  lock.current=true;setBusy(true);setError('');const outcome=props.failNext?'failure':'success';props.onPaymentAttempt?.();
  timer.current=setTimeout(()=>{try{const p=latest.current;p.setCommerce(payBookingBalance(p.commerce,p.booking.owner,expected,event.current,outcome));setSuccess(true);}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}},interactionMotion.paymentWaitMs);
 };
 if(b.operation.status!=='confirmed')return null;
 return <><div className="booking-payment-status">{!props.hideStatus&&<BookingPaymentBadge booking={b}/>}{(showAmount&&due>0||partial&&b.stay?.status!=='checked_out')&&<span className="booking-payment-due">{showAmount&&due>0&&<strong className="booking-payment-remaining">К оплате {formatMoney(due)}</strong>}{partial&&b.stay?.status!=='checked_out'&&<button type="button" className="text-action booking-balance-link" onClick={start}>{props.linkLabel||'Оплатить'}</button>}</span>}</div>
 {!open&&error&&<p className="field-error" role="alert">{error}</p>}
 <BottomSheet open={open} onOpenChange={v=>{if(!lock.current)setOpen(v);}} title={success?'Оплата прошла':'Оплата бронирования'}><div className="sheet-body booking-balance-payment">
 {success?<><StatusBadge tone="success" icon="check">Оплачено</StatusBadge><h2>{editorialText("РШ-320", "Бронь полностью оплачена", "Бронь оплачена")}</h2><p>{editorialText("РШ-321", `Остаток ${formatMoney(expected?.amountMinor||0)} оплачен. Доплачивать за эту бронь не нужно.`, `Остаток ${formatMoney(expected?.amountMinor||0)} оплачен — доплата не нужна`)}</p><Button dismissOnly onClick={()=>setOpen(false)}>Готово</Button></>:<><p className="booking-balance-hotel">{catalog.hotels.find(h=>h.id===b.draft.hotelId)?.name}</p><div className="booking-balance-amount"><span>Осталось оплатить</span><strong>{formatMoney(expected?.amountMinor||0)}</strong></div><div className="booking-balance-card"><Icon name="card" size={24} inheritColor/><span>Банковская карта<small>Тестовая карта ···· 4242</small></span></div><p className="booking-balance-demo">{editorialText("РШ-326", "Демонстрационный эквайринг. Деньги не списываются.", "Это демо-версия — деньги не спишутся")}</p>{error&&<p className="field-error" role="alert">{error}</p>}<Button busy={busy} onClick={pay}>Оплатить {formatMoney(expected?.amountMinor||0)}</Button></>}
 </div></BottomSheet></>;
}
