import type {Commerce} from '../booking/model.ts';
export type HotelierStatus='none'|'pending'|'approved'|'rejected';
export type Verification={id:string;token:string;phone:string;email:string;hotelName:string;status:HotelierStatus;requestedAt:string;resolvedAt?:string};
export type VerificationClaim=Pick<Verification,'id'|'token'|'phone'|'email'>;
export const hotelierLabels:Record<HotelierStatus,string>={none:'Подтвердить статус отельера',pending:'Ожидаем подтверждение',approved:'Отельер · Friendly Rate',rejected:'Привязка отклонена'};
export const verificationClaim=(r:Verification):VerificationClaim=>({id:r.id,token:r.token,phone:r.phone,email:r.email});
export function matchesClaim(request:Verification|undefined,owner:string,claim:VerificationClaim){return !!request&&!!claim.token&&request.id===claim.id&&request.token===claim.token&&request.email===claim.email&&request.phone===claim.phone&&owner===claim.phone;}
export function submitVerification(s:Commerce,owner:string,email:string,id:string,now=Date.now(),token=crypto.randomUUID()):Commerce{
 if(!/^\+7\d{10}$/.test(owner)||!s.accounts[owner])throw Error('Сначала войдите по телефону');
 const value=email.trim().toLowerCase();if(value.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw Error('Проверьте рабочий email');
 if(s.hotelierVerifications?.[owner]?.status==='pending')throw Error('Запрос уже отправлен. Чтобы изменить почту, отмените его');
 return {...s,hotelierParticipants:{...s.hotelierParticipants,[owner]:true},hotelierEmailDrafts:{...s.hotelierEmailDrafts,[owner]:value},hotelierVerifications:{...s.hotelierVerifications,[owner]:{id,token,phone:owner,email:value,hotelName:'Maidens Hotel',status:'pending',requestedAt:new Date(now).toISOString()}},accounts:{...s.accounts,[owner]:{...s.accounts[owner],hotelierStatus:'pending'}}};
}
export function resolveVerification(s:Commerce,owner:string,claim:VerificationClaim,status:'approved'|'rejected',now=Date.now()):Commerce{
 const request=s.hotelierVerifications?.[owner];
 if(!matchesClaim(request,owner,claim)||request?.status!=='pending')throw Error('Запрос недоступен: уже обработан или устарел');
 return {...s,hotelierVerifications:{...s.hotelierVerifications,[owner]:{...request,status,resolvedAt:new Date(now).toISOString()}},accounts:{...s.accounts,[owner]:{...s.accounts[owner],hotelierStatus:status}}};
}
export function clearVerification(s:Commerce,owner:string):Commerce{
 if(!s.accounts[owner])return s;
 const requests={...s.hotelierVerifications},email=requests[owner]?.email||s.hotelierEmailDrafts?.[owner]||'';delete requests[owner];
 return {...s,hotelierEmailDrafts:{...s.hotelierEmailDrafts,[owner]:email},hotelierVerifications:requests,accounts:{...s.accounts,[owner]:{...s.accounts[owner],hotelierStatus:'none'}}};
}
export function syncVerification(s:Commerce,remote:Commerce,owner:string):Commerce{
 const local=s.hotelierVerifications?.[owner],result=remote.hotelierVerifications?.[owner];
 if(!local||local.status!=='pending'||!result||!matchesClaim(local,owner,result)||!['approved','rejected'].includes(result.status))return s;
 return resolveVerification(s,owner,verificationClaim(result),result.status as 'approved'|'rejected',Date.parse(result.resolvedAt||'')||Date.now());
}
export type HotelierInvitationData={name:string;hotel:string};
const clean=(value:string|null,fallback:string)=>value?.trim().replace(/\s+/g,' ').slice(0,80)||fallback;
export function invitationData(url:string):HotelierInvitationData{const params=new URL(url).searchParams;return {name:clean(params.get('inviter'),'Юра Костин'),hotel:clean(params.get('inviterHotel'),'Travelline')};}
export function invitationLink(base:string,name:string,hotel:string){const url=new URL(base);url.search='';url.hash='hotelier-invite';url.searchParams.set('scenario','guest-invite');url.searchParams.set('inviter',clean(name,'Коллега'));url.searchParams.set('inviterHotel',clean(hotel,'Отель'));return url.href;}
export function bannerStamp(s:Commerce,owner:string){return `${s.accounts[owner]?.hotelierStatus||'none'}:${s.hotelierVerifications?.[owner]?.id||''}`;}

export type InvitationAudience='hotelier'|'traveler';
export function appInvitationLink(base:string,name:string,hotel:string,audience:InvitationAudience){
 if(audience==='hotelier')return invitationLink(base,name,hotel);
 const url=new URL(base);url.search='';url.hash='phone';url.searchParams.set('scenario','friend-invite');url.searchParams.set('inviter',clean(name,'Друг'));return url.href;
}
/** An invitation signals intent, never a submitted verification or an approved role. */
export function registerHotelierInterest(s:Commerce,owner:string,inviter?:HotelierInvitationData):Commerce{
 if(s.hotelierParticipants?.[owner]&&(!inviter||JSON.stringify(s.hotelierInviters?.[owner])===JSON.stringify(inviter)))return s;
 return {...s,hotelierParticipants:{...s.hotelierParticipants,[owner]:true},hotelierInviters:inviter?{...s.hotelierInviters,[owner]:inviter}:s.hotelierInviters};
}
