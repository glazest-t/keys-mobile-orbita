import test from 'node:test';
import assert from 'node:assert/strict';
import {serviceStatusPresentation as present} from '../app/src/booking/serviceSettlement.ts';
const booking={operation:{status:'confirmed'},draft:{search:{checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2,childrenAges:[]}}};
const breakfast={kind:'breakfast',mode:'room',status:'confirmed',date:'2026-11-14',time:'08:00',persons:1,amountMinor:180000};
test('Ранний заезд и поздний выезд: единый зелёный статус добавления, оплата отражается отдельно',()=>{
 for(const service of [{kind:'early',date:'2026-11-13'},{kind:'catalog',serviceId:'late',date:'2026-11-15'}]){
  const r={...breakfast,...service,settlement:'at_hotel'};
  for(const status of ['confirmed','completed']){
   assert.deepEqual(present(booking,{...r,status}),{label:'Добавлено',tone:'success',icon:'check'});
   assert.equal(present(booking,{...r,status,operation:{status:'confirmed'}}).label,'Добавлено');
  }
  assert.equal(present(booking,{...r,status:'completed',amountMinor:0}).label,'Добавлено');
  assert.equal(present(booking,{...r,status:'completed',settlement:undefined,operation:{status:'confirmed'}}).label,'Добавлено');
 }
});
test('Отмена, отказ и проверка имеют приоритет над сохранённой платёжной операцией',()=>{
 const paid={...breakfast,operation:{status:'confirmed'}};
 assert.equal(present({...booking,operation:{status:'cancelled'}},paid).label,'Отменено');
 assert.equal(present(booking,{...paid,status:'cancelled'}).tone,'neutral');
 assert.equal(present(booking,{...paid,status:'declined'}).label,'Отклонено');
 assert.equal(present(booking,{...paid,date:'2026-12-20'}).label,'Нужна проверка');
});
test('Оплаченные и бесплатные услуги различаются; незавершённый платёж не показывает успех',()=>{
 assert.equal(present(booking,breakfast).label,'К оплате');
 assert.equal(present(booking,{...breakfast,status:'pending'}).label,'Ждёт ответа');
 assert.equal(present(booking,{...breakfast,amountMinor:0}).label,'Заказано');
 assert.equal(present(booking,{...breakfast,status:'completed',amountMinor:0}).label,'Выполнено');
 assert.equal(present(booking,{...breakfast,status:'completed',operation:{status:'confirmed'}}).label,'Оплачено');
 assert.equal(present(booking,{...breakfast,operation:{status:'failed'}}).label,'К оплате');
});
