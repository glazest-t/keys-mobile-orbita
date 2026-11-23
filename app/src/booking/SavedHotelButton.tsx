import {novemberEditorialText} from '../../../prototype/domain/novemberEditorialText.mjs';
import {Icon} from '../ui';
import {useFavoriteSaving} from './FavoriteSaving';
export function SavedButton({saved,onClick,hotelId}:{saved:boolean;onClick:()=>void;hotelId?:string}){const save=useFavoriteSaving();return <button className={'save-hotel '+(saved?'is-saved':'')} aria-label={saved?novemberEditorialText("Т-1925", 'Удалить из избранного', "Убрать из избранного"):novemberEditorialText("Т-1926", 'Сохранить отель', "Добавить в избранное")} aria-pressed={saved} onClick={()=>hotelId&&save?save.toggle(hotelId):onClick()}><Icon outline={!saved} name={saved?"heart":"favorite-outline"} size={18} inheritColor/></button>;}
