import {editorialText} from './editorialText.mjs';

let resolveScope = () => false;
export function setNovemberEditorialScope(resolve) { resolveScope = resolve; }
/** 19.11 workbook: explicit approved call sites, edited November copy on both surfaces. */
export function novemberEditorialText(id, original, edited) {
  return resolveScope() ? editorialText(id, original, edited) : original;
}
