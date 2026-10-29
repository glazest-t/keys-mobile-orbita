import {memo} from 'react';
import {PointsBalance} from '../interactions';
import {Button,Icon,ServiceTile} from '../ui';
import {catalog,hotelPhoto,type Booking} from './model';
import orbit from './completed-orbit.html?raw';
import './completed-trip.css';
const Orbit=memo(function Orbit(){return <span className="completed-orbit-art" aria-hidden="true" dangerouslySetInnerHTML={{__html:orbit}}/>;});
export function CompletedTrip({booking:b,balance,onReview,onDocuments,onChat,onRepeat}:{booking:Booking;balance:number;onReview:(rating?:number)=>void;onDocuments:()=>void;onChat:()=>void;onRepeat:()=>void}){
 const hotel=catalog.hotels.find(h=>h.id===b.draft.hotelId)!,name=hotel.id==='orbit-sea'?'Mantera':hotel.name;
 return <><header className="completed-greeting"><p>Поездка завершена</p><h1>До встречи!</h1></header><div className="completed-content"><section className="completed-reward-card"><PointsBalance key={b.id} value={balance} className="completed-orbit"><Orbit/></PointsBalance><p>На счёте «Ключей»</p>
 {b.review?<button type="button" className="completed-review-summary" aria-label={`Ваш отзыв: ${b.review.rating} из 5 — посмотреть`} onClick={()=>onReview()}><span>Ваш отзыв</span><span className="completed-review-score"><Icon name="review" size={18} inheritColor/>{b.review.rating} из 5</span><Icon name="chevron-right" size={18} inheritColor/></button>:<section className="completed-review-card"><div><strong>Как вам {name}?</strong><small>Оцените поездку</small></div><div className="completed-review-stars" role="group" aria-label="Оценить поездку">{[1,2,3,4,5].map(n=><button key={n} type="button" aria-label={`Оценить поездку на ${n} из 5`} onClick={()=>onReview(n)}><Icon name="review" size={24} inheritColor/></button>)}</div></section>}
 </section>
 <section className="completed-tiles"><ServiceTile icon="document" onClick={onDocuments}>Документы<small>Бронь и счёт</small></ServiceTile><ServiceTile icon="nav-chats" onClick={onChat}>Связаться с отелем<small>Чат с отелем</small></ServiceTile></section>
 <section className="completed-repeat"><img src={hotelPhoto(hotel.id)} alt=""/><span><strong>Вернуться в {name}</strong><small>Выберите новые даты</small></span><Button variant="secondary" onClick={onRepeat}>Повторить</Button></section></div></>;
}
