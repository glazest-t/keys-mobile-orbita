import data from '../../../spec/imported-hotels.json' with {type:'json'};
export const importedHotel=(id:string)=>(data.hotels as Record<string,typeof data.hotels[keyof typeof data.hotels]>)[id];
export const importedRoom=(id:string)=>(data.rooms as Record<string,typeof data.rooms[keyof typeof data.rooms]>)[id];
