import {memo} from 'react';
import {Icon} from '../ui';

// A presentation of the room controls, not actions on a guest's actual booking.
export const RoomControlArt=memo(function RoomControlArt(){
 return <div className="room-control-art" role="img" aria-label="Открыть номер, заказать услуги в номер и подключить Wi-Fi в один клик">
  <img className="room-control-image" src="/brand/illustrations/onboarding-room-control.webp" alt="" draggable={false}/>
  <div className="room-control-panel" aria-hidden="true">
   <div className="room-control-feature room-control-feature--door">
    <span className="room-control-icon"><Icon name="door" size={32} inheritColor/><span className="room-control-success"><Icon name="check" size={17} inheritColor/></span></span>
    <span>Открыть<br/>номер</span>
   </div>
   <div className="room-control-feature room-control-feature--service">
    <span className="room-control-icon"><Icon name="room-service" size={32} inheritColor/></span>
    <span>Заказать<br/>в номер</span>
   </div>
   <div className="room-control-feature room-control-feature--wifi">
    <span className="room-control-icon"><Icon name="wifi" size={32} inheritColor/></span>
    <span>Wi-Fi<br/>в один клик</span>
   </div>
  </div>
 </div>;
});
