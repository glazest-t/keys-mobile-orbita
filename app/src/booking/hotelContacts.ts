// Проверено 28.10.2026: официальный сайт https://manteracongress.ru/booking
const hotelPhones:Record<string,string>={'orbit-sea':'+78001013333'};
// Вымышленный демонстрационный контакт для отелей без опубликованного номера.
// Не является реальным телефоном отеля; заменить при подключении каталога.
const demoHotelPhone='+70000000000';
export const hotelPhone=(hotelId:string)=>hotelPhones[hotelId]||demoHotelPhone;
