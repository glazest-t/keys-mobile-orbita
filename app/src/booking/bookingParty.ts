import type {Draft,Search} from './model.ts';
import type {User} from '../state.ts';

export type GuestName={name:string;surname:string};
export const guestCapacity=(search:Search)=>Math.max(0,search.adults+search.childrenAges.length-1);
// Keep the original second-guest field readable in existing saved bookings.
export function bookingGuests(d:Draft):GuestName[]{return [...(d.additionalGuest?[d.additionalGuest]:[]),...(d.otherGuests||[])];}
export function guestPatch(guests:GuestName[]):Pick<Draft,'additionalGuest'|'otherGuests'>{return {additionalGuest:guests[0],otherGuests:guests.slice(1)};}
export function trimGuests(d:Draft,search:Search){return guestPatch(bookingGuests(d).slice(0,guestCapacity(search)));}
export function updateGuest(d:Draft,index:number,guest:GuestName|null){
 const guests=bookingGuests(d);
 if(index<0||index>guests.length||index>=guestCapacity(d.search))throw Error('Проверьте состав гостей');
 if(guest)guests[index]={...guest};else guests.splice(index,1);
 return guestPatch(guests);
}
export function prefillAdditionalGuest(draft:Draft,user:User|null,index:number):Draft{
 const guests=bookingGuests(draft);
 if(!user||index!==guests.length||index>=guestCapacity(draft.search))return draft;
 const key=(g:GuestName)=>`${g.name.trim()} ${g.surname.trim()}`.toLocaleLowerCase('ru-RU');
 const used=new Set([key(draft.contact),...guests.map(key)]);
 const next=user.travelers.find(t=>!t.primary&&t.name.trim()&&t.surname.trim()&&!used.has(key(t)));
 return next?{...draft,...updateGuest(draft,index,{name:next.name,surname:next.surname})}:draft;
}
export const stayWishOptions=['Тихий номер','Высокий этаж','Номера рядом'] as const;
export const WISH_LIMIT=500;
export function wishSummary(d:Draft){return [...(d.stayWishes?.options||[]),d.stayWishes?.note.trim()].filter(Boolean).join(' · ');}
