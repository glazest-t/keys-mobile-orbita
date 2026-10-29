import {Icon} from '../ui';

/** Informational only: checkout is confirmed by the hotel. */
export function CheckoutReminder(){
 return <aside className="trip-checkout-reminder" aria-label="Перед выездом">
  <span className="trip-checkout-reminder-icon"><Icon name="info" size={20} inheritColor/></span>
  <div>
   <h2>Перед выездом</h2>
   <p>Проверьте сейф, заберите документы, вещи и зарядки.</p>
  </div>
 </aside>;
}
