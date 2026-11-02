import {preferenceIllustrationFor} from './preferenceIllustrations';
import './preference-illustrations.css';
const sheets={1:'/assets/preferences/set-1-1.webp',2:'/assets/preferences/set-1-2.webp'};
export function PreferenceIllustration({label,size=32}:{label:string;size?:number}){
 const icon=preferenceIllustrationFor(label);
 if(!icon)return null;
 const [x,y,w,h]=icon.rect,scale=size/Math.max(w,h);
 return <span className="preference-illustration" data-preference-icon={icon.id} aria-hidden="true" style={{width:size,height:size}}><span style={{width:w*scale,height:h*scale}}><img alt="" src={sheets[icon.sheet]} draggable={false} decoding="async" style={{width:1536*scale,height:1024*scale,left:-x*scale,top:-y*scale}}/></span></span>;
}
