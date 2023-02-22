'use strict';

console.log(({ url: (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (document.currentScript && document.currentScript.src || new URL('cjs.js', document.baseURI).href)) }));
