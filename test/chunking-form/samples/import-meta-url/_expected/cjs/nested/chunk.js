'use strict';

var main = require('../main.js');

main.log('nested: ' + (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (document.currentScript && document.currentScript.src || new URL('nested/chunk.js', document.baseURI).href)));
