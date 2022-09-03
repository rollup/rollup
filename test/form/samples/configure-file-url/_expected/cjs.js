'use strict';

var asset1 = 'chunkId=cjs.js:moduleId=solved:fileName=assets/asset-solved-230ecafdb.txt:format=cjs:relativePath=assets/asset-solved-230ecafdb.txt:referenceId=6296c678';

var asset2 = 'resolved';

var asset3 = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/asset-unresolved-f4c1e86cd.txt').href : new URL('assets/asset-unresolved-f4c1e86cd.txt', document.currentScript && document.currentScript.src || document.baseURI).href);

console.log(asset1, asset2, asset3);
