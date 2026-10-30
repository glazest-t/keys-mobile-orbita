import {HotelLevels,type HotelLevelCard} from './HotelLevels';
import {useState} from 'react';
import {Button,Icon} from '../ui';
import {BottomSheet} from '../mobile';
import type {Commerce} from '../booking/model';
import {hotelVisual} from '../booking/presentation';
import {hasHotelProgram,hotelPrograms,hotelProgramProgress,supportsHotelPoints,type HotelLevel} from './loyalty';

const money=(minor:number)=>Math.round(minor/100).toLocaleString('ru-RU')+' ₽';
const levelCard=(l:HotelLevel):HotelLevelCard=>({id:l.id,name:l.name,
 condition:l.thresholdMinor?`От ${money(l.thresholdMinor)} за год`:'После подключения программы',
 benefits:[...(l.discountBasisPoints?[{label:`Скидка ${l.discountBasisPoints/100}%`,kind:'discount' as const}]:[]),
 ...(l.earnBasisPoints?[{label:`${l.earnBasisPoints/100}% баллами`,kind:'points' as const}]:[])]});
export function HotelProgramDetails({s,owner,hotelId}:{s:Commerce;owner:string;hotelId:string}){
 const [selected,setSelected]=useState<HotelLevel|null>(null);
 const h=hotelPrograms.find(h=>h.id===hotelId)!,connected=hasHotelProgram(s,owner,hotelId);
 const {levels,current,next,spentMinor,remainingMinor,progress,year}=hotelProgramProgress(s,owner,hotelId);
 if(!current)return null;
 const points=s.payment.balances[`hotel:${hotelId}:${owner}`]||0,withPoints=supportsHotelPoints(hotelId);
 return <>
 <section className="benefit-program-hero">
  <div className="benefit-program-photo"><img src={hotelVisual(hotelId).photos[0]} alt=""/><div><h1>{h.name}</h1><small>{withPoints?(current.discountBasisPoints?'Скидка и баллы':'Бонусы с уровнями'):'Скидка с уровнями'}</small></div></div>
  <div className="hotel-level-heading"><span>{connected?'Ваш уровень':'Начальный уровень'}</span><span className="hotel-level-badge">{connected?current.name:levels[0].name}</span></div>
  <div className="benefit-program-numbers hotel-level-numbers">
   {current.discountBasisPoints>0&&<div><small>{connected?'Скидка':'Скидка по карте'}</small><strong>−{(connected?current:levels[0]).discountBasisPoints/100}%</strong></div>}
   {withPoints&&<><div><small>Баллы</small><strong className="hotel-points-number">{connected?points.toLocaleString('ru-RU'):'—'}</strong></div><div><small>Начисление</small><strong className="hotel-points-number">{(connected?current:levels[0]).earnBasisPoints/100}%</strong></div></>}
  </div>
  {connected&&<div className="hotel-level-progress">
   {next?<><progress value={progress} max={1} aria-label={`Прогресс до уровня ${next.name}`}/><span>Ещё {money(remainingMinor)} до уровня «{next.name}»</span><small>{money(spentMinor)} из {money(next.thresholdMinor)} за {year} год</small></>:<><span className="hotel-level-max"><Icon name="check" size={16} inheritColor/>Высший уровень</span><small>{money(spentMinor)} за {year} год</small></>}
  </div>}
 </section>
 <section className="benefit-section"><h2>Уровни отеля</h2><HotelLevels levels={levels.map(levelCard)} currentId={connected?current.id:undefined} onDetails={id=>setSelected(levels.find(l=>l.id===id)||null)}/></section>
 <section className="benefit-section"><h2>Условия</h2><div className="benefit-card benefit-conditions">{[
 'Уровень — по оплате проживания за календарный год. Новый год — новый расчёт.',
 'Покупки учитываем после выезда, за вычетом скидок и списанных баллов. Услуги не учитываем.',
 ...(withPoints?['Баллы начисляем после выезда по уровню на момент бронирования. 1 балл = 1 ₽.']:[]),
 'Баллы «Ключей» и отеля хранятся отдельно. Можно оплатить до 100% бронирования.',
 ...(s.accounts[owner]?.hotelierStatus==='approved'?['С Friendly Rate программа отеля не совмещается.']:[])
 ].map(t=><div key={t}><span className="benefit-condition-check"><Icon name="check" size={13} inheritColor/></span><span>{t}</span></div>)}</div></section>
 <BottomSheet title={selected?.name||'Уровень отеля'} open={!!selected} onOpenChange={v=>{if(!v)setSelected(null);}} snap={.75}><div className="sheet-body hotel-level-sheet">{selected&&<><p className="hotel-level-sheet-subtitle">{selected.thresholdMinor?`От ${money(selected.thresholdMinor)} за календарный год`:'Доступен после подключения карты'}</p><div className="hotel-level-sheet-benefits">{selected.discountBasisPoints>0&&<div><span>Скидка на проживание</span><strong>−{selected.discountBasisPoints/100}%</strong></div>}{selected.earnBasisPoints>0&&<div><span>Начисление баллов</span><strong>{selected.earnBasisPoints/100}%</strong></div>}</div>{selected.privileges.length>0&&<section className="benefit-section"><h3>Привилегии</h3><div className="benefit-card benefit-conditions">{selected.privileges.map(t=><div key={t}><span className="benefit-condition-check"><Icon name="check" size={13} inheritColor/></span><span>{t}</span></div>)}</div><p className="benefit-muted">Доступность привилегий зависит от условий отеля и выбранного тарифа.</p></section>}<p className="benefit-muted">Списание баллов не снижает накопленный прогресс. Новый уровень применяется к следующим бронированиям.</p><Button onClick={()=>setSelected(null)}>Понятно</Button></>}</div></BottomSheet>
 </>;
}
