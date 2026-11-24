import {tripEditorialText} from '../../../prototype/domain/tripEditorialText.mjs';
import './mobile-service-details.css';
import {Icon} from '../ui';

// Presentation only: availability and pricing stay in the service domain models.
const content:Record<string,{icon:string;image?:string;description:string}>={
 buffet:{icon:'cafe',image:'assets/services/breakfast-buffet.png',get description(){return tripEditorialText("ПР-125", 'Горячие блюда, свежая выпечка, фрукты и напитки в ресторане отеля. Приходите в любое время в часы завтрака.', "Горячие блюда, свежая выпечка, фрукты и напитки в ресторане. Приходите в любое время в часы завтрака");}},
 room:{icon:'room-service',image:'assets/services/breakfast-in-room.png',get description(){return tripEditorialText("ПР-126", 'Круассан, омлет, фрукты и кофе с доставкой в номер. Выберите дату, количество гостей и удобное время доставки.', "Круассан, омлет, фрукты и кофе с доставкой в номер. Выберите дату, количество гостей и удобное время доставки");}},
 spa:{icon:'spa',image:'brand/ideas/covers/hammam.webp',get description(){return tripEditorialText("ПР-127", 'Два часа отдыха: термальная зона и массаж. Выберите дату и время начала программы.', "Два часа отдыха: термальная зона и массаж. Выберите дату и время начала программы");}},
 early:{icon:'early-check-in',image:'brand/ideas/covers/sleep.webp',get description(){return tripEditorialText("ПР-128", 'Заселитесь раньше стандартного времени. Здесь доступны только часы, которые отель уже может предложить.', "Заселитесь раньше стандартного времени. Показаны только доступные часы");}},
 late:{icon:'late-check-out',image:'brand/ideas/covers/sleep.webp',get description(){return tripEditorialText("ПР-129", 'Останьтесь в номере дольше в день отъезда. Выберите доступное время выезда — услуга сразу добавится в бронь.', "Останьтесь в номере дольше в день отъезда. Выберите доступное время выезда — услуга сразу добавится в бронь");}},
 food:{icon:'restaurant',image:'brand/ideas/covers/gastro.webp',get description(){return tripEditorialText("ПР-130", 'Выберите блюда из меню, затем укажите дату и время доставки.', "Выберите блюда из меню, затем укажите дату и время доставки");}},
 cleaning:{icon:'cleaning',get description(){return tripEditorialText("ПР-131", 'Выберите вид уборки и удобное время — сотрудники подготовят ваш номер.', "Выберите вид уборки и удобное время — сотрудники подготовят ваш номер");}},
 towels:{icon:'towels',get description(){return tripEditorialText("ПР-132", 'Свежие полотенца, бельё и необходимые мелочи с доставкой в номер. Укажите нужное количество и время.', "Свежие полотенца, бельё и необходимые мелочи с доставкой в номер. Укажите нужное количество и время");}},
 pillow:{icon:'pillow',image:'brand/ideas/covers/sleep.webp',get description(){return tripEditorialText("ПР-133", 'Выберите комфортную для вас подушку и время доставки в номер.', "Выберите подушку и время доставки в номер");}},
 cot:{icon:'baby-cot',get description(){return tripEditorialText("ПР-134", 'Подготовим детскую кроватку в вашем номере. Выберите дату и время, к которому она понадобится.', "Подготовим детскую кроватку в вашем номере. Выберите дату и время");}},
 transfer:{icon:'transfer',get description(){return tripEditorialText("ПР-135", 'Поездка от отеля до аэропорта. Выберите дату и время подачи автомобиля.', "Поездка до аэропорта. Выберите дату и время подачи машины");}},
 parking:{icon:'parking',get description(){return tripEditorialText("ПР-136", 'Место для вашего автомобиля на парковке отеля. Укажите дату и время прибытия.', "Место для вашей машины на парковке. Укажите дату и время прибытия");}},
 other:{icon:'concierge',get description(){return tripEditorialText("ПР-137", 'Расскажите, какая помощь вам нужна. При необходимости приложите фото — оно поможет сотрудникам разобраться в запросе.', "Расскажите, какая помощь вам нужна. Если нужно, добавьте фото");}},
};
export function ServiceDetailIntro({kind,description,image,icon}:{kind:string;description?:string;image?:string;icon?:string}){
 const item=content[kind]||content.other,src=image||item.image;
 return <div className="service-detail-intro">
  {src?<img className="service-detail-cover" src={import.meta.env.BASE_URL+src} alt=""/>:<div className="service-detail-art" aria-hidden="true"><span><Icon name={icon||item.icon} size={64} inheritColor/></span></div>}
  <p>{description||item.description}</p>
 </div>;
}
