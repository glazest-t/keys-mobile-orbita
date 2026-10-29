import {TripChat} from './TripChat';
import {HotelServices} from './HotelServices';
import {BreakfastFlow} from './Breakfast';
import {createContext,useContext,type Dispatch,type SetStateAction} from 'react';
import {FlowStack,MobileScroll,useFlow,type FlowScreen} from '../mobile';
import {Button,Icon,IconButton} from '../ui';
import {catalog,type Booking,type Commerce} from './model';
import {hotelVisual} from './presentation';
import {HotelDetailProvider,hotelDetailScreen} from './HotelDetails';
import {type TripAction} from './UpcomingTrip';
import {tripFacts} from './trip';
import './trip.css';
type Props={actor?:string;booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;initial:TripAction;initialPlaceId?:string;breakfastMode?:'buffet'|'room';onBack:()=>void;onOrder:(id:string,payNow?:boolean)=>void;onEarly:()=>void;onToast:(message:string)=>void;onNavigate:(route:string)=>void};
const Context=createContext<Props|null>(null);
const useTrip=()=>useContext(Context)!;
function screen(kind:TripAction):FlowScreen{if(kind==='route'||kind==='nearby')return hotelDetailScreen(kind);const id='trip-'+kind+'-'+crypto.randomUUID();return {id,headerHeight:0,render:()=> <Page kind={kind} id={id}/>};}
function Header({kind}:{kind:TripAction}){const ctx=useTrip(),flow=useFlow();return <header className="record-header trip-header"><IconButton name="back" label="Назад" onClick={()=>flow.canGoBack?flow.pop():ctx.onBack()}/><span>{kind==='guide'?'Инструкция по заселению':kind==='services'?'Все услуги':catalog.hotels.find(h=>h.id===ctx.booking.draft.hotelId)?.name}</span><span/></header>;}
function Page({kind,id}:{kind:TripAction;id:string}){const flow=useFlow(),active=flow.current.id===id;return <MobileScroll className="page-scroll record-scroll"><div inert={!active} aria-hidden={!active}><Header kind={kind}/></div><main className={'trip-page '+(kind==='services'?'hotel-services-page':'')} inert={!active} aria-hidden={!active}>{kind==='guide'?<Guide/>:kind==='services'?<Services/>:null}</main></MobileScroll>;}
function Guide(){const {booking:b}=useTrip(),flow=useFlow(),f=tripFacts(b),v=hotelVisual(b.draft.hotelId);const date=new Date(b.draft.search.checkIn+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'});return <><div className="arrival-time"><span>Заезд {date}</span><strong>с {f.checkInTime}</strong></div>{[
 ['pin','Адрес и вход',`${v.location}, ${v.address}. ${b.draft.hotelId==='orbit-sea'?'Вход с набережной.':'Расположение входа уточните у отеля.'}`],
 ['reception','На ресепшене','Назовите номер брони и предъявите документы. Ключ станет доступен после фактического заселения.'],
 ['document','Что взять с собой','Оригиналы документов всех гостей. Уточнить список для вашей поездки можно в чате с отелем.'],
 ...(v.amenities.includes('Парковка')?[['parking','Парковка',b.draft.hotelId==='orbit-sea'?'Въезд с ул. Голубая. Условия парковки уточните перед приездом.':'У отеля есть парковка. Уточните наличие мест и условия.']]:[])
 ].map(([icon,title,text])=><section className="arrival-info" key={title}><span className="icon-tile"><Icon name={icon} size={22} inheritColor/></span><div><h2>{title}</h2><p>{text}</p></div></section>)}<Button onClick={()=>flow.push(screen('route'))}><Icon name="route" size={20} inheritColor/>Построить маршрут</Button></>;}
function Services(){const c=useTrip();return <HotelServices booking={c.booking} commerce={c.commerce} setCommerce={c.setCommerce} onOrder={c.onOrder} onToast={c.onToast} onBreakfast={()=>c.onNavigate('trip-breakfast')}/>;}
export function TripPreparation(props:Props){if(props.initial==='chat')return <TripChat {...props} actor={props.actor||props.booking.owner}/>;if(props.initial==='breakfast')return <BreakfastFlow initialMode={props.breakfastMode} booking={props.booking} commerce={props.commerce} setCommerce={props.setCommerce} onBack={props.onBack} onDone={()=>props.onNavigate('trips')} onOrder={props.onOrder}/>;return <Context.Provider value={props}><HotelDetailProvider commerce={{...props.commerce,draft:props.booking.draft}} initialPlaceId={props.initialPlaceId} activeTab="trips" onNavigate={props.onNavigate} onBack={props.onBack} backLabel="Назад к поездке"><div className="record-flow"><FlowStack initial={screen(props.initial)}/></div></HotelDetailProvider></Context.Provider>;}
