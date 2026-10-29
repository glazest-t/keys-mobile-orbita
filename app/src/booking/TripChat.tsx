import {createContext,useContext,useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {FlowStack,MobileScroll,Carousel,KeyboardInput,useKeyboard,type FlowScreen} from '../mobile';
import {Icon,IconButton} from '../ui';
import {catalog,type Booking,type Commerce} from './model';
import {type TripMessage,type ChatAction} from './trip';
import {readChat,sendChatMessage,threadMessages} from './chatThreads';
import {hotelPhone} from './hotelContacts';
import {scopedNotices} from './notifications';
import './trip-chat.css';
type Props={booking?:Booking;hotelId?:string;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;actor:string;onBack:()=>void;onNavigate:(route:string)=>void};
type ContextValue=Props&{hotelId:string;messages:TripMessage[];text:string;setText:(v:string)=>void;send:(preset?:string)=>void;error:string};
const Context=createContext<ContextValue|null>(null),useChat=()=>useContext(Context)!;
const actionLabel:Record<ChatAction,string>={hotel:'Посмотреть отель',breakfast:'Посмотреть завтрак',services:'Открыть услуги',route:'Построить маршрут',guide:'Как заселиться'};
const time=(at:string)=>new Date(at).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
function dateLabel(at:string){const d=new Date(at);return d.toDateString()===new Date().toDateString()?'Сегодня':d.toLocaleDateString('ru-RU',{day:'numeric',month:'long'});}
function Header(){const c=useChat(),keyboard=useKeyboard(),hotelId=c.hotelId,phone=hotelPhone(hotelId),unread=scopedNotices(c.commerce,c.actor,hotelId).filter(n=>!n.read).length;return <header className="hotel-chat-header"><IconButton name="back" label="Назад" onClick={c.onBack}/><div className="hotel-chat-identity"><strong>{catalog.hotels.find(h=>h.id===hotelId)?.name}</strong><span className="hotel-chat-assistant-label">ИИ-ассистент</span></div><div className="hotel-chat-actions">{phone&&<a className="k-icon-button" href={'tel:'+phone} aria-label="Позвонить в отель" onClick={()=>keyboard.hide()}><Icon name="phone" size={20}/></a>}<span className="notification-trigger"><IconButton name="bell" label="Уведомления отеля" onClick={()=>{keyboard.hide();c.onNavigate('notifications');}}/>{unread>0&&<span className="notification-count" aria-hidden="true">{Math.min(99,unread)}</span>}</span></div></header>;}

function Messages(){
 const c=useChat(),main=useRef<HTMLElement>(null),stick=useRef(true),messages=c.messages,pending=messages.some(m=>m.replyState==='pending');
 useEffect(()=>{const scroll=main.current?.closest('.mobile-scroll');if(!scroll)return;const track=()=>{stick.current=scroll.scrollHeight-scroll.clientHeight-scroll.scrollTop<96;};scroll.addEventListener('scroll',track);const resize=new ResizeObserver(()=>{if(stick.current)scroll.scrollTop=scroll.scrollHeight;});resize.observe(scroll);return()=>{scroll.removeEventListener('scroll',track);resize.disconnect();};},[]);
 useEffect(()=>{const scroll=main.current?.closest('.mobile-scroll');if(scroll&&(stick.current||messages.at(-1)?.role==='guest')){scroll.scrollTop=scroll.scrollHeight;stick.current=true;}},[messages.length,pending]);
 return <MobileScroll className="record-scroll"><main ref={main} className="hotel-chat-messages" role="log" aria-label="Переписка с отелем" aria-live="polite" aria-relevant="additions text">
 <>{!messages.length&&<div className="hotel-chat-date">Сегодня</div>}<article className="hotel-chat-message assistant"><p>Здравствуйте! Подскажу время заезда, условия завтрака и доступные услуги. Что вас интересует?</p></article></>
 {messages.map((m,i)=><div className="hotel-chat-entry" key={m.id}>{(!i||dateLabel(messages[i-1].at)!==dateLabel(m.at))&&<div className="hotel-chat-date">{dateLabel(m.at)}</div>}<article className={'hotel-chat-message '+(m.role==='assistant'?'assistant':'guest')} aria-label={m.role==='assistant'?'ИИ-ассистент':'Вы'}><p>{m.text}</p>{m.action&&(m.action==='hotel'||m.action==='route'||c.booking?.operation.status==='confirmed'&&c.booking.stay?.status!=='checked_out')&&<button className="chat-context-action" onClick={()=>c.onNavigate(m.action==='hotel'?'chat-open-hotel':'trip-'+m.action)}>{actionLabel[m.action]}<Icon name="chevron-right" size={16} inheritColor/></button>}<time dateTime={m.at}>{time(m.at)}</time></article></div>)}
 {pending&&<div className="hotel-chat-typing" role="status"><span className="chat-typing-dots" aria-hidden="true"><i/><i/><i/></span>Ассистент печатает</div>}
 </main></MobileScroll>;
}
function Composer(){const c=useChat(),keyboard=useKeyboard(),staffRequested=c.messages.some(m=>m.role==='guest'&&/сотрудник|оператор|человек|администратор/i.test(m.text));return <div className="hotel-chat-composer"><Carousel ariaLabel="Быстрые вопросы" contentClassName="hotel-chat-prompts">{[...(c.booking?['Поздний выезд','Где парковка?','Условия завтрака','Как добраться?']:['Условия завтрака','Как добраться?','Какие есть номера?']),'Позвать сотрудника'].map(prompt=><button className="chat-prompt" key={prompt} disabled={prompt==='Позвать сотрудника'&&staffRequested} onPointerDown={e=>e.preventDefault()} onClick={()=>c.send(prompt)}>{prompt==='Позвать сотрудника'&&staffRequested?'Ожидаем сотрудника':prompt}</button>)}</Carousel><form onSubmit={e=>{e.preventDefault();c.send();}}><KeyboardInput aria-label="Сообщение отелю" placeholder="Сообщение" value={c.text} maxLength={1000} enterKeyHint="send" onChange={e=>c.setText(e.target.value)} onBlur={()=>keyboard.hide()}/><button className="chat-send" type="submit" aria-label="Отправить сообщение" disabled={!c.text.trim()} onPointerDown={e=>e.preventDefault()}><Icon name="back" size={20} inheritColor/></button></form><p className="field-error" role={c.error?'alert':undefined}>{c.error}</p></div>;}
function chatScreen():FlowScreen{return {id:'hotel-chat',headerHeight:76,header:()=> <Header/>,footerHeight:142,footer:()=> <Composer/>,render:()=> <Messages/>};}
export function TripChat(props:Props){
 const hotelId=props.booking?.draft.hotelId||props.hotelId!,target={hotelId,bookingId:props.booking?.id},draftKey=props.actor+':'+(props.booking?.id||'hotel:'+hotelId),text=props.commerce.chatDrafts?.[draftKey]||'',[error,setError]=useState(''),keyboard=useKeyboard();
 const messages=threadMessages(props.commerce,props.actor,target);
 const setText=(value:string)=>{setError('');props.setCommerce(s=>({...s,chatDrafts:{...s.chatDrafts,[draftKey]:value}}));};
 const send=(preset?:string)=>{try{const message=preset??text,id=crypto.randomUUID();sendChatMessage(props.commerce,props.actor,target,message,id);props.setCommerce(s=>({...sendChatMessage(s,props.actor,target,message,id),chatDrafts:preset===undefined?{...s.chatDrafts,[draftKey]:''}:s.chatDrafts}));setError('');keyboard.hide();}catch(e){setError((e as Error).message);}};
 useEffect(()=>props.setCommerce(s=>{try{return readChat(s,props.actor,target);}catch{return s;}}),[props.actor,props.booking?.id,hotelId,messages.at(-1)?.id,props.setCommerce]);
 return <Context.Provider value={{...props,hotelId,messages,text,setText,send,error}}><div className="record-flow hotel-chat-flow"><FlowStack initial={chatScreen()}/></div></Context.Provider>;
}
