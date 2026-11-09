import {BookingSteps} from './BookingSteps';
import {amendmentNavigationEvent} from './amendmentNavigation';
import {useEffect,useRef,useState,type Dispatch,type SetStateAction,type ReactNode} from 'react';
import {BottomSheet,MobileScroll,KeyboardTextarea,useKeyboard} from '../mobile';
import {Button,Field,Icon,Switch} from '../ui';
import {isDesktop} from '../desktop/surface';
import {amendmentInput,previewAmendment,type AmendmentInput,type AmendmentPreview} from './amendment';
import {catalog,dateLabel,formatMoney,guestLabel,searchError,contactErrors,additionalGuestError,cancellationLabel,type Booking,type Commerce} from './model';
import {Calendar} from './SearchControls';
import {guestPatch,WISH_LIMIT} from './bookingParty';
import {rateTitle} from './roomOffers';
import {mealLabel} from './searchFacets';
import {tripFacts} from './trip';
import {bookingNumber} from './bookingNumber';
import './amendment-editor.css';

type Panel='dates'|'room'|'guests'|'wishes'|'services';
type Props={booking:Booking;commerce:Commerce;form:AmendmentInput;setForm:Dispatch<SetStateAction<AmendmentInput>>;preview:AmendmentPreview|null;calculationError:string;error:string;busy:boolean;changed:boolean;save:()=>Promise<boolean>;onBack:()=>void};
const titles:Record<Panel,string>={dates:'Даты проживания',room:'Номер и тариф',guests:'Данные гостей',wishes:'Пожелания к проживанию',services:'Услуги в брони'};
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
const roomLabel=(i:AmendmentInput)=>catalog.rooms.find(r=>r.id===i.roomId)?.title||'';
const tariffLabel=(i:AmendmentInput)=>{const r=catalog.rates.find(r=>r.id===i.rateId);return r?rateTitle(r):'';};
const peopleLabel=(i:AmendmentInput)=>[i.contact,...(i.guests||[])].filter(Boolean).map(g=>`${g!.name} ${g!.surname}`.trim()).filter(Boolean).join(', ');
const servicesLabel=(i:AmendmentInput)=>i.services.map(id=>catalog.services.find(s=>s.id===id)?.title||id).join(', ')||'Нет добавленных услуг';
function DetailLine({label,children,accent=false}:{label:string;children:ReactNode;accent?:boolean}){return <div className={'amend-money-line'+(accent?' amend-money-total':'')}><span>{label}</span><strong>{children}</strong></div>;}
function PriceSummary({booking:b,preview:p,changed,settled=false}:{booking:Booking;preview:AmendmentPreview|null;changed:boolean;settled?:boolean}){
 return <section className="amend-price"><h2>{changed?'Стоимость после изменений':'Стоимость брони'}</h2>
 {changed&&<DetailLine label="Было">{formatMoney(b.quote.orderTotalMinor)}</DetailLine>}
 <DetailLine label={changed?'Стало':'Стоимость'} accent>{p?formatMoney(p.quote.orderTotalMinor):'Нужен перерасчёт'}</DetailLine>
 {p&&<><DetailLine label="Проживание">{formatMoney(p.quote.lodgingMinor)}</DetailLine>{p.quote.serviceTotalMinor>0&&<DetailLine label="Услуги">{formatMoney(p.quote.serviceTotalMinor)}</DetailLine>}{p.quote.applied.pointsMinor>0&&<DetailLine label="Учтены списанные баллы">−{formatMoney(p.quote.applied.pointsMinor)}</DetailLine>}
 <div className="amend-settlement"><DetailLine label={p.extraPaid?(settled?'Доплачено':'Доплатить сейчас'):p.refund?(settled?'Оформлен возврат':'Вернём после подтверждения'):'Доплата сейчас'} accent>{formatMoney(p.extraPaid||p.refund)}</DetailLine>{p.dueAtHotel>0&&<DetailLine label="К оплате в отеле">{formatMoney(p.dueAtHotel)}</DetailLine>}{p.hotelReturn+p.keysReturn>0&&<p>{p.hotelReturn>0&&<>В программу отеля вернётся {p.hotelReturn.toLocaleString('ru-RU')} баллов. </>}{p.keysReturn>0&&<>На счёт Ключей — {p.keysReturn.toLocaleString('ru-RU')} баллов.</>}</p>}</div>
 {p.refund>0&&<p className="amend-muted">Возврат — на исходный способ оплаты.</p>}</>}
 </section>;
}
function ReviewChanges({before,after}:{before:AmendmentInput;after:AmendmentInput}){
 const rows=[['Даты',dateLabel(before.search),dateLabel(after.search)],['Номер',roomLabel(before),roomLabel(after)],['Тариф',tariffLabel(before),tariffLabel(after)],['Гости',peopleLabel(before),peopleLabel(after)],['Телефон',before.contact?.phone,after.contact?.phone],['Почта',before.contact?.email,after.contact?.email],['Услуги',servicesLabel(before),servicesLabel(after)],['Пожелания',before.wishes||'Не указаны',after.wishes||'Не указаны']].filter(([,old,next])=>old!==next);
 return <section className="amend-card amend-diff"><h2>Что изменится</h2>{rows.map(([label,old,next])=><div className="amend-diff-row" key={label}><h3>{label}</h3><div><span>Было</span><p>{old}</p></div><div><span>Станет</span><p>{next}</p></div></div>)}</section>;
}
export function AmendmentEditor(p:Props){
 const original=useRef(p.booking).current,b=original,before=amendmentInput(b),keyboard=useKeyboard();
 const [step,setStep]=useState<'edit'|'review'|'success'>('edit'),[panel,setPanel]=useState<Panel|null>(null),[local,setLocal]=useState<AmendmentInput>(p.form),[panelError,setPanelError]=useState(''),[leaving,setLeaving]=useState<'page'|'panel'|null>(null),[saved,setSaved]=useState<AmendmentPreview|null>(null);
 const dirty=p.changed&&step!=='success',panelDirty=!!panel&&!equal(local,p.form),hotel=catalog.hotels.find(h=>h.id===b.draft.hotelId)!,current=p.form,facts=tripFacts({...b,draft:{...b.draft,search:current.search,services:current.services,stayTimes:!current.services.includes('sea-early')&&b.draft.services.includes('sea-early')?{...b.draft.stayTimes,arrival:undefined}:b.draft.stayTimes}});
 const contentRef=useRef<HTMLDivElement>(null),pendingNavigation=useRef<null|(()=>void)>(null);
 useEffect(()=>{if(!dirty&&!panelDirty&&!p.busy)return;const guard=(e:Event)=>{e.preventDefault();if(p.busy)return;pendingNavigation.current=(e as CustomEvent<{proceed:()=>void}>).detail.proceed;setLeaving('page');};window.addEventListener(amendmentNavigationEvent,guard);return()=>window.removeEventListener(amendmentNavigationEvent,guard);},[dirty,panelDirty,p.busy]);
 useEffect(()=>{if(!dirty&&!panelDirty)return;const guard=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[dirty,panelDirty]);
 useEffect(()=>{contentRef.current?.closest('.mobile-scroll')?.scrollTo({top:0});contentRef.current?.querySelector<HTMLElement>('h1')?.focus({preventScroll:true});},[step]);
 function open(which:Panel){keyboard.hide();setLocal(structuredClone(current));setPanelError('');setPanel(which);}
 function cancelLeave(){pendingNavigation.current=null;setLeaving(null);}
 function closePanel(){keyboard.hide();if(panelDirty)setLeaving('panel');else setPanel(null);}
 function back(){pendingNavigation.current=null;keyboard.hide();if(step==='review'){setStep('edit');return;}if(dirty)setLeaving('page');else p.onBack();}
 function apply(){
  let error='';
  if(panel==='dates')error=searchError(local.search);
  if(panel==='guests')error=Object.values(contactErrors(local.contact!))[0]||additionalGuestError({...b.draft,...guestPatch(local.guests||[])});
  if(error){setPanelError(error);return;}
  keyboard.hide();p.setForm(local);setPanel(null);setPanelError('');
 }
 let localPreview:AmendmentPreview|null=null,localError='';if(panel&&['dates','room','services'].includes(panel)&&local.search.checkOut){try{localPreview=previewAmendment(p.commerce,b.owner,b.id,local);}catch(e){localError=(e as Error).message;}}
 const early=catalog.services.find(s=>s.id==='sea-early'&&b.draft.services.includes(s.id));
 const changes=(which:Panel)=>which==='dates'?!equal(before.search,current.search):which==='room'?before.roomId!==current.roomId||before.rateId!==current.rateId:which==='guests'?!equal([before.contact,before.guests],[current.contact,current.guests]):which==='services'?!equal(before.services,current.services):before.wishes!==current.wishes;
 const tile=(which:Panel,icon:string,detail:string,extra?:ReactNode)=> <button className="amend-option" onClick={()=>open(which)}><span className="icon-tile"><Icon name={icon} size={24}/></span><span className="amend-option-copy"><strong>{titles[which]}{changes(which)&&<span className="amend-edited">Изменено</span>}</strong><span>{detail}</span>{extra}</span><Icon name="edit" size={18}/></button>;
 async function confirm(){const expected=p.preview;if(await p.save()){setSaved(expected);setStep('success');}}
 return <div className="amend-page"><MobileScroll className="page-scroll amend-scroll"><div ref={contentRef} className="amend-content">
 <header className="amend-header"><button className="k-icon-button" aria-label="Назад" disabled={p.busy} onClick={back}><Icon name="back" size={20}/></button><div><h1 tabIndex={-1}>{step==='success'?'Бронь изменена':'Изменение брони'}</h1><p>№ {bookingNumber(b)}</p></div></header>
 {step==='success'?<div className="amend-success"><span className="amend-success-icon"><Icon name="check" size={32}/></span><h2>Новые условия сохранены</h2><p>{hotel.name}</p><p>{dateLabel(current.search)} · {guestLabel(current.search)}</p><p>{roomLabel(current)}</p>{saved&&<PriceSummary booking={b} preview={saved} changed settled/>}<Button onClick={p.onBack}>К деталям брони</Button></div>:<>
 <BookingSteps step={step==='edit'?1:2} title={step==='edit'?'Изменения':'Подтверждение'} heading="h2"/>
 <div className="amend-layout"><div className="amend-main" inert={p.busy}>
 {step==='edit'?<><p className="amend-notice"><Icon name="info" size={20}/>До подтверждения действуют прежние условия брони.</p>
 <section className="amend-card amend-options">{tile('dates','calendar',dateLabel(current.search),<small>Заезд с {facts.checkInTime} · выезд до {facts.checkOutTime}</small>)}{tile('room','room',roomLabel(current),<small>{tariffLabel(current)}</small>)}{tile('guests','guests',peopleLabel(current)||'Укажите данные гостей')}{tile('wishes','edit',current.wishes||'Можно оставить комментарий для отеля')}</section>
 <section className="amend-card">{early?tile('services','service',servicesLabel(current)):<><h2>Услуги в брони</h2><p>{servicesLabel(current)}</p><p className="amend-muted">Добавление и отмена отдельных услуг доступны в разделе «Все услуги» вашей поездки.</p></>}</section>
 </>:<><p className="amend-notice"><Icon name="info" size={20}/>Проверьте новые параметры и расчёт перед подтверждением.</p><ReviewChanges before={before} after={current}/><section className="amend-card"><h2>Условия после изменения</h2><p>Бесплатная отмена до {cancellationLabel(current.search)}.</p><p className="amend-muted">Позже — стоимость одной ночи. Способ оплаты сохраняется.</p>{p.preview?.extraPaid? <p>При подтверждении доплата составит <strong>{formatMoney(p.preview.extraPaid)}</strong>.</p>:<p>Сейчас ничего доплачивать не нужно.</p>}<button className="amend-text-button" onClick={()=>setStep('edit')}>Вернуться к изменениям</button></section></>}
 {p.calculationError&&<div role="alert" className="amend-error"><strong>Не удалось пересчитать бронь</strong><p>{p.calculationError}</p><p>Выберите другие даты или доступный номер.</p></div>}
 {p.error&&<div role="alert" className="amend-error">{p.error}</div>}
 </div><aside className="amend-aside"><PriceSummary booking={b} preview={p.preview} changed={dirty}/><div className="amend-desktop-action"><Button busy={p.busy} disabled={!p.preview||!dirty} onClick={()=>step==='edit'?setStep('review'):void confirm()}>{step==='edit'?'Проверить изменения':'Подтвердить изменения'}</Button>{step==='edit'&&dirty&&<button className="amend-text-button" onClick={()=>{pendingNavigation.current=null;setLeaving('page');}}>Выйти без изменений</button>}</div></aside></div>
 </>}
 </div></MobileScroll>
 {step!=='success'&&<footer className="amend-mobile-action"><div><small>{p.preview?.extraPaid?'Доплата сейчас':p.preview?.refund?'К возврату':'Стоимость'}</small><strong>{p.preview?formatMoney(p.preview.extraPaid||p.preview.refund||p.preview.quote.orderTotalMinor):'—'}</strong></div><Button busy={p.busy} disabled={!p.preview||!dirty} onClick={()=>step==='edit'?setStep('review'):void confirm()}>{step==='edit'?'Проверить':'Подтвердить'}</Button></footer>}
 <BottomSheet open={!!panel} onOpenChange={on=>{if(!on)closePanel();}} title={panel?titles[panel]:''} snap={.9}><div className={'amend-panel amend-panel-'+panel}>{!isDesktop&&<button className="amend-panel-close k-icon-button" aria-label="Закрыть" onClick={closePanel}><Icon name="close" size={20}/></button>}<div className="amend-panel-body">
 {panel==='dates'&&<><Calendar value={local.search} onChange={search=>setLocal(v=>({...v,search}))} visibleMonths={isDesktop?2:1}/><p className="amend-muted">Время заезда с {facts.checkInTime}, выезда до {facts.checkOutTime}. Для другого времени используйте услуги поездки.</p></>}
 {panel==='room'&&<><p className="amend-muted">{dateLabel(local.search)} · {guestLabel(local.search)}. Цены за всё проживание.</p><div className="amend-room-list">{catalog.rooms.filter(r=>r.hotelId===b.draft.hotelId).map(room=>{const offers=catalog.rates.filter(r=>r.roomId===room.id).flatMap(rate=>{try{return [{rate,preview:previewAmendment(p.commerce,b.owner,b.id,{...local,roomId:room.id,rateId:rate.id})}];}catch{return [];}});return offers.length?<section key={room.id} className="amend-room"><h3>{room.title}</h3>{offers.map(({rate,preview})=><button className={'amend-rate '+(local.rateId===rate.id?'selected':'')} key={rate.id} aria-pressed={local.rateId===rate.id} onClick={()=>setLocal(v=>({...v,roomId:room.id,rateId:rate.id}))}><span><strong>{rateTitle(rate)}</strong><small>{mealLabel(rate.mealPlan)}{b.draft.rateId===rate.id?' · Текущий тариф':''}</small></span><span><strong>{formatMoney(preview.quote.orderTotalMinor)}</strong><small>{local.rateId===rate.id?'Выбрано':'Выбрать'}</small></span></button>)}</section>:null;})}</div>{!catalog.rates.some(rate=>{try{previewAmendment(p.commerce,b.owner,b.id,{...local,roomId:rate.roomId,rateId:rate.id});return rate.id!==b.draft.rateId;}catch{return false;}})&&<p className="amend-notice">Других доступных тарифов на эти даты нет. Попробуйте изменить даты.</p>}</>}
 {panel==='guests'&&<><div className="amend-notice"><div><strong>{guestLabel(b.draft.search)}</strong><p>Количество гостей сохраняется. Для изменения состава свяжитесь с отелем.</p></div></div><h3>Основной гость и контакт</h3><div className="amend-fields">{(['name','surname','phone','email'] as const).map((key,i)=><Field key={key} label={['Имя','Фамилия','Телефон','Электронная почта'][i]} error={panelError?contactErrors(local.contact!)[key]:undefined} type={key==='email'?'email':key==='phone'?'tel':'text'} value={local.contact?.[key]||''} onChange={e=>setLocal(v=>({...v,contact:{...v.contact!,[key]:e.target.value}}))}/>)}</div>{Array.from({length:Math.max(0,b.draft.search.adults+b.draft.search.childrenAges.length-1)},(_,index)=><section key={index}><h3>Гость {index+2}</h3><p className="amend-muted">Имя и фамилия — если известны</p><div className="amend-fields">{(['name','surname'] as const).map(key=><Field key={key} label={key==='name'?'Имя':'Фамилия'} value={local.guests?.[index]?.[key]||''} onChange={e=>setLocal(v=>{const guests=Array.from({length:index+1},(_,j)=>v.guests?.[j]||{name:'',surname:''});return {...v,guests:[...guests.map((g,j)=>j===index?{...g,[key]:e.target.value}:g),...(v.guests||[]).slice(index+1)]};})}/>)}</div></section>)}</>}
 {panel==='wishes'&&<><label className="amend-comment">Комментарий для отеля<KeyboardTextarea rows={5} maxLength={WISH_LIMIT} value={local.wishes||''} onBlur={()=>keyboard.hide()} onChange={e=>setLocal(v=>({...v,wishes:e.target.value}))}/></label><p className="amend-muted">Отель учтёт пожелания при наличии возможности. {local.wishes?.length||0}/{WISH_LIMIT}</p></>}
 {panel==='services'&&early&&<><Switch checked={local.services.includes(early.id)} onChange={on=>setLocal(v=>({...v,services:on?[...v.services,early.id]:v.services.filter(id=>id!==early.id)}))}><span><strong>{early.title}</strong><small>С 10:00 · {formatMoney(early.unitPriceMinor)}</small></span></Switch><p className="amend-muted">Остальные услуги управляются в разделе «Все услуги» поездки.</p></>}
 {localError&&<p role="alert" className="field-error">{localError}</p>}
 {panelError&&<p role="alert" className="field-error">{panelError}</p>}
 </div><div className="amend-panel-actions">{localPreview&&!equal(local,current)&&<div className="amend-local-price"><DetailLine label="Стоимость брони">{formatMoney(b.quote.orderTotalMinor)} → {formatMoney(localPreview.quote.orderTotalMinor)}</DetailLine><DetailLine label={localPreview.refund?'К возврату':'Доплата сейчас'}>{formatMoney(localPreview.refund||localPreview.extraPaid)}</DetailLine>{localPreview.dueAtHotel>0&&<DetailLine label="К оплате в отеле">{formatMoney(localPreview.dueAtHotel)}</DetailLine>}</div>}<p className="amend-muted">Бронь изменится только после общего подтверждения.</p><Button disabled={panel==='dates'&&!local.search.checkOut} onClick={apply}>Применить к черновику</Button></div>
 </div></BottomSheet>
 <BottomSheet open={!!leaving} onOpenChange={on=>{if(!on)cancelLeave();}} title="Выйти без изменений?" snap={.42}><div className="amend-panel"><p>{leaving==='panel'?'Настройки в этом окне не будут применены.':'Несохранённые изменения будут потеряны.'} Действующая бронь останется прежней.</p><Button onClick={cancelLeave}>Продолжить редактирование</Button><Button variant="secondary" onClick={()=>{const target=leaving;setLeaving(null);if(target==='panel')setPanel(null);else if(pendingNavigation.current){const proceed=pendingNavigation.current;pendingNavigation.current=null;proceed();}else p.onBack();}}>Выйти без изменений</Button></div></BottomSheet>
 </div>;
}
