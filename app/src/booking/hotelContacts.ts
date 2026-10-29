// Проверено 28.10.2026: официальный сайт https://manteracongress.ru/booking
// Не подставлять контакт Mantera другим отелям без собственных данных.
const hotelPhones:Record<string,string>={'orbit-sea':'+78001013333'};
export const hotelPhone=(hotelId:string)=>hotelPhones[hotelId];
