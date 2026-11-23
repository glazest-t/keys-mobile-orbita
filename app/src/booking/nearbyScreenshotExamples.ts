import type {NearbyPlace} from './nearby';

/** Demo content from the user's IMG_6312–6317 screenshots. Distances are from
 * the reference, not calculated from the currently selected hotel. Coordinates
 * are approximate display positions for this separate Moscow demo scenario. */
const examples:[string,string,NearbyPlace['category'],string,number,number,number][]=[
 ['bolshoi','Большой театр','Культура','Театр',1500,37.6186,55.7602],
 ['red-square','Красная площадь','Культура','Достопримечательность',2100,37.6208,55.7539],
 ['arbat','Старый Арбат','Прогулки','Пешеходная улица',2200,37.5927,55.7494],
 ['st-basil','Храм Василия Блаженного','Культура','Достопримечательность',2300,37.6231,55.7525],
 ['zaryadye','Парк «Зарядье»','Прогулки','Парк',2600,37.6287,55.7512],
 ['christ-saviour','Храм Христа Спасителя','Культура','Достопримечательность',2700,37.6050,55.7446],
 ['tretyakov','Третьяковская галерея','Музеи','Музей',3300,37.6200,55.7414],
 ['gorky-park','Парк Горького','Прогулки','Парк',4100,37.6000,55.7298],
 ['moscow-city','Москва-Сити','Культура','Достопримечательность',4200,37.5397,55.7496],
 ['ostankino','Останкинская телебашня','Культура','Достопримечательность',5700,37.6117,55.8197],
 ['vdnh','Парк ВДНХ','Прогулки','Парк',6800,37.6332,55.8298],
];
export const nearbyScreenshotExamples:NearbyPlace[]=examples.map(([id,name,category,categoryLabel,radialDistanceMeters,lng,lat])=>({
 id:'reference-'+id,name,category,categoryLabel,radialDistanceMeters,coordinates:[lng,lat],
 icon:category==='Прогулки'?'park':category==='Музеи'?'museum':'pin',
 about:`${name}, Москва.`,source:'https://yandex.ru/maps/?text='+encodeURIComponent(name+' Москва'),
 photo:{url:`/assets/nearby/references/${id}.jpg`,credit:'Фото из предоставленного референса'},
}));
