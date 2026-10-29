import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,cancelBooking,catalog,type Commerce} from '../booking/model.ts';
import {demoCheckIn} from '../booking/stay.ts';
import {demoCheckoutDay,confirmCheckout} from '../booking/stayBill.ts';
import {restoreTripByNumber} from './history.ts';
/** Local fixtures only. Real booking lookup requires a hotel integration and guest verification. */
export function historyFixture(owner:string,hotelId:string,number:string,status:'future'|'past'|'cancelled'){
 let s=ensureAccount(initialCommerce(),owner);const h=catalog.hotels.find(h=>h.id===hotelId)!;
 s={...s,search:{city:h.city,checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]}};
 s=startDraft(s,hotelId,number+'-'+owner);
 s.draft!.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};
 s=commitBooking(s,owner,quoteDraft(s,owner),'success','2026-10-27T12:00:00Z');
 const id=s.bookings[0].id;
 if(status==='cancelled')s=cancelBooking(s,owner,id,'2026-10-28T12:00:00Z');
 if(status==='past'){
  s.bookings[0].draft.search={...s.search,checkIn:'2026-10-10',checkOut:'2026-10-12'};
  s.bookings[0].createdAt='2026-10-01T12:00:00Z';
  s=demoCheckIn(s,owner,id,id+'-in');s=demoCheckoutDay(s,owner,id);s=confirmCheckout(s,owner,id,id+'-out');
 }
 return {...s.bookings[0],number};
}
export function addTripByNumber(s:Commerce,owner:string,number:string):Commerce{
 if(!s.accounts[owner])throw Error('Войдите в приложение');
 const code=number.trim().toUpperCase();
 if(code!=='KEYS-2026')return restoreTripByNumber(s,owner,code);
 const existing=s.bookings.find(b=>b.owner===owner&&b.number===code);
 if(existing)return restoreTripByNumber(s,owner,code);
 const b=historyFixture(owner,'kazan-city',code,'future');
 return {...s,bookings:[...s.bookings,b],selectedBooking:b.id,payment:{...s.payment,operations:{...s.payment.operations,[b.operation.id]:b.operation}}};
}
