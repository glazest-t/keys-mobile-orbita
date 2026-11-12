import {tripEditorialText} from '../../../prototype/domain/tripEditorialText.mjs';
import {breakfastVenue} from './breakfastVenue.ts';
import {tripFacts} from './trip.ts';
import {activeRequests} from './serviceRequests.ts';
import type {Booking} from './model.ts';

export function breakfastSummary(b:Booking){
 const facts=tripFacts(b);
 const orders=activeRequests(b).filter(r=>r.kind==='breakfast'&&r.mode!=='room').sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
 const unpaid=orders.find(r=>r.status==='confirmed'&&!r.operation);
 const order=unpaid||orders[0];
 const present=facts.breakfastIncluded||facts.breakfastAdded||!!order;
 const label=facts.breakfastIncluded&&!order?'Включено':present?'Добавлено':tripEditorialText("ПР-190", 'Не добавлена', "Не добавлено");
 const tone='success' as const;
 const venue=breakfastVenue(b.draft.hotelId);
 return {present,label,tone,details:present?`${venue.hours} · ${venue.restaurant} · ${venue.floor}`:tripEditorialText("ПР-190", 'Не добавлена', "Не добавлено")};
}
