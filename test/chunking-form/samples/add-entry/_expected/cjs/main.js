'use strict';

var __chunk_1 = require('./generated-chunk.js');

console.log('virtual', __chunk_1.value);
new Worker((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/load.js').href : new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../load.js').href));

console.log('main', __chunk_1.value);
