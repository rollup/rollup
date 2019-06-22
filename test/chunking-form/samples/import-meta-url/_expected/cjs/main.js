'use strict';

var __chunk_1 = require('./nested/chunk.js');

__chunk_1.log('main: ' + (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
new Promise(function (resolve) { resolve(require('./nested/chunk2.js')); });
