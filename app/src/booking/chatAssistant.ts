import {canManageBooking} from './bookingShare.ts';
import {tripFacts,type ChatAction} from './trip.ts';
import {settingsFor,breakfastIncluded,requestStatus} from './serviceRequests.ts';
import {hotelVisual} from './presentation.ts';
import {formatMoney,type Booking,type Commerce} from './model.ts';

type Answer={text:string;action?:ChatAction};
/** Deterministic demo answers. Reading the booking never creates a service or changes money. */
export function chatAnswer(b:Booking,text:string):Answer {
 const q=text.toLocaleLowerCase('ru-RU').replace(/ё/g,'е'),facts=tripFacts(b),visual=hotelVisual(b.draft.hotelId);
 const active=b.operation.status==='confirmed'&&b.stay?.status!=='checked_out';
 if(/сотрудник|оператор|человек|администратор/.test(q))return {text:'Запрос на подключение сотрудника создан. Пока ожидаете, я могу подсказать сведения о поездке и услугах.'};
 if(b.operation.status==='cancelled'&&!/адрес|маршрут|добра/.test(q))return {text:'Эта бронь отменена. Сведения об отмене и возврате доступны в деталях брони.'};
 if(/завтрак|поесть|питани/.test(q)){
  const config=settingsFor(b),orders=(b.serviceRequests||[]).filter(r=>r.kind==='breakfast'&&!['cancelled','declined','review'].includes(requestStatus(b,r)));
  const unpaid=orders.some(r=>requestStatus(b,r)==='confirmed'&&!r.operation&&r.amountMinor>0);
  return {text:`Завтрак — с 07:00 до 11:00${b.draft.hotelId==='orbit-sea'?' в ресторане «Гренадин»':' в ресторане отеля'}. ${breakfastIncluded(b)?'Включён в вашу бронь.':`Стоимость — ${formatMoney(config.breakfastMinor)} за персону.`}${unpaid?' У вас есть завтрак, ожидающий оплаты.':orders.some(r=>r.operation?.status==='confirmed')?' У вас есть оплаченный заказ завтрака.':''}`,action:active?'breakfast':undefined};
 }
 if(/поздн|выезд|выеха/.test(q))return {text:b.stay?.status==='checked_out'?'Поездка завершена: отель оформил выезд.':`Выезд — до ${facts.checkOutTime}.${active?' Доступные варианты позднего выезда можно посмотреть в услугах отеля.':''}`,action:active?'services':undefined};
 if(/заезд|заех|засел|ранн|приезд|приех|вход|документ/.test(q))return {text:b.stay?.status==='checked_out'?'Поездка завершена: отель оформил выезд.':b.stay?.status==='in_house'?`Вы заселены. Ваш номер — ${b.stay.roomNumber}.`:`Заезд — с ${facts.checkInTime}. На ресепшене назовите номер брони и предъявите документы гостей.`,action:active&&!b.stay?'guide':undefined};
 if(/wi[ -]?fi|вай.?фай|интернет|пароль/.test(q))return {text:b.stay?.status==='in_house'&&active?'Реквизиты сети и инструкция доступны в блоке Wi-Fi на странице поездки.':b.stay?.status==='checked_out'?'Поездка завершена. Для доступа к сети обратитесь на ресепшен.':'Реквизиты Wi-Fi будут доступны на странице поездки после заселения.'};
 if(/парков|машин|автомоб/.test(q))return {text:visual.amenities.includes('Парковка')?`${b.draft.hotelId==='orbit-sea'?'Въезд на парковку — с улицы Голубая.':'У отеля есть парковка.'} Доступность и стоимость смотрите в услугах отеля.`:'Наличие парковки нужно уточнить у ресепшена.',action:active&&visual.amenities.includes('Парковка')?'services':undefined};
 if(/добра|адрес|маршрут|такси|где отель/.test(q))return {text:`Отель находится по адресу: ${visual.location}, ${visual.address}. Маршрут можно открыть ниже.`,action:'route'};
 if(/ключ|двер/.test(q))return {text:b.stay?.status==='in_house'&&active?'Цифровой ключ доступен в карточке проживания. Нажмите «Открыть дверь».':b.stay?.status==='checked_out'?'После выезда цифровой ключ больше недоступен.':'Цифровой ключ появится в поездке после фактического заселения.'};
 if(/услуг|полотен|уборк|подуш|бель|спа|spa|трансфер/.test(q))return {text:active?'Выберите услугу, дату и параметры в каталоге отеля. Там же можно посмотреть заказ и оплатить его.':'Новые услуги доступны только для действующей поездки.',action:active?'services':undefined};
 if(/оплат|счет|деньг/.test(q))return {text:b.operation.status==='cancelled'?'Бронь отменена. Информация о возврате доступна в деталях брони.':facts.due?`По проживанию осталось оплатить ${formatMoney(facts.due)}. Детали доступны в вашей брони.`:'Проживание оплачено. Оплата дополнительных услуг показывается отдельно в их заказах.'};
 return {text:'Могу подсказать время заезда и выезда, условия завтрака, адрес, парковку или доступные услуги. Что вас интересует?'};
}
export function replyToTripMessage(state:Commerce,actor:string,bookingId:string,messageId:string,at=new Date().toISOString()):Commerce {
 const b=state.bookings.find(b=>b.id===bookingId&&canManageBooking(state,actor,b));
 if(!b)throw Error('Поездка не найдена');
 const messages=state.tripMessages?.[bookingId]||[],message=messages.find(m=>m.id===messageId);
 if(!message||message.role==='assistant'||message.replyState!=='pending')return state;
 if(messages.some(m=>m.replyTo===messageId))return state;
 const reply={id:'assistant:'+messageId,role:'assistant' as const,replyTo:messageId,at,...chatAnswer(b,message.text)};
 return {...state,tripMessages:{...state.tripMessages,[bookingId]:[...messages.map(m=>m.id===messageId?{...m,replyState:'answered' as const}:m),reply]}};
}
