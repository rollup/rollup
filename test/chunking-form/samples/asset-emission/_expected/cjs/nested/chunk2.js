'use strict';

var __chunk_1 = require('./chunk.js');

var logo = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/../assets/logo2-25253976.svg').href : new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../../assets/logo2-25253976.svg').href);

__chunk_1.showImage(logo);
