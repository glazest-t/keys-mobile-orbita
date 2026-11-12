import {tripEditorialText} from '../../../prototype/domain/tripEditorialText.mjs';
import {Field,Icon} from '../ui';
import type {Draft} from './model';
export function PartialPoints({draft,wallets,totalMinor,applied,onChange}:{draft:Draft;wallets:{keysPoints:number;hotelPoints:number};totalMinor:number;applied:number;onChange:(amount:number|undefined)=>void}){
 const balance=wallets.keysPoints+(draft.rateId.includes('friendly')?0:wallets.hotelPoints);
 const max=Math.min(balance,Math.floor(totalMinor/100));
 const partial=draft.pointsToUse!==undefined;
 return <div className="november-partial-points"><button type="button" role="checkbox" aria-checked={partial} className="november-partial-toggle" onClick={()=>onChange(partial?undefined:max)}><span className="november-checkbox" aria-hidden="true">{partial&&<Icon name="check" size={14} inheritColor/>}</span>Списать частично</button>{partial&&<div className="november-partial-form"><Field label="Сколько списать" inputMode="numeric" value={String(Math.min(draft.pointsToUse??max,max))} onChange={e=>onChange(Math.min(max,Number(e.target.value.replace(/\D/g,'').slice(0,9))||0))}/><span className="november-points-limit">баллов<small>{tripEditorialText("ПР-247", `из ${max.toLocaleString('ru-RU')}`, `Из ${max.toLocaleString('ru-RU')}`)}</small></span></div>}<p role="status">Спишем {applied.toLocaleString('ru-RU')} баллов</p></div>;
}
