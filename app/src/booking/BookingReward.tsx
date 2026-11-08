import {Icon} from '../ui';
import type {BookingQuote} from '../../../prototype/domain/booking.mjs';
import {pointsLabel} from '../rewards/points';
import {bookingRewardPoints} from './bookingRewards';
import './booking-reward.css';

export function BookingReward({quote}:{quote:BookingQuote}){
 const points=bookingRewardPoints(quote);
 return <section className="booking-reward desktop-booking-reward" aria-label="Баллы за бронирование">
  <span className="desktop-booking-reward-mark"><Icon name={points>0?"points-earned":"points"} size={28}/></span>
  <strong className="desktop-booking-reward-title">Баллы «Ключей»</strong>
  <strong className="desktop-booking-reward-amount" aria-live="polite" aria-atomic="true" aria-label={`+${points.toLocaleString('ru-RU')} ${pointsLabel(points)}`}>+{points.toLocaleString('ru-RU')}</strong>
  <p>{points>0?'Начислим после проживания':'За эту бронь баллы не начисляются'}</p>
 </section>;
}
