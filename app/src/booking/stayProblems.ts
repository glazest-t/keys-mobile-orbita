import type {Booking,Commerce} from './model.ts';
import {canManageBooking} from './bookingShare.ts';
import {stayNow} from './stay.ts';

export const problemCategories=[
 {id:'climate',title:'Кондиционер',icon:'climate'}, {id:'wifi',title:'Wi-Fi',icon:'wifi'},
 {id:'light',title:'Свет',icon:'bulb'}, {id:'lock',title:'Замок',icon:'door'},
 {id:'cleaning',title:'Уборка',icon:'cleaning'}, {id:'other',title:'Другое',icon:'more'}
] as const;
export type ProblemCategory=typeof problemCategories[number]['id'];
export type ProblemUrgency='normal'|'urgent'|'critical';
export type ProblemStatus='sent'|'in_progress'|'resolved'|'cancelled';
export type StayProblem={id:string;stayEventId:string;author:string;category:ProblemCategory;description:string;urgency:ProblemUrgency;photo?:string;createdAt:string;status:ProblemStatus;events:{status:ProblemStatus;at:string}[]};
export type ProblemInput=Pick<StayProblem,'category'|'description'|'urgency'|'photo'>;
export const problemStatusLabel:Record<ProblemStatus,string>={sent:'Отправлено',in_progress:'В работе',resolved:'Решено',cancelled:'Отменено'};
export const urgencyLabel:Record<ProblemUrgency,string>={normal:'Обычная',urgent:'Срочная',critical:'Критическая'};
export const problemTitle=(p:StayProblem)=>problemCategories.find(c=>c.id===p.category)?.title||'Другое';
export function problemInputError(input:ProblemInput){
 if(!problemCategories.some(c=>c.id===input.category))return 'Выберите, что случилось';
 if(!['normal','urgent','critical'].includes(input.urgency))return 'Выберите срочность';
 if(typeof input.description!=='string'||input.description.trim().length>1000)return 'Описание — не больше 1000 символов';
 if(input.category==='other'&&!input.description.trim())return 'Опишите, что случилось';
 if(input.photo&&(!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(input.photo)||input.photo.length>350000))return 'Не удалось прикрепить фото. Выберите другое';
 return '';
}
function update(s:Commerce,b:Booking,problems:StayProblem[]):Commerce{return {...s,bookings:s.bookings.map(v=>v.id===b.id?{...v,problems,revision:(v.revision||0)+1}:v)};}
export function sendStayProblem(s:Commerce,actor:string,bookingId:string,id:string,input:ProblemInput,now=Date.now()):Commerce{
 const b=s.bookings.find(v=>v.id===bookingId);
 if(!b||!canManageBooking(s,actor,b))throw Error('Нет доступа к поездке');
 if(b.operation.status!=='confirmed'||b.stay?.status!=='in_house')throw Error('Обращение доступно во время проживания');
 const duplicate=b.problems?.find(p=>p.id===id);
 if(duplicate){if(duplicate.author!==actor)throw Error('Повторите отправку');return s;}
 if(!id||s.bookings.some(v=>v.problems?.some(p=>p.id===id))||!Number.isFinite(stayNow(b,now)))throw Error('Повторите отправку');
 const error=problemInputError(input);if(error)throw Error(error);
 const at=new Date(stayNow(b,now)).toISOString();
 const p:StayProblem={...input,description:input.description.trim(),id,author:actor,stayEventId:b.stay.eventId,status:'sent',createdAt:at,events:[{status:'sent',at}]};
 return update(s,b,[...(b.problems||[]),p]);
}
/** Local hotel simulator only; never an automatic acknowledgement from a real hotel. */
export function demoProblemStatus(s:Commerce,owner:string,bookingId:string,id:string,status:ProblemStatus,now=Date.now()):Commerce{
 const b=s.bookings.find(v=>v.id===bookingId&&v.owner===owner),p=b?.problems?.find(p=>p.id===id);
 if(!b||!p||!b.stay||b.operation.status!=='confirmed'||p.stayEventId!==b.stay.eventId)throw Error('Обращение недоступно');
 if(p.status===status)return s;
 if(!((p.status==='sent'&&status==='in_progress')||(p.status==='in_progress'&&status==='resolved')))throw Error('Недопустимая смена статуса');
 const atMs=stayNow(b,now);if(!Number.isFinite(atMs)||atMs<Date.parse(p.events.at(-1)!.at))throw Error('Проверьте время события');
 const at=new Date(atMs).toISOString();return update(s,b,b.problems!.map(v=>v.id===id?{...v,status,events:[...v.events,{status,at}]}:v));
}

export function cancelStayProblem(s:Commerce,actor:string,bookingId:string,id:string,now=Date.now()):Commerce{
 const b=s.bookings.find(v=>v.id===bookingId),p=b?.problems?.find(v=>v.id===id);
 if(!b||!p||!canManageBooking(s,actor,b))throw Error('Нет доступа к обращению');
 if(p.status==='cancelled')return s;
 if(p.status==='resolved')throw Error('Обращение уже решено');
 const atMs=stayNow(b,now);if(!Number.isFinite(atMs)||atMs<Date.parse(p.events.at(-1)!.at))throw Error('Проверьте время события');
 const at=new Date(atMs).toISOString();return update(s,b,b.problems!.map(v=>v.id===id?{...v,status:'cancelled',events:[...v.events,{status:'cancelled',at}]}:v));
}
