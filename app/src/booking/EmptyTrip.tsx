import {useState,type Dispatch,type SetStateAction} from 'react';
import {useDemoEmptyTrip} from '../demoEmptyTrip';
import {AddBookingSheet} from '../profile/AddBookingSheet';
import {Button,Empty,Icon} from '../ui';
import type {Commerce} from './model';

export function EmptyTrip({commerce,setCommerce,owner,onSearch,onLogin,onAdded}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner?:string;onSearch:()=>void;onLogin:()=>void;onAdded:()=>void}){
 const missing=useDemoEmptyTrip()==='missing';
 const [adding,setAdding]=useState(false);
 return <><Empty icon="nav-trips" illustration="/brand/illustrations/trip-empty-portal.png" title="Здесь появится ваша поездка" action={<Button onClick={missing?()=>owner?setAdding(true):onLogin():onSearch}>{missing?<><Icon name="plus" size={20} inheritColor/>У меня есть бронь</>:'Найти'}</Button>}>Бронь, ключ и услуги — в одном месте</Empty>{owner&&<AddBookingSheet commerce={commerce} setCommerce={setCommerce} owner={owner} open={adding} onClose={()=>setAdding(false)} onAdded={onAdded}/>}</>;
}
