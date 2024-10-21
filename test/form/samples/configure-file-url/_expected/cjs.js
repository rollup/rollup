'use strict';

var asset1 = 'chunkId=cjs.js:moduleId=solved:fileName=assets/asset-solved-mq0xpjgt.txt:format=cjs:relativePath=assets/asset-solved-mq0xpjgt.txt:referenceId=lj6zEdlc';

var asset2 = 'resolved';

var asset3 = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-unresolved-hkzfwzsd.txt').href : new URL('assets/asset-unresolved-hkzfwzsd.txt', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href);

console.log(asset1, asset2, asset3);
