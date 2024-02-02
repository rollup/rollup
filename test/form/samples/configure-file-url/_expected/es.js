var asset1 = 'chunkId=es.js:moduleId=solved:fileName=assets/asset-solved-DSjIjiFN.txt:format=es:relativePath=assets/asset-solved-DSjIjiFN.txt:referenceId=lj6zEdlc';

var asset2 = 'resolved';

var asset3 = new URL('assets/asset-unresolved-B7Qh6_pN.txt', import.meta.url).href;

console.log(asset1, asset2, asset3);
