import './friendly-rate.css';
export function FriendlyRateBadge({role=false,percent}:{role?:boolean;percent?:number}){
 return <span className={'friendly-rate-label '+(role?'friendly-rate-role':'')}>
  {role&&<span className="friendly-rate-mark"><img src="/brand/assets/logo/mark-white-ui.svg" alt="" width="11" height="11"/></span>}
  {role?'Отельер · Friendly Rate':'Friendly Rate'}{percent!==undefined&&percent>0?` −${percent}%`:''}
 </span>;
}
