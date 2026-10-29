import {Button,Icon} from '../ui';
import {ShareBookingButton} from './ShareBookingButton';

export function BookingCardActions({onDetails,onShare}:{onDetails:()=>void;onShare:()=>void}){
 return <div className="booking-card-actions">
  <Button type="button" variant="secondary" className="booking-card-action" aria-label="Детали брони" onClick={onDetails}><Icon name="document" size={20} inheritColor/><span>Детали</span></Button>
  <ShareBookingButton onClick={onShare}/>
 </div>;
}
