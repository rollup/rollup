const shared = 'shared';

const dynamic = import('./generated-dynamic.js');

globalThis.sharedStatic = shared;

export { shared as s };
