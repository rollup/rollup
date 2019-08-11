'use strict';

var showImage = require('./chunk.js');

var logo = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/../assets/logo2-6d5979e4.svg').href : new URL('../assets/logo2-6d5979e4.svg', document.currentScript && document.currentScript.src || document.baseURI).href);

showImage.showImage(logo);
