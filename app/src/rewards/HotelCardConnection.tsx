import {novemberEditorialText} from '../../../prototype/domain/novemberEditorialText.mjs';
import {useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Field,Icon} from '../ui';
import {catalog,type Commerce} from '../booking/model';
import {promotionBasisPoints} from '../booking/promotions';
import {hotelProgramDiscount,hotelProgramProgress,connectHotelProgram,hasHotelProgram,supportsHotelPoints} from './loyalty';
import './rewards.css';

type Props={commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string;hotelId:string;onConnected:()=>void};
export function HotelCardConnection(p:Props){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[reset,setReset]=useState(false);
 return <form className="benefit-connect" onSubmit={e=>{e.preventDefault();try{const next=connectHotelProgram(p.commerce,p.owner,p.hotelId,email,password);p.setCommerce(next);setPassword('');p.onConnected();}catch(err){setError((err as Error).message);}}}>
 <Field label="Email" type="email" autoComplete="off" value={email} onChange={e=>{setEmail(e.target.value);setError('');}}/>
 <Field label="Пароль" type="password" autoComplete="off" value={password} onChange={e=>{setPassword(e.target.value);setError('');}}/>
 {error&&<p className="field-error" role="alert">{error}</p>}
 <button type="button" className="benefit-text-link" aria-expanded={reset} onClick={()=>setReset(!reset)}>Не помню пароль</button>
 {reset&&<p className="benefit-muted">{novemberEditorialText("Т-3442", "Пароль восстанавливается в личном кабинете программы отеля.", "Восстановить пароль можно в личном кабинете программы лояльности")}</p>}
 <Button type="submit">Войти и подключить карту</Button></form>;
}
export function HotelLoyaltyCheckout({commerce,setCommerce,owner,hotelId,friendly}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string;hotelId:string;friendly:boolean}){
 const [open,setOpen]=useState(false),hotel=catalog.hotels.find(h=>h.id===hotelId),connected=hasHotelProgram(commerce,owner,hotelId);
 if(!hotel||(!hotel.hotelDiscountBasisPoints&&!supportsHotelPoints(hotelId))||friendly)return null;
 const discount=hotelProgramDiscount(commerce,owner,hotelId),level=hotelProgramProgress(commerce,owner,hotelId).current;
 const promo=promotionBasisPoints(hotelId)>discount;
 return <>{connected?<div className="hotel-loyalty-note"><span className="icon-tile"><Icon name={hotel.hotelDiscountBasisPoints?'discount':'points'} size={22} inheritColor/></span><span><strong>{novemberEditorialText("Т-3444", "Программа отеля · ", "Программа лояльности · ")}{level?.name}</strong><small>{!hotel.hotelDiscountBasisPoints?novemberEditorialText("Т-3445", 'Баллы отеля доступны на шаге оплаты', "Баллы программы доступны на шаге оплаты"):promo?'Карта подключена · применена более выгодная акция':`Скидка ${discount/100}% на проживание уже учтена`}</small></span><span className="loyalty-check"><Icon name="check" size={20} inheritColor/></span></div>:<button className="hotel-loyalty-note benefit-connect-trigger" onClick={()=>setOpen(true)}><span className="icon-tile"><Icon name="card" size={22} inheritColor/></span><span><strong>{novemberEditorialText("Т-3448", "Подключить карту отеля", "Подключить карту лояльности")}</strong><small>{hotel.hotelDiscountBasisPoints?`Скидка программы ${hotel.hotelDiscountBasisPoints/100}%`:novemberEditorialText("Т-3450", 'Накопление и списание баллов отеля', "Накопление и списание баллов программы")}</small></span><Icon name="chevron-right" size={18} inheritColor/></button>}
 <BottomSheet open={open} onOpenChange={setOpen} title={novemberEditorialText("Т-3451", "Карта отеля", "Карта лояльности")} snap={.8}><div className="sheet-body"><h2 className="benefit-connection-hotel">{hotel.name}</h2><HotelCardConnection key={String(open)} commerce={commerce} setCommerce={setCommerce} owner={owner} hotelId={hotelId} onConnected={()=>setOpen(false)}/></div></BottomSheet></>;
}
