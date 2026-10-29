import {useEffect,useState,type Dispatch,type SetStateAction} from 'react';
import QRCode from 'qrcode';
import {BottomSheet,FlowStack,MobileScroll,KeyboardInput} from '../mobile';
import {StatusBadge,Button,Icon,IconButton} from '../ui';
import {catalog,dateLabel,hotelPhoto,nights,type Booking,type Commerce} from './model';
import {acceptBookingShare,bookingShareUrl,createBookingShare,sharedBooking,type BookingShare as Share} from './bookingShare';
import './trip-services.css';
import './booking-share.css';

type Props={commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;actor:string};
export function BookingShareSheet({booking:b,open,onClose,commerce,setCommerce,actor}:Props&{booking:Booking;open:boolean;onClose:()=>void}){
 const [mode,setMode]=useState<Share['mode']>('read'),[qr,setQr]=useState(''),[message,setMessage]=useState('');
 const share=commerce.bookingShares?.find(v=>v.bookingId===b.id&&v.mode===mode);
 const url=share?bookingShareUrl(location.href,share.token):'';
 useEffect(()=>{if(open){setMode('read');setMessage('');}},[open,b.id]);
 useEffect(()=>{if(!open||share)return;try{setCommerce(s=>createBookingShare(s,actor,b.id,mode,crypto.randomUUID()));}catch(e){setMessage((e as Error).message);}},[open,b.id,actor,mode,share,setCommerce]);
 useEffect(()=>{let live=true;setQr('');if(open&&url)QRCode.toDataURL(url,{width:560,margin:4,errorCorrectionLevel:'M',color:{dark:'#101320',light:'#ffffff'}}).then(src=>{if(live)setQr(src);}).catch(()=>{if(live)setMessage('Не удалось создать QR-код. Используйте ссылку.');});return()=>{live=false;};},[open,url]);
 const copy=async()=>{try{await navigator.clipboard.writeText(url);setMessage('Ссылка скопирована');}catch{setMessage('Выделите и скопируйте ссылку ниже');}};
 const send=async()=>{if(navigator.share){try{await navigator.share({title:'Бронь · '+catalog.hotels.find(h=>h.id===b.draft.hotelId)?.name,url});return;}catch(e){if((e as Error).name==='AbortError')return;}}await copy();};
 return <BottomSheet open={open} onOpenChange={v=>{if(!v)onClose();}} title="Поделиться бронью" snap={.92}><div className="sheet-body booking-share"><div className="share-hotel"><strong>{catalog.hotels.find(h=>h.id===b.draft.hotelId)?.name}</strong><span>{dateLabel(b.draft.search)}</span></div><div className="breakfast-segments" role="group" aria-label="Режим доступа">{([['read','Просмотр'],['manage','Управление']] as const).map(([value,label])=><button key={value} className={mode===value?'selected':''} aria-pressed={mode===value} onClick={()=>{setMode(value);setMessage('');}}>{label}</button>)}</div><p className="share-permission">{mode==='read'?'Отель и даты поездки. Без изменений брони.':'Все возможности владельца: бронь, услуги и ключ после заселения.'}</p><div className="booking-qr">{qr?<img src={qr} alt={'QR-код брони · '+(mode==='read'?'просмотр':'управление')}/>:<span>Готовим QR-код…</span>}</div><p className="share-scan">Отсканируйте камерой телефона</p><Button disabled={!url} onClick={send}><Icon name="share" size={20} inheritColor/>Поделиться ссылкой</Button><Button disabled={!url} variant="secondary" onClick={copy}>Скопировать ссылку</Button>{message&&<p role="status" className="share-feedback">{message}</p>}{message==='Выделите и скопируйте ссылку ниже'&&<KeyboardInput aria-label="Ссылка на бронь" value={url} readOnly onFocus={e=>e.currentTarget.select()}/>}</div></BottomSheet>;
}
export function SharedBookingPage({commerce,setCommerce,actor,onClose,onAccepted}:Props&{onClose:()=>void;onAccepted:()=>void}){
 const [error,setError]=useState('');
 const token=new URL(location.href).searchParams.get('trip')||'',entry=sharedBooking(commerce,token),b=entry?.booking,hotel=b&&catalog.hotels.find(h=>h.id===b.draft.hotelId),active=b?.operation.status==='confirmed'&&b.stay?.status!=='checked_out';
 const accept=()=>{try{setCommerce(acceptBookingShare(commerce,actor,token));onAccepted();}catch(e){setError((e as Error).message);}};
 return <div className="shared-booking-page"><FlowStack initial={{id:'shared-booking',headerHeight:0,render:()=> <MobileScroll className="page-scroll"><header className="shared-booking-header"><IconButton name="back" label="Назад" onClick={onClose}/><strong>С вами поделились бронью</strong></header><main className="shared-booking-content">{b&&hotel?<><img className="shared-booking-photo" src={hotelPhoto(hotel.id)} alt={hotel.name}/><StatusBadge tone="info">{entry?.share.mode==='manage'?'Полное управление':'Только просмотр'}</StatusBadge><h1>{hotel.name}</h1><p>{hotel.city}</p><div className="share-summary"><Icon name="calendar" size={22}/><span>{dateLabel(b.draft.search)}<small>{nights(b.draft.search)} ноч. · {b.stay?.status==='in_house'?'Гость в отеле':b.stay?.status==='checked_out'?'Поездка завершена':b.operation.status==='cancelled'?'Бронь отменена':'Предстоящая поездка'}</small></span></div>{entry?.share.mode==='manage'&&active?<><p>Вы получите те же возможности, что и владелец брони.</p><Button onClick={accept}>Добавить поездку</Button></>:<Button variant="secondary" onClick={onClose}>Готово</Button>}</>:<><Icon name="document" size={36}/><h1>Ссылка недоступна</h1><p>Эта бронь не найдена в текущей демонстрационной сессии.</p><Button onClick={onClose}>К поездкам</Button></>}{error&&<p role="alert">{error}</p>}</main></MobileScroll>}}/></div>;
}
