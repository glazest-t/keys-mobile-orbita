import {useState} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Icon} from '../ui';
import {EXCLUSIVE_BONUS_LABEL} from './filterSchema';

export function ExclusiveBonusOption({selected,onToggle}:{selected:boolean;onToggle:()=>void}){
 const [explained,setExplained]=useState(false);
 return <div className="exclusive-bonus-option"><div className={'exclusive-bonus-chip '+(selected?'selected':'')}>
  <button type="button" className="exclusive-bonus-select" aria-pressed={selected} onClick={onToggle}><span aria-hidden="true">🔥</span>{EXCLUSIVE_BONUS_LABEL}</button>
  <button type="button" className="exclusive-bonus-info" aria-label={'О параметре «'+EXCLUSIVE_BONUS_LABEL+'»'} aria-expanded={explained} aria-haspopup="dialog" onClick={()=>setExplained(true)}><Icon name="info" size={16} inheritColor/></button>
 </div><BottomSheet open={explained} onOpenChange={setExplained} title={EXCLUSIVE_BONUS_LABEL} snap={.38}><div className="sheet-body exclusive-bonus-help"><p>Специальные предложения отелей, которые можно забронировать только в «Ключах».</p><Button onClick={()=>setExplained(false)}>Понятно</Button></div></BottomSheet></div>;
}
