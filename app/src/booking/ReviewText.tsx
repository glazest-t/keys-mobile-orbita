import {useId,useState} from 'react';
import {isDesktop} from '../desktop/surface';
import './review-text.css';

export function ReviewText({text}:{text:string}){
 const [expanded,setExpanded]=useState(false);
 const id=useId();
 const collapsible=!isDesktop&&text.length>240;
 return <>
  <p id={id} className={'review-text'+(collapsible&&!expanded?' review-text-collapsed':'')}>{text}</p>
  {collapsible&&<button type="button" className="review-text-toggle" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(value=>!value)}>{expanded?'Свернуть':'Подробнее'}</button>}
 </>;
}
