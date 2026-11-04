import {isDesktop} from '../desktop/surface';
import {useState,type Dispatch,type SetStateAction} from 'react';
import {Carousel,useKeyboard} from '../mobile';
import {Button,Empty,Field,Icon,Row} from '../ui';
import type {State,User} from '../state';
import type {Commerce} from '../booking/model';
import {helpArticles} from './support';
import './history.css';
import './support.css';
// Legacy support links open the help centre instead of an unavailable support form.
export const isSupportRoute=(r:string)=>r==='help'||r==='support-new'||r.startsWith('help-article/')||r.startsWith('support-new/')||r.startsWith('support-request/');
export const supportTitle=(r:string)=>r==='help'?'Помощь и поддержка':'Помощь';
export const supportBack=(_r:string)=>_r==='help'?'profile':'help';
export function SupportPage({setState,user,route:requestedRoute,onNavigate:go}:{state:State;setState:Dispatch<SetStateAction<State>>;commerce:Commerce;user:User;route:string;onNavigate:(r:string)=>void;onChat:(id:string)=>void;onToast:(s:string)=>void}){
 const route=requestedRoute.startsWith('support-')?'help':requestedRoute,keyboard=useKeyboard();
 const [query,setQuery]=useState(user.helpBrowse?.query||''),[category,setCategory]=useState(user.helpBrowse?.category||'Все');
 const browse=(patch:Partial<{query:string;category:string}>)=>{if(patch.query!==undefined)setQuery(patch.query);if(patch.category!==undefined)setCategory(patch.category);setState(s=>({...s,users:{...s.users,[user.phone]:{...s.users[user.phone],helpBrowse:{query,category,...patch}}}}));};
 let content;
 if(route==='help'){
 const articles=helpArticles.filter(a=>(category==='Все'||a.category===category)&&(a.title+' '+a.text).toLocaleLowerCase('ru-RU').includes(query.trim().toLocaleLowerCase('ru-RU')));
 content=<><div className="help-search"><Icon name="nav-search" size={20}/><Field label="Поиск по помощи" placeholder="Поиск по помощи" value={query} onChange={e=>browse({query:e.target.value})}/></div><Carousel ariaLabel="Темы помощи"><div className="help-filters">{['Все','Бронирование','Проживание','Аккаунт','Баллы'].map(t=><button key={t} className={'filter-chip'+(category===t?' selected':'')} aria-pressed={category===t} onClick={()=>{keyboard.hide();browse({category:t});}}>{t}</button>)}</div></Carousel>{articles.length?<section className="history-section help-questions"><h2>{query.trim()?'Результаты поиска':category==='Все'?'Частые вопросы':category}</h2><div className="k-card">{articles.map(a=><Row key={a.id} icon={a.category==='Бронирование'?'nav-trips':a.category==='Проживание'?'reception':a.category==='Баллы'?'discount':'nav-profile'} title={a.title} onClick={()=>go('help-article/'+a.id)}/>)}</div></section>:<Empty icon="nav-search" title="Статья не найдена">Попробуйте другое слово или выберите другую тему.</Empty>}</>;
 }else{const article=helpArticles.find(a=>a.id===route.split('/')[1]);content=article?<><div className="support-article"><span className="icon-tile"><Icon name="info" size={26}/></span><h1>{article.title}</h1><p>{article.text}</p></div>{!isDesktop&&<Button onClick={()=>go(article.route)}>{article.action}</Button>}</>:<Empty icon="info" title="Статья не найдена" action={<Button onClick={()=>go('help')}>К помощи</Button>}>Выберите другую тему.</Empty>;}
 return <div className="profile-history-page support-page">{content}</div>;
}
