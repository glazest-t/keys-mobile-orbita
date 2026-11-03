import {CardPaymentPlan} from './CardPaymentPlan';
import {useId,useLayoutEffect,useRef,useState} from 'react';
import {Icon} from '../ui';
import type {Draft} from './model';
import {extraPaymentOptions,paymentSelection,type PaymentChoice} from './paymentOptions';
import {paymentLayout} from './paymentLayout';
const methods=[
 {id:'sbp',label:'СБП',caption:'Через приложение банка',icon:'qr'},
 {id:'card',label:'Картой',caption:'Банковская карта',icon:'card'},
 {id:'at_hotel',label:'При заселении',caption:'Оплата в отеле',icon:'reception'},
 ...extraPaymentOptions.map(o=>({...o,caption:'Через приложение'})),
] satisfies {id:PaymentChoice;label:string;caption:string;icon:string}[];
export function DesktopPaymentChoices({draft,onChange,onlineOnly=false}:{draft:Draft;onChange:(value:Partial<Draft>)=>void;onlineOnly?:boolean}){
 const rail=useRef<HTMLElement>(null),id=useId();
 const [width,setWidth]=useState(0),[expanded,setExpanded]=useState(false);
 useLayoutEffect(()=>{const el=rail.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));setWidth(el.clientWidth);observer.observe(el);return()=>observer.disconnect();},[]);
 const options=methods.filter(o=>!onlineOnly||o.id!=='at_hotel');
 const {visible,overflow}=paymentLayout(options,width);
 const selected=draft.method==='at_hotel'?'at_hotel':draft.paymentOption||'sbp';
 const hiddenSelected=overflow.find(o=>o.id===selected);
 const select=(choice:PaymentChoice)=>{onChange(paymentSelection(choice));setExpanded(false);};
 return <section ref={rail} className="hotel-section checkout-payment desktop-payment-choices"><h2>Способ оплаты</h2>
  <div className="desktop-payment-grid" role="group" aria-label="Способы оплаты" style={{gridTemplateColumns:`repeat(${visible.length+(overflow.length?1:0)}, minmax(0, 1fr))`}}>
   {visible.map(o=><button key={o.id} className={'payment-choice '+(selected===o.id?'selected':'')} aria-pressed={selected===o.id} onClick={()=>select(o.id)}><Icon name={o.icon} size={26} inheritColor/><span className="payment-choice-check" aria-hidden="true">{selected===o.id&&<Icon name="check" size={12} inheritColor/>}</span><strong>{o.label}</strong><small>{o.caption}</small></button>)}
   {!!overflow.length&&<button className={'payment-choice payment-more '+(hiddenSelected?'selected':'')} aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(v=>!v)}><Icon name="more" size={26} inheritColor/><span className="payment-choice-check" aria-hidden="true">{hiddenSelected&&<Icon name="check" size={12} inheritColor/>}</span><strong>Другое <Icon name="chevron-down" size={14} inheritColor/></strong><small>{hiddenSelected?.label||`Ещё ${overflow.length}`}</small></button>}
  </div>
  <CardPaymentPlan draft={draft} onChange={onChange} onlineOnly={onlineOnly}/>
  {expanded&&!!overflow.length&&<div id={id} className="payment-extra-options" role="group" aria-label="Другие способы оплаты">{overflow.map(o=><button key={o.id} aria-pressed={selected===o.id} onClick={()=>select(o.id)}><span className="icon-tile"><Icon name={o.icon} size={20} inheritColor/></span><strong>{o.label}</strong><span className={'radio-dot '+(selected===o.id?'checked':'')}/></button>)}</div>}
 </section>;
}
