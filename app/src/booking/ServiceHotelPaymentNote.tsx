import {tripEditorialText} from '../../../prototype/domain/tripEditorialText.mjs';
import {Icon} from '../ui';
import type {Booking} from './model';
import {hotelServicePaymentLabel} from './serviceHotelPayment';
import './service-hotel-payment.css';

export function ServiceHotelPaymentNote({booking,amount}:{booking:Booking;amount:number}){
 if(amount<=0)return null;
 return <p className="service-hotel-payment-note"><Icon name="info" size={18} inheritColor/><span>{tripEditorialText("ПР-165", `${hotelServicePaymentLabel(booking)}. Сейчас ничего оплачивать не нужно.`, `${hotelServicePaymentLabel(booking)}. Сейчас ничего оплачивать не нужно`)}</span></p>;
}
