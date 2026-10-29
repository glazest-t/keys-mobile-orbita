import type {Draft} from './model.ts';
import type {User,Traveler} from '../state.ts';
import {bookingGuests,guestPatch} from './bookingParty.ts';
import {normalizeContactPhone} from '../travelers/contactPhone.ts';
const personKey=(person:{name:string;surname:string})=>`${person.name.trim()} ${person.surname.trim()}`.toLocaleLowerCase('ru');
export function selfBookingContact(user:User){const t=user.travelers.find(t=>t.primary);return {name:t?.name||user.name,surname:t?.surname||'Примерова',phone:t?.phone||user.phone,email:t?.email||'guest@example.test'};}
export function selectBookingPerson(draft:Draft,user:User,person:Traveler):Partial<Draft>{
 if(!user.travelers.some(t=>t.id===person.id))throw Error('Путешественник не найден');
 return {bookingFor:person.primary?'self':'other',guestTravelerId:person.id,contact:{name:person.name,surname:person.surname,phone:normalizeContactPhone(person.phone)||person.phone,email:person.email||selfBookingContact(user).email},...guestPatch(bookingGuests(draft).filter(g=>personKey(g)!==personKey(person)))};
}
export function changeBookingFor(draft:Draft,user:User,mode:'self'|'other'):Partial<Draft>{
 if(mode===(draft.bookingFor||'self'))return {};
 if(mode==='self')return {bookingFor:mode,guestTravelerId:user.travelers.find(t=>t.primary)?.id,contact:selfBookingContact(user),...guestPatch(bookingGuests(draft).filter(g=>personKey(g)!==personKey(selfBookingContact(user))))};
 return {bookingFor:mode,guestTravelerId:undefined,contact:{name:'',surname:'',phone:'',email:selfBookingContact(user).email}};
}
export function availableBookingTravelers(draft:Draft,user:User,index?:number){
 const used=new Set([personKey(draft.contact),...bookingGuests(draft).filter((_,i)=>i!==index).map(personKey)]);
 return user.travelers.filter(t=>t.name.trim()&&t.surname.trim()&&!used.has(personKey(t)));
}
