export function setEditorialTextResolver(resolve: () => 'standard' | 'edited'): void;
export function editorialText<A, B>(group: string, original: A, edited: B): A | B;
