import {promotionBasisPoints} from './promotions.ts';
import {hotelProgramDiscount} from '../rewards/loyalty.ts';
import {catalog,quoteDraft,type Commerce,type Draft} from './model.ts';
import {priceWatchEntries} from './priceWatch.ts';
export type PriceEvent={id:string;owner:string;key:string;previousMinor:number;currentMinor:number;createdAt:string};
export type PriceNotice=PriceEvent&{draft:Draft;read:boolean};
export function userPriceNotices(s:Commerce,owner:string,now=Date.now()){
 return (s.priceNotices||[]).filter(n=>n.owner===owner&&Date.parse(n.createdAt)<=now).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
/** Local inventory event. Convert the desired net total back to a base total so all quote/payment calculations agree. */
export function applyPriceEvent(s:Commerce,owner:string,key:string,deltaMinor:number,id:string,now=new Date().toISOString()):Commerce{
 if((s.priceEvents||[]).some(e=>e.id===id))return s;
 const entry=priceWatchEntries(s,owner).find(e=>e.key===key);
 if(!entry||entry.currentMinor===null)throw Error(entry?.unavailable||'Наблюдение не найдено');
 if(!id||!Number.isSafeInteger(deltaMinor)||!deltaMinor||!Number.isFinite(Date.parse(now)))throw Error('Проверьте изменение цены');
 const target=entry.currentMinor+deltaMinor;if(!Number.isSafeInteger(target)||target<=0)throw Error('Цена должна остаться больше нуля');
 const rate=catalog.rates.find(r=>r.id===entry.draft.rateId)!,hotel=catalog.hotels.find(h=>h.id===entry.draft.hotelId)!;
 const bps=rate.kind==='friendly_rate'?0:Math.max(promotionBasisPoints(hotel.id),hotelProgramDiscount(s,owner,hotel.id));
 if(bps>=10000)throw Error('Этот тариф нельзя изменить');
 const net=(base:number)=>base-Number((BigInt(base)*BigInt(bps)+5000n)/10000n);
 let low=target,high=Math.ceil(target*10000/(10000-bps))+2;
 if(!Number.isSafeInteger(high))throw Error('Слишком большая цена');
 while(low<high){const mid=Math.floor(low+(high-low)/2);if(net(mid)<target)low=mid+1;else high=mid;}
 const next={...s,demoOfferPrices:{...s.demoOfferPrices,[key]:low}},price=quoteDraft({...next,draft:entry.draft},owner).lodgingMinor;
 if(price!==target)throw Error('Не удалось пересчитать цену');
 const event:PriceEvent={id,owner,key,previousMinor:entry.currentMinor,currentMinor:price,createdAt:now};
 const notify=entry.watch.active&&price<entry.currentMinor&&(entry.watch.mode==='any'||(entry.currentMinor>entry.watch.targetMinor!&&price<=entry.watch.targetMinor!));
 return {...next,priceEvents:[...(s.priceEvents||[]),event],priceNotices:notify?[...(s.priceNotices||[]),{...event,draft:structuredClone(entry.draft),read:false}]:(s.priceNotices||[])};
}
export function readPriceNotices(s:Commerce,owner:string,id?:string):Commerce{
 return {...s,priceNotices:(s.priceNotices||[]).map(n=>n.owner===owner&&Date.parse(n.createdAt)<=Date.now()&&(!id||n.id===id)?{...n,read:true}:n)};
}
export function openPriceNotice(s:Commerce,owner:string,id:string,draftId:string):Commerce{
 const n=userPriceNotices(s,owner).find(n=>n.id===id);if(!n)throw Error('Уведомление не найдено');
 // A notice keeps its snapshot even if the observation was deleted.
 const scoped={...s,priceWatches:{...s.priceWatches,[n.key]:s.priceWatches?.[n.key]||{mode:'any' as const,targetMinor:null,push:false,active:false,priceMinor:n.currentMinor}}};
 const entry=priceWatchEntries(scoped,owner).find(e=>e.key===n.key);if(!entry||entry.unavailable)throw Error(entry?.unavailable||'Предложение недоступно');
 return {...readPriceNotices(s,owner,id),draft:{...n.draft,id:draftId,services:[],usePoints:false,step:'hotel',returnTo:'notifications'}};
}
