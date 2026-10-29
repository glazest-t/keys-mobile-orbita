import type {Commerce} from './model.ts';
import {canManageBooking} from './bookingShare.ts';
import {keyAccess,openRoom} from './stay.ts';
export type DoorAttempt={bookingId:string;actor:string;stayEventId:string;eventId:string;outcome:'success'|'failure'};
export function prepareDoorAttempt(s:Commerce,actor:string,bookingId:string,eventId:string,outcome:DoorAttempt['outcome'],now=Date.now()):DoorAttempt{
 const b=s.bookings.find(b=>b.id===bookingId);
 if(!b||!canManageBooking(s,actor,b))throw Error('Нет доступа к брони');
 const access=keyAccess(b,now);if(!access.available)throw Error(access.reason);
 return {bookingId,actor,stayEventId:b.stay!.eventId,eventId,outcome};
}
export function finishDoorAttempt(s:Commerce,attempt:DoorAttempt,actor:string,now=Date.now()){
 if(actor!==attempt.actor||s.selectedBooking!==attempt.bookingId)throw Error('Открытие отменено');
 const b=s.bookings.find(b=>b.id===attempt.bookingId);
 if(!b||!canManageBooking(s,actor,b)||b.stay?.eventId!==attempt.stayEventId)throw Error('Доступ к номеру изменился');
 return openRoom(s,b.owner,b.id,attempt.eventId,attempt.outcome,now);
}
