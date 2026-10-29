import {ProfilePhoto} from '../profile/ProfilePhoto';
import {useState,type Dispatch,type SetStateAction} from 'react';
import {Icon,Row} from '../ui';
import {displayPhone,type User} from '../state';
import {type Commerce} from '../booking/model';
import {SwipePreferences} from '../booking/SwipeWelcome';
import {applySwipePreferences} from '../booking/swipePreferences';
import {HotelierProfileBadge} from './HotelierBenefits';
import './profile.css';

export function ProfilePage({user,commerce,onPhotoChange,onBenefits,onHotelier,onGuests,onStyle,onNotifications,onSecurity,onData,onHistory,onHelp,onWatches,onInvite,onAbout,onLogout}:{user:User;commerce:Commerce;onPhotoChange:(photo?:string)=>void;onBenefits:()=>void;onHotelier:()=>void;onGuests:()=>void;onStyle:()=>void;onNotifications:()=>void;onSecurity:()=>void;onData:()=>void;onHistory:()=>void;onHelp:()=>void;onWatches:()=>void;onInvite:()=>void;onAbout:()=>void;onLogout:()=>void}){
 const approved=commerce.accounts[user.phone]?.hotelierStatus==='approved';
 const surname=user.travelers.find(t=>t.primary)?.surname||'';
 const name=[user.name,surname].filter(Boolean).join(' ');
 const balance=commerce.payment.balances['keys:'+user.phone]||0;
 const pointsWord=new Intl.PluralRules('ru').select(balance);
 return <div className="profile-page">
  <div className="profile-identity hotelier-profile-identity"><ProfilePhoto key={user.phone} name={name} photo={user.photo} onSave={onPhotoChange}/><div><h1>{name}</h1><p>{displayPhone(user.phone)}</p>{approved&&<HotelierProfileBadge onClick={onHotelier}/>}</div></div>
  <button className="profile-points k-surface-action" onClick={onBenefits} aria-label={`Баллы «Ключей»: ${balance.toLocaleString('ru-RU')}. Открыть выгоды`}><span><small>Баллы «Ключей»</small><strong>{balance.toLocaleString('ru-RU')} <span>{pointsWord==='one'?'балл':pointsWord==='few'?'балла':'баллов'}</span></strong></span><span className="profile-points-link">Выгоды<Icon name="chevron-right" size={16} inheritColor/></span></button>
  <section className="profile-navigation-group" aria-labelledby="profile-travel-title"><h2 id="profile-travel-title">Мои поездки</h2><div className="k-card">
   <Row icon="nav-trips" title="История поездок" onClick={onHistory}/>
   <Row icon="guests" title="Путешественники" onClick={onGuests}/>
   <Row icon="style-match" title="Мой стиль" onClick={onStyle}/>
  </div></section>
  <section className="profile-navigation-group" aria-labelledby="profile-benefits-title"><h2 id="profile-benefits-title">Моя выгода</h2><div className="k-card">
   <Row icon="discount" title="Следим за ценами" onClick={onWatches}/>
   <Row icon="invite" title="Пригласить друзей" subtitle="1 000 баллов за друга" onClick={onInvite}/>
   {!approved&&commerce.hotelierParticipants?.[user.phone]&&<Row icon="reception" title="Подтвердить статус отельера" onClick={onHotelier}/>}
  </div></section>
  <section className="profile-navigation-group" aria-labelledby="profile-settings-title"><h2 id="profile-settings-title">Настройки аккаунта</h2><div className="k-card">
   <Row icon="bell" title="Уведомления" onClick={onNotifications}/>
   <Row icon="secure" title="Безопасность и доступ" onClick={onSecurity}/>
   <Row icon="settings" title="Управление данными" onClick={onData}/>
  </div></section>
  <section className="profile-navigation-group" aria-labelledby="profile-service-title"><h2 id="profile-service-title">О сервисе</h2><div className="k-card">
   <Row icon="nav-chats" title="Помощь и поддержка" onClick={onHelp}/>
   <Row icon="info" title="О приложении" onClick={onAbout}/>
  </div></section>
  <div className="k-card profile-logout"><Row danger icon="logout" title="Выйти" onClick={onLogout}/></div>
 </div>;
}

export function ProfileStyle({commerce,setCommerce,owner,onClose}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string;onClose:()=>void}){
 const [selected,setSelected]=useState(()=>[...(commerce.swipePreferences?.[owner]?.themes||[])]);
 return <SwipePreferences selected={selected} onChange={setSelected} saveMode backLabel="Назад в профиль" onClose={onClose} onContinue={()=>{setCommerce(s=>applySwipePreferences(s,owner,selected));onClose();}}/>;
}
