import {depositBalance} from './deposit.ts';
import {stayBill} from './stayBill.ts';
import {tripFacts} from './trip.ts';
import {serviceTitle,serviceStatusLabel} from './serviceSettlement.ts';
import {catalog,dateLabel,guestLabel,formatMoney,cancellationLabel,type Booking} from './model.ts';
import {bookingGuests,wishSummary} from './bookingParty.ts';
import {rateTitle} from './roomOffers.ts';

export type DocumentKind='confirmation'|'cancellation'|'invoice';
export type TripDocument={kind:DocumentKind;title:string;filename:string;bookingId:string;revision:number;hotel:string;dates:string;status:string;sections:{title:string;rows:[string,string][]}[]};
export function documentKinds(b:Booking):DocumentKind[]{return ['confirmation',...(b.stay?.status==='checked_out'?['invoice' as const]:[]),...(b.operation.status==='cancelled'?['cancellation' as const]:[])];}
export function tripDocument(b:Booking,kind:DocumentKind):TripDocument{
 if(!documentKinds(b).includes(kind))throw Error('Этот документ пока недоступен');
 const d=b.draft,o=b.operation,room=catalog.rooms.find(r=>r.id===d.roomId)!,rate=catalog.rates.find(r=>r.id===d.rateId)!;
 const money:[string,string][]=[['Стоимость заказа',formatMoney(b.quote.orderTotalMinor)],['Скидка на проживание',formatMoney(b.quote.hotelDiscountMinor)],['Оплачено деньгами',formatMoney(o.paidCashMinor)],['Списано баллов «Ключей»',b.quote.applied.keysPoints.toLocaleString('ru-RU')],['Списано баллов отеля',b.quote.applied.hotelPoints.toLocaleString('ru-RU')],['При заселении',formatMoney(o.dueAtHotelMinor)]];
 const refund:[string,string][]=[['Возврат денег',formatMoney(o.refundCashMinor||0)],['Возврат баллов',((o.returnedPointsMinor||0)/100).toLocaleString('ru-RU')],['Удержание',formatMoney(o.penaltyMinor||0)],['К доплате за отмену',formatMoney(o.penaltyDueMinor||0)]];
 const stay:[string,string][]=[['Заезд',`${d.search.checkIn} · с ${tripFacts(b).checkInTime}`],['Выезд',`${d.search.checkOut} · до ${tripFacts(b).checkOutTime}`],['Номер',room.title],['Тариф',rateTitle(rate)],['Гости',guestLabel(d.search)],['Основной гость',`${d.contact.name} ${d.contact.surname}`],...bookingGuests(d).map((g,i):[string,string]=>[`Гость ${i+2}`,`${g.name} ${g.surname}`]),['Бесплатная отмена до',cancellationLabel(d.search)]];
 const titles={invoice:'Счёт для отчёта',confirmation:'Подтверждение брони',cancellation:'Подтверждение отмены'};
 const sections:TripDocument['sections']=kind==='confirmation'?[{title:'Проживание',rows:stay},...(d.services.length?[{title:'Услуги в брони',rows:d.services.map(id=>['Услуга',catalog.services.find(s=>s.id===id)?.title||id] as [string,string])}]:[]),...(wishSummary(d)?[{title:'Пожелания',rows:[['Пожелания к проживанию',wishSummary(d)!] as [string,string]]}]:[]),{title:'Оплата',rows:money}]:[{title:'Отмена и возврат',rows:refund}];
 if(kind==='confirmation'&&b.serviceRequests?.length)sections.push({title:'Дополнительные заказы услуг',rows:b.serviceRequests.map(r=>[serviceTitle(r)+' · '+r.date+' '+r.time,serviceStatusLabel(b,r)+' · '+formatMoney(r.amountMinor)+(r.operation?' · Деньгами '+formatMoney(r.operation.paidCashMinor)+' · Баллами '+r.operation.pointsMinor/100:'')])});
 if(o.status==='cancelled'&&kind!=='cancellation')sections.push({title:'Бронь отменена',rows:refund});
 if(kind==='invoice'){const bill=stayBill(b);sections.splice(0,sections.length,{title:'Проживание',rows:stay.filter(([label])=>label!=='Бесплатная отмена до')},{title:'Итоговый счёт',rows:[['Проживание и услуги в брони',formatMoney(b.quote.orderTotalMinor)],...bill.charges.map(r=>[serviceTitle(r)+' · '+r.date,formatMoney(r.amountMinor)] as [string,string]),...(b.serviceRequests||[]).filter(r=>r.operation?.penaltyMinor).map(r=>['Удержание · '+serviceTitle(r),formatMoney(r.operation!.penaltyMinor!)] as [string,string]),['Итого',formatMoney(bill.total)],['Оплачено деньгами',formatMoney(bill.cash)],['Оплачено баллами',String(bill.points/100)],['Остаток',formatMoney(bill.due)],...(b.deposit?[[b.deposit.returned?'Возвращено с депозита':'Остаток депозита',formatMoney(b.deposit.returned?.amountMinor??depositBalance(b))] as [string,string]]:[])]});}
 const safeId=b.id.replace(/[^a-zA-Z0-9_-]/g,'_');
 return {kind,title:titles[kind],filename:`${kind}-${safeId}-v${b.revision||1}.pdf`,bookingId:b.id.toUpperCase(),revision:b.revision||1,hotel:catalog.hotels.find(h=>h.id===d.hotelId)!.name,dates:dateLabel(d.search),status:o.status==='cancelled'?'Отменена':b.stay?.status==='checked_out'?'Завершена':'Подтверждена',sections};
}
export function validDocumentEmail(value:string){return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)&&value.length<=254;}
