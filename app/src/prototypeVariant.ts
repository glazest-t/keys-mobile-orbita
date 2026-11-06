/** Product edition selector. November differences are documented in docs/handoff/NOVEMBER.md. */
export type PrototypeVariant = 'full' | 'november';
export const PROTOTYPE_VARIANT_KEY = 'keys-orbita-prototype-variant';
const changeEvent = 'keys-prototype-variant-change';
const valid = (value: string | null): value is PrototypeVariant => value === 'full' || value === 'november';

export function resolvePrototypeVariant(href: string, saved: string | null): PrototypeVariant {
 const explicit = new URL(href).searchParams.get('variant');
 return valid(explicit) ? explicit : valid(saved) ? saved : 'full';
}

export function getPrototypeVariant(): PrototypeVariant {
 if(typeof location==='undefined')return 'full';
 let saved: string | null = null;
 try { saved = localStorage.getItem(PROTOTYPE_VARIANT_KEY); } catch { /* URL works without storage. */ }
 return resolvePrototypeVariant(location.href, saved);
}

export function setPrototypeVariant(variant: PrototypeVariant) {
 const url = new URL(location.href);
 url.searchParams.set('variant', variant);
 history.replaceState(history.state, '', url);
 try { localStorage.setItem(PROTOTYPE_VARIANT_KEY, variant); } catch { /* Keep the choice in the URL. */ }
 if(typeof document!=='undefined')document.documentElement.dataset.prototypeVariant=variant;
 window.dispatchEvent(new Event(changeEvent));
}

export function subscribePrototypeVariant(onChange: () => void) {
 window.addEventListener(changeEvent, onChange);
 window.addEventListener('popstate', onChange);
 return () => {
  window.removeEventListener(changeEvent, onChange);
  window.removeEventListener('popstate', onChange);
 };
}
