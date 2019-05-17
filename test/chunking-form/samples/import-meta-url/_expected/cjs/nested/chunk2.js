'use strict';

var __chunk_1 = require('./chunk.js');

__chunk_1.log('nested: ' + (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('nested/chunk2.js', document.baseURI).href)));
