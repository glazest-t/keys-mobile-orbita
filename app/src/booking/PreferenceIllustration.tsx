import {preferenceIllustrationFor,type PreferenceIllustrationId} from './preferenceIllustrations';
import {usePrototypeIcons} from '../usePrototypeIcons';
import {Icon} from '../ui';
import './preference-illustrations.css';
const icons:Record<PreferenceIllustrationId,string>={cleanliness:'cleaning',quiet:'do-not-disturb',wifi:'wifi',location:'pin',kids:'kids-room',pool:'pool',breakfast:'breakfast',air:'climate',entertainment:'board-games',design:'style-match',coffee:'cafe',attractions:'nearby',spa:'spa',view:'sea-view',restaurant:'restaurant',historic:'museum',security:'secure',solo:'nav-profile',sport:'fitness',parking:'parking',mountains:'mountain-view',rental:'car',nature:'garden-view',beach:'beach',water:'sea-view',park:'park',kitchen:'kitchen',laundry:'laundry',sauna:'sauna',bar:'bar',work:'desk',adults:'guests'};
export function PreferenceIllustration({label,size=32,original=false}:{label:string;size?:number;original?:boolean}){
 const variant=usePrototypeIcons();
 const item=preferenceIllustrationFor(label);if(!item)return null;
 if(original||variant==='old'){
  const [x,y,w,h]=item.rect,scale=size/Math.max(w,h);
  const sheets={1:'/assets/preferences/set-1-1.webp',2:'/assets/preferences/set-1-2.webp'};
  return <span className="preference-illustration preference-illustration-original" data-preference-icon={item.id} aria-hidden="true" style={{width:size,height:size}}><span style={{width:w*scale,height:h*scale}}><img alt="" src={sheets[item.sheet]} draggable={false} decoding="async" style={{width:1536*scale,height:1024*scale,left:-x*scale,top:-y*scale}}/></span></span>;
 }
 return <span className="preference-illustration" data-preference-icon={item.id} aria-hidden="true" style={{width:size,height:size}}><Icon name={icons[item.id]} size={size}/></span>;
}
