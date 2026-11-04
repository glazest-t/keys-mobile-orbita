import {bookingNumber} from './bookingNumber';
import {catalog,type Booking} from './model';
import {hotelVisual} from './presentation';
import {hotelLocation} from '../maps/locations';
import {tripFacts} from './trip';

const escape=(value:string)=>value.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
// Fold by UTF-8 bytes, as required by iCalendar (including Cyrillic names).
const fold=(line:string)=>{const rows:string[]=[];let row='',length=0;for(const char of line){const bytes=new TextEncoder().encode(char).length;if(length+bytes>75){rows.push(row);row=' ';length=1;}row+=char;length+=bytes;}rows.push(row);return rows.join('\r\n');};
export function bookingCalendar(b:Booking,now=new Date()){
 const hotel=catalog.hotels.find(h=>h.id===b.draft.hotelId),visual=hotelVisual(b.draft.hotelId),facts=tripFacts(b);
 const address=[visual.location.replaceAll(' · ', ', '),hotelLocation(b.draft.hotelId)?.address||visual.address].filter(Boolean).join(', ');
 // All-day stay spans the booked nights; the checkout date is the exclusive end.
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Keys//Booking//RU','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${escape(b.id)}@keys.example`,`DTSTAMP:${now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${b.draft.search.checkIn.replaceAll('-','')}`,`DTEND;VALUE=DATE:${b.draft.search.checkOut.replaceAll('-','')}`,`SUMMARY:${escape('Поездка · '+(hotel?.name||'Отель'))}`,`LOCATION:${escape(address)}`,`DESCRIPTION:${escape(`Бронь № ${bookingNumber(b)}\nЗаезд ${b.draft.search.checkIn} с ${facts.checkInTime}\nВыезд ${b.draft.search.checkOut} до ${facts.checkOutTime}`)}`,'STATUS:CONFIRMED','END:VEVENT','END:VCALENDAR'];
 return lines.map(fold).join('\r\n')+'\r\n';
}
export function downloadBookingCalendar(b:Booking){
 const url=URL.createObjectURL(new Blob([bookingCalendar(b)],{type:'text/calendar;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='keys-trip.ics';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
