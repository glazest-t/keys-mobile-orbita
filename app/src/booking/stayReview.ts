import type {Commerce} from './model.ts';
import {canManageBooking} from './bookingShare.ts';
import {stayNow} from './stay.ts';
export const reviewTopics={liked:['Номер','Пляж','Завтрак','Персонал','Тишина','СПА','Расположение'],improve:['Wi-Fi','Шумоизоляция','Парковка','Заселение']};
export type ReviewInput={rating:number;liked:string[];improve:string[];text:string;photos:string[]};
export type StayReview=ReviewInput&{id:string;author:string;createdAt:string};
export function reviewInputError(input:ReviewInput){
 if(!Number.isInteger(input.rating)||input.rating<1||input.rating>5)return 'Выберите оценку от 1 до 5';
 if(input.text.length>1500)return 'Сократите отзыв до 1500 символов';
 if(input.photos.length>5||input.photos.some(p=>!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(p)||p.length>350000))return 'Добавьте до пяти фотографий JPG, PNG или WebP до 5 МБ';
 if(input.liked.some(t=>!reviewTopics.liked.includes(t))||input.improve.some(t=>!reviewTopics.improve.includes(t)))return 'Проверьте темы отзыва';
 return '';
}
export function sendStayReview(s:Commerce,actor:string,bookingId:string,id:string,input:ReviewInput,now=Date.now()):Commerce{
 const b=s.bookings.find(b=>b.id===bookingId);
 if(!b||!canManageBooking(s,actor,b))throw Error('Нет доступа к поездке');
 if(b.operation.status!=='confirmed'||b.stay?.status!=='checked_out')throw Error('Оставить отзыв можно после завершения проживания');
 if(b.review){if(b.review.id===id)return s;throw Error('Отзыв о поездке уже сохранён');}
 const error=reviewInputError(input);if(error)throw Error(error);
 if(!id||!Number.isFinite(now))throw Error('Не удалось сохранить отзыв');
 const review:StayReview={...input,liked:[...new Set(input.liked)],improve:[...new Set(input.improve)],photos:[...input.photos],text:input.text.trim(),id,author:actor,createdAt:new Date(stayNow(b,now)).toISOString()};
 return {...s,bookings:s.bookings.map(item=>item.id===b.id?{...item,review}:item)};
}
