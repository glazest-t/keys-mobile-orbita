import {useId,useState,useRef,useEffect} from 'react';
import {BottomSheet,Carousel} from '../mobile';
import {Icon,Switch} from '../ui';
import {type Draft} from './model';
import {extraPaymentOptions,paymentSelection,visibleWallets,type PaymentChoice} from './paymentOptions';
import './paymentChoices.css';

export function PaymentChoices(props:{draft:Draft;onChange:(value:Partial<Draft>)=>void;onlineOnly?:boolean}){return (<MobilePaymentChoices {...props}/>);}
function MobilePaymentChoices({draft,onChange,onlineOnly=false}:{onlineOnly?:boolean;draft:Draft;onChange:(value:Partial<Draft>)=>void}){
 const [expanded,setExpanded]=useState(false),id=useId(),rail=useRef<HTMLElement>(null);
 const selected=draft.method==='at_hotel'?'at_hotel':draft.paymentOption||'sbp';
 const extra=extraPaymentOptions.find(o=>o.id===selected);
 useEffect(()=>{const scroller=rail.current?.querySelector<HTMLElement>('.mobile-carousel'),card=rail.current?.querySelector<HTMLElement>('.payment-choice.selected');if(scroller&&card)scroller.scrollTo({left:Math.max(0,card.offsetLeft-(scroller.clientWidth-card.offsetWidth)/2)});},[selected]);
 const select=(choice:PaymentChoice)=>{onChange(paymentSelection(choice));setExpanded(false);};
 return <section ref={rail} className="hotel-section checkout-payment"><h2>Способ оплаты</h2>
  <Carousel ariaLabel="Способы оплаты" contentClassName="payment-choice-track">
   {([
    {id:'sbp',label:'СБП',caption:'Через приложение банка',icon:'qr'},
    {id:'card',label:'Картой',caption:'Банковская карта',icon:'card'},
    {id:'at_hotel',label:'При заселении',caption:'Оплата в отеле',icon:'reception'},
   ] as const).filter(o=>!onlineOnly||o.id!=='at_hotel').map(o=><button key={o.id} className={'payment-choice '+(selected===o.id?'selected':'')} aria-pressed={selected===o.id} onClick={()=>select(o.id)}><Icon name={o.icon} size={26} inheritColor/><span className="payment-choice-check" aria-hidden="true">{selected===o.id&&<Icon name="check" size={12} inheritColor/>}</span><strong>{o.label}</strong><small>{o.caption}</small></button>)}

   <button className={'payment-choice payment-more '+(extra?'selected':'')} aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(v=>!v)}><Icon name="more" size={26} inheritColor/><span className="payment-choice-check" aria-hidden="true">{extra&&<Icon name="check" size={12} inheritColor/>}</span><strong>Другое <Icon name="chevron-down" size={14} inheritColor/></strong><small>{extra?.label||'Ещё 3 способа'}</small></button>
  </Carousel>
  {selected==='card'&&!onlineOnly&&<div className="card-payment-plan" role="group" aria-label="Размер оплаты картой">{([{id:'full',label:'Полностью'},{id:'night',label:'Предоплата за первые сутки'},{id:'percent30',label:'Предоплата 30%'}] as const).map(p=><button key={p.id} aria-pressed={(draft.cardPaymentPlan||'full')===p.id} onClick={()=>onChange({cardPaymentPlan:p.id})}><span>{p.label}</span><span className={'radio-dot '+((draft.cardPaymentPlan||'full')===p.id?'checked':'')}/></button>)}</div>}
  <BottomSheet open={expanded} onOpenChange={setExpanded} title="Другие способы оплаты" snap={.52}><div className="sheet-body"><div id={id} className="payment-extra-options" role="group" aria-label="Другие способы оплаты">{extraPaymentOptions.map(o=><button key={o.id} aria-pressed={selected===o.id} onClick={()=>select(o.id)}><span className="icon-tile"><Icon name={o.icon} size={20} inheritColor/></span><strong>{o.label}</strong><span className={'radio-dot '+(selected===o.id?'checked':'')}/></button>)}</div></div></BottomSheet>
 </section>;
}
export function PaymentPoints({wallets,friendly,checked,onChange}:{wallets:{keysPoints:number;hotelPoints:number};friendly:boolean;checked:boolean;onChange:(value:boolean)=>void}){
 const rows=visibleWallets(wallets,friendly),available=rows.some(w=>w.available);
 return <div className="points-payment-card"><Switch checked={available&&checked} disabled={!available} onChange={onChange}><span className="points-label"><span className="icon-tile"><Icon name="points" size={22}/></span><span><strong>Списать баллы</strong><small>{available?'До 100% проживания и услуг':'Нет доступных баллов'}</small></span></span></Switch>{available&&checked&&rows.length>0&&<div className="payment-wallets">{rows.map(w=><span key={w.id}>{w.label}<b>{w.points.toLocaleString('ru-RU')}</b></span>)}</div>}</div>;
}
