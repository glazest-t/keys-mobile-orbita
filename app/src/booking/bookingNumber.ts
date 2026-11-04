import type {Booking} from './model.ts';

/** Stable public demo number; internal IDs and legacy lookup codes stay unchanged. */
export function bookingNumber(b:Pick<Booking,'id'|'number'|'createdAt'>):string{
 if(b.number&&/^\d{8}-\d{5}-\d{8}$/.test(b.number))return b.number;
 const day=b.createdAt.slice(0,10).replaceAll('-','');
 const hash=(seed:number)=>{let value=seed;for(const char of b.id)value=Math.imul(value^char.charCodeAt(0),16777619)>>>0;return value;};
 return `${/^\d{8}$/.test(day)?day:'20261007'}-${10000+hash(2166136261)%90000}-${10000000+hash(5381)%90000000}`;
}
