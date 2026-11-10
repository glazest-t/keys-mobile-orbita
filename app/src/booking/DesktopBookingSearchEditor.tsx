import {useState} from 'react';
import {Button} from '../ui';
import {Calendar,GuestFields} from './SearchControls';
import {validDateRange} from './search';
import type {Search} from './model';

export function DesktopBookingSearchEditor({value,onApply}:{value:Search;onApply:(search:Search)=>void|string}){
 const [draft,setDraft]=useState(()=>structuredClone(value));
 const [error,setError]=useState('');
 const validation=validDateRange(draft);
 const change=(next:Search)=>{setDraft(next);setError('');};
 return <div className="desktop-booking-search-editor">
  <div className="desktop-booking-search-fields">
   <section><h3>Даты проживания</h3><Calendar value={draft} onChange={change}/></section>
   <section><h3>Гости</h3><GuestFields value={draft} onChange={change}/></section>
  </div>
  {error&&<p className="field-error" role="alert">{error}</p>}
  {validation&&draft.checkOut&&<p className="field-error" role="alert">{validation}</p>}
  <div className="desktop-booking-search-actions"><Button disabled={!!validation} onClick={()=>setError(onApply(draft)||'')}>Применить изменения</Button></div>
 </div>;
}
