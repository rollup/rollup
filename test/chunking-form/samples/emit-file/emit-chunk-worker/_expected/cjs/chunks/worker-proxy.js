'use strict';

PLACEHOLDER((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/worker.js').href : new URL('worker.js', document.currentScript && document.currentScript.src || document.baseURI).href));
