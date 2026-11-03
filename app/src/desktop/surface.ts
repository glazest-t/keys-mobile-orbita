import {accessibleRoute} from '../access.ts';
export const isDesktop=import.meta.env?.VITE_APP_SURFACE==='desktop';
const publicWebRoutes=new Set(['find','results','results-map','booking-flow','search-params','destination','search-dates']);
export function surfaceRoute(route:string,authenticated:boolean,desktop=isDesktop){return desktop&&publicWebRoutes.has(route)?route:accessibleRoute(route,authenticated);}
