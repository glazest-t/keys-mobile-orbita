import {catalog,dateLabel,type Commerce} from './model.ts';
import {canManageBooking} from './bookingShare.ts';
import {sendTripMessage,type TripMessage} from './trip.ts';
import {replyToTripMessage} from './chatAssistant.ts';
import {hotelVisual} from './presentation.ts';
export type ChatTarget={hotelId:string;bookingId?:string};
export type HotelConversation={hotelId:string;createdAt:string;messages:TripMessage[]};
export const threadKey=(t:ChatTarget)=>t.bookingId?'trip:'+t.bookingId:'hotel:'+t.hotelId;
function validate(s:Commerce,actor:string,t:ChatTarget){
 if(!s.accounts[actor]||!catalog.hotels.some(h=>h.id===t.hotelId))throw Error('Диалог недоступен');
 if(t.bookingId&&!s.bookings.some(b=>b.id===t.bookingId&&b.draft.hotelId===t.hotelId&&canManageBooking(s,actor,b)))throw Error('Нет доступа к поездке');
}
export function threadMessages(s:Commerce,actor:string,t:ChatTarget){validate(s,actor,t);return t.bookingId?s.tripMessages?.[t.bookingId]||[]:s.hotelConversations?.[actor]?.[t.hotelId]?.messages||[];}
export function openHotelConversation(s:Commerce,actor:string,hotelId:string,now=new Date().toISOString()):Commerce{
 const t={hotelId};validate(s,actor,t);if(s.hotelConversations?.[actor]?.[hotelId])return s;
 return {...s,hotelConversations:{...s.hotelConversations,[actor]:{...s.hotelConversations?.[actor],[hotelId]:{hotelId,createdAt:now,messages:[]}}}};
}
export function sendChatMessage(s:Commerce,actor:string,t:ChatTarget,text:string,id:string,at=new Date().toISOString()):Commerce{
 validate(s,actor,t);if(t.bookingId)return sendTripMessage(s,actor,t.bookingId,text,id,at);
 const next=openHotelConversation(s,actor,t.hotelId,at),conversation=next.hotelConversations![actor][t.hotelId];
 if(conversation.messages.some(m=>m.id===id))return next;
 if(!id||!text.trim()||text.trim().length>1000)throw Error('Введите сообщение до 1000 символов');
 return {...next,hotelConversations:{...next.hotelConversations,[actor]:{...next.hotelConversations![actor],[t.hotelId]:{...conversation,messages:[...conversation.messages,{id,text:text.trim(),at,role:'guest',replyState:'pending'}]}}}};
}
export function replyToChat(s:Commerce,actor:string,t:ChatTarget,messageId:string,at=new Date().toISOString()):Commerce{
 validate(s,actor,t);if(t.bookingId)return replyToTripMessage(s,actor,t.bookingId,messageId,at);
 const conversation=s.hotelConversations?.[actor]?.[t.hotelId],message=conversation?.messages.find(m=>m.id===messageId);
 if(!conversation||!message||message.role==='assistant'||message.replyState!=='pending'||conversation.messages.some(m=>m.replyTo===messageId))return s;
 const q=message.text.toLocaleLowerCase('ru-RU'),hotel=hotelVisual(t.hotelId);
 const text=/сотрудник|оператор|человек|администратор/.test(q)?'Запрос на подключение сотрудника создан. Пока ожидаете, я могу подсказать информацию об отеле.':/адрес|добра|маршрут|где отель/.test(q)?`Отель находится здесь: ${hotel.location}, ${hotel.address}. Подробнее о расположении — в карточке отеля.`:/завтрак|питани/.test(q)?'Тарифы с завтраком и варианты питания доступны в карточке отеля. Выберите даты, чтобы посмотреть предложения.':/заезд|выезд|засел|номер|цен|брони/.test(q)?'Номера, тарифы и доступное время заезда и выезда можно посмотреть при выборе дат в карточке отеля.':'Помогу с информацией об отеле. Расположение, удобства, фотографии и доступные номера собраны в его карточке.';
 const action=/сотрудник|оператор|человек|администратор/.test(q)?undefined:'hotel' as const;
 return {...s,hotelConversations:{...s.hotelConversations,[actor]:{...s.hotelConversations![actor],[t.hotelId]:{...conversation,messages:[...conversation.messages.map(m=>m.id===messageId?{...m,replyState:'answered' as const}:m),{id:'assistant:'+messageId,text,at,role:'assistant',replyTo:messageId,action}]}}}};
}
export function unreadChat(s:Commerce,actor:string,t:ChatTarget){const messages=threadMessages(s,actor,t),read=s.chatReads?.[actor]?.[threadKey(t)],index=messages.findIndex(m=>m.id===read);return messages.slice(index+1).filter(m=>m.role==='assistant').length;}
export function readChat(s:Commerce,actor:string,t:ChatTarget):Commerce{const last=threadMessages(s,actor,t).at(-1);if(!last||s.chatReads?.[actor]?.[threadKey(t)]===last.id)return s;return {...s,chatReads:{...s.chatReads,[actor]:{...s.chatReads?.[actor],[threadKey(t)]:last.id}}};}
export function chatThreads(s:Commerce,actor:string,now=new Date()){
 const today=now.toLocaleDateString('en-CA');
 const eligible=s.bookings.filter(b=>canManageBooking(s,actor,b)&&b.operation.status==='confirmed'&&b.stay?.status!=='checked_out'&&!s.hiddenTrips?.[actor]?.includes(b.id));
 const current=eligible.filter(b=>b.stay?.status==='in_house').sort((a,b)=>b.draft.search.checkIn.localeCompare(a.draft.search.checkIn))[0];
 const upcoming=eligible.filter(b=>!b.stay&&b.draft.search.checkIn>=today).sort((a,b)=>a.draft.search.checkIn.localeCompare(b.draft.search.checkIn))[0];
 const priority=current||upcoming;
 const linked=s.bookings.filter(b=>canManageBooking(s,actor,b)).map(b=>({hotelId:b.draft.hotelId,bookingId:b.id,createdAt:b.createdAt,subtitle:dateLabel(b.draft.search)}));
 const other=Object.values(s.hotelConversations?.[actor]||{}).map(c=>({hotelId:c.hotelId,bookingId:undefined,createdAt:c.createdAt,subtitle:'Без брони'}));
 return [...linked,...other].map(t=>({...t,priority:t.bookingId===priority?.id&&t.bookingId?(current?'current' as const:'upcoming' as const):undefined,last:threadMessages(s,actor,t).at(-1),unread:unreadChat(s,actor,t)})).sort((a,b)=>Number(Boolean(b.priority))-Number(Boolean(a.priority))||(b.last?.at||b.createdAt).localeCompare(a.last?.at||a.createdAt));
}
