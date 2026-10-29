import {useState,type CSSProperties} from 'react';
import {MobileScroll,useKeyboardInsets} from '../mobile';
import {Button,Icon,IconButton} from '../ui';
import {swipeThemes} from './swipePreferences';
import {BubbleOrbit,WaterRippleButton} from '../interactions';
import './swipe-preferences.css';

export function SwipePreferences({selected,onChange,onContinue,onClose,backLabel='Назад к поиску',saveMode=false}:{selected:string[];onChange:(ids:string[])=>void;onContinue:()=>void;onClose:()=>void;backLabel?:string;saveMode?:boolean}){
 const {bottomInset}=useKeyboardInsets();
 const [departing,setDeparting]=useState(false);
 return <section className="swipe-preferences" style={{'--swipe-intro-bottom':`${bottomInset}px`} as CSSProperties} aria-label="Предпочтения поездки" aria-busy={departing}>
  <MobileScroll className="page-scroll"><div className="swipe-preferences-content" inert={departing}>
   <div className="swipe-preferences-orbit" aria-hidden="true"/>
   <IconButton name="back" label={backLabel} onClick={onClose}/>
   <h1>Ваш стиль<br/><span>путешествий</span></h1>
   <p>На основе ваших предпочтений мы подберем лучшее предложение</p>
   <BubbleOrbit departing={departing} onDeparted={onContinue}>
    {swipeThemes.map(theme=>{const checked=selected.includes(theme.id);return <WaterRippleButton key={theme.id} type="button" role="checkbox" aria-checked={checked} className="swipe-theme" onClick={()=>onChange(checked?selected.filter(id=>id!==theme.id):[...selected,theme.id])}>
     <span className="swipe-theme-symbol"><Icon name={theme.icon} size={25} inheritColor/></span><span className="swipe-theme-label">{theme.title}</span>
     {checked&&<i className="swipe-theme-check"><Icon name="check" size={14} inheritColor/></i>}
    </WaterRippleButton>;})}
   </BubbleOrbit>
  </div></MobileScroll>
  <footer className="swipe-preferences-footer"><Button busy={departing} busyLabel={saveMode?"Сохраняем предпочтения":"Подбираем отели"} onClick={()=>setDeparting(true)}>{saveMode?"Сохранить предпочтения":"Перейти к отелям"}<Icon name={saveMode?"check":"chevron-right"} size={18} inheritColor/></Button></footer>
 </section>;
}
