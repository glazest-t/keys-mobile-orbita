import {StayReviewFlow} from '../booking/StayReviewFlow';
import {editorialText} from '../../../prototype/domain/editorialText.mjs';
import {useDemoHistoryLoading,setDemoHistoryLoading} from '../demoHistoryLoading';
import {AddBookingSheet} from './AddBookingSheet';
import {canManageBooking} from '../booking/bookingShare';
import {CancellationPanel} from '../booking/Catalog';
import {TripDetails} from './TripDetails';
import {DialogActions} from '../dialogActions';
import {isDesktop} from '../desktop/surface';
import {HistoryTimeline} from './HistoryTimeline';
import {useEffect,useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet,Carousel,useKeyboard} from '../mobile';
import {Button,Empty,Field,Icon,IconButton,Row} from '../ui';
import {cancelBooking,type Commerce} from '../booking/model';
import {historyBooking,historySummary,historyTrips,isPastTrip,removeTrip} from './history';
import '../booking/stay-review.css';
import './history.css';
import '../filter-tabs.css';
export const isHistoryRoute=(route:string)=>route==='profile-history'||route.startsWith('profile-trip/');
export function ProfileHistory({commerce:s,setCommerce,owner,route,onNavigate:go,onHotel,onToast,onBooking}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string;route:string;onNavigate:(r:string)=>void;onHotel:(hotelId:string)=>void;onBooking:(id:string,mode?:'edit'|'documents')=>void;onToast:(s:string)=>void}){
 const b=historyBooking(s,owner,route.split('/')[1]),keyboard=useKeyboard();
 const [query,setQuery]=useState(s.historyBrowse?.[owner]?.query||''),[filter,setFilter]=useState(s.historyBrowse?.[owner]?.filter||'Все'),[review,setReview]=useState(false),[error,setError]=useState('');
 const browse=(patch:Partial<{query:string;filter:string}>)=>{if(patch.query!==undefined)setQuery(patch.query);if(patch.filter!==undefined)setFilter(patch.filter);setCommerce(s=>({...s,historyBrowse:{...s.historyBrowse,[owner]:{query,filter,...patch}}}));};
 const [adding,setAdding]=useState(false),[remove,setRemove]=useState(false),[cancel,setCancel]=useState(false),[cancelError,setCancelError]=useState('');
 const trips=historyTrips(s,owner,isDesktop?'':query,filter);
 const filteredEmpty=isDesktop&&filter!=='Все';
 const {failed:historyFailed,key:historyLoadKey}=useDemoHistoryLoading();
 const [retryKey,setRetryKey]=useState<string|null>(null);
 const retrying=historyFailed&&retryKey===historyLoadKey;
 useEffect(()=>{
  if(!retrying)return;
  const timer=setTimeout(()=>setDemoHistoryLoading(false),900);
  return()=>clearTimeout(timer);
 },[retrying,historyLoadKey]);


 const download=()=>{if(!b)return;const url=URL.createObjectURL(new Blob([historySummary(b)],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='keys-trip-'+b.id.slice(0,8)+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);onToast('Сводка сохранена');};
 const addBookingAction=<button className="favorite-new text-action" onClick={()=>{keyboard.hide();setError('');setAdding(true);}}><Icon name="plus" size={18} inheritColor/>Добавить бронь</button>;
 if(route==='profile-history'&&historyFailed)return <div className="profile-history-page history-load-failed"><header className="history-toolbar"><IconButton name="back" label="Назад" onClick={()=>go(s.historyReturnTo||'profile')}/>{isDesktop&&<h1>{editorialText("РШ-001", "История поездок", "Мои поездки")}</h1>}</header>{!isDesktop&&<h1>{editorialText("РШ-001", "История поездок", "Мои поездки")}</h1>}<div className="history-load-error" role="status" aria-live="polite"><Empty icon="error" title="Не удалось загрузить поездки" action={<Button busy={retrying} busyLabel="Загружаем…" onClick={()=>setRetryKey(historyLoadKey)}>{editorialText("РШ-005", "Повторить", "Повторить загрузку")}</Button>}>{editorialText("РШ-006", "Проверьте подключение к интернету и попробуйте ещё раз.", "Проверьте подключение к интернету и попробуйте ещё раз")}</Empty></div></div>;
 if(route==='profile-history')return <div className="profile-history-page"><header className="history-toolbar"><IconButton name="back" label="Назад" onClick={()=>go(s.historyReturnTo||'profile')}/>{isDesktop&&<h1>{editorialText("РШ-001", "История поездок", "Мои поездки")}</h1>}{!isDesktop&&addBookingAction}</header>{!isDesktop&&<h1>{editorialText("РШ-001", "История поездок", "Мои поездки")}</h1>}{!isDesktop&&<div className="history-search"><Field aria-label="Отель или город" label={editorialText("РШ-007", "Отель или город", "")} placeholder={editorialText("РШ-008", "Поиск поездки", "Отель или город")} value={query} onChange={e=>browse({query:e.target.value})}/></div>}<div className={isDesktop?"desktop-history-controls":"history-controls"}><Carousel ariaLabel="Статус поездки" contentClassName="history-filters filter-tabs">{['Все','Предстоящие','Завершённые','Отменённые'].map(t=><button className={'filter-chip '+(filter===t?'selected':'')} key={t} aria-pressed={filter===t} onClick={()=>{keyboard.hide();browse({filter:t});}}>{t}</button>)}</Carousel>{isDesktop&&addBookingAction}</div>{trips.length?<HistoryTimeline trips={trips} onOpen={id=>go('profile-trip/'+id)} onRepeat={onHotel}/>:<Empty icon="luggage" title={filteredEmpty?'Нет поездок по этим условиям':query?editorialText("РШ-009", "Поездка не найдена", "Поездки не найдены"):editorialText("РШ-010", "Здесь будет история", "Здесь будут ваши поездки")} action={<Button variant="secondary" onClick={()=>filteredEmpty?browse({query:'',filter:'Все'}):go('find')}>{filteredEmpty?'Сбросить фильтры':'Найти'}</Button>}>{filteredEmpty?'Измените поиск или посмотрите все поездки.':query?editorialText("РШ-012", "Попробуйте другое название отеля или города.", "Попробуйте изменить запрос"):editorialText("РШ-013", "Предстоящие и прошлые поездки появятся здесь.", "Добавьте бронь, чтобы видеть её здесь")}</Empty>}<AddBookingSheet commerce={s} setCommerce={setCommerce} owner={owner} open={adding} onClose={()=>setAdding(false)} onAdded={()=>{setQuery('');setFilter('Все');onToast('Бронь добавлена');}}/></div>;
 if(!b)return <Empty icon="luggage" title="Поездка недоступна" action={<Button onClick={()=>go('profile-history')}>{editorialText("РШ-015", "К истории", "Мои поездки")}</Button>}>{editorialText("РШ-016", "Откройте поездку из своего профиля.", "Откройте поездку из своего профиля")}</Empty>;
 const canChange=canManageBooking(s,owner,b)&&!b.stay&&b.operation.status!=='cancelled'&&Date.now()<Date.parse(b.draft.search.checkIn+'T15:00:00+03:00');
 const mobileActions=<div className="trip-detail-action-group">{isPastTrip(b)&&<Button onClick={()=>onHotel(b.draft.hotelId)}><Icon name="calendar" size={20} inheritColor/>{editorialText("РШ-017", "Снова в этот отель", "Забронировать снова")}</Button>}</div>;
 const mobileStickyActions=canChange&&<div className="trip-detail-action-group">{canChange&&<><Button variant="primary" onClick={()=>onBooking(b.id,'edit')}><Icon name="edit" size={20} inheritColor/>Изменить</Button><Button variant="secondary" className="record-cancel" onClick={()=>{setCancelError('');setCancel(true);}}>{editorialText("РШ-019", "Отменить", "Отменить бронь")}</Button></>}</div>;
 return <div className="profile-history-page trip-detail-page"><TripDetails booking={b} commerce={s} setCommerce={setCommerce} onBooking={()=>onBooking(b.id)} onRepeat={()=>onHotel(b.draft.hotelId)} onDownload={download} onReview={()=>setReview(true)} onRemove={()=>setRemove(true)} actions={isDesktop?undefined:mobileActions} stickyActions={isDesktop?undefined:mobileStickyActions} resources={isDesktop?undefined:<><Row icon="document" title="Документы поездки" onClick={()=>onBooking(b.id,'documents')}/></>}/><BottomSheet title={editorialText("РШ-021", "Отменить бронирование?", "Отменить бронь?")} open={cancel} onOpenChange={setCancel}><div className="sheet-body record-cancellation">{cancelError&&<p role="alert" className="field-error">{cancelError}</p>}<CancellationPanel booking={b} onClose={()=>setCancel(false)} onConfirm={()=>{try{setCommerce(cancelBooking(s,owner,b.id));setCancel(false);onToast('Бронирование отменено');}catch(e){setCancelError((e as Error).message);}}}/></div></BottomSheet><BottomSheet title="Удалить бронь из приложения?" open={remove} onOpenChange={setRemove} snap={.55}><div className="sheet-body history-form" data-scroll-drag="ignore"><p>{editorialText("РШ-023", "Поездка исчезнет из приложения. Бронирование в отеле и оплата сохранятся. Вернуть поездку можно по номеру брони.", "Бронирование и оплата сохранятся. Вы сможете вернуть поездку в список по номеру брони")}</p><DialogActions><Button variant="danger" onClick={()=>{setCommerce(removeTrip(s,owner,b.id));setRemove(false);go('profile-history');onToast('Бронь удалена из приложения');}}>Удалить из приложения</Button><Button variant="secondary" onClick={()=>setRemove(false)}>Оставить</Button></DialogActions></div></BottomSheet><BottomSheet title="Отзыв" open={review} onOpenChange={setReview} snap={.9}>{review&&<StayReviewFlow embedded booking={b} commerce={s} setCommerce={setCommerce} actor={owner} onBack={()=>setReview(false)}/>}</BottomSheet></div>;
}
