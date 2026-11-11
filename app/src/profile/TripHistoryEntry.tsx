import {editorialText} from '../../../prototype/domain/editorialText.mjs';
import {Icon} from '../ui';
import {isDesktop} from '../desktop/surface';
import './history.css';
export function TripHistoryEntry({onOpen}:{onOpen:()=>void}){
 return <button className="trip-history-entry trip-promo" onClick={onOpen} aria-label="Все поездки — открыть историю"><img src="/brand/illustrations/trip-history-album.png" alt=""/><span className="trip-history-entry-copy trip-promo-copy"><strong>{editorialText("РШ-366", "Все поездки", "Мои поездки")}</strong><small>{editorialText("РШ-367", "Прошлые и предстоящие", "Прошлые и будущие")}</small><span>{editorialText("РШ-368", "Открыть историю", "Смотреть все")}<Icon name="chevron-right" size={isDesktop?20:16} inheritColor/></span></span></button>;
}
