/** Only onboarding, an invitation and sign-in are public in the mobile prototype. */
export function accessibleRoute(route:string,authenticated:boolean){if(route==='hotelier-offer')route='hotelier';return authenticated||['welcome','phone','code','name','hotelier-invite','terms'].includes(route)?route:'phone';}
