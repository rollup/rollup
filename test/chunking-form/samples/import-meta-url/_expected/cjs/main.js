'use strict';

var log = require('./nested/chunk.js');

log.log('main: ' + (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('main.js', document.baseURI).href)));
new Promise(function (resolve) { resolve(require('./nested/chunk2.js')); });
