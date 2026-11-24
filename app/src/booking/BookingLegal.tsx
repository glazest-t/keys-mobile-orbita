import {useState,type ReactNode} from 'react';
import {BottomSheet} from '../mobile';
import {Button,Icon} from '../ui';
import {TermsPage} from '../legal/TermsPage';
import {usePrototypeText} from '../usePrototypeText';
import './booking-legal.css';

type Document='agreement'|'privacy'|'provider';
const titles:Record<Document,string>={agreement:'Пользовательское соглашение',privacy:'Политика обработки персональных данных',provider:'Информация об исполнителе'};

export function BookingLegal({actionLabel,children}:{children?:ReactNode;actionLabel:string}){
 const [document,setDocument]=useState<Document|null>(null);
 const edited=usePrototypeText()==='edited';
 return <section className="booking-legal" aria-label="Согласия и документы">
  <div className="booking-legal-card">{children}
  <p className="booking-legal-copy">Нажимая «{actionLabel}», вы {edited?'принимаете':'соглашаетесь с'} <button type="button" onClick={()=>setDocument('agreement')}>{edited?'Пользовательское соглашение':'Пользовательским соглашением'}</button> и подтверждаете, что ознакомились с <button type="button" onClick={()=>setDocument('privacy')}>Политикой обработки персональных данных</button>.</p></div>
  <button type="button" className="booking-provider-link" onClick={()=>setDocument('provider')}>Информация об исполнителе <Icon name="chevron-right" size={14} inheritColor/></button>
  <BottomSheet open={document!==null} onOpenChange={open=>{if(!open)setDocument(null);}} title={document?titles[document]:''} snap={.94}>
   <div className={'booking-legal-document'+(document==='provider'?' booking-provider-document':'')}>
    {document==='provider'?<div className="booking-provider-details">
     <section className="booking-provider-section booking-provider-property" aria-labelledby="lodging-provider-title">
      <h3 id="lodging-provider-title">Проживание предоставляет</h3>
      <p className="booking-provider-name">Общество с ограниченной ответственностью «Управляющая компания „Лучано“»</p>
      <dl>
       <div className="booking-provider-address"><dt>Адрес</dt><dd>420111, Республика Татарстан, г. Казань, ул. Островского, 26</dd></div>
       <div><dt>ИНН</dt><dd>1655217207</dd></div>
       <div><dt>ОГРН</dt><dd>1111690042991</dd></div>
       <div><dt>Номер в реестре</dt><dd>С162025003465</dd></div>
      </dl>
     </section>
     <section className="booking-provider-section booking-provider-service" aria-labelledby="service-provider-title">
      <h3 id="service-provider-title">Сервис предоставляет</h3>
      <p className="booking-provider-name">ООО «ТРЭВЕЛ ЛАЙН СИСТЕМС»</p>
      <dl>
       <div className="booking-provider-address"><dt>Адрес</dt><dd>424031, Республика Марий Эл, г. Йошкар-Ола, ул. Комсомольская, д. 112</dd></div>
       <div><dt>ИНН</dt><dd>1215180595</dd></div>
       <div><dt>ОГРН</dt><dd>1141215003214</dd></div>
      </dl>
     </section>
    </div>:document&&<TermsPage key={document} initialDocument={document} embedded/>}
    <Button variant="secondary" dismissOnly onClick={()=>setDocument(null)}>Закрыть</Button>
   </div>
  </BottomSheet>
 </section>;
}
