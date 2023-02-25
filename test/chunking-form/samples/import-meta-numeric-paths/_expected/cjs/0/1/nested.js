'use strict';

const url = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (document.currentScript && document.currentScript.src || new URL('0/1/nested.js', document.baseURI).href));

exports.url = url;
