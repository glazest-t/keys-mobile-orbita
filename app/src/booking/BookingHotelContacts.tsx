import {Icon} from '../ui';
import {isDesktop} from '../desktop/surface';
import {hotelLocation} from '../maps/locations';
import {hotelVisual} from './presentation';
import {hotelPhone} from './hotelContacts';
import './booking-hotel-contacts.css';

export function BookingHotelContacts({hotelId}:{hotelId:string}){
 const visual=hotelVisual(hotelId),phone=hotelPhone(hotelId);
 const address=[visual.location.replaceAll(' · ', ', '),hotelLocation(hotelId)?.address||visual.address].filter(Boolean).join(', ');
 const phoneLabel=phone?.replace(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/, '+7 ($1) $2-$3-$4');
 return <div className="booking-hotel-contacts"><div><Icon name="pin" size={16} inheritColor/><span>{address}</span></div>{phone&&!isDesktop?<a href={'tel:'+phone} aria-label={'Позвонить в отель: '+phoneLabel}><Icon name="phone" size={16} inheritColor/><span>{phoneLabel}</span></a>:<div><Icon name="phone" size={16} inheritColor/><span>{phoneLabel||'Телефон не указан'}</span></div>}</div>;
}
