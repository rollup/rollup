'use strict';

var log = require('./chunk.js');

log.log('nested: ' + (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('nested/chunk2.js', document.baseURI).href)));
