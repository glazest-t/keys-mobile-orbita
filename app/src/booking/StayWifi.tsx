import {useEffect,useRef,useState} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Icon} from '../ui';
import {interactionMotion} from '../interactions';
import type {Booking} from './model';
import {checkoutDay} from './stayBill';
import './stay-wifi.css';

// P-020: fictional credentials; the connection state never changes the OS network.
const network='Hotel_Guest',password='welcome2026';
export function StayWifiSheet({booking,open,onClose}:{booking:Booking;open:boolean;onClose:()=>void}){
 const manual=checkoutDay(booking);
 // A new stay, hotel, or demo clock starts an independent connection scenario.
 const session=[booking.id,booking.draft.hotelId,booking.stay?.eventId,booking.stay?.demoTimeOffsetMs,manual].join(':');
 return <WifiSession key={session} open={open&&booking.operation.status==='confirmed'&&booking.stay?.status==='in_house'} manual={manual} onClose={onClose}/>;
}
function WifiSession({open,manual,onClose}:{open:boolean;manual:boolean;onClose:()=>void}){
 const [status,setStatus]=useState<'idle'|'connecting'|'connected'>('idle');
 const [view,setView]=useState<'connect'|'credentials'|'help'>(manual?'credentials':'connect');
 const [copied,setCopied]=useState(''),[error,setError]=useState('');
 const copyAttempt=useRef(0);
 useEffect(()=>{setView(manual?'credentials':'connect');setCopied('');setError('');if(!open)setStatus(s=>s==='connecting'?'idle':s);return()=>{copyAttempt.current++;};},[open,manual]);
 useEffect(()=>{
  if(!open||status!=='connecting')return;
  const timer=window.setTimeout(()=>setStatus('connected'),interactionMotion.wifiConnectingMs);
  return()=>window.clearTimeout(timer);
 },[open,status]);
 const copy=async(label:string,value:string)=>{
  const attempt=++copyAttempt.current;setError('');
  try{await navigator.clipboard.writeText(value);if(attempt===copyAttempt.current)setCopied(label);}
  catch{if(attempt===copyAttempt.current)setError('Не удалось скопировать. Введите данные вручную.');}
 };
 const connected=view==='connect'&&status==='connected';
 const title=view==='help'?'Как подключиться':connected?'Вы в сети':'Wi-Fi отеля';
 const subtitle=view==='help'?'В настройках телефона':view==='credentials'?'Выберите сеть в настройках телефона':connected?'Телефон подключён к Wi-Fi отеля':'Подключим телефон к сети отеля';
 return <BottomSheet open={open} onOpenChange={v=>{if(!v)onClose();}} title={title} snap={.64}>
  <div className={'sheet-body wifi-sheet '+(connected?'is-connected':'')} onFocusCapture={event=>{
   // Auto-focus during the sheet animation must not scroll the device shell.
   const screen=event.currentTarget.closest<HTMLElement>('[data-phone-screen]');
   if(screen)screen.scrollTop=0;
  }}>
   <header className="wifi-heading"><span className={'wifi-symbol '+(view!=='connect'?'soft':'')}><Icon name={connected?'check':'wifi'} size={26} inheritColor/></span><div><strong aria-hidden="true">{title}</strong><p>{subtitle}</p></div></header>
   {view==='connect'?<>
    <section className="wifi-network"><span className="wifi-network-icon"><Icon name="wifi" size={22} inheritColor/></span><div><strong>{network}</strong><small aria-live="polite">{connected?'Подключено':status==='connecting'?'Подключаемся…':'Гостевая сеть отеля'}</small></div><Icon name={connected?'check':'key'} size={18} inheritColor/></section>
    {connected?<Button variant="secondary" onClick={onClose}>Готово</Button>:<Button busy={status==='connecting'} busyLabel="Подключаемся…" onClick={()=>setStatus('connecting')}><Icon name="wifi" size={20} inheritColor/>Подключиться</Button>}
    {status!=='connecting'&&<Button variant="secondary" onClick={()=>setView('credentials')}>Сеть и пароль</Button>}
   </>:view==='credentials'?<>
    <section className="wifi-credentials">{[['Сеть',network],['Пароль',password]].map(([label,value])=><div key={label}><span><small>{label}</small><strong>{value}</strong></span><button className="wifi-copy" aria-label={copied===label?`${label}: скопировано`:`Скопировать ${label==='Сеть'?'название сети':'пароль'}`} onClick={()=>copy(label,value)}>{copied===label?<Icon name="check" size={18} inheritColor/>:<img src="/assets/details/copy.svg" width="18" height="18" alt=""/>}</button></div>)}</section>
    <span className="wifi-copy-status" role="status">{copied?`${copied==='Сеть'?'Название сети':'Пароль'} скопирован${copied==='Сеть'?'о':''}`:''}</span>
    {error&&<p className="field-error" role="alert">{error}</p>}
    <Button variant="secondary" onClick={()=>setView('help')}>Как подключиться</Button>
    <Button variant="secondary" onClick={manual?onClose:()=>setView('connect')}>{manual?'Готово':'Назад'}</Button>
   </>:<>
    <ol className="wifi-instructions"><li>Откройте настройки телефона и раздел Wi-Fi.</li><li>Выберите сеть <strong>{network}</strong>.</li><li>Введите пароль <strong>{password}</strong>.</li></ol>
    <Button variant="secondary" onClick={()=>setView('credentials')}>К сети и паролю</Button>
   </>}
  </div>
 </BottomSheet>;
}
