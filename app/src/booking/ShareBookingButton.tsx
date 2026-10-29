import {Button,Icon} from '../ui';
import './booking-share.css';

/** Один вход в совместный доступ и QR-код, одинаковый во всех состояниях поездки. */
export function ShareBookingButton({onClick}:{onClick:()=>void}){
 return <Button type="button" variant="secondary" className="booking-card-action" aria-label="Поделиться бронью" onClick={onClick}><Icon name="qr" size={20} inheritColor/><span>Поделиться</span></Button>;
}
