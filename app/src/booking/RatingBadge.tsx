import {ratingTone} from './rating';
import './rating.css';
export function RatingBadge({value}:{value:number|string}){return <b className={'hotel-rating hotel-rating--'+ratingTone(value)} aria-label={`Оценка ${value} из 5`}>{typeof value==='number'?value.toLocaleString('ru-RU'):value}</b>;}
