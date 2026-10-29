import {memo,useState} from 'react';
import {Icon} from '../ui';
import {motionVars} from './motion';

/** Stable layers replay only when this step is active and all artwork is loaded. */
export const PersonalizationArt=memo(function PersonalizationArt({active}:{active:boolean}){
 const [loaded,setLoaded]=useState<Record<string,boolean>>({});
 const ready=(name:string)=>setLoaded(previous=>previous[name]?previous:{...previous,[name]:true});
 return <div className="personalization-art" aria-hidden="true" style={motionVars('personal-selection',active&&Boolean(loaded.photo&&loaded.back&&loaded.sources))}>
  <div className="personalization-sources">
   <img src="/brand/illustrations/onboarding-personal-sources.png" alt="" draggable={false} onLoad={()=>ready('sources')}/>
   <div className="personalization-source-labels"><span>Поездки</span><span>Избранное</span><span>Ваш выбор</span></div>
  </div>
  <img className="personalization-backcards" src="/brand/illustrations/onboarding-personal-backcards.png" alt="" draggable={false} onLoad={()=>ready('back')}/>
  <div className="personalization-hotel-card">
   <img className="personalization-hotel-photo" src="/brand/illustrations/onboarding-personal-photo.png" alt="" draggable={false} onLoad={()=>ready('photo')}/>
   <div className="personalization-match-copy">
    <strong>Почему подходит вам</strong>
    <div className="personalization-match personalization-match--first"><span><Icon name="check" size={13} inheritColor/></span>Тишина и природа</div>
    <div className="personalization-match personalization-match--second"><span><Icon name="check" size={13} inheritColor/></span>Завтрак без спешки</div>
   </div>
  </div>
 </div>;
});
