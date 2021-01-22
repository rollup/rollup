const shared = 'shared';

import('./generated-dynamic.js');

globalThis.sharedStatic = shared;

export { shared as s };
