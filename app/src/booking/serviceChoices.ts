import type {Commerce} from './model.ts';
import {requestCatalogService} from './hotelServiceCatalog.ts';
export type ServiceLine={id:string;title:string;quantity:number;unitPriceMinor:number};
// Fictional menu and hotel inventory for the prototype. No restaurant integration.
export const foodMenu=[
 {id:'porridge',title:'Овсяная каша с ягодами',detail:'250 г',category:'Завтраки',amount:42000,icon:'breakfast'},
 {id:'omelette',title:'Омлет с овощами',detail:'220 г',category:'Завтраки',amount:58000,icon:'breakfast'},
 {id:'salad',title:'Овощной салат',detail:'200 г',category:'Закуски',amount:49000,icon:'restaurant'},
 {id:'soup',title:'Тыквенный суп',detail:'300 г',category:'Горячее',amount:55000,icon:'restaurant'},
 {id:'pasta',title:'Паста с томатами',detail:'300 г',category:'Горячее',amount:72000,icon:'restaurant'},
 {id:'cheesecake',title:'Чизкейк с ягодами',detail:'140 г',category:'Десерты',amount:45000,icon:'restaurant'},
 {id:'tea',title:'Чай',detail:'400 мл',category:'Напитки',amount:25000,icon:'breakfast'},
 {id:'water',title:'Вода без газа',detail:'500 мл',category:'Напитки',amount:18000,icon:'breakfast'},
] as const;
export const roomItems=[
 {id:'towel',title:'Полотенце',amount:0}, {id:'linen',title:'Комплект белья',amount:0},
 {id:'hygiene',title:'Гигиенический набор',amount:0},
] as const;
export const cleaningTypes=[{id:'standard',title:'Стандартная'},{id:'evening',title:'Вечерняя'},{id:'express',title:'Экспресс'}] as const;
export type ServiceChoicesInput={date:string;time:string;quantities:Record<string,number>;cleaning:string;comment:string;photo?:string};
export const pillowTypes=[{id:'down',title:'Пуховая'},{id:'latex',title:'Латексная'},{id:'buckwheat',title:'С гречихой'}] as const;
export type ChoiceKind='food'|'towels'|'cleaning'|'pillow'|'other';
export function choiceLines(kind:ChoiceKind,input:ServiceChoicesInput):ServiceLine[]{
 if(kind==='cleaning'||kind==='pillow') {const item=(kind==='cleaning'?cleaningTypes:pillowTypes).find(v=>v.id===input.cleaning);if(!item)throw Error('Выберите вариант услуги');return [{id:item.id,title:kind==='cleaning'?item.title+' уборка':item.id==='buckwheat'?'Подушка с гречихой':item.title+' подушка',quantity:1,unitPriceMinor:0}];}
 if(kind==='other'){if(!input.comment.trim()||input.comment.length>500)throw Error('Опишите запрос: до 500 символов');return [];}
 const catalog=kind==='food'?foodMenu:roomItems;
 if(Object.keys(input.quantities).some(id=>!catalog.some(item=>item.id===id)))throw Error('Позиция больше недоступна');
 const lines=catalog.map(item=>({id:item.id,title:item.title,quantity:input.quantities[item.id]||0,unitPriceMinor:item.amount}));
 if(lines.some(item=>!Number.isInteger(item.quantity)||item.quantity<0||item.quantity>10))throw Error('Можно заказать до 10 единиц каждой позиции');
 const chosen=lines.filter(item=>item.quantity>0);if(!chosen.length)throw Error(kind==='food'?'Добавьте блюда в заказ':'Выберите нужные предметы');return chosen;
}
export const choiceTotal=(lines:ServiceLine[])=>lines.reduce((sum,line)=>sum+line.quantity*line.unitPriceMinor,0);
export function requestServiceChoices(s:Commerce,actor:string,bookingId:string,kind:ChoiceKind,input:ServiceChoicesInput,id:string,now=Date.now()):Commerce{
 const lines=choiceLines(kind,input);
 if(input.photo&&(!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(input.photo)||input.photo.length>350000))throw Error('Не удалось прикрепить фото');
 const next=requestCatalogService(s,actor,bookingId,kind,input.date,input.time,input.comment,id,now);
 if(next===s)return s;
 return {...next,bookings:next.bookings.map(b=>b.id===bookingId?{...b,serviceRequests:b.serviceRequests!.map(r=>r.id===id?{...r,items:lines,photo:input.photo,amountMinor:choiceTotal(lines),title:kind==='cleaning'||kind==='pillow'?lines[0].title:r.title}:r)}:b)};
}
