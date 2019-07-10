'use strict';

var __chunk_1 = require('./chunk.js');

var logo = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/../assets/logo2-c943ca3c.svg').href : new URL('../assets/logo2-c943ca3c.svg', document.currentScript && document.currentScript.src || document.baseURI).href);

__chunk_1.showImage(logo);
