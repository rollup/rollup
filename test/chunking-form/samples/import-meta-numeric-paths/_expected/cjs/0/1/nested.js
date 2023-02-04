'use strict';

const url = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('0/1/nested.js', document.baseURI).href));

exports.url = url;
