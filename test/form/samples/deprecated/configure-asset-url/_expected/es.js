var asset1 = 'es.js:solved:assets/asset-solved-9b321da2.txt:assets/asset-solved-9b321da2.txt';

var asset2 = 'resolved';

var asset3 = new URL('assets/asset-unresolved-9548436d.txt', import.meta.url).href;

console.log(asset1, asset2, asset3);
