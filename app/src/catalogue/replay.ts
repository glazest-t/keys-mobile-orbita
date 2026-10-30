import {useEffect} from 'react';
import {catalogueScene} from './fixture';
/** Replay only the known, local catalogue recipe. No visitor input is executed. */
export function useCatalogueReplay(){
 useEffect(()=>{
  const scene=catalogueScene;if(!scene)return;
  if(window.parent!==window)document.documentElement.classList.add('catalogue-preview');
  let index=0,tries=0,timer:ReturnType<typeof setTimeout>;
  const actions=[...(scene.onboarding?[{selector:`button[aria-label^="Шаг ${scene.onboarding+1}:"]`}]:[]),...(scene.actions||[])];
  const report=(status:string,detail='')=>{document.documentElement.dataset.catalogueStatus=status;window.parent.postMessage({type:'keys-catalogue',id:scene.id,status,detail},location.origin);};
  const next=()=>{
   if(index===actions.length){report('ready');return;}
   const action=actions[index];
   const candidates=action.selector?Array.from(document.querySelectorAll<HTMLElement>(action.selector)).filter(e=>!('contains' in action)||e.textContent?.includes(String(action.contains))):Array.from(document.querySelectorAll<HTMLElement>('button,[role="button"]')).filter(e=>(e.textContent||'').trim().includes(action.text||'\0'));
   const element=candidates.find(e=>!e.closest('[inert],[aria-hidden="true"]')&&e.getBoundingClientRect().width>0&&!(e as HTMLButtonElement).disabled);
   if(!element){if(++tries>40){report('error',action.selector||action.text);return;}timer=setTimeout(next,200);return;}
   element.click();index++;tries=0;timer=setTimeout(next,1100);
  };
  timer=setTimeout(next,800);
  return()=>{clearTimeout(timer);document.documentElement.classList.remove('catalogue-preview');};
 },[]);
}
