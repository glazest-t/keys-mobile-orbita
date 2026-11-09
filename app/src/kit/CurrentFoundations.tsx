import {useState} from 'react';
import {Button,Icon,IconButton} from '../ui';
import {ICON_REVISION} from '../iconAssets';
import {usePrototypeIcons} from '../usePrototypeIcons';
import {SortSheet} from '../booking/SortSheet';
import {sortOptions as options} from '../booking/filterSchema';
import {SavedButton} from '../booking/Discovery';
import inventory from '../../../design/assets/icons-soft/inventory.json';
import tokens from '../../../design/tokens.json';
import './current-components.css';

const colors=tokens.primitive.color;
const palette=[['Фон приложения','--k-surface-app',colors.neutral.pearl],['Подложки иконок и блоков','--k-action-tint',colors.brand.cobaltTint],['Карточка','--k-surface-card',colors.neutral.white],['Основной акцент','--k-action-primary',colors.brand.cobalt],['Текст','--k-text-primary',colors.neutral.ink],['Неактивная навигация',null,'#454750']] as const;
const featured=['best-price','breakfast','cafe','cleaning','time','points-earned','room','spa'];

/** Uses the same tokens, SVGs and action components as the prototype. */
export function CurrentFoundations(){
 const [saved,setSaved]=useState(false),[sortOpen,setSortOpen]=useState(false),[sort,setSort]=useState<string>('recommended'),[feedback,setFeedback]=useState('');
 const variant=usePrototypeIcons();
 return <div className="current-component-kit current-foundations">
  <section className="current-kit-release"><h2>Актуальная версия · 08.11.2026</h2><p>Мобильная и десктопная версии используют общие компоненты. Иконки: {variant==='new'?'Мягкие':'исходный набор'}. Ревизия новых иконок: <code>{ICON_REVISION}</code>.</p></section>
  <section><h2>Цвета и подложки</h2><div className="current-kit-palette">{palette.map(([label,token,color])=><div key={label}><i style={{background:token?`var(${token})`:color}}/><span><strong>{label}</strong><code>{color}</code>{token&&<small>{token}</small>}</span></div>)}</div><p>Десктопная страница — белая. Мобильный фон — почти белый. В онбординге и под кнопкой входа нет дополнительной подложки.</p></section>
  <section><h2>Действия в шапке</h2><div className="record-details-header current-kit-header-actions"><IconButton name="back" inheritColor label="Пример: назад" onClick={()=>setFeedback('Назад')}/><SavedButton saved={saved} onClick={()=>setSaved(v=>!v)}/><IconButton name="share" inheritColor label="Пример: поделиться" onClick={()=>setFeedback('Поделиться')}/></div><p>Кнопки 44 × 44 px, белый фон, тонкая обводка, синие иконки 20 px. Избранное в шапке различается контуром и заливкой. В карточках выдачи сохранённый отель отмечается розовым.</p><span role="status" className="current-kit-feedback">{feedback}</span></section>
  <section><h2>Сортировка</h2><Button variant="secondary" onClick={()=>setSortOpen(true)}>{options.find(([value])=>value===sort)?.[1]}<Icon name="sort" size={20} inheritColor/></Button><p>SortSheet для сортировки выдачи отелей. Выбор сразу применяется и закрывает окно.</p></section>
  <section><h2>Иконки · {inventory.assetCount} SVG</h2><div className="current-kit-icons">{featured.map(id=><div key={id}><span className="icon-tile"><Icon name={id}/></span><span>{inventory.items.find(item=>item.id===id)?.label||id}</span><code>{id}</code></div>)}</div><p>Крупный основной силуэт, мягкие скругления; второй тон только у самостоятельного дополнительного элемента. Стандартная подложка — 44 px, радиус 15 px.</p><details className="current-kit-icon-catalogue"><summary>Все {inventory.catalogueCount} назначений иконок</summary>{[...new Set(inventory.items.map(item=>item.group))].map(group=><section key={group}><h3>{group}</h3><div className="current-kit-icons">{inventory.items.filter(item=>item.group===group).map(item=><div key={item.id}><Icon name={item.id}/><span>{item.label}</span><code>{item.id}</code></div>)}</div></section>)}</details></section>
  <SortSheet open={sortOpen} onOpenChange={setSortOpen} label="Сортировка отелей · UI kit" options={options} value={sort} onChange={setSort}/>
 </div>;
}
