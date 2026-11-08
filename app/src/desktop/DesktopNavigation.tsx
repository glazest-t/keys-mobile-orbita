import {useNovember} from '../usePrototypeVariant';
import {useState,useEffect,useRef} from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {Icon,Mark} from '../ui';

export function DesktopNavigation({route,name,photo,points=0,unread=false,onNavigate,onLogin,onLogout}:{route:string;name?:string;photo?:string;points?:number;unread?:boolean;onNavigate:(route:string)=>void;onLogin:()=>void;onLogout:()=>void}){
 const november=useNovember();
 const active=route==='trip-chat'||route.startsWith('hotel-chat/')?'chats':route.startsWith('trip')||route==='booking-record'?'trips':route==='points'||route.startsWith('loyalty-')?'rewards':['results','results-map','booking-flow','swipe','wish-search','search-params'].includes(route)?'find':route;
 const pointsWord=new Intl.PluralRules('ru').select(points);
 const pointsLabel=points.toLocaleString('ru-RU')+' '+(pointsWord==='one'?'балл':pointsWord==='few'?'балла':'баллов');
 const [demo,setDemo]=useState(false);
 const pendingMenuAction=useRef<(()=>void)|null>(null);
 const menuItems=[
  ['profile-history','nav-trips','История поездок'],
  ['travelers','guests','Путешественники'],
  ['price-watches','discount','Следим за ценами'],
  ['help','help','Помощь и поддержка'],
 ];
 useEffect(()=>{window.scrollTo(0,0);},[route]);
 useEffect(()=>{const close=()=>setDemo(false);window.addEventListener('keys-demo-tools-close',close);return()=>window.removeEventListener('keys-demo-tools-close',close);},[]);
 useEffect(()=>{document.body.classList.toggle('desktop-demo-open',demo);return()=>document.body.classList.remove('desktop-demo-open');},[demo]);
 return <header className="desktop-navigation">
  <button className="desktop-brand" onClick={()=>onNavigate('find')} aria-label="Ключи — найти отель"><Mark/></button>
  <nav aria-label="Главные разделы">{[['find','Найти'],['trips','Поездки'],['chats','Чаты'],['rewards','Выгоды']].map(([id,label])=><button key={id} aria-current={active===id?'page':undefined} onClick={()=>onNavigate(id)}>{label}</button>)}</nav>
  <button className="desktop-demo-toggle" aria-expanded={demo} aria-controls="desktop-demo-tools" onClick={()=>setDemo(v=>!v)}>Сценарии{demo?' ×':''}</button>
  <div className="desktop-navigation-actions">
   <button aria-label="Избранное" onClick={()=>onNavigate('favorites')}><Icon name="heart" size={20}/></button>
   {!november&&<button className="desktop-notification-button" aria-label={unread?'Уведомления: есть новые':'Уведомления'} onClick={()=>onNavigate('notifications')}><Icon name="bell" size={20}/>{unread&&<span className="notification-dot" aria-hidden="true"/>}</button>}
   {name&&<button className="desktop-points-link" aria-label={`Баллы «Ключей»: ${pointsLabel}. Открыть выгоды`} onClick={()=>onNavigate('rewards')}><Icon name="gift" size={20} inheritColor/><span>{pointsLabel}</span></button>}
   {name?<DropdownMenu.Root><DropdownMenu.Trigger asChild><button className="desktop-profile-link" aria-label={`Меню профиля: ${name}`}>{photo?<img className="desktop-profile-avatar" src={photo} alt=""/>:<span className="desktop-profile-avatar">{name.slice(0,1)}</span>}<strong>{name}</strong><Icon name="menu" size={18} inheritColor/></button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="desktop-account-menu" align="end" sideOffset={8} collisionPadding={16} onCloseAutoFocus={()=>{const action=pendingMenuAction.current;if(action){pendingMenuAction.current=null;requestAnimationFrame(action);}}}>
    <DropdownMenu.Item onSelect={()=>onNavigate('profile')}><Icon name="nav-profile" size={18} inheritColor/>Мой профиль</DropdownMenu.Item>
    <DropdownMenu.Separator/>
    {menuItems.map(([target,icon,label])=><DropdownMenu.Item key={target} onSelect={()=>onNavigate(target)}><Icon name={icon} size={18} inheritColor/>{label}</DropdownMenu.Item>)}
    <DropdownMenu.Separator/>
    <DropdownMenu.Item className="desktop-account-logout" onSelect={()=>{pendingMenuAction.current=onLogout;}}><Icon name="logout" size={18} inheritColor/>Выйти</DropdownMenu.Item>
   </DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>:<button className="desktop-signin" onClick={onLogin}>Войти</button>}
  </div>
 </header>;
}
