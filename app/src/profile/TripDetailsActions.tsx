import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {useMobileDevice} from '../mobile';

/** Anchored to the phone app, not the page's scrolling or transformed flow scene. */
export function TripDetailsActions({children,className=""}:{children:ReactNode;className?:string}){
 const anchor=useRef<HTMLDivElement>(null),footer=useRef<HTMLElement>(null);
 const [host,setHost]=useState<HTMLElement|null>(null),[height,setHeight]=useState(148);
 const {device}=useMobileDevice();
 useLayoutEffect(()=>{setHost(anchor.current?.closest<HTMLElement>('.keys-app')||null);},[]);
 useLayoutEffect(()=>{
  if(!footer.current)return;
  const measure=()=>setHeight(footer.current?.offsetHeight||0);
  measure();const observer=new ResizeObserver(measure);observer.observe(footer.current);
  return ()=>observer.disconnect();
 },[host]);
 return <><div ref={anchor} className={"trip-detail-actions-spacer "+(className?className+"-spacer":"")} style={{height}} aria-hidden="true"/>{host&&createPortal(<footer ref={footer} className={"trip-detail-fixed-actions "+className} aria-label="Действия с бронированием" style={{paddingBottom:Math.max(12,device.geometry.safeArea.bottom)}}>{children}</footer>,host)}</>;
}
