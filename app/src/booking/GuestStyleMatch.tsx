import {PreferenceIllustration} from './PreferenceIllustration';
import {useGuestProfile} from '../useGuestProfile';
import {Icon} from '../ui';
import type {Commerce} from './model';
import {travelStyleMatch} from './swipePreferences';
import {travelStyleReasonItems} from './travelStyleReasons';
import {hotelReviewPraise} from './presentation';
import './guest-style.css';

export function GuestStyleMatch({hotelId,commerce,owner}:{hotelId:string;commerce:Commerce;owner:string|null}){
 const enabled=useGuestProfile();
 if(!enabled)return null;
 const themes=commerce.swipePreferences?.[owner||'guest']?.themes||[];
 const match=travelStyleMatch(hotelId,themes);
 if(match.percent===null)return null;
 const reasons=travelStyleReasonItems(hotelId,themes,hotelReviewPraise(hotelId));
 const heading=<><img className="guest-style-heart" src="/assets/preferences/style-heart-3d-blue.png" width={22} height={22} alt="" aria-hidden="true" draggable={false}/><strong>Под ваш стиль</strong><b className="guest-style-match-ring" aria-hidden="true" style={{background:`conic-gradient(var(--theme-link, var(--k-action-primary)) ${match.percent}%, var(--k-border-subtle, var(--theme-border, #e4e7ef)) 0)`}}><span>{match.percent}%</span></b></>;
 return <section className="guest-style-match" aria-label="Соответствие вашему стилю">
  <div className="guest-style-match-meter" role="meter" aria-label="Совпадение с вашим стилем" aria-valuemin={0} aria-valuemax={100} aria-valuenow={match.percent} aria-valuetext={`Совпало ${match.percent}%, не совпало ${100-match.percent}%`}><span style={{width:`${match.percent}%`}}/></div>
  {reasons.length?<details><summary>{heading}<Icon name="chevron-down" size={14} inheritColor/></summary><ul>{reasons.map(({feature,text})=><li key={feature}><PreferenceIllustration label={feature} size={28} contrast/><span>{text}</span></li>)}</ul></details>:<div className="guest-style-match-heading">{heading}</div>}
 </section>;
}
