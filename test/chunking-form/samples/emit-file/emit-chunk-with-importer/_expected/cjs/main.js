'use strict';

console.log('no importer', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/generated-lib.js').href : new URL('generated-lib.js', document.currentScript && document.currentScript.src || document.baseURI).href));
console.log('from maim', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/generated-lib.js').href : new URL('generated-lib.js', document.currentScript && document.currentScript.src || document.baseURI).href));
console.log('from nested', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/generated-lib2.js').href : new URL('generated-lib2.js', document.currentScript && document.currentScript.src || document.baseURI).href));
