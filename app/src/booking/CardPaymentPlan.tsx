import type {Draft} from './model';

/** Shared booking choices; service payments intentionally do not offer instalments. */
export function CardPaymentPlan({draft,onChange,onlineOnly=false}:{draft:Draft;onChange:(value:Partial<Draft>)=>void;onlineOnly?:boolean}){
 if(onlineOnly||draft.method!=='online'||draft.paymentOption!=='card')return null;
 return <div className="card-payment-plan" role="group" aria-label="Размер оплаты картой">{([{id:'full',label:'Полностью'},{id:'night',label:'Предоплата за первые сутки'},{id:'percent30',label:'Предоплата 30%'}] as const).map(plan=><button key={plan.id} aria-pressed={(draft.cardPaymentPlan||'full')===plan.id} onClick={()=>onChange({cardPaymentPlan:plan.id})}><span>{plan.label}</span><span className={'radio-dot '+((draft.cardPaymentPlan||'full')===plan.id?'checked':'')}/></button>)}</div>;
}
