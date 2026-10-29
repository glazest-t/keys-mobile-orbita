import {useState,type Dispatch,type SetStateAction} from 'react';
import {catalog,type Commerce} from './model';
import {rateTitle} from './roomOffers';
import {priceWatchEntries} from './priceWatch';
import {applyPriceEvent} from './priceEvents';
import './price-notifications.css';

export function PriceEventControls({commerce,setCommerce,owner,onEvent}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string;onEvent:()=>void}){
 const entries=priceWatchEntries(commerce,owner),[key,setKey]=useState(''),[error,setError]=useState(''),entry=entries.find(e=>e.key===key)||entries[0];
 const apply=(delta:number)=>{if(!entry)return;try{const next=applyPriceEvent(commerce,owner,entry.key,delta,crypto.randomUUID());setCommerce(next);setError('');onEvent();}catch(e){setError((e as Error).message);}};
 return <details className="price-event-tools"><summary>Цена · демособытия</summary><small>Меняет предложение в списке и бронировании. Подтверждённые брони сохраняют свою стоимость.</small>{entries.length?<><select aria-label="Наблюдение для изменения цены" value={entry.key} onChange={e=>{setKey(e.target.value);setError('');}}>{entries.map(e=><option key={e.key} value={e.key}>{catalog.hotels.find(h=>h.id===e.draft.hotelId)?.name} · {catalog.rooms.find(r=>r.id===e.draft.roomId)?.title} · {rateTitle(catalog.rates.find(r=>r.id===e.draft.rateId)!)} · {e.draft.search.checkIn}</option>)}</select><button disabled={entry.currentMinor===null||entry.currentMinor<=550000} onClick={()=>apply(-550000)}>Снизить цену на 5 500 ₽</button><button disabled={entry.currentMinor===null} onClick={()=>apply(550000)}>Повысить цену на 5 500 ₽</button>{error&&<small role="alert">{error}</small>}</>:<small>Сначала сохраните наблюдение цены.</small>}</details>;
}
