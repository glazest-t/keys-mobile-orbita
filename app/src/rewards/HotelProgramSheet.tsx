import {BottomSheet} from '../mobile';
import {Button} from '../ui';
import type {Commerce} from '../booking/model';
import {hasHotelProgram,hotelProgramDiscount,hotelPrograms,supportsHotelPoints} from './loyalty';
import {pointsLabel} from './points';
import type {ReactNode} from 'react';

const hotelProgramSites:Record<string,string>={'orbit-sea':'https://manteracongress.ru/loyalty-program'};

export function ProgramSummarySheet({open,name,city,programUrl,onClose,onBook,children}:{open:boolean;name:string;city?:string;programUrl?:string;onClose:()=>void;onBook:()=>void;children:ReactNode}){
 return <BottomSheet open={open} onOpenChange={value=>{if(!value)onClose();}} title={name} description={city} snap={.65}>
  <div className="sheet-body hotel-program-summary">{children}{programUrl&&<p className="benefit-muted hotel-program-site-note">Условия программы и доступные тарифы — <a className="hotel-program-site-link" href={programUrl} target="_blank" rel="noopener noreferrer">на сайте отеля</a>.</p>}<Button onClick={onBook}>Забронировать</Button></div>
 </BottomSheet>;
}

/** A single presentation for discount-only, points-only, and combined programs. */
export function ProgramBenefits({discountBasisPoints=0,points}:{discountBasisPoints?:number;points?:number}){
 return <dl className="hotel-program-summary-values">
  {discountBasisPoints>0&&<div><dt>Скидка</dt><dd>−{discountBasisPoints/100}%</dd></div>}
  {points!==undefined&&<div><dt>Баллы</dt><dd>{points.toLocaleString('ru-RU')} {pointsLabel(points)}</dd></div>}
 </dl>;
}

export function HotelProgramSheet({hotelId,commerce,owner,onClose,onBook}:{hotelId:string|null;commerce:Commerce;owner:string;onClose:()=>void;onBook:(id:string)=>void}){
 const hotel=hotelPrograms.find(h=>h.id===hotelId);
 const connected=!!hotel&&hasHotelProgram(commerce,owner,hotel.id);
 const discount=hotel?hotelProgramDiscount(commerce,owner,hotel.id):0;
 const balance=hotel?commerce.payment.balances[`hotel:${hotel.id}:${owner}`]||0:0;
 return <ProgramSummarySheet open={!!hotel} name={hotel?.name||'Программа отеля'} city={hotel?.city} programUrl={hotel?hotelProgramSites[hotel.id]:undefined} onClose={onClose} onBook={()=>{if(hotel){onClose();onBook(hotel.id);}}}>
  {hotel&&<ProgramBenefits discountBasisPoints={connected?discount:hotel.hotelDiscountBasisPoints} points={supportsHotelPoints(hotel.id)?(connected?balance:0):undefined}/>}
 </ProgramSummarySheet>;
}
