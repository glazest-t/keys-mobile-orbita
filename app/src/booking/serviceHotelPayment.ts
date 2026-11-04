import type {Booking} from './model.ts';

/** Payment timing follows the current stage of the guest's trip. */
export const hotelServicePaymentLabel=(booking:Booking)=>booking.stay?'Оплата при выезде':'Оплата при заселении';
