'use strict';

var asset1 = 'chunkId=cjs.js:moduleId=solved:fileName=assets/asset-solved-9b321da2.txt:format=cjs:relativePath=assets/asset-solved-9b321da2.txt:assetReferenceId=6296c678:chunkReferenceId=null';

var asset2 = 'resolved';

var asset3 = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/asset-unresolved-9548436d.txt').href : new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../assets/asset-unresolved-9548436d.txt').href);

console.log(asset1, asset2, asset3);
