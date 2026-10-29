import {readWallets} from '../../../prototype/domain/payment.mjs';
import data from '../../../spec/demo-data.json' with {type:'json'};
import type {Commerce} from '../booking/model.ts';

// Legacy accounts retain their existing benefits; explicit membership overrides only one hotel.
export function hasHotelProgram(s:Commerce,owner:string|null|undefined,hotelId:string){
 return !!owner && (s.hotelMemberships?.[owner]?.[hotelId] ?? s.accounts[owner]?.loyalty ?? false);
}
export const hotelPrograms=data.hotels.filter(h=>h.hotelDiscountBasisPoints>0||h.hotelPointsProgram);
export function setHotelProgram(s:Commerce,owner:string,hotelId:string,connected:boolean):Commerce{
 if(!s.accounts[owner])throw Error('Войдите в профиль');
 if(!hotelPrograms.some(h=>h.id===hotelId))throw Error('Программа отеля недоступна');
 return {...s,hotelMemberships:{...s.hotelMemberships,[owner]:{...s.hotelMemberships?.[owner],[hotelId]:connected}}};
}
export function connectHotelProgram(s:Commerce,owner:string,hotelId:string,email:string,password:string):Commerce{
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))throw Error('Проверьте почту');
 if(password.trim().length<4)throw Error('Введите пароль, не короче 4 символов');
 // Local simulation. Neither credentials nor a session token are persisted.
 return setHotelProgram(s,owner,hotelId,true);
}
export const programNetwork={id:'orbit-kazan',name:'Орбита · Казань',hotelIds:['kazan-apart','kazan-camp']};

export function programWallets(s:Commerce,owner:string|null|undefined,hotelId:string){
 const wallets=readWallets(s.payment,owner||'anonymous',hotelId);
 return hasHotelProgram(s,owner,hotelId)?wallets:{...wallets,hotelPoints:0};
}

export const supportsHotelPoints=(hotelId:string)=>!!data.hotels.find(h=>h.id===hotelId)?.hotelPointsProgram;
/** Seed only a missing demo wallet; spending it to zero never refills it. */
export function ensureDemoHotelPoints(s:Commerce,owner:string):Commerce{
 if(s.accounts[owner]&&!s.hotelLoyaltySeeds?.[owner])s={...s,hotelLoyaltySeeds:{...s.hotelLoyaltySeeds,[owner]:{'orbit-sea':{year:programYear(new Date().toISOString()),amountMinor:6160000},'orbit-forest':{year:programYear(new Date().toISOString()),amountMinor:4600000}}}};
 const wallet=`hotel:orbit-forest:${owner}`;
 if(!s.accounts[owner]||Object.hasOwn(s.payment.balances,wallet))return s;
 return {...s,payment:{...s.payment,balances:{...s.payment.balances,[wallet]:2500}}};
}


export type HotelLevel={id:string;name:string;thresholdMinor:number;discountBasisPoints:number;earnBasisPoints:number;privileges:string[]};
export type HotelLoyaltySnapshot={levelId:string;levelName:string;earnBasisPoints:number};
export type HotelLoyaltyAward={bookingId:string;hotelId:string;at:string;qualifyingMinor:number;points:number};
/** Demo rules based on v3. Commercial terms must be supplied by each hotel. */
export function hotelLevels(hotelId:string):HotelLevel[]{
 const h=hotelPrograms.find(h=>h.id===hotelId);if(!h)return [];
 const names=['Гость','Ценитель','Знаток','Эксперт','Легенда'];
 return names.map((name,i)=>({id:['guest','connoisseur','expert','master','legend'][i],name,
 thresholdMinor:[0,4000000,8000000,15000000,30000000][i],
 discountBasisPoints:h.hotelDiscountBasisPoints?Math.min(2500,h.hotelDiscountBasisPoints+[0,0,200,500,1000][i]):0,
 earnBasisPoints:h.hotelPointsProgram?[300,500,700,1000,1500][i]:0,
 privileges:i===0?[]:i===1?['Приветственный напиток']:i===2?['Приветственный напиток','Поздний выезд при наличии возможности']:['Приветственный напиток','Поздний выезд при наличии возможности','Повышение категории при наличии свободных номеров']
 }));
}
const programYear=(at:string)=>new Date(at).toLocaleDateString('en-CA',{timeZone:'Europe/Moscow'}).slice(0,4);
export function hotelProgramProgress(s:Commerce,owner:string|null|undefined,hotelId:string,at=new Date().toISOString()){
 const levels=hotelLevels(hotelId),year=programYear(at),seed=owner?s.hotelLoyaltySeeds?.[owner]?.[hotelId]:undefined;
 const spentMinor=(seed?.year===year?seed.amountMinor:0)+(owner?s.hotelLoyaltyAwards?.[owner]||[]:[]).filter(a=>a.hotelId===hotelId&&programYear(a.at)===year).reduce((n,a)=>n+a.qualifyingMinor,0);
 const current=levels.filter(l=>l.thresholdMinor<=spentMinor).at(-1),next=levels.find(l=>l.thresholdMinor>spentMinor);
 return {levels,current,next,spentMinor,year,remainingMinor:next?next.thresholdMinor-spentMinor:0,
 progress:next&&current?(spentMinor-current.thresholdMinor)/(next.thresholdMinor-current.thresholdMinor):1};
}
export function hotelProgramDiscount(s:Commerce,owner:string|null|undefined,hotelId:string){
 return hasHotelProgram(s,owner,hotelId)?hotelProgramProgress(s,owner,hotelId).current?.discountBasisPoints||0:0;
}
export function hotelLoyaltySnapshot(s:Commerce,owner:string,hotelId:string,rateId:string):HotelLoyaltySnapshot|undefined{
 if(!hasHotelProgram(s,owner,hotelId)||data.rates.find(r=>r.id===rateId)?.kind==='friendly_rate')return;
 const level=hotelProgramProgress(s,owner,hotelId).current;
 return level?{levelId:level.id,levelName:level.name,earnBasisPoints:level.earnBasisPoints}:undefined;
}
/** Called once by hotel checkout; stored booking terms survive later level changes. */
export function settleHotelLoyalty(s:Commerce,owner:string,bookingId:string):Commerce{
 const b=s.bookings.find(b=>b.id===bookingId&&b.owner===owner);
 if(!b?.hotelLoyalty||b.operation.status!=='confirmed'||b.stay?.status!=='checked_out'||!b.stay.checkedOutAt||s.hotelLoyaltyAwards?.[owner]?.some(a=>a.bookingId===bookingId))return s;
 const qualifyingMinor=Math.max(0,b.quote.lodgingMinor-b.quote.applied.pointsMinor);
 const points=Math.floor(qualifyingMinor*b.hotelLoyalty.earnBasisPoints/1000000),wallet=`hotel:${b.draft.hotelId}:${owner}`;
 const award={bookingId,hotelId:b.draft.hotelId,at:b.stay.checkedOutAt,qualifyingMinor,points};
 return {...s,hotelLoyaltyAwards:{...s.hotelLoyaltyAwards,[owner]:[...(s.hotelLoyaltyAwards?.[owner]||[]),award]},payment:{...s.payment,balances:{...s.payment.balances,[wallet]:(s.payment.balances[wallet]||0)+points}}};
}
