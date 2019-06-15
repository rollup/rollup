'use strict';

var asset2 = 'resolved';

var asset3 = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/asset-unresolved-9548436d.txt').href : new URL('assets/asset-unresolved-9548436d.txt', document.currentScript && document.currentScript.src || document.baseURI).href);

Promise.resolve(require('./nested/chunk.js')).then(result => console.log(result, asset2, asset3));
