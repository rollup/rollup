var asset1 = 'chunkId=es.js:moduleId=solved:fileName=assets/asset-solved-9b321da2.txt:format=es:relativePath=assets/asset-solved-9b321da2.txt:assetReferenceId=6296c678:chunkReferenceId=null';

var asset2 = 'resolved';

var asset3 = new URL('assets/asset-unresolved-9548436d.txt', import.meta.url).href;

console.log(asset1, asset2, asset3);
