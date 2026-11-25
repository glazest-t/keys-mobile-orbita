import {editorialText} from '../../../prototype/domain/editorialText.mjs';
import {useState,type Dispatch,type SetStateAction} from 'react';
import {useDemoEmptyTrip} from '../demoEmptyTrip';
import {AddBookingSheet} from '../profile/AddBookingSheet';
import {Button,Empty,Icon} from '../ui';
import type {Commerce} from './model';

export function EmptyTrip({commerce,setCommerce,owner,onSearch,onLogin,onAdded,onAddBooking}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner?:string;onSearch:()=>void;onLogin:()=>void;onAdded:()=>void;onAddBooking?:()=>void}){
 const missing=useDemoEmptyTrip()==='missing';
 const [adding,setAdding]=useState(false);
 const addBooking=onAddBooking??(()=>owner?setAdding(true):onLogin());
 return <><Empty icon="nav-trips" illustration="/brand/illustrations/trip-empty-portal.png" title="Здесь появится ваша поездка" action={<Button onClick={missing?addBooking:onSearch}>{missing?<><Icon name="plus" size={20} inheritColor/>У меня есть бронь</>:'Найти'}</Button>}>{editorialText("РШ-362", "Бронь, ключ и услуги — в одном месте", "Бронь, ключ и услуги — всегда под рукой")}</Empty>{owner&&!onAddBooking&&<AddBookingSheet commerce={commerce} setCommerce={setCommerce} owner={owner} open={adding} onClose={()=>setAdding(false)} onAdded={onAdded}/>}</>;
}
