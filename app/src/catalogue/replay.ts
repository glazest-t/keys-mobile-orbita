import {useEffect} from 'react';
import {catalogueScene} from './fixture';
import {extraPaymentOptions} from '../booking/paymentOptions';
import {getPrototypeVariant} from '../prototypeVariant';
import {isDesktop} from '../desktop/surface';
/** Replay only the known, local catalogue recipe. No visitor input is executed. */
export function useCatalogueReplay(){
 useEffect(()=>{
  const scene=catalogueScene;if(!scene)return;
  if(window.parent!==window)document.documentElement.classList.add('catalogue-preview');
  let index=0,tries=0,timer:ReturnType<typeof setTimeout>;
  const actions=[...(scene.onboarding?[{selector:`button[aria-label^="Шаг ${scene.onboarding+1}:"]`}]:[]),...(scene.actions||[])];
  const report=(status:string,detail='')=>{document.documentElement.dataset.catalogueStatus=status;window.parent.postMessage({type:'keys-catalogue',id:scene.id,status,detail},location.origin);};
  if(scene.fullOnly&&getPrototypeVariant()==='november'){report('unavailable','Сценарий доступен в полной версии');return;}
  const next=()=>{
   if(index===actions.length){report('ready');return;}
   const action=actions[index];
   if(scene.id==='booking-total'&&document.querySelector('.checkout-cost-details[open]')){
    index++;tries=0;timer=setTimeout(next,200);return;
   }
   // Desktop filters are already visible in the result sidebar, without a modal trigger.
   if(isDesktop&&scene.id==='filters'&&'text' in action&&action.text==='Фильтры'){
    const panel=document.querySelector<HTMLElement>('.desktop-results-filters');
    if(panel&&panel.getBoundingClientRect().width>0){index++;tries=0;timer=setTimeout(next,200);return;}
   }
   // Desktop breakfast settings are already open in the service dialog.
   if(scene.id==='breakfast-order'&&action.text==='Добавить завтрак'&&document.querySelector('.breakfast-order-sheet')){index++;tries=0;timer=setTimeout(next,200);return;}
   if(isDesktop&&scene.id==='payment-methods'&&action.text==='Другое'){
    const grid=document.querySelector('.desktop-payment-grid');
    const labels=Array.from(grid?.querySelectorAll('button strong')||[],label=>label.textContent?.trim());
    if(extraPaymentOptions.every(option=>labels.includes(option.label))){index++;tries=0;timer=setTimeout(next,200);return;}
   }
   const candidates=action.selector?Array.from(document.querySelectorAll<HTMLElement>(action.selector)).filter(e=>!('contains' in action)||e.textContent?.includes(String(action.contains))):Array.from(document.querySelectorAll<HTMLElement>('button,[role="button"]')).filter(e=>(e.textContent||'').trim().includes(action.text||'\0'));
   const element=candidates.find(e=>!e.closest('[inert],[aria-hidden="true"]')&&e.getBoundingClientRect().width>0&&!(e as HTMLButtonElement).disabled);
   if(!element){if(++tries>40){report('error',action.selector||action.text);return;}timer=setTimeout(next,200);return;}
   element.click();index++;tries=0;timer=setTimeout(next,1100);
  };
  timer=setTimeout(next,800);
  return()=>{clearTimeout(timer);document.documentElement.classList.remove('catalogue-preview');};
 },[]);
}
