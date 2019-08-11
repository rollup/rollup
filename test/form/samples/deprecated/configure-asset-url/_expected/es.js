var asset1 = 'es.js:solved:assets/asset-solved-28a7ac89.txt:assets/asset-solved-28a7ac89.txt';

var asset2 = 'resolved';

var asset3 = new URL('assets/asset-unresolved-8dcd7fca.txt', import.meta.url).href;

console.log(asset1, asset2, asset3);
