import {FriendlyRateBadge} from '../hotelier/FriendlyRateBadge';
import {ratePrice} from './friendlyRate';
import {useState,type CSSProperties,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet,MobileScroll,KeyboardTextarea,useKeyboard,useMobileDevice} from '../mobile';
import {Button,Empty,Icon,IconButton} from '../ui';
import {ExpandingMap} from '../interactions';
import {FavoritesMap} from './FavoritesMap';
import {SavedButton} from './Discovery';
import {HotelCardPhotos} from './HotelCardPhotos';
import {DatePicker,GuestPicker} from './SearchControls';
import {FavoriteName,useFavoriteSaving} from './FavoriteSaving';
import {favoriteCountLabel as countLabel,favoriteLibrary,favoriteItems,favoriteOffers,saveFavoriteList,saveFavoriteSearch,saveFavoriteNote,setFavorite,INBOX} from './favorites';
import {compactDates} from './FindPage';
import {catalog,dateLabel,guestLabel,formatMoney,nights,type Commerce} from './model';
import {hotelVisual} from './presentation';
import './favorites.css';

type Props={commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string;detail:boolean;mapOpen:boolean;onMap:()=>void;onMapClose:()=>void;onBack:()=>void;onList:(id:string)=>void;onOpen:(id:string)=>void;onSearch:()=>void};

export function FavoritesScreen({commerce,setCommerce,owner,detail,mapOpen,onMap,onMapClose,onBack,onList,onOpen,onSearch}:Props){
 const lib=favoriteLibrary(commerce,owner),list=lib.lists.find(l=>l.id===lib.selectedId)||lib.lists[0];
 const items=favoriteOffers(commerce,owner,list.id),allCount=commerce.savedHotels?.[owner]?.length||0;
 const [sheet,setSheet]=useState(''),[hotelId,setHotelId]=useState(''),[note,setNote]=useState(''),[error,setError]=useState('');
 const keyboard=useKeyboard(),{device}=useMobileDevice(),saving=useFavoriteSaving();
 const close=()=>{keyboard.hide();setSheet('');setError('');};
 const open=(target:string,id='')=>{keyboard.hide();setError('');setHotelId(id);setSheet(target);if(target==='note')setNote(lib.notes[id]||'');};
 const title=detail?list.name:'Избранное';
 const lists=[...lib.lists.filter(l=>l.id!==INBOX),...lib.lists.filter(l=>l.id===INBOX)];
 function listCard(id:string,featured=false){
  const item=lib.lists.find(l=>l.id===id)!,ids=favoriteItems(commerce,owner,id),photos=ids.flatMap(id=>hotelVisual(id).photos.slice(0,1)).slice(0,3);
  return <button key={id} className={'favorite-list '+(featured?'featured':'compact')+' k-surface-action'} onClick={()=>onList(id)}>
   <span className={'favorite-cover photos-'+photos.length}>{photos.length?photos.map((src,i)=><img src={src} alt="" key={i}/>):<Icon name="heart" size={32}/>}</span>
   <span className="favorite-list-label"><strong>{item.name}</strong><small>{countLabel(ids.length)}{featured&&ids.length>0?` · ${dateLabel(item.search)}`:''}</small></span><Icon name="chevron-right" size={18}/>
  </button>;
 }
 return <div className="favorite-screen" style={{'--favorite-safe-top':`${device.geometry.safeArea.top}px`} as CSSProperties}>
 <div className="favorite-scroll-frame" inert={mapOpen} aria-hidden={mapOpen}><MobileScroll key={detail?list.id:'lists'}><header className="favorite-header" inert={mapOpen} aria-hidden={mapOpen}><IconButton name="back" label={detail?'Назад к спискам':'Назад'} onClick={onBack}/>{detail?<IconButton name="map" label="Карта отелей подборки" onClick={onMap}/>:<button className="favorite-new text-action" onClick={()=>open('create')}><Icon name="plus" size={18} inheritColor/>Новый список</button>}</header><main className="favorite-content"><div className="favorite-heading"><h1>{title}</h1><span>{countLabel(detail?items.length:allCount)}</span></div>
 {!detail?<>{allCount===0&&<Empty icon="heart" title="Сохраните то, что нравится" action={<Button onClick={onSearch}>Найти отель</Button>}>Нажмите на сердце в карточке отеля.</Empty>}{(allCount>0||lists.length>1)&&<div className="favorite-lists">{listCard(lists[0].id,true)}{lists.length>1&&<section>{lists.slice(1).map(l=>listCard(l.id))}</section>}</div>}</>:<>
  <div className="favorite-search">{[['dates','calendar','Даты',compactDates(list.search)],['guests','guests','Гости',guestLabel(list.search)]].map(([key,icon,label,value])=><button className="k-surface-action" key={key} onClick={()=>open(key)}><Icon name={icon} size={20} inheritColor/><span><small>{label}</small><strong>{value}</strong></span></button>)}</div>
  {items.length>0&&<p className="favorite-caption">Цены за {nights(list.search)} {nights(list.search)%10===1&&nights(list.search)!==11?'ночь':nights(list.search)%10>=2&&nights(list.search)%10<=4&&(nights(list.search)<12||nights(list.search)>14)?'ночи':'ночей'} · {guestLabel(list.search)}</p>}
  {items.map(({hotel,quote})=>{const v=hotelVisual(hotel.id);return <article className="favorite-hotel" key={hotel.id}><div className="discovery-photo"><HotelCardPhotos name={hotel.name} photos={v.photos} onOpen={()=>{if(quote)onOpen(hotel.id);else open('dates');}}/><SavedButton hotelId={hotel.id} saved onClick={()=>setCommerce(s=>setFavorite(s,owner,hotel.id,null))}/></div>
   <div className="favorite-hotel-details"><button className="favorite-hotel-title k-surface-action" onClick={()=>quote?onOpen(hotel.id):open('dates')}><strong>{hotel.name}</strong><span className={quote?'favorite-price':'favorite-unavailable'}>{quote?formatMoney(quote.cashDueMinor):'Нет номеров'}</span></button>{quote?.rateKind==='friendly_rate'&&<FriendlyRateBadge percent={ratePrice(quote).percent}/>}<div className="favorite-rating"><b>{v.rating.toLocaleString('ru-RU')}</b><span>{hotel.city} · {v.reviews} отзывов</span></div></div>
   <button className={'favorite-note k-surface-action '+(lib.notes[hotel.id]?'has-note':'')} onClick={()=>open('note',hotel.id)}>{lib.notes[hotel.id]?<><span><small>Моя заметка</small><span>{lib.notes[hotel.id]}</span></span><Icon name="edit" size={16} inheritColor/></>:<><Icon name="plus" size={16} inheritColor/>Добавить заметку</>}</button>
  </article>;})}
  {!items.length&&<Empty icon="heart" title="В списке пока нет отелей" action={<Button onClick={onSearch}>Найти отель</Button>}>Добавляйте понравившиеся отели с помощью сердца.</Empty>}
 </>}</main></MobileScroll></div>
 <ExpandingMap open={mapOpen} origin={`inset(${device.geometry.safeArea.top+8}px 12px calc(100% - ${device.geometry.safeArea.top+52}px) calc(100% - 56px) round 22px)`}><FavoritesMap initialSelected={commerce.draft?.returnTo==='favorite-map'?commerce.draft.hotelId:undefined} name={list.name} search={list.search} items={items} onClose={onMapClose} onOpen={onOpen} onDates={()=>open('dates')}/></ExpandingMap>
 <BottomSheet open={!!sheet} onOpenChange={value=>{if(!value)close();}} title={({create:'Новый список',dates:'Даты поездки',guests:'Кто едет',note:'Заметка'} as Record<string,string>)[sheet]||title} snap={sheet==='dates'?.9:sheet==='guests'?.8:.7}>
  <div className="sheet-body favorite-sheet">{error&&sheet!=='note'&&<p className="field-error" role="alert">{error}</p>}
   {sheet==='create'&&<FavoriteName onSave={name=>{const id=crypto.randomUUID();setCommerce(saveFavoriteList(commerce,owner,id,name));close();saving?.selectList(id);onList(id);}}/>}
   {sheet==='dates'&&<DatePicker value={list.search} onSave={search=>{try{setCommerce(saveFavoriteSearch(commerce,owner,list.id,search));close();}catch(e){setError((e as Error).message);}}}/>}
   {sheet==='guests'&&<GuestPicker value={list.search} onSave={search=>{try{setCommerce(saveFavoriteSearch(commerce,owner,list.id,search));close();}catch(e){setError((e as Error).message);}}}/>}
   {sheet==='note'&&<form className="favorite-form" onSubmit={e=>{e.preventDefault();try{setCommerce(saveFavoriteNote(commerce,owner,hotelId,note));close();}catch(e){setError((e as Error).message);}}}><div className="favorite-note-hotel"><img src={hotelVisual(hotelId).photos[0]} alt=""/><strong>{catalog.hotels.find(h=>h.id===hotelId)?.name}</strong></div><KeyboardTextarea aria-label="Заметка об отеле" maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} placeholder="Что важно запомнить об отеле"/><small className="favorite-counter">{note.length} / 1000</small>{error&&<p role="alert" className="field-error">{error}</p>}<Button type="submit">Сохранить</Button></form>}
  </div>
 </BottomSheet></div>;
}
