import {checkoutDay,confirmCheckout,demoCheckoutDay} from './stayBill';
import {useEffect,useState,type CSSProperties,type Dispatch,type SetStateAction} from 'react';
import {Button,Icon} from '../ui';
import {catalog,nights,type Booking,type Commerce} from './model';
import {demoCheckIn,demoExpireKey,demoResetStay,keyAccess,stayNow} from './stay';
import './stay.css';
import {BookingCardActions} from './BookingCardActions';

export function StayCard({booking:b,onOpen,onDetails,onShare,opened=false,opening=false}:{opening?:boolean;opened?:boolean;booking:Booking;onOpen:()=>void;onDetails:()=>void;onShare:()=>void}){
 const stay=b.stay!,hotel=catalog.hotels.find(h=>h.id===b.draft.hotelId)!,room=catalog.rooms.find(r=>r.id===b.draft.roomId)!,access=keyAccess(b),total=nights(b.draft.search),day=Math.min(total,Math.max(1,Math.floor((stayNow(b)-Date.parse(stay.checkedInAt))/86400000)+1));
 return <section className="stay-card"><div className="stay-hotel"><small>{checkoutDay(b)?'Сегодня выезд':'Проживание'}</small><strong>{hotel.name}</strong></div><div className="stay-room"><div><small>Ваш номер</small><strong>{stay.roomNumber}</strong><span>{room.title} · {stay.floor} этаж</span></div><div className="stay-progress" style={{'--stay-progress':`${day/total*360}deg`} as CSSProperties}><span><small>ночь</small><strong>{day}</strong><small>из {total}</small></span></div></div><Button className="door-button" success={opened} busy={opening} busyLabel="Открываем…" aria-live="polite" onClick={onOpen}>{!opened&&<Icon name="key" size={20} inheritColor/>}{opened?'Дверь открыта':access.available?'Открыть дверь':'Ключ от номера'}</Button><BookingCardActions onDetails={onDetails} onShare={onShare}/></section>;
}

type Props={booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>};
export function StayDemoControls({booking:b,commerce,setCommerce,failNext,onFailChange}:Props&{failNext:boolean;onFailChange:(v:boolean)=>void}){
 const [error,setError]=useState('');useEffect(()=>setError(''),[b]);if(b.operation.status!=='confirmed')return null;
 const act=(fn:()=>Commerce)=>{try{setCommerce(fn());setError('');}catch(e){setError((e as Error).message);}};
 return <details><summary>Проживание · демосценарий</summary><small>{catalog.hotels.find(h=>h.id===b.draft.hotelId)?.name}. Подтверждение отеля, время проживания и замок имитируются. Физическая дверь и биометрия не используются. Подключение Wi-Fi демонстрационное и не меняет сеть устройства.</small><div>{b.stay?.status==='checked_out'?<small>Выезд подтверждён</small>:!b.stay?<button onClick={()=>act(()=>demoCheckIn(commerce,b.owner,b.id,crypto.randomUUID()))}>Заселить гостя</button>:<><button onClick={()=>act(()=>demoCheckoutDay(commerce,b.owner,b.id))}>День выезда</button><button onClick={()=>act(()=>confirmCheckout(commerce,b.owner,b.id,crypto.randomUUID()))}>Оформить выезд в отеле</button><button onClick={()=>onFailChange(!failNext)}>{failNext?'Следующее открытие: ошибка':'Следующее открытие: успех'}</button><button onClick={()=>act(()=>demoExpireKey(commerce,b.owner,b.id))}>Истечь срок ключа</button><button onClick={()=>act(()=>demoResetStay(commerce,b.owner,b.id))}>Вернуть до заезда</button></>}</div>{error&&<small role="alert">{error}</small>}</details>;
}
