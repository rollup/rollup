'use strict';

var asset2 = 'resolved';

var asset3 = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/asset-unresolved-8dcd7fca.txt').href : new URL('assets/asset-unresolved-8dcd7fca.txt', document.currentScript && document.currentScript.src || document.baseURI).href);

Promise.resolve().then(function () { return require('./nested/chunk.js'); }).then(result => console.log(result, asset2, asset3));
