'use strict';

var asset1 = 'cjs.js:solved:assets/asset-solved-28a7ac89.txt:assets/asset-solved-28a7ac89.txt';

var asset2 = 'resolved';

var asset3 = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/asset-unresolved-8dcd7fca.txt').href : new URL('assets/asset-unresolved-8dcd7fca.txt', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href);

console.log(asset1, asset2, asset3);
