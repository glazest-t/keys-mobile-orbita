import {hotelRewardPoints,type HotelLoyaltySnapshot} from '../rewards/loyalty';
import {editorialText} from '../../../prototype/domain/editorialText.mjs';
import {useState} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Icon} from '../ui';
import type {BookingQuote} from '../../../prototype/domain/booking.mjs';
import {pointsLabel} from '../rewards/points';
import {bookingRewardPoints} from './bookingRewards';
import './booking-reward.css';

export function BookingReward({quote,hotelLoyalty}:{quote:BookingQuote;hotelLoyalty?:HotelLoyaltySnapshot}){
 const points=bookingRewardPoints(quote);
 const hotelPoints=hotelRewardPoints(quote,hotelLoyalty);
 const [infoOpen,setInfoOpen]=useState(false);
 return <><section className="booking-reward desktop-booking-reward" aria-label="Баллы за бронирование">
  <span className="icon-tile desktop-booking-reward-mark"><Icon name="points" size={20} inheritColor/></span>
  <strong className="desktop-booking-reward-title">{editorialText("РШ-333", "Баллы «Ключей»", "Баллы Ключей")}<button type="button" className="booking-reward-info" aria-label="Как работают баллы Ключей" aria-haspopup="dialog" aria-expanded={infoOpen} onClick={()=>setInfoOpen(true)}><Icon name="info" size={16} inheritColor/></button></strong>
  <strong className="desktop-booking-reward-amount" aria-live="polite" aria-atomic="true" aria-label={`+${points.toLocaleString('ru-RU')} ${pointsLabel(points)}`}>+{points.toLocaleString('ru-RU')}</strong>
  {hotelLoyalty&&hotelLoyalty.earnBasisPoints>0&&<>
  <span className="icon-tile desktop-booking-reward-mark"><Icon name="hotel-building" size={20} inheritColor/></span>
  <strong className="desktop-booking-reward-title">Баллы отеля</strong>
  <strong className="desktop-booking-reward-amount" aria-live="polite" aria-atomic="true" aria-label={`+${hotelPoints.toLocaleString('ru-RU')} ${pointsLabel(hotelPoints)}`}>+{hotelPoints.toLocaleString('ru-RU')}</strong>
  </>}
  <p>{points>0||hotelPoints>0?'Начислим после проживания':'За эту бронь баллы не начисляются'}</p>
 </section><BottomSheet open={infoOpen} onOpenChange={setInfoOpen} title="Баллы Ключей" snap={.65}>
  <div className="booking-reward-explanation">
   <div><h3>За эту бронь</h3><p>{points>0?`Начислим ${points.toLocaleString('ru-RU')} ${pointsLabel(points)} после проживания.`:'За эту бронь баллы не начисляются.'}</p></div>
   <div><h3>1 балл = 1 ₽ скидки</h3><p>Баллами можно оплатить до 100% стоимости бронирования. Выберите «Списать баллы» при оформлении.</p></div>
   <p>Баллы Ключей и баллы отеля хранятся отдельно. Баллы отеля действуют только в его программе.</p>
   <Button variant="secondary" dismissOnly onClick={()=>setInfoOpen(false)}>Понятно</Button>
  </div>
 </BottomSheet></>;
}
