import {useEffect,useRef,useState} from 'react';
import {BottomSheet} from '../mobile';
import {Button} from '../ui';
const months=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
const row=44;
function DateWheel({label,items,index,onChange}:{label:string;items:string[];index:number;onChange:(index:number)=>void}){
 const ref=useRef<HTMLDivElement>(null),drag=useRef<{y:number;index:number;offset:number}|null>(null);
 const [offset,setOffset]=useState(0);
 useEffect(()=>{const el=ref.current;if(!el)return;let total=0;const wheel=(e:WheelEvent)=>{e.preventDefault();e.stopPropagation();total+=e.deltaY;if(Math.abs(total)>=20){onChange(clamp(index+Math.sign(total),0,items.length-1));total=0;}};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[index,items.length,onChange]);
 const settle=()=>{if(!drag.current)return;onChange(clamp(drag.current.index-Math.round(drag.current.offset/row),0,items.length-1));drag.current=null;setOffset(0);};
 return <div ref={ref} className={'birth-wheel'+(drag.current?' is-dragging':'')} role="spinbutton" tabIndex={0} aria-label={label} aria-valuemin={Number(items[0])||1} aria-valuemax={Number(items.at(-1))||items.length} aria-valuenow={Number(items[index])||index+1} aria-valuetext={items[index]} data-scroll-drag="ignore"
  onKeyDown={e=>{const delta=({ArrowDown:1,ArrowUp:-1,PageDown:10,PageUp:-10} as Record<string,number>)[e.key];if(delta!==undefined||e.key==='Home'||e.key==='End'){e.preventDefault();onChange(e.key==='Home'?0:e.key==='End'?items.length-1:clamp(index+delta,0,items.length-1));}}}
  onPointerDown={e=>{e.preventDefault();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);drag.current={y:e.clientY,index,offset:0};}}
  onPointerMove={e=>{if(!drag.current)return;const next=clamp(e.clientY-drag.current.y,-(items.length-1-index)*row,index*row);drag.current.offset=next;setOffset(next);}}
  onPointerUp={e=>{if(drag.current&&Math.abs(drag.current.offset)<5){const bounds=e.currentTarget.getBoundingClientRect();const at=Math.round((e.clientY-bounds.top)/row-.5)-2;onChange(clamp(index+at,0,items.length-1));drag.current=null;setOffset(0);}else settle();}}
  onPointerCancel={()=>{drag.current=null;setOffset(0);}}>
  <div className="birth-wheel-track" aria-hidden="true" style={{transform:`translateY(${2*row-index*row+offset}px)`}}>{items.map((text,i)=><div key={text} className={'birth-wheel-item'+(i===index?' selected':'')}>{text}</div>)}</div>
 </div>;
}
export function BirthDatePicker({value,onSave,onClose}:{value:string;onSave:(value:string)=>void;onClose:()=>void}){
 const today=new Date(),maxYear=today.getFullYear(),maxMonth=today.getMonth()+1,maxDay=today.getDate();
 const initial=/^\d{4}-\d{2}-\d{2}$/.test(value)?value:'1990-01-01';
 const [year,setYear]=useState(clamp(+initial.slice(0,4),1900,maxYear));
 const [month,setMonth]=useState(+initial.slice(5,7));const [day,setDay]=useState(+initial.slice(8));
 const monthCount=year===maxYear?maxMonth:12,selectedMonth=clamp(month,1,monthCount);
 const dayCount=Math.min(new Date(year,selectedMonth,0).getDate(),year===maxYear&&selectedMonth===maxMonth?maxDay:31),selectedDay=clamp(day,1,dayCount);
 const iso=`${year}-${String(selectedMonth).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
 return <BottomSheet open onOpenChange={open=>{if(!open)onClose();}} title="Дата рождения" snap={.55}><div className="sheet-body birth-date-sheet">
  <div className="birth-wheels"><div className="birth-wheel-highlight" aria-hidden="true"/><DateWheel label="День" items={Array.from({length:dayCount},(_,i)=>String(i+1))} index={selectedDay-1} onChange={i=>setDay(i+1)}/><DateWheel label="Месяц" items={months.slice(0,monthCount)} index={selectedMonth-1} onChange={i=>setMonth(i+1)}/><DateWheel label="Год" items={Array.from({length:maxYear-1899},(_,i)=>String(1900+i))} index={year-1900} onChange={i=>setYear(1900+i)}/></div>
  <Button type="button" onClick={()=>onSave(iso)}>Готово</Button><Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
 </div></BottomSheet>;
}
