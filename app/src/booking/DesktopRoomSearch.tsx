import {useState} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Icon} from '../ui';
import {DatePicker,GuestPicker} from './SearchControls';
import {dateLabel,guestLabel,type Search} from './model';

export function DesktopRoomSearch({value,onApply}:{value:Search;onApply:(value:Search)=>void|string}){
 const [draft,setDraft]=useState(()=>structuredClone(value));
 const [field,setField]=useState<'dates'|'guests'|null>(null),[error,setError]=useState('');
 const save=(next:Search)=>{setDraft(next);setError('');setField(null);};
 return <div className="desktop-room-search">
  <form aria-label="Поиск номеров" onSubmit={event=>{event.preventDefault();setError(onApply(draft)||'');}}>
   <button type="button" className="desktop-room-search-field" onClick={()=>setField('dates')}><Icon name="calendar" size={20}/><span><small>Заезд — выезд</small><strong>{dateLabel(draft)}</strong></span><Icon name="chevron-down" size={16}/></button>
   <button type="button" className="desktop-room-search-field" onClick={()=>setField('guests')}><Icon name="guests" size={20}/><span><small>Гости</small><strong>{guestLabel(draft)}</strong></span><Icon name="chevron-down" size={16}/></button>
   <Button type="submit" variant="secondary"><Icon name="nav-search" size={18} inheritColor/>Найти номера</Button>
  </form>
  {error&&<p className="field-error" role="alert">{error}</p>}
  <BottomSheet open={!!field} onOpenChange={open=>{if(!open)setField(null);}} title={field==='dates'?'Даты проживания':'Кто едет'}>
   {field==='dates'?<DatePicker value={draft} onSave={save}/>:field==='guests'?<GuestPicker value={draft} onSave={save}/>:null}
  </BottomSheet>
 </div>;
}
