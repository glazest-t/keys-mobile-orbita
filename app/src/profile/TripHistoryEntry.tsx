import {Icon} from '../ui';
import './history.css';
export function TripHistoryEntry({onOpen}:{onOpen:()=>void}){
 return <button className="trip-history-entry" onClick={onOpen} aria-label="Все поездки — открыть историю"><img src="/brand/illustrations/trip-history-album.png" alt=""/><span className="trip-history-entry-copy"><strong>Все поездки</strong><small>Прошлые и предстоящие</small><span>Открыть историю<Icon name="chevron-right" size={20} inheritColor/></span></span></button>;
}
