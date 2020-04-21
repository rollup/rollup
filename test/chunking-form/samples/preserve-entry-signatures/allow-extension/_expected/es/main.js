const shared = 'shared';

const unused = 'unused';
const dynamic = import('./generated-dynamic.js');

globalThis.sharedStatic = shared;

export { dynamic, shared as s, unused };
