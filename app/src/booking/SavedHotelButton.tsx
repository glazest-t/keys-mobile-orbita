import {Icon} from '../ui';
import {useFavoriteSaving} from './FavoriteSaving';
export function SavedButton({saved,onClick,hotelId}:{saved:boolean;onClick:()=>void;hotelId?:string}){const save=useFavoriteSaving();return <button className={'save-hotel '+(saved?'is-saved':'')} aria-label={saved?'Удалить из избранного':'Сохранить отель'} aria-pressed={saved} onClick={()=>hotelId&&save?save.toggle(hotelId):onClick()}><Icon name={saved?"heart":"favorite-outline"} size={18} inheritColor/></button>;}
