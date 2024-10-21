var asset1 = 'chunkId=es.js:moduleId=solved:fileName=assets/asset-solved-mq0xpjgt.txt:format=es:relativePath=assets/asset-solved-mq0xpjgt.txt:referenceId=lj6zEdlc';

var asset2 = 'resolved';

var asset3 = new URL('assets/asset-unresolved-hkzfwzsd.txt', import.meta.url).href;

console.log(asset1, asset2, asset3);
