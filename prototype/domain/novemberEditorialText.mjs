import {editorialText} from './editorialText.mjs';

let resolveScope = () => false;
export function setNovemberEditorialScope(resolve) { resolveScope = resolve; }
/** 19.11 workbook: explicit approved call sites, edited November mobile only. */
export function novemberEditorialText(id, original, edited) {
  return resolveScope() ? editorialText(id, original, edited) : original;
}
