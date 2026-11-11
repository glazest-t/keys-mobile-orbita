// The application supplies the text edition. Domain-only consumers keep original copy.
let resolveEdition = () => 'standard';
export function setEditorialTextResolver(resolve) { resolveEdition = resolve; }
/** group identifies the exact approved workbook group, never a global word replacement. */
export function editorialText(group, original, edited) {
  return resolveEdition() === 'edited' ? edited : original;
}
