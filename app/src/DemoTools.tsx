import {useRef,type ReactNode} from 'react';
import {Icon} from './ui';
import './demo-tools.css';

/** Demonstration controls live outside the product and stay closed until requested. */
export function DemoTools({children}:{children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null);
 const close=()=>dialog.current?.close();

 return <div className="demo-launcher">
  <button className="demo-launch-button" aria-label="Открыть настройки прототипа" aria-haspopup="dialog" onClick={()=>dialog.current?.showModal()}><Icon name="settings" size={16} inheritColor/><span>Сценарии</span></button>
  <dialog ref={dialog} className="demo-tools demo-tools-dialog" aria-labelledby="demo-tools-title" onClick={e=>{if(e.target===e.currentTarget)close();}}>
   <header className="demo-tools-heading"><h2 id="demo-tools-title">Настройки прототипа</h2><button aria-label="Закрыть настройки" onClick={close}><Icon name="close" size={20} inheritColor/></button></header>
   <div className="demo-tools-content" onClick={e=>{const target=(e.target as Element).closest('button,a');if(target&&!target.closest('.biometric-demo-controls'))close();}}>{new URLSearchParams(location.search).has('catalogue')&&<a className="demo-return" href="?review=mobile#trips">Выйти из примера</a>}{children}</div>
  </dialog>
 </div>;
}
