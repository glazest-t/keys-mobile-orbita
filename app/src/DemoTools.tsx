import {usePrototypeText} from './usePrototypeText';
import {setPrototypeText} from './prototypeText';
import {useDemoHistoryLoading,setDemoHistoryLoading} from './demoHistoryLoading';
import {usePrototypeIcons} from './usePrototypeIcons';
import {setPrototypeIcons} from './prototypeIcons';
import {useDemoEmptyTrip} from './demoEmptyTrip';
import {useDemoIntegrations,toggleDemoIntegration} from './demoIntegrations';
import {useDemoSearchLoading,setDemoSearchLoading} from './demoSearchLoading';
import {prototypeVersionUrl} from './prototypeVersion';
import {setPrototypeVariant} from './prototypeVariant';
import {usePrototypeVariant} from './usePrototypeVariant';
import {useEffect,useRef,type ReactNode} from 'react';
import {Icon} from './ui';
import './prototype-edition-notice.css';

const FULL_EDITION_NOTICE='Внимание, вы открыли полную версию, которая будет реализована только в марте.';
import './demo-tools.css';

function PrototypeVersion({desktop}:{desktop:boolean}){
 const warning=useRef<HTMLDialogElement>(null);
 const variant=usePrototypeVariant();
 const icons=usePrototypeIcons();
 const text=usePrototypeText();
 useEffect(()=>{setPrototypeText(text);},[text]);
 useDemoSearchLoading();
 useDemoIntegrations();
 useDemoEmptyTrip();
 useEffect(()=>{setPrototypeVariant(variant);},[variant]);
 const href=(desktop:boolean)=>{const url=new URL(location.href);url.searchParams.set('variant',variant);url.searchParams.set('icons',icons);url.searchParams.set('text',text);return prototypeVersionUrl(url.href,import.meta.env.BASE_URL,desktop,import.meta.env.DEV);};
 return <><section className="demo-version demo-variant"><h3>Вариант прототипа</h3><div className="demo-variant-options" role="group" aria-label="Вариант прототипа">{([['full','Полный'],['november','Ноябрь']] as const).map(([value,label])=><button key={value} type="button" aria-pressed={variant===value} onClick={()=>{setPrototypeVariant(value);if(value==='full')warning.current?.showModal();}}>{label}</button>)}</div><dialog ref={warning} className="prototype-edition-warning" aria-labelledby="prototype-edition-warning-title" aria-describedby="prototype-edition-warning-text"><h2 id="prototype-edition-warning-title">Полная версия</h2><p id="prototype-edition-warning-text">{FULL_EDITION_NOTICE}</p><button type="button" onClick={()=>warning.current?.close()}>Понятно</button></dialog></section><section className="demo-version"><h3>Версия прототипа</h3><nav aria-label="Версия прототипа"><a href={href(false)} aria-current={!desktop?'page':undefined} onClick={e=>{if(!desktop)e.preventDefault();}}>Мобильная версия</a><a href={href(true)} aria-current={desktop?'page':undefined} onClick={e=>{if(desktop)e.preventDefault();}}>Десктопная</a></nav></section></>;
}

function SearchLoadingSetting({onPreview}:{onPreview:()=>void}){
 const {slow}=useDemoSearchLoading();
 return <details className="demo-search-loading"><summary>Загрузка выдачи{slow&&<span className="demo-setting-value">5 сек</span>}</summary><div className="demo-compact-body"><div className="demo-variant-options" role="group" aria-label="Скорость загрузки выдачи"><button type="button" aria-pressed={!slow} onClick={()=>setDemoSearchLoading(false)}>Обычная</button><button type="button" aria-pressed={slow} onClick={()=>setDemoSearchLoading(true)}>Медленная · 5 сек</button></div><button type="button" className="demo-loading-preview" onClick={()=>{setDemoSearchLoading(true);onPreview();location.hash='results';}}>Показать прелоудер</button></div></details>;
}

function HistoryLoadingSetting({onPreview}:{onPreview:()=>void}){
 const {failed}=useDemoHistoryLoading();
 return <details className="demo-history-loading" data-demo-keep-open><summary>История поездок{failed&&<span className="demo-setting-value">Ошибка</span>}</summary><div className="demo-compact-body"><div className="demo-variant-options" role="group" aria-label="Загрузка истории поездок"><button type="button" aria-pressed={!failed} onClick={()=>setDemoHistoryLoading(false)}>Загружена</button><button type="button" aria-pressed={failed} onClick={()=>setDemoHistoryLoading(true)}>Ошибка загрузки</button></div><small>«Повторить» восстановит список. Брони сохраняются.</small><button type="button" className="demo-loading-preview" onClick={()=>{setDemoHistoryLoading(true);onPreview();location.hash='profile-history';}}>Показать ошибку</button></div></details>;
}

function TextSettings(){
 const text=usePrototypeText();
 return <details className="demo-text-settings" data-demo-keep-open><summary>Текст<span className="demo-setting-value">{text==='edited'?'С редактурой':'Обычный'}</span></summary><div className="demo-compact-body"><div className="demo-variant-options" role="group" aria-label="Текст">{([['standard','Обычный'],['edited','С редактурой']] as const).map(([value,label])=><button key={value} type="button" aria-pressed={text===value} onClick={()=>setPrototypeText(value)}>{label}</button>)}</div></div></details>;
}

function IconSettings(){
 const icons=usePrototypeIcons();
 return <details className="demo-icon-settings" data-demo-keep-open><summary>Иконки<span className="demo-setting-value">{icons==='new'?'Новые':'Старые'}</span></summary><div className="demo-compact-body"><div className="demo-variant-options" role="group" aria-label="Набор иконок">{([['old','Старые иконки'],['new','Новые иконки']] as const).map(([value,label])=><button key={value} type="button" aria-pressed={icons===value} onClick={()=>setPrototypeIcons(value)}>{label}</button>)}</div></div></details>;
}

function IntegrationSettings(){
 const capabilities=useDemoIntegrations();
 return <details className="demo-integration-settings"><summary>Возможности интеграций</summary><div className="demo-integration-options" role="group" aria-label="Возможности интеграций">{([['room','Без номера'],['key','Без ключа'],['wifi','Без Wi-Fi']] as const).map(([id,label])=><button key={id} type="button" aria-pressed={!capabilities[id]} onClick={()=>toggleDemoIntegration(id)}>{label}</button>)}</div><small>Можно включить несколько ограничений одновременно.</small></details>;
}

/** Demonstration controls live outside the product and stay closed until requested. */
export function DemoTools({children,primaryControls,desktop=false,floating=false}:{children:ReactNode;primaryControls:ReactNode;desktop?:boolean;floating?:boolean}){
 const dialog=useRef<HTMLDialogElement>(null);
 const close=()=>{dialog.current?.close();window.dispatchEvent(new Event('keys-demo-tools-close'));};
 if(desktop&&!floating)return <aside id="desktop-demo-tools" className="demo-tools" aria-label="Инструменты демонстрации"><PrototypeVersion desktop/>{primaryControls}<div className="demo-compact-controls" role="group" aria-label="Дополнительные настройки"><TextSettings/><IconSettings/><IntegrationSettings/><SearchLoadingSetting onPreview={close}/><HistoryLoadingSetting onPreview={close}/>{children}</div></aside>;
 return <div className="demo-launcher">
  <button className="demo-launch-button" aria-label="Открыть настройки прототипа" aria-haspopup="dialog" onClick={()=>dialog.current?.showModal()}><Icon name="settings" size={16} inheritColor/><span>Сценарии</span></button>
  <dialog ref={dialog} className="demo-tools demo-tools-dialog" aria-labelledby="demo-tools-title" onClick={e=>{if(e.target===e.currentTarget)close();}}>
   <header className="demo-tools-heading"><h2 id="demo-tools-title">Настройки прототипа</h2><button aria-label="Закрыть настройки" onClick={close}><Icon name="close" size={20} inheritColor/></button></header>
   <div className="demo-tools-content" onClick={e=>{const target=(e.target as Element).closest('button,a');if(target&&!target.closest('.biometric-demo-controls,.demo-variant,.demo-search-loading,.demo-integration-settings,.demo-empty-trip-settings,[data-demo-keep-open]'))close();}}><PrototypeVersion desktop={desktop}/>{primaryControls}<div className="demo-compact-controls" role="group" aria-label="Дополнительные настройки"><TextSettings/><IconSettings/><IntegrationSettings/><SearchLoadingSetting onPreview={close}/><HistoryLoadingSetting onPreview={close}/>{new URLSearchParams(location.search).has('catalogue')&&<a className="demo-return" href="?review=mobile#trips">Выйти из примера</a>}{children}</div></div>
  </dialog>
 </div>;
}
