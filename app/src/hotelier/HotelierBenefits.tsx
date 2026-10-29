import {useState} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Field,Icon,IconButton,Mark} from '../ui';
import {appInvitationLink,type InvitationAudience,type HotelierInvitationData} from './verification';
import './hotelier.css';

export function HotelierHeader({confirmed=false,onClose}:{confirmed?:boolean;onClose?:()=>void}){
 return <header className="app-header hotelier-header"><div><Mark/>{!confirmed&&<span>Для отельеров</span>}</div>{!confirmed&&onClose&&<IconButton name="close" label="Закрыть подтверждение статуса" onClick={onClose}/>}</header>;
}

export function HotelierProfileBadge({onClick}:{onClick:()=>void}){
 return <button className="hotelier-profile-badge" onClick={onClick} aria-label="Отельер · Friendly Rate: о статусе"><span><img src="/brand/assets/logo/mark-white-ui.svg" alt="" width="12" height="12"/></span><span>Отельер · Friendly Rate</span><Icon name="chevron-right" size={12} inheritColor/></button>;
}

/** fr6: one explanation surface for the trip banner, profile and benefits. */
export function HotelierInfoSheet({open,onClose,onHotels,inviter}:{open:boolean;onClose:()=>void;onHotels:()=>void;inviter?:HotelierInvitationData}){
 return <BottomSheet open={open} onOpenChange={v=>{if(!v)onClose();}} title="Friendly Rate" description="Дружественный тариф для отельеров">
  <div className="hotelier-info">
   <p>Тариф для отельеров партнёрской программы TravelLine. Даёт скидку на бронирование отелей в «Ключах».</p>
   {inviter&&<section className="hotelier-inviter"><small>Вас пригласил</small><div><span className="hotelier-inviter-avatar">{inviter.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span><span><strong>{inviter.name}</strong><small>{inviter.hotel}</small></span></div></section>}
   <p className="hotelier-eligibility"><Icon name="secure" size={20} inheritColor/><span>Доступно только отельерам с подтверждённым статусом</span></p>
   <Button onClick={onHotels}>К отелям с Friendly Rate</Button>
  </div>
 </BottomSheet>;
}

/** i1 for travelers, i2 audience choice for confirmed hoteliers. */
export function HotelierSharePage({name,hotel,approved}:{name:string;hotel:string;approved:boolean}){
 const [audience,setAudience]=useState<InvitationAudience>(approved?'hotelier':'traveler');
 const [copied,setCopied]=useState(false),[error,setError]=useState('');
 const selected=approved?audience:'traveler';
 const link=appInvitationLink(location.href,name,hotel,selected);
 const copy=async()=>{try{await navigator.clipboard.writeText(link);setCopied(true);setError('');}catch{setError('Не удалось скопировать. Выделите ссылку в поле.');}};
 const share=async()=>{if(!navigator.share){await copy();return;}try{await navigator.share({title:'Приглашение в Ключи',text:`${name} приглашает вас в Ключи`,url:link});setError('');}catch(e){if((e as Error).name!=='AbortError')setError('Не удалось открыть отправку. Скопируйте ссылку.');}};
 return <div className="hotelier-share-page">
  {approved?<><div className="invite-heading"><h1>Кого пригласить?</h1><p>Выберите, какую ссылку отправить</p></div>
   <div className="invite-audiences" role="group" aria-label="Кого пригласить">
    {([['hotelier','reception','Коллегу-отельера','Доступ к тарифам Friendly Rate'],['traveler','invite','Путешественника','Обычная ссылка на приложение']] as const).map(([value,icon,title,description])=><button key={value} className={'invite-audience k-surface-action '+(selected===value?'is-selected':'')} aria-pressed={selected===value} onClick={()=>{setAudience(value);setCopied(false);setError('');}}><span className="icon-tile"><Icon name={icon} size={22} inheritColor/></span><span><strong>{title}</strong><small>{description}</small>{value==='hotelier'&&<span className="invite-rate-label">Friendly Rate</span>}</span><span className="invite-radio" aria-hidden="true"/></button>)}
   </div><div className="invite-explanation"><span className="invite-info-icon"><Icon name="info" size={20} inheritColor/></span><span>{selected==='hotelier'?'Коллеге нужно будет подтвердить аккаунт в личном кабинете TravelLine. После этого откроются тарифы Friendly Rate.':'Ссылка откроет обычный вход в приложение — без подтверждения статуса отельера.'}</span></div>
  </>:<><section className="hotelier-share-hero"><img src="/brand/assets/logo/mark-cobalt-ui.svg" alt=""/><h1>Поделитесь<br/>ссылкой на «Ключи»</h1></section><ol className="hotelier-share-steps"><li>Отправьте другу свою ссылку</li><li>Друг войдёт в приложение по номеру телефона</li><li>Выбирайте отели и планируйте новые поездки</li></ol></>}
  <div className="hotelier-share-link"><Field label="Ссылка-приглашение" value={link} readOnly onFocus={e=>e.target.select()}/><button onClick={copy} aria-label="Скопировать ссылку-приглашение"><Icon name={copied?'check':'document'} size={18} inheritColor/>{copied?'Скопировано':'Копировать'}</button></div>
  {error&&<p className="field-error" role="alert">{error}</p>}{copied&&<span className="sr-only" role="status">Ссылка скопирована</span>}
  <div className="hotelier-actions"><Button onClick={share}><Icon name="share" size={20} inheritColor/>{approved?'Поделиться ссылкой':'Поделиться'}</Button></div>
 </div>;
}
