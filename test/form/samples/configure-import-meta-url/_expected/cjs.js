'use strict';

console.log('resolved');

console.log((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('cjs.js', document.baseURI).href)));

console.log('cjs.js/configure-import-meta-url/main.js');
