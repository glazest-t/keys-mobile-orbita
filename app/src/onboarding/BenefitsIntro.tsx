import {memo,useState} from 'react';
import {Icon,Mark} from '../ui';
import {motionVars} from './motion';

export const BenefitsArt=memo(function BenefitsArt({active}:{active:boolean}){
 const [keysReady,setKeysReady]=useState(false),[hotelReady,setHotelReady]=useState(false),[plusReady,setPlusReady]=useState(false);
 return <div className="onboarding-benefits-art" aria-hidden="true" style={motionVars('dual-benefits',active&&keysReady&&hotelReady&&plusReady)}>
  <div className="benefits-orbit"><span className="benefits-orbit-ring"/><i className="benefits-pearl benefits-pearl--first"/><i className="benefits-pearl benefits-pearl--last"/></div>
  <img className="benefits-card benefits-card--hotel" src="/brand/illustrations/onboarding-benefits-hotel.png" alt="" draggable={false} onLoad={()=>setHotelReady(true)}/>
  <img className="benefits-card benefits-card--keys" src="/brand/illustrations/onboarding-benefits-keys.png" alt="" draggable={false} onLoad={()=>setKeysReady(true)}/>
  <img className="benefits-plus" src="/brand/illustrations/onboarding-benefits-plus.png" alt="" draggable={false} onLoad={()=>setPlusReady(true)}/>
 </div>;
});

export function BenefitsIntro(){
 return <div className="onboarding-benefits-copy">
  <div className="onboarding-benefit onboarding-benefit--keys">
   <span className="onboarding-benefit-icon" aria-hidden="true"><Mark/></span>
   <div><h2>Баллы «Ключей»</h2><p>Копите и тратьте на любые брони.</p></div>
  </div>
  <div className="onboarding-benefit onboarding-benefit--hotel">
   <span className="onboarding-benefit-icon" aria-hidden="true"><Icon name="hotel-building" size={32} inheritColor/></span>
   <div><h2>Ваша программа отеля</h2><p>Пользуйтесь её скидками, баллами и привилегиями.</p></div>
  </div>
 </div>;
}
