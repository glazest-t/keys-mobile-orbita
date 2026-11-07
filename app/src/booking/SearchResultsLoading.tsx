import {BrandOrbitLoader} from '../interactions';
import './search-results-loading.css';
export function SearchMapLoading(){
 return <div className="search-loading-map" aria-hidden="true"><div className="search-map-loading-content"><BrandOrbitLoader/><span>Находим отели на карте</span></div></div>;
}
export function SearchResultsLoading({mobile=false}:{mobile?:boolean}){
 if(mobile)return <div className="search-results-loading search-results-loading-mobile" role="status"><div className="search-map-loading-content"><BrandOrbitLoader/><span>Подбираем отели…</span></div></div>;
 return <div className="search-results-loading"><span className="search-loading-announcement" role="status">Подбираем отели…</span><div aria-hidden="true" className="search-loading-cards">{[0,1,2].map(n=><div className="search-loading-card" key={n}><div className="skeleton search-loading-photo"/><div className="search-loading-copy"><div className="skeleton search-loading-title"/><div className="skeleton search-loading-line"/><div className="skeleton search-loading-rating"/><div className="skeleton search-loading-price"/></div></div>)}</div></div>;
}
