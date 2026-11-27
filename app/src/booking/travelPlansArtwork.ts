const root='/assets/preferences/travel-plans';

export const travelPlanHeart=`${root}/heart.png`;

const travelPlanScenes:Record<string,string>={
 family:'01-with-kids',
 discover:'02-unusual-places',
 romantic:'03-for-two',
 culture:'04-near-center',
 active:'06-sports-and-activities',
 nature:'07-in-nature',
 spa:'09-spa-and-relax',
 food:'10-good-food',
};

const reasonIcons:Record<string,string>={
 'Чистота':'01-cleanliness',
 'Тишина':'02-quiet',
 'Wi-Fi':'03-wifi',
 'Расположение':'04-location',
 'Удобное расположение':'04-location',
 'С детьми':'05-kids-room',
 'Детская комната':'05-kids-room',
 'Бассейн':'06-pool',
 'Завтрак':'07-breakfast',
 'Кондиционер':'08-air-conditioning',
 'Анимация':'09-entertainment',
 'Дизайн':'10-unique-design',
 'Уникальный дизайн':'10-unique-design',
 'Кафе и кофейни':'11-coffee-shops-nearby',
 'Рядом с достопримечательностями':'12-landmarks-nearby',
 'Спа':'13-spa',
 'Вид из окна':'14-window-view',
 'Ресторан':'15-restaurant',
 'Историческое здание':'16-historic-building',
 'Тихое место':'17-peaceful-place',
 'Безопасность':'18-safety',
 'В центре':'19-city-center',
 'Для соло-поездки':'20-solo-friendly',
 'Спортплощадка':'21-sports-court',
 'Фитнес-центр':'21-sports-court',
 'Парковка':'22-parking',
 'В горах':'23-mountains',
 'Прокат инвентаря':'24-equipment-rental',
 'На природе':'25-in-nature',
 'У воды':'26-by-water',
 'У моря':'26-by-water',
 'Парк рядом':'27-park-nearby',
 'Кухня':'28-kitchen',
 'Прачечная':'29-laundry',
 'Сауна':'30-sauna',
 'Кафе':'31-cafe',
 'Бар':'32-bar',
 'Гастро':'15-restaurant',
};

export function travelPlanScene(id:string){
 const scene=travelPlanScenes[id];
 return scene&&`${root}/scenes/${scene}.png`;
}

export function travelPlanReasonIcon(feature:string){
 const icon=reasonIcons[feature];
 return icon&&`${root}/icons/${icon}.png`;
}
