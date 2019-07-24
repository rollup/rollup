'use strict';

var __chunk_1 = require('./chunk.js');

var logo = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/../assets/logo2-6d5979e4.svg').href : new URL('../assets/logo2-6d5979e4.svg', document.currentScript && document.currentScript.src || document.baseURI).href);

__chunk_1.showImage(logo);
