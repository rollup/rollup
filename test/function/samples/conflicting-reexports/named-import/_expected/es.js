import { indirectOverride } from 'external';
export * from 'external';
export { noOverride, directOverride as renamedDirectOverride } from 'external';

const renamedIndirectOverride = indirectOverride;

export { renamedIndirectOverride };
