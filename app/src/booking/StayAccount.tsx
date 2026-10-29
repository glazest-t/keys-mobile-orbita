import {ServiceStatus} from './ServiceStatus';
import {interactionMotion} from '../interactions';
import {createContext,useContext,useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {FlowStack,MobileScroll,type FlowScreen} from '../mobile';
import {Button,Icon,IconButton} from '../ui';
import {readWallets} from '../../../prototype/domain/payment.mjs';
import {catalog,dateLabel,formatMoney,type Booking,type Commerce,type Draft} from './model';
import {PaymentChoices,PaymentPoints} from './PaymentChoices';
import {payStayBill,quoteStayBill,stayBill} from './stayBill';
import {serviceTitle,serviceIcon} from './serviceSettlement';
import './stay-bill.css';

type Props={booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;onBack:()=>void;onOrder:(id:string)=>void;failNext:boolean;onPaymentAttempt:()=>void};
type State=Props&{paying:boolean;setPaying:(v:boolean)=>void;choice:Partial<Draft>;change:(v:Partial<Draft>)=>void;quote?:ReturnType<typeof quoteStayBill>;error:string;busy:boolean;pay:()=>void;success:boolean};
const Context=createContext<State|null>(null),useBill=()=>useContext(Context)!;
function Header(){const c=useBill();return <header className="record-header record-details-header"><IconButton name="back" label="Назад" onClick={()=>c.paying?c.setPaying(false):c.onBack()}/><span>{c.paying?'Оплата счёта':'Счёт'}</span><span/></header>;}
function Content(){const c=useBill(),b=c.booking,bill=stayBill(b);return <MobileScroll className="page-scroll"><Header/><main className="stay-bill-content" inert={c.busy}>
 <section className="bill-total"><small>{c.success&&!bill.due?'Счёт оплачен':bill.due?(bill.onlineDue?'К оплате':'К оплате в отеле'):'Всё оплачено'}</small><strong>{formatMoney(c.paying&&c.quote?c.quote.cash:bill.due)}</strong></section>
 {!c.paying&&bill.hotelDue>0&&bill.onlineDue>0&&<p className="bill-note">Из них {formatMoney(bill.hotelDue)} — оплата в отеле</p>}
 {c.paying?<><PaymentChoices onlineOnly draft={{...b.draft,...c.choice}} onChange={c.change}/><PaymentPoints wallets={readWallets(c.commerce.payment,b.owner,b.draft.hotelId)} friendly={b.quote.rateKind==='friendly_rate'} checked={!!c.choice.usePoints} onChange={usePoints=>c.change({usePoints})}/>{c.quote&&<div className="bill-breakdown"><span>Счёт<strong>{formatMoney(bill.onlineDue)}</strong></span>{c.quote.hotelPoints>0&&<span>Баллы отеля<strong>−{c.quote.hotelPoints}</strong></span>}{c.quote.keysPoints>0&&<span>Баллы «Ключей»<strong>−{c.quote.keysPoints}</strong></span>}</div>}</>:<>
 <h2>Расходы</h2>{!bill.charges.length&&!b.operation.dueAtHotelMinor&&!(b.serviceRequests||[]).some(r=>r.operation?.penaltyMinor)&&<p className="bill-note">Дополнительных расходов пока нет</p>}<section className="bill-lines">{b.operation.dueAtHotelMinor>0&&<div className="bill-line"><span className="icon-tile"><Icon name="room" size={22} inheritColor/></span><span><strong>Проживание и услуги в брони</strong><small>{dateLabel(b.draft.search)}</small><small>{b.operation.dueAtHotelMinor?'К оплате '+formatMoney(b.operation.dueAtHotelMinor):'Оплачено'}</small></span><b>{formatMoney(b.operation.dueAtHotelMinor)}</b></div>}{bill.charges.map(r=><button className="bill-line" key={r.id} onClick={()=>c.onOrder(r.id)}><span className="icon-tile"><Icon name={serviceIcon(r)} size={22} inheritColor/></span><span><strong>{serviceTitle(r)}</strong><small>{new Date(r.date+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</small><ServiceStatus booking={b} request={r}/></span><b>{r.amountMinor?formatMoney(r.amountMinor):'Бесплатно'}</b></button>)}{(b.serviceRequests||[]).filter(r=>r.operation?.penaltyMinor).map(r=><div className="bill-line" key={r.id}><span className="icon-tile"><Icon name="info" size={22} inheritColor/></span><span><strong>{serviceTitle(r)}</strong><small>Удержание при отмене</small></span><b>{formatMoney(r.operation!.penaltyMinor!)}</b></div>)}</section>
 <details className="bill-payment-details"><summary>Оплата проживания и услуг<Icon name="chevron-down" size={18} inheritColor/></summary><div className="bill-breakdown"><span>Оплачено деньгами<strong>{formatMoney(bill.cash)}</strong></span>{bill.points>0&&<span>Оплачено баллами<strong>{bill.points/100}</strong></span>}</div></details>

 {bill.pending.length>0&&<><h2>Заявки без ответа</h2><section className="bill-lines">{bill.pending.map(r=><button className="bill-line" key={r.id} onClick={()=>c.onOrder(r.id)}><span className="icon-tile"><Icon name="pending" size={22} inheritColor/></span><span><strong>{serviceTitle(r)}</strong><small>{r.date}</small><ServiceStatus booking={b} request={r}/></span><Icon name="chevron-right" size={18}/></button>)}</section></>}
 {b.stay?.status==='checked_out'&&<div className="bill-checkout-note"><span>Выезд подтверждён</span></div>}
 </>}{c.error&&<p className="field-error" role="alert">{c.error}</p>}
 </main></MobileScroll>;}
function Footer(){const c=useBill(),b=c.booking,bill=stayBill(b);return <footer className="bill-footer">{c.paying?<><div><span>К оплате</span><strong>{c.quote?formatMoney(c.quote.cash):'—'}</strong></div><Button busy={c.busy} disabled={!c.quote||!c.quote.items.length} onClick={c.pay}>{c.quote?.cash===0?'Подтвердить списание баллов':'Оплатить'}</Button></>:bill.onlineDue?<Button onClick={()=>c.setPaying(true)}>Оплатить {formatMoney(bill.onlineDue)}</Button>:<Button onClick={c.onBack}>К деталям проживания</Button>}</footer>;}
const screen:FlowScreen={id:'stay-bill',headerHeight:0,footerHeight:112,footer:()=> <Footer/>,render:()=> <Content/>};
export function StayBill(props:Props){
 const [paying,setPaying]=useState(false),[choice,setChoice]=useState<Partial<Draft>>({method:'online',paymentOption:'sbp',usePoints:false}),[error,setError]=useState(''),[busy,setBusy]=useState(false),[success,setSuccess]=useState(false);
 const latest=useRef(props),timer=useRef<ReturnType<typeof setTimeout>|null>(null),lock=useRef(false);latest.current=props;
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 let quote:ReturnType<typeof quoteStayBill>|undefined,validation='';
 if(paying)try{quote=quoteStayBill(props.commerce,props.booking.owner,props.booking.id,!!choice.usePoints);}catch(e){validation=(e as Error).message;}
 const pay=()=>{if(lock.current||!quote)return;const expected=quote,id=crypto.randomUUID(),option=choice.paymentOption||'sbp',source='online',fail=source==='online'&&props.failNext;if(source==='online')props.onPaymentAttempt();lock.current=true;setBusy(true);setError('');timer.current=setTimeout(()=>{try{const p=latest.current;p.setCommerce(payStayBill(p.commerce,p.booking.owner,p.booking.id,expected,id,option,fail?'failure':'success',new Date().toISOString(),source));setPaying(false);setSuccess(true);}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}},interactionMotion.paymentWaitMs);};

 return <Context.Provider value={{...props,paying,setPaying:v=>{if(!busy){setPaying(v);setError('');}},choice,change:v=>{setChoice(c=>({...c,...v}));setError('');},quote,error:error||validation,busy,pay,success}}><div className="record-flow"><FlowStack initial={screen}/></div></Context.Provider>;
}
