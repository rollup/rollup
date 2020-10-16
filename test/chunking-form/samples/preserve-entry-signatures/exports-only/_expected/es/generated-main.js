const shared = 'shared';

const unused = 'unused';
const dynamic = import('./generated-dynamic.js');

globalThis.sharedStatic = shared;

export { dynamic as d, shared as s, unused as u };
