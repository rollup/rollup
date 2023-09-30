'use strict';

var asset1 = 'chunkId=cjs.js:moduleId=solved:fileName=assets/asset-solved-0oyI4hTT.txt:format=cjs:relativePath=assets/asset-solved-0oyI4hTT.txt:referenceId=JY$sxHZX';

var asset2 = 'resolved';

var asset3 = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-unresolved-e0Iev6TZ.txt').href : new URL('assets/asset-unresolved-e0Iev6TZ.txt', document.currentScript && document.currentScript.src || document.baseURI).href);

console.log(asset1, asset2, asset3);
