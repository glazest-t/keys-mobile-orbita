import {useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet,useKeyboard} from '../mobile';
import {Button,Empty,Icon,Switch} from '../ui';
import {PriceWatchEditor} from './HotelSheets';
import {priceWatchEntries,removePriceWatch,setWatchActive} from './priceWatch';
import {catalog,formatMoney,type Commerce} from './model';
import {hotelVisual} from './presentation';
import './details.css';
import './price-watches.css';

export function PriceWatches({previewChange=null,onExitPreview,commerce,setCommerce,owner,onOpen,onSearch}:{previewChange?:'down'|'up'|'compare'|null;onExitPreview?:()=>void;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string;onOpen:(key:string)=>void;onSearch:()=>void}){
 const entries=priceWatchEntries(commerce,owner),[tab,setTab]=useState<'active'|'paused'>('active'),[selected,setSelected]=useState(''),[sheet,setSheet]=useState<'edit'|'delete'|''>(''),[error,setError]=useState('');
 const keyboard=useKeyboard(),entry=entries.find(e=>e.key===selected),active=entries.filter(e=>e.watch.active),paused=entries.filter(e=>!e.watch.active),shown=tab==='active'?active:paused;
 const close=()=>{keyboard.hide();setSheet('');setError('');};
 const open=(key:string,next:'edit'|'delete')=>{onExitPreview?.();keyboard.hide();setSelected(key);setSheet(next);setError('');};
 return <div className="price-watches"><h1>Следим за ценами</h1>
 {entries.length>0&&<div className="detail-segments watch-mode" aria-label="Состояние отслеживания">{(['active','paused'] as const).map(t=><button key={t} aria-pressed={tab===t} className={tab===t?'active':''} onClick={()=>{setTab(t);setError('');}}>{t==='active'?'Активные':'На паузе'} · {t==='active'?active.length:paused.length}</button>)}</div>}
 {error&&!sheet&&<p className="field-error" role="alert">{error}</p>}
 {shown.map((e,index)=>{const h=catalog.hotels.find(h=>h.id===e.draft.hotelId)!,room=catalog.rooms.find(r=>r.id===e.draft.roomId)!,original=previewChange?e.currentMinor??e.watch.priceMinor:e.watch.priceMinor,delta=previewChange==='up'||(previewChange==='compare'&&(index%2===1||shown.length===1))?550000:-550000,current=e.currentMinor!==null&&previewChange&&e.currentMinor+delta>0?e.currentMinor+delta:e.currentMinor,changed=current!==null&&current!==original;return <article className="watch-card" key={e.key}>
  <div className="watch-card-heading"><button className="watch-hotel k-surface-action" disabled={!!e.unavailable} onClick={()=>{onExitPreview?.();onOpen(e.key);}}><img src={hotelVisual(h.id).photos[0]} alt=""/><span><strong>{h.name}</strong><small>{room.title}</small></span></button><button type="button" className="watch-remove k-icon-button" aria-label={`Удалить наблюдение: ${h.name}`} onClick={()=>open(e.key,'delete')}><Icon name="trash" size={18} inheritColor/></button></div>
  <div className="watch-card-footer"><button className="watch-card-price k-surface-action" aria-label={`Изменить условие: ${h.name}`} title="Настроить отслеживание цены" onClick={()=>open(e.key,'edit')}>
   {changed&&<span className="watch-price-history"><del aria-label="Прежняя цена">{formatMoney(original)}</del><span className={'watch-price-delta '+(current!<original?'down':'up')} aria-label={`Цена ${current!<original?'снизилась':'выросла'} на ${formatMoney(Math.abs(current!-original))}`}>{current!<original?'↓':'↑'} {formatMoney(Math.abs(current!-original))}</span></span>}
   <strong className={changed&&current!<original?'decreased':''} aria-label={changed?'Новая цена':'Цена проживания'}>{current===null?'Недоступно':formatMoney(current)}</strong>
  </button><div className="watch-toggle"><Switch checked={e.watch.active} disabled={!e.watch.active&&!!e.unavailable} onChange={value=>{try{setCommerce(setWatchActive(commerce,owner,e.key,value));setError('');}catch(err){setError((err as Error).message);}}}><span className="watch-toggle-label">Отслеживание · {h.name}</span></Switch></div></div>
 </article>;})}
 {!shown.length&&<Empty icon="bell" title={!entries.length?'Пока не следим за ценами':tab==='active'?'Нет активных наблюдений':'Нет наблюдений на паузе'} action={!entries.length?<Button onClick={onSearch}>Найти отель</Button>:<Button variant="secondary" onClick={()=>setTab(tab==='active'?'paused':'active')}>{tab==='active'?'Посмотреть на паузе':'Посмотреть активные'}</Button>}>{!entries.length?'Выберите «Следить за ценой» на странице отеля.':tab==='active'?'Возобновите отслеживание, когда будете готовы.':'Приостановленные наблюдения останутся здесь.'}</Empty>}
 <BottomSheet open={!!sheet&&!!entry} onOpenChange={value=>{if(!value)close();}} title={sheet==='delete'?'Удалить наблюдение?':'Следить за ценой'} snap={sheet==='delete'?.42:.82}>
 <div className="sheet-body">{entry&&sheet==='edit'?<PriceWatchEditor key={entry.key} commerce={commerce} setCommerce={setCommerce} owner={owner} draft={entry.draft} onClose={close}/>:entry&&sheet==='delete'?<><p>Отслеживание цены на {catalog.hotels.find(h=>h.id===entry.draft.hotelId)?.name} будет удалено.</p><Button variant="danger" onClick={()=>{setCommerce(removePriceWatch(commerce,owner,entry.key));close();}}>Удалить</Button><Button variant="secondary" onClick={close}>Оставить</Button></>:null}</div>
 </BottomSheet></div>;
}
