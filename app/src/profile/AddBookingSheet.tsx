import {editorialText} from '../../../prototype/domain/editorialText.mjs';
import {isDesktop} from '../desktop/surface';
import {DialogActions} from '../dialogActions';
import './add-booking-sheet.css';
import {useEffect,useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet,useKeyboard} from '../mobile';
import {Button,Field} from '../ui';
import {useNovember} from '../usePrototypeVariant';
import type {Commerce} from '../booking/model';
import {addTripByNumber} from './historyDemo';
import './history.css';

export function AddBookingSheet({commerce,owner,setCommerce,open,onClose,onAdded}:{commerce:Commerce;owner:string;setCommerce:Dispatch<SetStateAction<Commerce>>;open:boolean;onClose:()=>void;onAdded:()=>void}){
 const november=useNovember(),keyboard=useKeyboard();
 const [number,setNumber]=useState(''),[voucher,setVoucher]=useState(''),[error,setError]=useState('');
 useEffect(()=>{if(!open){setNumber('');setVoucher('');setError('');}},[open]);
 const add=()=>{try{
  if(november&&!voucher.trim())throw Error('Введите код из ваучера');
  const next=addTripByNumber(commerce,owner,number,november?voucher:undefined);
  setCommerce({...next,historyBrowse:{...next.historyBrowse,[owner]:{query:'',filter:'Все'}}});
  keyboard.hide();onClose();onAdded();
 }catch(e){setError((e as Error).message);}};
 return <BottomSheet title="Добавить бронь" open={open} onOpenChange={value=>{if(!value)onClose();}} snap={.6}><form className="sheet-body history-form add-booking-form" data-scroll-drag="ignore" onSubmit={e=>{e.preventDefault();add();}}><p>{november?editorialText("РШ-034", "Введите номер бронирования и код из ваучера.", "Укажите номер бронирования и код из ваучера"):'Введите номер из подтверждения бронирования.'}</p><Field label="Номер бронирования" placeholder={editorialText("РШ-036", "Например, KEYS-2026", "")} autoCapitalize="characters" value={number} error={error} onChange={e=>{setNumber(e.target.value);setError('');}}/>{november&&<Field label="Код из ваучера" value={voucher} autoComplete="off" onChange={e=>{setVoucher(e.target.value);setError('');}}/>}<DialogActions><Button type="submit" disabled={!number.trim()||(november&&!voucher.trim())}>{editorialText("РШ-038", "Добавить бронь", "Добавить")}</Button>{isDesktop&&<Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>}</DialogActions></form></BottomSheet>;
}
