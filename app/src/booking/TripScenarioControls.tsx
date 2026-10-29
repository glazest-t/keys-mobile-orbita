import {type Commerce} from './model';
import {tripScenarios,activeTripScenario,type TripScenario} from './demoTripScenarios';
import './trip-scenarios.css';

export function TripScenarioControls({commerce,owner,onSelect,onRestore}:{commerce:Commerce;owner:string|null;onSelect:(scenario:TripScenario)=>void;onRestore:()=>void}){
 const active=owner?activeTripScenario(commerce,owner):null;
 return <details className="trip-scenario-controls" open><summary>Сценарии поездки</summary>
 <div className="trip-scenario-options" role="group" aria-label="Сценарий поездки">{tripScenarios.map(s=><button key={s.id} disabled={!owner} aria-pressed={active===s.id} onClick={()=>onSelect(s.id)}><span>{s.label}</span><small>{s.hint}</small></button>)}</div><small>Добавление по номеру: KEYS-2026 — пример внешней брони.</small>
 {!owner?<small>Войдите, чтобы посмотреть сценарии.</small>:commerce.demoTripSession?<><small>Готовый пример. Переключение начинает сценарий заново.</small><button className="restore-trip-data" onClick={onRestore}>Вернуться к своим данным</button></>:<small>Ваши данные сохранятся отдельно на время просмотра.</small>}
 </details>;
}
