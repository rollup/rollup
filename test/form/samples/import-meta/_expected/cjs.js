'use strict';

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
console.log(({ url: (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('cjs.js', document.baseURI).href)) }));
