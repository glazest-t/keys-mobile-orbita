/** Copy edition, independent of product and icon variants. Original copy stays unchanged. */
import {setEditorialTextResolver} from '../../prototype/domain/editorialText.mjs';
export type PrototypeText = 'standard' | 'edited';
export const PROTOTYPE_TEXT_KEY = 'keys-orbita-prototype-text';
const eventName = 'keys-prototype-text-change';
const valid = (v: string | null): v is PrototypeText => v === 'standard' || v === 'edited';
export function resolvePrototypeText(href: string, saved: string | null): PrototypeText {
 const explicit = new URL(href).searchParams.get('text');
 return valid(explicit) ? explicit : valid(saved) ? saved : 'standard';
}
export function getPrototypeText(): PrototypeText {
 if(typeof location === 'undefined')return 'standard';
 let saved: string | null = null;
 try { saved = localStorage.getItem(PROTOTYPE_TEXT_KEY); } catch { /* URL remains usable. */ }
 return resolvePrototypeText(location.href, saved);
}
export function setPrototypeText(value: PrototypeText) {
 const url = new URL(location.href);url.searchParams.set('text', value);
 history.replaceState(history.state, '', url);
 try { localStorage.setItem(PROTOTYPE_TEXT_KEY, value); } catch { /* URL retains selection. */ }
 window.dispatchEvent(new Event(eventName));
}
export function subscribePrototypeText(onChange: () => void) {
 window.addEventListener(eventName, onChange);
 window.addEventListener('popstate', onChange);
 window.addEventListener('storage', onChange);
 return () => {
  window.removeEventListener(eventName, onChange);
  window.removeEventListener('popstate', onChange);
  window.removeEventListener('storage', onChange);
 };
}

/** Unedited strings fall back to the original in both modes. */
export function selectPrototypeText(variant: PrototypeText, original: string, edited = original): string {
 return variant === 'edited' ? edited : original;
}

setEditorialTextResolver(getPrototypeText);
