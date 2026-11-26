import {PreferenceIllustration} from './PreferenceIllustration';
import {useGuestProfile} from '../useGuestProfile';
import {Carousel} from '../mobile';
import {Icon} from '../ui';
import type {Commerce} from './model';
import {travelStyleMatch} from './swipePreferences';
import {travelStyleReasonItems} from './travelStyleReasons';
import {hotelReviewPraise} from './presentation';
import './guest-style.css';

type GuestStyleMatchProps={hotelId:string;commerce:Commerce;owner:string|null};

const styleHeart=<img className="guest-style-heart" src="/assets/preferences/style-heart-3d-blue.png" width={22} height={22} alt="" aria-hidden="true" draggable={false}/>;

export function useGuestStyleMatch({hotelId,commerce,owner}:GuestStyleMatchProps){
 const enabled=useGuestProfile();
 if(!enabled)return null;
 const themes=commerce.swipePreferences?.[owner||'guest']?.themes||[];
 const {percent}=travelStyleMatch(hotelId,themes);
 if(percent===null)return null;
 const reasons=travelStyleReasonItems(hotelId,themes,hotelReviewPraise(hotelId));
 return {percent,reasons};
}

export function GuestStyleMatch(props:GuestStyleMatchProps){
 const match=useGuestStyleMatch(props);
 if(!match)return null;
 const {percent,reasons}=match;
 const heading=<>{styleHeart}<strong>Под ваш стиль</strong><b className="guest-style-match-ring" aria-hidden="true" style={{background:`conic-gradient(var(--theme-link, var(--k-action-primary)) ${percent}%, var(--k-border-subtle, var(--theme-border, #e4e7ef)) 0)`}}><span>{percent}%</span></b></>;
 return <section className="guest-style-match" aria-label="Соответствие вашему стилю">
  <div className="guest-style-match-meter" role="meter" aria-label="Совпадение с вашим стилем" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`Совпало ${percent}%, не совпало ${100-percent}%`}><span style={{width:`${percent}%`}}/></div>
  {reasons.length?<details><summary>{heading}<Icon name="chevron-down" size={14} inheritColor/></summary><ul>{reasons.map(({feature,text})=><li key={feature}><PreferenceIllustration label={feature} size={28} contrast/><span>{text}</span></li>)}</ul></details>:<div className="guest-style-match-heading">{heading}</div>}
 </section>;
}

function splitStyleReason(text:string){
 // Keep a single wrap point so the card can size itself to the longer phrase.
 const middle=Math.floor(text.length/2);
 const before=text.lastIndexOf(' ',middle);
 const after=text.indexOf(' ',middle);
 const boundary=after<0||(before>=0&&middle-before<=after-middle)?before:after;
 return boundary<0?[text]:[text.slice(0,boundary),text.slice(boundary+1)];
}

export function GuestStyleMatchDetails({reasons}:{reasons:ReturnType<typeof travelStyleReasonItems>}){
 if(!reasons.length)return null;
 return <section className="hotel-section guest-style-details">
  <Carousel ariaLabel="Особенности под ваш стиль">
   <ul className="guest-style-details-track" role="list">
    {reasons.map(({feature,text})=>{
     const [first,second]=splitStyleReason(text);
     return <li key={feature} className="guest-style-details-tile">
      <PreferenceIllustration label={feature} size={24} contrast/>
      <span className="guest-style-details-label"><span>{first}</span>{second&&<> <span>{second}</span></>}</span>
     </li>;
    })}
   </ul>
  </Carousel>
 </section>;
}
