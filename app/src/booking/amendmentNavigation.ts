/** The amendment editor can defer a route change until its draft is discarded. */
export const amendmentNavigationEvent='keys-amendment-navigation';
export function deferAmendmentNavigation(proceed:()=>void){
 const event=new CustomEvent<{proceed:()=>void}>(amendmentNavigationEvent,{cancelable:true,detail:{proceed}});
 window.dispatchEvent(event);
 return event.defaultPrevented;
}
