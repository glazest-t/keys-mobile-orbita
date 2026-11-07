import {Fragment} from 'react';
import {useDemoEmptyTrip,setDemoEmptyTrip} from '../demoEmptyTrip';
import {type Commerce} from './model';
import {tripScenarios,activeTripScenario,type TripScenario} from './demoTripScenarios';
import './trip-scenarios.css';

export function TripScenarioControls({commerce,owner,onSelect,onRestore}:{commerce:Commerce;owner:string|null;onSelect:(scenario:TripScenario)=>void;onRestore:()=>void}){
 const emptyScenario=useDemoEmptyTrip();
 const active=owner?activeTripScenario(commerce,owner):null;
 return <details className="trip-scenario-controls"><summary>Сценарии поездки</summary>
 <div className="trip-scenario-options" role="group" aria-label="Сценарий поездки">{tripScenarios.map(s=><Fragment key={s.id}><button data-demo-keep-open={s.id==='empty'?true:undefined} disabled={!owner} aria-pressed={active===s.id} onClick={()=>onSelect(s.id)}><span>{s.label}</span></button>
 {s.id==='empty'&&active==='empty'&&<div className="demo-empty-trip-settings" role="group" aria-label="Вариант без брони"><small>Вариант сценария</small>{([['missing','Бронь не подгрузилась'],['none','Брони не было']] as const).map(([id,label])=><button key={id} type="button" aria-pressed={emptyScenario===id} onClick={()=>setDemoEmptyTrip(id)}>{label}</button>)}</div>}</Fragment>)}</div>
 {!owner?<small>Войдите, чтобы посмотреть сценарии.</small>:commerce.demoTripSession?<><button className="restore-trip-data" onClick={onRestore}>Вернуться к своим данным</button></>:null}
 </details>;
}
