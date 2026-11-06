import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
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
 return <DropdownMenu.Root><DropdownMenu.Trigger asChild><button type="button" className="desktop-review-sort" aria-label={`Сортировка отзывов: ${options.find(([id])=>id===value)?.[1]}`}><span>{options.find(([id])=>id===value)?.[1]}</span><Icon name="chevron-down" size={16} inheritColor/></button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="desktop-review-sort-menu" align="end" sideOffset={8} collisionPadding={16}><DropdownMenu.RadioGroup value={value} onValueChange={v=>onChange(v as ReviewSortOrder)}>{options.map(([id,label])=><DropdownMenu.RadioItem className="desktop-review-sort-option" value={id} key={id}><span className="desktop-review-sort-check"><DropdownMenu.ItemIndicator><Icon name="check" size={18} inheritColor/></DropdownMenu.ItemIndicator></span>{label}</DropdownMenu.RadioItem>)}</DropdownMenu.RadioGroup></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>;
}
