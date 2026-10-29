import type {Commerce} from '../booking/model.ts';
import type {Operation} from '../../../prototype/domain/payment.mjs';
export type PointEntry={id:string;amount:number;title:string;hotelId:string;bookingId:string;at?:string;kind:'spend'|'return'|'welcome'|'stay'|'invite'};
export const WELCOME_POINTS=1000;
/** Account activation/migration, never a side effect of reading history. */
export function ensureWelcomePoints(s:Commerce,owner:string,at=new Date().toISOString()):Commerce{
 if(!owner||!s.accounts[owner]||s.welcomePoints?.[owner])return s;
 const wallet='keys:'+owner;
 return {...s,welcomePoints:{...s.welcomePoints,[owner]:{amount:WELCOME_POINTS,at}},payment:{...s.payment,balances:{...s.payment.balances,[wallet]:(s.payment.balances[wallet]||0)+WELCOME_POINTS}}};
}
/** Demo ledger explains the 4,860 points already seeded by ensureAccount.
 * Never credits them again and never creates synthetic booking/payment operations. */
export function ensureDemoPointsHistory(s:Commerce,owner:string,at=new Date().toISOString()):Commerce{
 if(!owner||!s.accounts[owner]||s.demoPointsHistory?.[owner])return s;
 const anchor=Math.min(Date.parse(at),...s.bookings.filter(b=>b.owner===owner).map(b=>Date.parse(b.createdAt)).filter(Number.isFinite));
 const date=(days:number)=>new Date(anchor-days*86400000).toISOString();
 const rows:[number,number,PointEntry['kind'],string,string][]=[
  [110,1800,'stay','Баллы за проживание','orbit-sea'],
  [100,1000,'invite','За приглашение друга',''],
  [90,-2200,'spend','Оплата брони','kazan-apart'],
  [80,1200,'stay','Баллы за проживание','kazan-apart'],
  [70,-900,'spend','Оплата брони','orbit-sea'],
  [68,900,'return','Возврат при отмене','orbit-sea'],
  [55,600,'stay','Баллы за проживание','orbit-sea'],
  [40,2460,'stay','Баллы за проживание','kazan-apart'],
  [25,-2400,'spend','Оплата брони','orbit-sea'],
  [10,2400,'stay','Баллы за проживание','orbit-sea'],
 ];
 const entries=rows.map(([days,amount,kind,title,hotelId],i)=>({id:`demo-points:${owner}:${i}`,amount,kind,title,hotelId,bookingId:'',at:date(days)}));
 const welcome=s.welcomePoints?.[owner];
 return {...s,demoPointsHistory:{...s.demoPointsHistory,[owner]:entries},...(welcome?{welcomePoints:{...s.welcomePoints,[owner]:{...welcome,at:date(120)}}}:{})};
}
export function pointEntryDescription(entry:PointEntry){
 return entry.kind==='welcome'?'Начислены при регистрации':entry.kind==='stay'?'Начислены за завершённое проживание':entry.kind==='invite'?'Бонус за приглашённого друга':entry.kind==='spend'?'Использованы при оплате':'Возвращены на баланс «Ключей»';
}
function returnedTo(op:Operation,wallet:string){
 let remainder=(op.returnedPointsMinor||0)/100;
 for(const [id,amount] of Object.entries(op.debits).reverse()){
  const returned=Math.min(remainder,amount);if(id===wallet)return returned;remainder-=returned;
 }
 return 0;
}
/** Derive history from persisted payment operations; viewing never changes a wallet. */
export function pointHistory(s:Commerce,owner:string,wallet='keys:'+owner):PointEntry[]{
 if(wallet!=='keys:'+owner&&!wallet.endsWith(':'+owner))return [];
 const entries:PointEntry[]=wallet==='keys:'+owner?[...(s.demoPointsHistory?.[owner]||[])]:[];
 for(const a of s.hotelLoyaltyAwards?.[owner]||[]){if(wallet===`hotel:${a.hotelId}:${owner}`&&a.points)entries.push({id:'hotel-stay:'+a.bookingId,amount:a.points,title:'Баллы за проживание',hotelId:a.hotelId,bookingId:a.bookingId,at:a.at,kind:'stay'});}
 const welcome=wallet==='keys:'+owner?s.welcomePoints?.[owner]:undefined;
 if(welcome)entries.push({id:'welcome:'+owner,amount:welcome.amount,title:'Приветственные баллы',hotelId:'',bookingId:'',at:welcome.at,kind:'welcome'});
 for(const op of Object.values(s.payment.operations)){
  if(op.userId!==owner)continue;
  const b=s.bookings.find(b=>b.owner===owner&&b.id===op.bookingId);
  const changes=b?.operation.id===op.id?b.changes||[]:[];
  const restored=changes.reduce((sum,c)=>sum+(wallet==='keys:'+owner?c.returnedKeysPoints:wallet===`hotel:${op.hotelId}:${owner}`?c.returnedHotelPoints:0),0);
  const spent=(op.debits[wallet]||0)+restored;
  if(spent)entries.push({id:op.id+':debit',amount:-spent,title:b?'Оплата брони':'Оплата услуги',hotelId:op.hotelId,bookingId:b?.id||op.bookingId,at:b?.createdAt,kind:'spend'});
  for(const c of changes){const amount=wallet==='keys:'+owner?c.returnedKeysPoints:wallet===`hotel:${op.hotelId}:${owner}`?c.returnedHotelPoints:0;if(amount)entries.push({id:op.id+':'+c.id,amount,title:'Возврат при изменении',hotelId:op.hotelId,bookingId:op.bookingId,at:c.at,kind:'return'});}
  const amount=returnedTo(op,wallet);
  if(amount)entries.push({id:op.id+':return',amount,title:'Возврат при отмене',hotelId:op.hotelId,bookingId:b?.id||op.bookingId,kind:'return'});
 }
 return entries.reverse().sort((a,b)=>(b.at||'').localeCompare(a.at||''));
}
export function pointsLabel(n:number){const a=Math.abs(n)%100;return a>=11&&a<=14?'баллов':a%10===1?'балл':a%10>=2&&a%10<=4?'балла':'баллов';}
