'use strict';

var asset1 = 'chunkId=cjs.js:moduleId=solved:fileName=assets/asset-solved-DSjIjiFN.txt:format=cjs:relativePath=assets/asset-solved-DSjIjiFN.txt:referenceId=lj6zEdlc';

var asset2 = 'resolved';

var asset3 = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-unresolved-B7Qh6_pN.txt').href : new URL('assets/asset-unresolved-B7Qh6_pN.txt', document.currentScript && document.currentScript.src || document.baseURI).href);

console.log(asset1, asset2, asset3);
