import type {Booking} from './model';
import {bookingCancellationPolicy,cancellationTerms} from './bookingCancellation';
import './cancellation-terms.css';
export function CancellationTerms({booking}:{booking:Booking}){
 return <div className="booking-cancellation-terms"><h3>Условия отмены</h3>{cancellationTerms(booking.draft.search.checkIn,bookingCancellationPolicy(booking)).map(text=><p key={text}>{text}</p>)}</div>;
}
