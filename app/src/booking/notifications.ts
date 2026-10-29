import {catalog,formatMoney,type Commerce} from './model.ts';
import {canManageBooking} from './bookingShare.ts';
import {keyAccess} from './stay.ts';
import {userPriceNotices,readPriceNotices} from './priceEvents.ts';
export const pushKinds=['arrival-guide','room-key','welcome','feedback','stay-points'] as const;
export type PushKind=typeof pushKinds[number];
export type NoticeCategory='trips'|'benefits'|'hotel';
export type AppNotice={id:string;owner:string;kind:PushKind;title:string;body:string;createdAt:string;read:boolean;hotelId?:string;bookingId?:string;demo:true};
export const pushTemplates:Record<PushKind,{label:string;category:NoticeCategory;icon:string;action:string;tone:'brand'|'success'}>={
 'arrival-guide':{label:'Инструкция перед заездом',category:'trips',icon:'check-in',action:'Как заселиться',tone:'brand'},
 'room-key':{label:'Электронный ключ готов',category:'hotel',icon:'key',action:'К поездке',tone:'brand'},
 welcome:{label:'Добро пожаловать в отель',category:'hotel',icon:'info',action:'Открыть поездку',tone:'brand'},
 feedback:{label:'Отзыв после поездки',category:'trips',icon:'nav-chats',action:'Оставить отзыв',tone:'brand'},
 'stay-points':{label:'Баллы за проживание',category:'benefits',icon:'points',action:'Посмотреть выгоды',tone:'success'},
};
export type NoticeItem={id:string;kind:PushKind|'price';title:string;body:string;createdAt:string;read:boolean;category:NoticeCategory;icon:string;action:string;tone:'brand'|'success';hotelId?:string;bookingId?:string};
export function appNotices(s:Commerce,owner:string,now=Date.now()):NoticeItem[]{
 const local=(s.appNotices||[]).filter(n=>n.owner===owner&&Number.isFinite(Date.parse(n.createdAt))&&Date.parse(n.createdAt)<=now).map(n=>({...n,hotelId:n.hotelId||s.bookings.find(b=>b.id===n.bookingId&&canManageBooking(s,owner,b))?.draft.hotelId,...pushTemplates[n.kind]}));
 const prices=userPriceNotices(s,owner,now).map(n=>({id:'price:'+n.id,kind:'price' as const,hotelId:n.draft.hotelId,title:'Цена снизилась на '+formatMoney(n.previousMinor-n.currentMinor),body:`${catalog.hotels.find(h=>h.id===n.draft.hotelId)?.name||'Отель'} · ${catalog.rooms.find(r=>r.id===n.draft.roomId)?.title||'Номер'} теперь ${formatMoney(n.currentMinor)}`,createdAt:n.createdAt,read:n.read,category:'benefits' as const,icon:'ticket',action:'Посмотреть',tone:'success' as const}));
 return [...local,...prices].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||a.id.localeCompare(b.id));
}
export function scopedNotices(s:Commerce,owner:string,hotelId?:string,now=Date.now()){
 return appNotices(s,owner,now).filter(n=>!hotelId||n.hotelId===hotelId);
}
export function readScopedNotices(s:Commerce,owner:string,hotelId?:string,now=Date.now()){
 return scopedNotices(s,owner,hotelId,now).reduce((next,n)=>readAppNotices(next,owner,n.id,now),s);
}
export function readAppNotices(s:Commerce,owner:string,id?:string,now=Date.now()):Commerce{
 const next=!id||id.startsWith('price:')?readPriceNotices(s,owner,id?.slice(6)):s;
 return {...next,appNotices:(s.appNotices||[]).map(n=>n.owner===owner&&Date.parse(n.createdAt)<=now&&(!id||id===n.id)?{...n,read:true}:n)};
}
/** Explicit examples only: never creates a booking, key, loyalty credit or scheduled delivery. */
export function addNotificationExamples(s:Commerce,owner:string,now=Date.now()):Commerce{
 const booking=s.bookings.find(b=>b.id===s.selectedBooking&&canManageBooking(s,owner,b))||s.bookings.find(b=>canManageBooking(s,owner,b));
 const hotel=catalog.hotels.find(h=>h.id===booking?.draft.hotelId)?.name||'Mantera Resort & Congress';
 const copy:Record<PushKind,[string,string]>={
  'arrival-guide':['Всё готово к вашему заезду',`Как добраться и заселиться в ${hotel} — инструкция в вашей поездке.`],
  'room-key':['Ваш электронный ключ готов!',`Ключ от номера в ${hotel} уже в приложении. Откройте свою поездку, чтобы воспользоваться им.`],
  welcome:[`Приятного отдыха в ${hotel}!`,'Wi-Fi, удобства номера, услуги отеля и интересные места рядом — всё полезное в вашей поездке.'],
  feedback:[`Как вам отдых в ${hotel}?`,'Поделитесь впечатлениями — оставьте короткий отзыв.'],
  'stay-points':['Баллы за поездку уже на счёте',`За проживание в ${hotel} начислено 300 баллов. Ваш баланс — ${(s.payment.balances['keys:'+owner]||0).toLocaleString('ru-RU')} баллов.`],
 };
 const samples=pushKinds.map((kind,i):AppNotice=>({id:`example:${owner}:${kind}`,owner,kind,title:copy[kind][0],body:copy[kind][1],createdAt:new Date(now-[86400000+3600000,7200000,6300000,600000,120000][i]).toISOString(),read:i===0,bookingId:booking?.id,hotelId:booking?.draft.hotelId,demo:true}));
 return {...s,appNotices:[...(s.appNotices||[]).filter(n=>n.owner!==owner||!n.demo),...samples]};
}
export function removeNotificationExamples(s:Commerce,owner:string):Commerce{return {...s,appNotices:(s.appNotices||[]).filter(n=>n.owner!==owner||!n.demo)};}
export function notificationDestination(s:Commerce,owner:string,id:string,now=Date.now()){
 const n=appNotices(s,owner,now).find(n=>n.id===id);if(!n)throw Error('Уведомление недоступно');
 if(n.kind==='price')return {route:'booking-flow',priceId:n.id.slice(6)};
 if(n.kind==='stay-points')return {route:'rewards'};
 const b=s.bookings.find(b=>b.id===n.bookingId&&canManageBooking(s,owner,b));
 if(!b)throw Error('Поездка из уведомления больше недоступна');
 if(b.operation.status!=='confirmed')throw Error('Эта бронь отменена');
 if(n.kind==='room-key'&&!keyAccess(b,now).available)throw Error(b.stay?.status==='checked_out'?'Проживание завершено. Ключ уже недоступен':'Ключ доступен только во время проживания');
 if(n.kind==='welcome'&&!b.stay)throw Error('Информация о проживании появится после заселения');
 if(n.kind==='feedback'&&b.stay?.status!=='checked_out')throw Error('Оставить отзыв можно после завершения проживания');
 return {route:n.kind==='arrival-guide'?'trip-guide':n.kind==='feedback'?'trip-review':'trips',bookingId:b.id};
}
export function noticeDay(iso:string,now=Date.now()){
 const date=(v:number)=>new Date(v).toLocaleDateString('en-CA',{timeZone:'Europe/Moscow'}),at=Date.parse(iso);
 return date(at)===date(now)?'Сегодня':date(at)===date(now-86400000)?'Вчера':new Date(at).toLocaleDateString('ru-RU',{day:'numeric',month:'long',timeZone:'Europe/Moscow'});
}
