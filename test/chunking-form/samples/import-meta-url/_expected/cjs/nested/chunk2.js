'use strict';

var main = require('./chunk.js');

main.log('nested: ' + (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('nested/chunk2.js', document.baseURI).href)));
