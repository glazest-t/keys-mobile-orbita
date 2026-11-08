import {useState} from 'react';
import {SortSheet} from './SortSheet';
import {Icon} from '../ui';

const options=[['popular','Сначала популярные'],['recent','Сначала свежие'],['negative','Сначала отрицательные'],['positive','Сначала положительные']] as const;
export type ReviewSortOrder=typeof options[number][0];
const months=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function reviewDate(value:string){
 const match=value.match(/^(\d{1,2})\s+([а-я]+)(?:\s+(\d{4}))?/i);
 if(!match)return 0;
 return Number(match[3]||new Date().getFullYear())*10000+(months.indexOf(match[2].toLowerCase())+1)*100+Number(match[1]);
}
export function sortHotelReviews<T extends {date:string;score:string}>(reviews:T[],order:ReviewSortOrder):T[]{
 // Popularity is the editorial order of the demo catalogue, not live voting data.
 if(order==='popular')return [...reviews];
 return [...reviews].sort((a,b)=>order==='recent'?reviewDate(b.date)-reviewDate(a.date):(Number(a.score.replace(',','.'))-Number(b.score.replace(',','.')))*(order==='positive'?-1:1));
}
export function ReviewSort({value,onChange}:{value:ReviewSortOrder;onChange:(value:ReviewSortOrder)=>void}){
 const [open,setOpen]=useState(false);
 return <><button type="button" className="desktop-review-sort" aria-label={`Сортировка отзывов: ${options.find(([id])=>id===value)?.[1]}`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><span>{options.find(([id])=>id===value)?.[1]}</span><Icon name="chevron-down" size={16} inheritColor/></button><SortSheet open={open} onOpenChange={setOpen} title="Сортировка отзывов" label="Порядок отзывов" options={options} value={value} onChange={onChange}/></>;
}
