'use strict';

var main = require('../main.js');

main.log('nested: ' + (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('nested/chunk.js', document.baseURI).href)));
