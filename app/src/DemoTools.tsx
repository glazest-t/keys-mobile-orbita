import {prototypeVersionUrl} from './prototypeVersion';
import {setPrototypeVariant} from './prototypeVariant';
import {usePrototypeVariant} from './usePrototypeVariant';
import {useEffect,useRef,type ReactNode} from 'react';
import {Icon} from './ui';
import './demo-tools.css';

function PrototypeVersion({desktop}:{desktop:boolean}){
 const variant=usePrototypeVariant();
 useEffect(()=>{setPrototypeVariant(variant);},[variant]);
 const href=(desktop:boolean)=>{const url=new URL(location.href);url.searchParams.set('variant',variant);return prototypeVersionUrl(url.href,import.meta.env.BASE_URL,desktop,import.meta.env.DEV);};
 return <><section className="demo-version demo-variant"><h3>Вариант прототипа</h3><div className="demo-variant-options" role="group" aria-label="Вариант прототипа">{([['full','Полный'],['november','Ноябрь']] as const).map(([value,label])=><button key={value} type="button" aria-pressed={variant===value} onClick={()=>setPrototypeVariant(value)}>{label}</button>)}</div></section><section className="demo-version"><h3>Версия прототипа</h3><nav aria-label="Версия прототипа"><a href={href(false)} aria-current={!desktop?'page':undefined} onClick={e=>{if(!desktop)e.preventDefault();}}>Мобильная версия</a><a href={href(true)} aria-current={desktop?'page':undefined} onClick={e=>{if(desktop)e.preventDefault();}}>Десктопная</a></nav></section></>;
}

/** Demonstration controls live outside the product and stay closed until requested. */
export function DemoTools({children,desktop=false}:{children:ReactNode;desktop?:boolean}){
 const dialog=useRef<HTMLDialogElement>(null);
 const close=()=>dialog.current?.close();
 if(desktop)return <aside id="desktop-demo-tools" className="demo-tools" aria-label="Инструменты демонстрации"><PrototypeVersion desktop/>{children}</aside>;
 return <div className="demo-launcher">
  <button className="demo-launch-button" aria-label="Открыть настройки прототипа" aria-haspopup="dialog" onClick={()=>dialog.current?.showModal()}><Icon name="settings" size={16} inheritColor/><span>Сценарии</span></button>
  <dialog ref={dialog} className="demo-tools demo-tools-dialog" aria-labelledby="demo-tools-title" onClick={e=>{if(e.target===e.currentTarget)close();}}>
   <header className="demo-tools-heading"><h2 id="demo-tools-title">Настройки прототипа</h2><button aria-label="Закрыть настройки" onClick={close}><Icon name="close" size={20} inheritColor/></button></header>
   <div className="demo-tools-content" onClick={e=>{const target=(e.target as Element).closest('button,a');if(target&&!target.closest('.biometric-demo-controls,.demo-variant'))close();}}><PrototypeVersion desktop={false}/>{new URLSearchParams(location.search).has('catalogue')&&<a className="demo-return" href="?review=mobile#trips">Выйти из примера</a>}{children}</div>
  </dialog>
 </div>;
}
