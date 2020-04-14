const shared = 'shared';

const nonEssential = 'non-essential';
const dynamic = import('./generated-dynamic.js');

globalThis.sharedStatic = shared;

export { dynamic as d, nonEssential as n, shared as s };
