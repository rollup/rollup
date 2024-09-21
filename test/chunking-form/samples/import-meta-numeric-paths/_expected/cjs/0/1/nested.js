'use strict';

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
const url = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('0/1/nested.js', document.baseURI).href));

exports.url = url;
