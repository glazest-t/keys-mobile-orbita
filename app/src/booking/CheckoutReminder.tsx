import {tripEditorialText} from '../../../prototype/domain/tripEditorialText.mjs';
import {Icon} from '../ui';

/** Informational only: checkout is confirmed by the hotel. */
export function CheckoutReminder(){
 return <aside className="trip-checkout-reminder" aria-label={tripEditorialText("ПР-249", "Перед выездом", "Ничего не забыли?")}>
  <span className="trip-checkout-reminder-icon"><Icon name="info" size={20} inheritColor/></span>
  <div>
   <h2>{tripEditorialText("ПР-249", "Перед выездом", "Ничего не забыли?")}</h2>
   <p>{tripEditorialText("ПР-250", "Проверьте сейф, заберите документы, вещи и зарядки.", "Проверьте, всё ли забрали: документы, зарядку и хорошее настроение")}</p>
  </div>
 </aside>;
}
