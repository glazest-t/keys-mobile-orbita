import {editorialText} from './editorialText.mjs';
let resolveScope = () => false;
export function setTripEditorialScope(resolve) { resolveScope = resolve; }
/** Five-scenario workbook: explicit call sites only; never a global text substitution. */
export function tripEditorialText(group, original, edited) {
  return resolveScope() ? editorialText(group, original, edited) : original;
}
