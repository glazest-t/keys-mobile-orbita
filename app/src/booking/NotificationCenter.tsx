import {useEffect,useState,type Dispatch,type SetStateAction} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {Carousel} from '../mobile';
import {Button,Empty,Icon,IconButton,Mark} from '../ui';
import {interactionMotion} from '../interactions';
import {type Commerce} from './model';
import {appNotices,scopedNotices,readScopedNotices,noticeDay,pushKinds,pushTemplates,addNotificationExamples,removeNotificationExamples,type NoticeCategory,type NoticeItem} from './notifications';
import './notifications.css';
export function NotificationHeader({commerce,setCommerce,owner,onBack,hotelId}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string;hotelId?:string;onBack:()=>void}){
 const unread=scopedNotices(commerce,owner,hotelId).some(n=>!n.read);
 return <header className="app-header notification-header"><IconButton name="back" label="Назад" onClick={onBack}/><h1>Уведомления</h1><button className="notification-read-all" disabled={!unread} onClick={()=>setCommerce(s=>readScopedNotices(s,owner,hotelId))}>Прочитать все</button></header>;
}
export function NotificationCenter({commerce,owner,onOpen,hotelId}:{commerce:Commerce;owner:string;hotelId?:string;onOpen:(id:string)=>void}){
 const [category,setCategory]=useState<NoticeCategory|'all'>('all'),[limit,setLimit]=useState(20);
 const items=scopedNotices(commerce,owner,hotelId).filter(n=>category==='all'||n.category===category),visible=items.slice(0,limit);
 const groups=[...new Set(visible.map(n=>noticeDay(n.createdAt)))];
 return <div className="notification-center"><Carousel ariaLabel="Категории уведомлений" contentClassName="notification-tabs">{([['all','Все'],['trips','Поездки'],['benefits','Выгоды'],['hotel','Отель']] as const).map(([id,label])=><button key={id} aria-pressed={id===category} onClick={()=>{setCategory(id);setLimit(20);}}>{label}</button>)}</Carousel>
 {groups.map(day=><section className="notification-day" key={day}><h2>{day}</h2><div className="notification-group">{visible.filter(n=>noticeDay(n.createdAt)===day).map(n=><button key={n.id} className={'notification-row k-surface-action '+(!n.read?'is-unread':'')} onClick={()=>onOpen(n.id)} aria-label={`${!n.read?'Новое. ':''}${n.title}. ${n.action}`}><span className={'notification-icon '+n.tone}><Icon name={n.icon} size={22} inheritColor/></span><span className="notification-copy"><strong>{n.title}</strong><span>{n.body}</span><span className="notification-action">{n.action}<Icon name="chevron-right" size={14} inheritColor/></span></span><span className="notification-meta"><time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Moscow'})}</time>{!n.read&&<i aria-label="Не прочитано"/>}</span></button>)}</div></section>)}
 {!items.length&&<Empty icon="bell" title={category==='all'?'Уведомлений пока нет':'Здесь пока пусто'}>{category==='all'?(hotelId?'Уведомления этого отеля появятся здесь.':'Сообщения о поездках, отелях и выгодах появятся здесь.'):'В этой категории пока нет уведомлений.'}</Empty>}
 {items.length>limit&&<Button variant="secondary" onClick={()=>setLimit(v=>v+20)}>Показать ещё</Button>}
 </div>;
}
export function NotificationDemoControls({commerce,setCommerce,owner,onPreview}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string;onPreview:(notice:NoticeItem)=>void}){
 return <details className="notification-demo"><summary>Уведомления</summary><button onClick={()=>setCommerce(s=>addNotificationExamples(s,owner))}>Добавить примеры в историю</button>{pushKinds.map(kind=><button key={kind} onClick={()=>{const sample=appNotices(addNotificationExamples(commerce,owner),owner).find(n=>n.kind===kind)!;onPreview(sample);}}>Пуш: {pushTemplates[kind].label}</button>)}<button onClick={()=>setCommerce(s=>removeNotificationExamples(s,owner))}>Убрать примеры из истории</button></details>;
}
export function NotificationPush({notice,onClose,onOpen}:{notice:NoticeItem|null;onClose:()=>void;onOpen:(notice:NoticeItem)=>void}){
 const reduced=useReducedMotion();
 useEffect(()=>{if(!notice)return;const id=setTimeout(onClose,8000);return()=>clearTimeout(id);},[notice,onClose]);
 return <AnimatePresence>{notice&&<motion.aside className="notification-push" role="status" initial={{opacity:0,y:reduced?0:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-12}} transition={{duration:interactionMotion.tab,ease:interactionMotion.orbit}}><div className="notification-push-brand"><Mark/><span>Ключи</span><small>сейчас</small><button onClick={onClose} aria-label="Закрыть пуш"><Icon name="close" size={16}/></button></div><button className="notification-push-body" onClick={()=>onOpen(notice)}><strong>{notice.title}</strong><span>{notice.body}</span></button></motion.aside>}</AnimatePresence>;
}
