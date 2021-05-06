import { indirectOverride, ignoredOverride } from './external-reexport';
export { directOverride as renamedDirectOverride } from './external-reexport';

export const renamedIndirectOverride = indirectOverride;
export const conflictOverride = ignoredOverride;
