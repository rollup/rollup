var asset2 = 'resolved';

var asset3 = new URL('assets/asset-unresolved-8dcd7fca.txt', import.meta.url).href;

import('./nested/chunk.js').then(result => console.log(result, asset2, asset3));
