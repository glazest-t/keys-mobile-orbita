import {hotelStarLabel,visuals} from './presentation';

export function DestinationSuggestionTitle({title,hotelId}:{title:string;hotelId?:string}){
 const stars=hotelId?hotelStarLabel(visuals[hotelId]?.stars):null;
 return <span className="destination-suggestion-title">
  <span>{title}</span>
  {stars&&<b className="hotel-star-badge">{stars}</b>}
 </span>;
}
