import type {State} from '../state.ts';
import {catalog,dateLabel,type Commerce} from '../booking/model.ts';
import {canManageBooking} from '../booking/bookingShare.ts';
export const supportTopics=['Бронирование','Возврат','Аккаунт и безопасность','Приложение','Другое'] as const;
export type SupportRequest={id:string;topic:string;text:string;createdAt:string;status:'new';bookingId?:string;tripLabel?:string};
export type SupportDraft={topic:string;text:string;bookingId?:string};
export function submitSupport(s:State,c:Commerce,owner:string,id:string,input:SupportDraft,now=new Date().toISOString()):State{
 const user=s.users[owner];if(!user||s.activePhone!==owner)throw Error('Войдите в профиль');
 if(user.supportRequests?.some(r=>r.id===id))return s;
 if(!id||!supportTopics.includes(input.topic as typeof supportTopics[number]))throw Error('Выберите тему');
 const text=input.text.trim();if(text.length<10||text.length>2000)throw Error('Опишите вопрос: от 10 до 2000 символов');
 const booking=input.bookingId?c.bookings.find(b=>b.id===input.bookingId&&canManageBooking(c,owner,b)):undefined;
 if(input.bookingId&&!booking)throw Error('Поездка недоступна. Выберите другую');
 const request:SupportRequest={id,topic:input.topic,text,createdAt:now,status:'new',...(booking?{bookingId:booking.id,tripLabel:`${catalog.hotels.find(h=>h.id===booking.draft.hotelId)?.name} · ${dateLabel(booking.draft.search)}`}:{})};
 return {...s,users:{...s.users,[owner]:{...user,supportDraft:undefined,supportRequests:[request,...(user.supportRequests||[])]}}};
}
export const helpArticles=[
 {id:'change',category:'Бронирование',title:'Как изменить или отменить бронь',text:'Откройте детали брони в «Поездках». Там можно изменить даты и гостей или отменить бронирование. Перед подтверждением будут показаны новый итог, возврат или удержание. Бесплатная отмена проживания доступна за 3 дня до заезда; позже удерживается стоимость одной ночи.',action:'К поездкам',route:'trips'},
 {id:'door',category:'Проживание',title:'Как открыть дверь номера',text:'Цифровой ключ появляется после заселения. Нажмите «Открыть дверь» и дождитесь результата. Если открытие не удалось, повторите попытку или обратитесь к сотруднику отеля.',action:'К поездкам',route:'trips'},
 {id:'points',category:'Баллы',title:'Чем отличаются баллы отеля и «Ключей»',text:'Баллы «Ключей» и отеля хранятся раздельно. При бронировании можно списать максимум доступного в пределах стоимости заказа или сохранить баллы. Баллы отеля действуют только в его программе. С Friendly Rate можно использовать баллы «Ключей», а программа отеля не суммируется.',action:'Мои выгоды',route:'rewards'},
 {id:'refund',category:'Бронирование',title:'Где посмотреть возврат',text:'Результат отмены проживания доступен в деталях брони и истории поездок. Денежная часть возвращается исходным способом, а баллы — в тот кошелёк, из которого они были списаны. Возврат за услуги зависит от условий конкретной услуги отеля.',action:'История поездок',route:'profile-history'},
 {id:'traveler',category:'Аккаунт',title:'Как добавить путешественника',text:'В профиле откройте «Путешественники» и добавьте человека. Имя, фамилия и телефон обязательны. Эти данные можно использовать для будущих бронирований. Добавление человека не выдаёт ему доступ к вашим поездкам и ключам.',action:'Путешественники',route:'travelers'},
 {id:'notifications',category:'Аккаунт',title:'Как настроить уведомления',text:'В профиле можно выбрать каналы и темы уведомлений, а также тихие часы. Для писем укажите почту основного путешественника. История уведомлений доступна по колокольчику; важная информация о поездке остаётся в приложении.',action:'Настроить уведомления',route:'profile-notifications'},
 {id:'times',category:'Проживание',title:'Как изменить время заезда и выезда',text:'При оформлении брони выберите время в блоке «Заезд и выезд» — итог обновится. После бронирования доступные варианты можно добавить к поездке. Стоимость раннего заезда оплачивается при заселении, позднего выезда — при выезде.',action:'К поездкам',route:'trips'},
 {id:'access',category:'Аккаунт',title:'Не узнаю устройство в списке',text:'Откройте «Безопасность и доступ», проверьте список устройств и завершите незнакомый сеанс. Если нужна помощь с аккаунтом, создайте обращение в поддержку «Ключей».',action:'Устройства и сеансы',route:'profile-sessions'},
];
