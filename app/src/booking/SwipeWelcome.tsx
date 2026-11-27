import {useState,type CSSProperties} from 'react';
import {MobileScroll,useKeyboardInsets} from '../mobile';
import {Button,Icon,IconButton} from '../ui';
import {iconAsset} from '../iconAssets';
import {usePrototypeIcons} from '../usePrototypeIcons';
import {usePrototypeText} from '../usePrototypeText';
import {swipeThemeTitle,swipeThemes} from './swipePreferences';
import {travelPlanScene} from './travelPlansArtwork';
import {BubbleOrbit,WaterRippleButton} from '../interactions';
import './swipe-preferences.css';


export function SwipePreferences({selected,onChange,onContinue,onClose,backLabel='Назад к поиску',saveMode=false,searchPlans=false,embedded=false,standardHeader=false,fixedIntro=false}:{selected:string[];onChange:(ids:string[])=>void;onContinue:()=>void;onClose:()=>void;backLabel?:string;saveMode?:boolean;searchPlans?:boolean;embedded?:boolean;standardHeader?:boolean;fixedIntro?:boolean}){
 const {bottomInset}=useKeyboardInsets(),iconVariant=usePrototypeIcons();
 const mode=usePrototypeText();
 const editedSearch=searchPlans&&mode==='edited';
 const action=editedSearch?'Показать варианты':saveMode?'Сохранить предпочтения':'Перейти к отелям';
 const busyAction=editedSearch?'Ищём лучшее для вас...':saveMode?'Сохраняем предпочтения':'Подбираем отели';
 const styleIcons:Record<string,string>={family:'art-kids',discover:'art-entertainment',romantic:'art-adults',culture:'art-attractions',active:'art-sport',nature:'art-nature',spa:'preference-spa',food:'art-restaurant'};
 const [departing,setDeparting]=useState(false);
 const intro=<>
  {!fixedIntro&&!embedded&&!standardHeader&&<IconButton name="back" label={backLabel} onClick={onClose}/>}
  {!standardHeader&&<h1 tabIndex={fixedIntro?-1:undefined}>{editedSearch?'Под ваши':'Ваш стиль'}<br/>{' '}<span>{editedSearch?'планы':'путешествий'}</span></h1>}
  <p>{editedSearch?'Отметьте, что важно в этой поездке — первыми покажем места с самым точным совпадением':'На основе ваших предпочтений мы подберем лучшее предложение'}</p>
 </>;
 return <section className={"swipe-preferences"+(embedded?" swipe-preferences-sheet":"")+(searchPlans?" trip-plans-preferences":"")} style={{'--swipe-intro-bottom':`${bottomInset}px`} as CSSProperties} aria-label="Предпочтения поездки" aria-busy={departing}>
  {standardHeader&&<header className="desktop-section-header"><IconButton name="back" label={backLabel} onClick={onClose}/><h1>Ваш стиль путешествий</h1></header>}
  {fixedIntro&&<header className="swipe-preferences-intro" inert={departing}>{intro}<IconButton name="close" label="Закрыть окно" onClick={onClose}/></header>}
  <MobileScroll className="page-scroll"><div className="swipe-preferences-content" inert={departing}>
   <div className="swipe-preferences-orbit" aria-hidden="true"/>
   {!fixedIntro&&intro}
   <BubbleOrbit departing={departing} onDeparted={onContinue}>
    {swipeThemes.map(theme=>{const checked=selected.includes(theme.id),scene=searchPlans?travelPlanScene(theme.id):undefined;return <WaterRippleButton key={theme.id} type="button" role="checkbox" aria-checked={checked} className="swipe-theme" onClick={()=>onChange(checked?selected.filter(id=>id!==theme.id):[...selected,theme.id])}>
     {scene?<img className="trip-plans-scene" src={scene} width={384} height={384} alt="" draggable={false}/>
      :<span className="swipe-theme-symbol"><img className="swipe-theme-art" src={iconVariant==='new'?iconAsset(styleIcons[theme.id],iconVariant):`/assets/preferences/travel-style/${theme.id}.png?v=1`} width={42} height={42} alt="" draggable={false}/></span>}
     <span className="swipe-theme-label">{swipeThemeTitle(theme,mode)}</span>
     {checked&&<i className="swipe-theme-check"><Icon name="check" size={14} inheritColor/></i>}
    </WaterRippleButton>;})}
   </BubbleOrbit>
  </div></MobileScroll>
  <footer className="swipe-preferences-footer"><Button busy={departing} busyLabel={busyAction} onClick={()=>setDeparting(true)}>{action}{!saveMode&&!standardHeader&&<Icon name="chevron-right" size={18} inheritColor/>}</Button></footer>
 </section>;
}
