import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Icon} from '../ui';
import {interactionMotion} from '../interactions';
import {formatMoney,type Booking,type Commerce,type Draft} from './model';
import {PaymentChoices} from './PaymentChoices';
import {quoteServiceGroup,payServiceGroup} from './servicePayment';
type Props={booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;groupId:string;onOrder:(id:string)=>void;onClose:()=>void;failNext:boolean;onPaymentAttempt:()=>void};
export function ServiceGroupPayment(props:Props){
 const [choice,setChoice]=useState<Partial<Draft>>({method:'online',paymentOption:'sbp',usePoints:false}),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const latest=useRef(props),lock=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);latest.current=props;useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const b=props.booking,activeRows=(b.serviceRequests||[]).filter(r=>r.groupId===props.groupId&&!['cancelled','declined'].includes(r.status)),done=activeRows.length>0&&activeRows.every(r=>r.operation?.status==='confirmed'),rows=done?activeRows:activeRows.filter(r=>r.status==='confirmed'&&!r.operation);
 let quote:ReturnType<typeof quoteServiceGroup>|undefined,validation='';if(!done)try{quote=quoteServiceGroup(props.commerce,b.owner,b.id,props.groupId,false);}catch(e){validation=(e as Error).message;}

 const pay=()=>{if(lock.current||!quote)return;const expected=quote,source='online',option=choice.paymentOption||'sbp',fail=source==='online'&&props.failNext;if(source==='online')props.onPaymentAttempt();lock.current=true;setBusy(true);setError('');timer.current=setTimeout(()=>{try{const p=latest.current;p.setCommerce(payServiceGroup(p.commerce,p.booking.owner,p.booking.id,p.groupId,expected,option,source,fail?'failure':'success'));}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}},interactionMotion.paymentWaitMs);};
 return <><BottomSheet open onOpenChange={v=>{if(!v&&!busy)props.onClose();}} title={done?'Завтраки оплачены':'Оплата завтраков'} snap={.92}><div className="service-sheet-layout" inert={busy}><div className="service-sheet-fields service-order-detail">
 <div className="service-order-summary"><span className="icon-tile"><Icon name="breakfast" size={22} inheritColor/></span><div><strong>{rows[0]?.mode==='room'?'Завтрак в номер':'Завтрак'}</strong><span>{rows.length} дн. · {rows[0]?.persons} перс.</span></div></div>
 {done&&<details className="bill-payment-details"><summary>Заказы по дням<Icon name="chevron-down" size={18} inheritColor/></summary><div className="breakfast-batch-dates">{rows.map(r=><button className="deposit-group-day service-group-order" key={r.id} onClick={()=>props.onOrder(r.id)}><span>{new Date(r.date+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'})} · {r.time}</span><span>{formatMoney(r.amountMinor)}</span><Icon name="chevron-right" size={16}/></button>)}</div></details>}
 {!done&&<><PaymentChoices onlineOnly draft={{...b.draft,...choice}} onChange={v=>{setChoice(c=>({...c,...v}));setError('');}}/></>}
 </div><div className="service-action-footer service-order-footer">
 {(error||validation)&&<p role="alert" className="field-error">{error||validation}</p>}
 <div><span>{done?'Оплачено':'К оплате'}</span><strong>{done?formatMoney(rows.reduce((sum,r)=>sum+r.amountMinor,0)):quote?formatMoney(quote.cash):'—'}</strong></div>
 {!done&&!!quote?.points&&<small>Списать {quote.points/100} баллов</small>}
 {done?<Button onClick={props.onClose}>Готово</Button>:<><Button busy={busy} disabled={!quote} onClick={pay}>{quote?.cash===0?'Подтвердить списание баллов':'Оплатить'}</Button><Button variant="secondary" disabled={busy} onClick={props.onClose}>К поездке</Button></>}
 </div></div></BottomSheet></>;
}
