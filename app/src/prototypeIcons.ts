/** Independent of the Full/November edition; switching never resets product data. */
export type PrototypeIcons = 'old' | 'new';
export const PROTOTYPE_ICONS_KEY = 'keys-orbita-prototype-icons';
const eventName = 'keys-prototype-icons-change';
const valid = (v: string | null): v is PrototypeIcons => v === 'old' || v === 'new';
export function resolvePrototypeIcons(href: string, saved: string | null): PrototypeIcons {
 const explicit = new URL(href).searchParams.get('icons');
 return valid(explicit) ? explicit : valid(saved) ? saved : 'new';
}
export function getPrototypeIcons(): PrototypeIcons {
 if(typeof location === 'undefined')return 'new';
 let saved: string | null = null;
 try { saved = localStorage.getItem(PROTOTYPE_ICONS_KEY); } catch { /* URL remains usable. */ }
 return resolvePrototypeIcons(location.href, saved);
}
export function setPrototypeIcons(value: PrototypeIcons) {
 const url = new URL(location.href);url.searchParams.set('icons', value);
 history.replaceState(history.state, '', url);
 try { localStorage.setItem(PROTOTYPE_ICONS_KEY, value); } catch { /* URL retains selection. */ }
 window.dispatchEvent(new Event(eventName));
}
export function subscribePrototypeIcons(onChange: () => void) {
 window.addEventListener(eventName, onChange);
 window.addEventListener('popstate', onChange);
 window.addEventListener('storage', onChange);
 return () => {
  window.removeEventListener(eventName, onChange);
  window.removeEventListener('popstate', onChange);
  window.removeEventListener('storage', onChange);
 };
}
