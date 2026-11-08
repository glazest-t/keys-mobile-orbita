import {BottomSheet} from '../mobile';
import {Icon} from '../ui';
import './results-header.css';

/** Общий выбор сортировки для выдачи отелей и отзывов. */
export function SortSheet<T extends string>({open,onOpenChange,title='Сортировка',label,options,value,onChange}:{open:boolean;onOpenChange:(open:boolean)=>void;title?:string;label:string;options:ReadonlyArray<readonly [T,string]>;value:T;onChange:(value:T)=>void}){
 return <BottomSheet open={open} onOpenChange={onOpenChange} title={title} snap={.68}>
  <div className="results-sort-panel" role="group" aria-label={label}>{options.map(([key,text])=><button type="button" className="results-sort-option" key={key} aria-pressed={key===value} onClick={()=>{onChange(key);onOpenChange(false);}}><span>{text}</span><span className="results-sort-check" aria-hidden="true">{key===value&&<Icon name="check" size={14} inheritColor/>}</span></button>)}</div>
 </BottomSheet>;
}
