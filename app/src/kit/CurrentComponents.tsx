import {useState} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Row,ServiceTile,StatusBadge} from '../ui';
import {SmsCodeField,PinCodeField} from '../SmsCodeField';
import {HotelLevels,type HotelLevelCard} from '../rewards/HotelLevels';
import {TripService} from '../booking/UpcomingTrip';
import '../rewards/rewards.css';
import './current-components.css';

const levels:HotelLevelCard[]=[
 {id:'start',name:'Гость',condition:'С первого проживания',benefits:[{kind:'points',label:'3% баллами'}]},
 {id:'current',name:'Знаток',condition:'От 40 000 ₽ за год',benefits:[{kind:'discount',label:'Скидка 7%'},{kind:'points',label:'7% баллами'}]},
 {id:'next',name:'Постоянный гость загородных отелей',condition:'От 150 000 ₽ за год',description:'Пример длинного названия и условий: карточка растёт по содержимому.',benefits:[{kind:'discount',label:'Скидка 10%'}]},
];

/** Live examples reuse production components; they never change a guest's bookings or wallets. */
export function CurrentComponents(){
 const [sms,setSms]=useState(''),[pin,setPin]=useState(''),[detail,setDetail]=useState<string|null>(null);
 return <div className="current-component-kit">
  <section><h2>Коды входа</h2><SmsCodeField value={sms} onChange={setSms}/><PinCodeField label="PIN-код" value={pin} onChange={setPin}/><SmsCodeField value="123456" onChange={()=>{}} success/></section>
  <section><h2>Строки и плитки · C5</h2><div className="k-card"><Row icon="guests" title="Путешественники" subtitle="Данные для бронирования" onClick={()=>setDetail('Путешественники')}/><TripService icon="early-check-in" title="Ранний заезд" subtitle="С 10:00" added onClick={()=>setDetail('Ранний заезд')}/><TripService icon="late-check-out" title="Поздний выезд" subtitle="До 15:00" added onClick={()=>setDetail('Поздний выезд')}/></div><div className="current-kit-tiles"><ServiceTile icon="wifi" onClick={()=>setDetail('Wi-Fi')}>Wi-Fi</ServiceTile><ServiceTile icon="room-service" onClick={()=>setDetail('Услуги')}>Услуги</ServiceTile></div></section>
  <section><h2>Статусы поездок</h2><div className="badges"><StatusBadge tone="info" icon="calendar">Предстоящая</StatusBadge><StatusBadge tone="success" icon="check">Завершена</StatusBadge><StatusBadge icon="close">Отменена</StatusBadge></div></section>
  <section><h2>Уровни отеля</h2><p>Общий компонент: баллы, скидка или обе выгоды. Текущий уровень — выбранный вариант 3.</p><HotelLevels levels={levels} currentId="current" onDetails={id=>setDetail(levels.find(level=>level.id===id)!.name)}/></section>
  <BottomSheet open={!!detail} onOpenChange={open=>{if(!open)setDetail(null);}} title={detail||'Подробности'} snap={.65}><div className="sheet-body"><p>Пример общего компонента. Содержимое и условия передаёт сценарий.</p><Button onClick={()=>setDetail(null)}>Понятно</Button></div></BottomSheet>
 </div>;
}
