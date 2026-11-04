import './mobile-service-details.css';
import {Icon} from '../ui';

// Presentation only: availability and pricing stay in the service domain models.
const content:Record<string,{icon:string;image?:string;description:string;unit:string}>={
 buffet:{icon:'breakfast',image:'assets/services/breakfast-buffet.png',description:'Горячие блюда, свежая выпечка, фрукты и напитки в ресторане отеля. Приходите в любое время в часы завтрака.',unit:'За гостя в день'},
 room:{icon:'room-service',image:'assets/services/breakfast-in-room.png',description:'Круассан, омлет, фрукты и кофе с доставкой в номер. Выберите дату, количество гостей и удобное время доставки.',unit:'За сет на одного гостя'},
 spa:{icon:'spa',image:'brand/ideas/covers/hammam.webp',description:'Два часа отдыха: термальная зона и массаж. Выберите дату и время начала программы.',unit:'За одно посещение · 2 часа'},
 early:{icon:'early-check-in',image:'brand/ideas/covers/sleep.webp',description:'Заселитесь раньше стандартного времени. Здесь доступны только часы, которые отель уже может предложить.',unit:'За ранний заезд'},
 late:{icon:'late-check-out',image:'brand/ideas/covers/sleep.webp',description:'Останьтесь в номере дольше в день отъезда. Выберите доступное время выезда — услуга сразу добавится в бронь.',unit:'За поздний выезд'},
 food:{icon:'restaurant',image:'brand/ideas/covers/gastro.webp',description:'Выберите блюда из меню, затем укажите дату и время доставки.',unit:'По стоимости выбранных блюд'},
 cleaning:{icon:'cleaning',description:'Выберите вид уборки и удобное время — сотрудники подготовят ваш номер.',unit:'Без дополнительной оплаты'},
 towels:{icon:'towels',description:'Свежие полотенца, бельё и необходимые мелочи с доставкой в номер. Укажите нужное количество и время.',unit:'Без дополнительной оплаты'},
 pillow:{icon:'pillow',image:'brand/ideas/covers/sleep.webp',description:'Выберите комфортную для вас подушку и время доставки в номер.',unit:'Без дополнительной оплаты'},
 cot:{icon:'baby-cot',description:'Подготовим детскую кроватку в вашем номере. Выберите дату и время, к которому она понадобится.',unit:'Без дополнительной оплаты'},
 transfer:{icon:'transfer',description:'Поездка от отеля до аэропорта. Выберите дату и время подачи автомобиля.',unit:'За одну поездку'},
 parking:{icon:'parking',description:'Место для вашего автомобиля на парковке отеля. Укажите дату и время прибытия.',unit:'Без дополнительной оплаты'},
 other:{icon:'concierge',description:'Расскажите, какая помощь вам нужна. При необходимости приложите фото — оно поможет сотрудникам разобраться в запросе.',unit:'Стоимость уточнит отель, если потребуется'},
};
export function ServiceDetailIntro({kind,description,unit,image,icon}:{kind:string;description?:string;unit?:string;image?:string;icon?:string}){
 const item=content[kind]||content.other,src=image||item.image,priceUnit=unit||item.unit;
 return <div className="service-detail-intro">
  {src?<img className="service-detail-cover" src={import.meta.env.BASE_URL+src} alt=""/>:<div className="service-detail-art" aria-hidden="true"><span><Icon name={icon||item.icon} size={64} inheritColor/></span></div>}
  <p>{description||item.description}</p>{priceUnit!=='Без дополнительной оплаты'&&<span className="service-detail-unit">{priceUnit}</span>}
 </div>;
}
