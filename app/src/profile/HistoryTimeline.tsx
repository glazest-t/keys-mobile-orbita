import {Icon,StatusBadge} from '../ui';
import {catalog,dateLabel,hotelPhoto,type Booking} from '../booking/model';
import {tripStatus} from './history';
import './history-timeline.css';

function presentation(booking:Booking){
 if(booking.operation.status==='cancelled')return {tone:'neutral' as const,icon:'close'};
 if(booking.stay?.status==='checked_out')return {tone:'success' as const,icon:'check'};
 if(booking.stay?.status==='in_house')return {tone:'success' as const,icon:'key'};
 return {tone:'info' as const,icon:'calendar'};
}

export function HistoryStatus({booking}:{booking:Booking}){
 return <StatusBadge {...presentation(booking)}>{tripStatus(booking)}</StatusBadge>;
}

export function HistoryTimeline({trips,onOpen,onRepeat}:{trips:Booking[];onOpen:(id:string)=>void;onRepeat:(hotelId:string)=>void}){
 const months=new Map<string,Booking[]>();
 for(const trip of trips){
  const month=trip.draft.search.checkIn.slice(0,7);
  months.set(month,[...(months.get(month)||[]),trip]);
 }
 return <div className="history-timeline">{[...months].map(([month,bookings])=>
  <section className="history-month" key={month} aria-label={new Date(month+'-01T12:00:00').toLocaleDateString('ru-RU',{month:'long',year:'numeric'}).replace(' г.','')}>
   <h2 className={'history-month-title timeline-tone-'+presentation(bookings[0]).tone}>
    {new Date(month+'-01T12:00:00').toLocaleDateString('ru-RU',{month:'long',year:'numeric'}).replace(' г.','')}
   </h2>
   <ol className="history-timeline-list">{bookings.map(booking=>{
    const hotel=catalog.hotels.find(h=>h.id===booking.draft.hotelId);
    const completed=booking.operation.status!=='cancelled'&&booking.stay?.status==='checked_out';
    return <li key={booking.id} className={'history-timeline-item timeline-tone-'+presentation(booking).tone}>
     <article className="history-timeline-card">
      <button className="history-timeline-open" onClick={()=>onOpen(booking.id)} aria-label={`Подробнее о поездке: ${hotel?.name}, ${dateLabel(booking.draft.search)}`}>
       <img src={hotelPhoto(booking.draft.hotelId)} alt=""/>
       <span className="history-timeline-copy"><strong>{hotel?.name}</strong><small>{hotel?.city} · {dateLabel(booking.draft.search)}</small></span>
       {!completed&&<Icon name="chevron-right" size={18} inheritColor/>}
      </button>
      <div className="history-timeline-meta"><HistoryStatus booking={booking}/>{completed&&<button onClick={()=>onRepeat(booking.draft.hotelId)}>Повторить<Icon name="chevron-right" size={16} inheritColor/></button>}</div>
     </article>
    </li>;
   })}</ol>
  </section>
 )}</div>;
}
