import {useState} from 'react';
import {StatusBadge,Button,Icon} from '../ui';
import './cancellation.css';
import {type Commerce,type Booking,catalog,formatMoney,dateLabel,guestLabel,hotelPhoto,cancellationLabel,cancellationPreview} from './model';
export function Trips({commerce,owner,onOpen}:{commerce:Commerce;owner:string;onOpen:(id:string)=>void}){
 const bookings=commerce.bookings.filter(b=>b.owner===owner);
 return <>{bookings.map(b=><article className="k-card trip-card" key={b.id}><StatusBadge tone={b.operation.status==='cancelled'?'neutral':'info'} icon={b.operation.status==='cancelled'?'close':'calendar'}>{b.operation.status==='cancelled'?'Бронь отменена':'Предстоящая поездка'}</StatusBadge><h2>{catalog.hotels.find(h=>h.id===b.draft.hotelId)?.name}</h2><p>{dateLabel(b.draft.search)} · {guestLabel(b.draft.search)}</p><Button variant="secondary" onClick={()=>onOpen(b.id)}>Детали поездки</Button></article>)}</>;
}
export function CancellationPanel({booking,onConfirm,onClose}:{booking:Booking;onConfirm:()=>void;onClose:()=>void}){
 const [error,setError]=useState('');let preview;try{preview=cancellationPreview(booking);}catch(e){return <><p>{(e as Error).message}</p><Button onClick={onClose}>Вернуться к поездке</Button></>;}
 const keys=preview.pointReturns[`keys:${booking.owner}`]||0,hotelPoints=preview.pointReturns[`hotel:${booking.draft.hotelId}:${booking.owner}`]||0;
 const servicePaid=(booking.serviceRequests||[]).filter(r=>r.operation?.status==='confirmed');
 const refundLabel=servicePaid.length?'К возврату деньгами':booking.draft.paymentOption==='sbp'?'К возврату через СБП':booking.draft.paymentOption==='card'?'К возврату на карту':'К возврату деньгами';
 return <div className="cancellation-panel">
  <p className="cancellation-subtitle">{catalog.hotels.find(h=>h.id===booking.draft.hotelId)?.name} · {dateLabel(booking.draft.search)}</p>
  <div className="cancellation-summary">
   <div><span>Оплачено</span><strong>{formatMoney(booking.operation.paidCashMinor+servicePaid.reduce((sum,r)=>sum+(r.operation?.paidCashMinor||0),0))}</strong></div>
   <div><span>Удержание</span><strong>{formatMoney(preview.penalty)}</strong></div>
   <div className="cancellation-refund"><span>{refundLabel}</span><strong>{formatMoney(preview.cashReturn)}</strong></div>
   {keys>0&&<div className="cancellation-points"><span>Баллы «Ключей» вернутся</span><strong>{keys.toLocaleString('ru-RU')}</strong></div>}
   {hotelPoints>0&&<div className="cancellation-points"><span>Баллы отеля вернутся</span><strong>{hotelPoints.toLocaleString('ru-RU')}</strong></div>}
   {preview.due>0&&<div><span>К доплате за отмену</span><strong>{formatMoney(preview.due)}</strong></div>}
  </div>
  <p className={'cancellation-policy '+(preview.penalty?'with-penalty':'')}>
   {preview.penalty?<Icon name="info" size={18} inheritColor/>:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>}
   <span>{preview.penalty?(preview.servicePenalty?'Удержание за проживание и услуги рассчитано по их условиям отмены.':'Бесплатный срок закончился. Удержание — одна ночь проживания.'):`Бесплатная отмена до ${cancellationLabel(booking.draft.search)}`}</span>
  </p>
  {servicePaid.length>0&&<p className="cancellation-subtitle">Дополнительные услуги отменяются вместе с бронью. Возврат по каждой услуге рассчитан с учётом её бесплатного срока.</p>}
  {error&&<p className="field-error" role="alert">{error}</p>}
  <Button className="cancellation-confirm" variant="danger" onClick={()=>{try{onConfirm();}catch(e){setError((e as Error).message);}}}>Отменить бронь</Button>
  <Button className="cancellation-keep" variant="ghost" onClick={onClose}>Оставить бронь</Button>
 </div>;
}
