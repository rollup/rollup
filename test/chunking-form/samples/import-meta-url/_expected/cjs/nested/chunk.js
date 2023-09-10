'use strict';

var main = require('../main.js');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
main.log('nested: ' + (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('nested/chunk.js', document.baseURI).href)));
